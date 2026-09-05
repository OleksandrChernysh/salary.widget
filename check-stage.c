#include <CoreGraphics/CoreGraphics.h>
#include <CoreFoundation/CoreFoundation.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <sys/stat.h>
#include <sys/file.h>
#include <fcntl.h>
#include <time.h>

#define STATE_FILE "/tmp/salary-widget-hidden"
#define PID_FILE "/tmp/salary-widget-check-stage.pid"
#define HEARTBEAT_FILE "/tmp/salary-widget-last-run"
#define POLL_INTERVAL_US 25000 // 25ms poll loop for instant T=0 transition detection

static volatile int g_running = 1;

static void handle_signal(int sig) {
    (void)sig;
    g_running = 0;
}

static int is_system_owner(const char *name) {
    static const char *ignored[] = {
        "WindowManager",
        "Dock",
        "Übersicht",
        "Uebersicht",
        "Window Server",
        "loginwindow",
        "TheBoringNotch",
        "Control Center",
        "Notification Center",
        "Spotlight",
        "SystemUIServer",
        NULL
    };
    for (int i = 0; ignored[i] != NULL; i++) {
        if (strcmp(name, ignored[i]) == 0) return 1;
    }
    return 0;
}

static int compute_should_hide() {
    CFArrayRef list = CGWindowListCopyWindowInfo(kCGWindowListOptionAll, kCGNullWindowID);
    if (!list) return 0;

    CGRect mainScreen = CGDisplayBounds(CGMainDisplayID());
    CFIndex count = CFArrayGetCount(list);

    int hasNativeWidget = 0;
    int nativeWidgetOnscreen = 0;
    int hasWmDesktopBackdrop = 0;
    int hasStageApp = 0;

    for (CFIndex i = 0; i < count; i++) {
        CFDictionaryRef dict = (CFDictionaryRef)CFArrayGetValueAtIndex(list, i);

        CFNumberRef layerNum = (CFNumberRef)CFDictionaryGetValue(dict, kCGWindowLayer);
        int layer = 0;
        if (layerNum) CFNumberGetValue(layerNum, kCFNumberIntType, &layer);

        CFDictionaryRef bounds = (CFDictionaryRef)CFDictionaryGetValue(dict, kCGWindowBounds);
        if (!bounds) continue;
        CGRect rect;
        if (!CGRectMakeWithDictionaryRepresentation(bounds, &rect)) continue;

        CFStringRef owner = (CFStringRef)CFDictionaryGetValue(dict, kCGWindowOwnerName);
        if (!owner) continue;
        char ownerBuf[128];
        if (!CFStringGetCString(owner, ownerBuf, sizeof(ownerBuf), kCFStringEncodingUTF8)) continue;

        // WindowManager desktop backdrop window at layer -2147483603 (covers the main screen).
        // Appears at T=0ms the exact instant the user clicks to hide the desktop/restore stage.
        // Destroyed at T=0ms the exact instant the user clicks to reveal the desktop.
        if (strcmp(ownerBuf, "WindowManager") == 0 && layer == -2147483603) {
            if (rect.origin.x >= mainScreen.origin.x - 10 &&
                rect.origin.x <= mainScreen.origin.x + 10 &&
                rect.size.width >= mainScreen.size.width - 10 &&
                rect.size.height >= mainScreen.size.height - 10) {
                CFBooleanRef onRef = (CFBooleanRef)CFDictionaryGetValue(dict, kCGWindowIsOnscreen);
                if (onRef && CFBooleanGetValue(onRef)) {
                    hasWmDesktopBackdrop = 1;
                }
            }
            continue;
        }

        // Native desktop widgets live in Notification Center at layer -2147483601
        if (strcmp(ownerBuf, "Notification Center") == 0 && layer == -2147483601) {
            if (rect.size.width >= 50 && rect.size.height >= 50) {
                hasNativeWidget = 1;
                CFBooleanRef onscreenRef = (CFBooleanRef)CFDictionaryGetValue(dict, kCGWindowIsOnscreen);
                if (onscreenRef && CFBooleanGetValue(onscreenRef)) {
                    nativeWidgetOnscreen = 1;
                }
            }
            continue;
        }

        // Regular application window on stage
        if (layer == 0 && !is_system_owner(ownerBuf)) {
            CGFloat centerX = rect.origin.x + rect.size.width / 2.0;
            CGFloat centerY = rect.origin.y + rect.size.height / 2.0;
            if (centerX >= mainScreen.origin.x && centerX <= mainScreen.origin.x + mainScreen.size.width &&
                centerY >= mainScreen.origin.y && centerY <= mainScreen.origin.y + mainScreen.size.height) {
                if (rect.size.width >= 350 && rect.size.height >= 250) {
                    hasStageApp = 1;
                }
            }
        }
    }

    CFRelease(list);

    int shouldHide = 0;
    if (hasNativeWidget) {
        // Synchronized T=0ms detection:
        // - Reveal starts: nativeWidgetOnscreen turns 1 AND hasWmDesktopBackdrop is 0
        // - Hide starts: hasWmDesktopBackdrop turns 1 immediately at T=0ms (370ms before Notification Center updates!)
        if (!nativeWidgetOnscreen || hasWmDesktopBackdrop) {
            shouldHide = 1;
        } else {
            shouldHide = 0;
        }
    } else {
        // Fallback when no native desktop widgets exist:
        CFPreferencesAppSynchronize(CFSTR("com.apple.WindowManager"));
        Boolean isGlobal = CFPreferencesGetAppBooleanValue(CFSTR("GloballyEnabled"), CFSTR("com.apple.WindowManager"), NULL);
        if (isGlobal && (hasWmDesktopBackdrop || hasStageApp)) {
            shouldHide = 1;
        }
    }

    return shouldHide;
}

static void run_daemon() {
    signal(SIGTERM, handle_signal);
    signal(SIGINT, handle_signal);

    int pid_fd = open(PID_FILE, O_RDWR | O_CREAT, 0644);
    if (pid_fd < 0 || flock(pid_fd, LOCK_EX | LOCK_NB) < 0) {
        if (pid_fd >= 0) close(pid_fd);
        return;
    }
    ftruncate(pid_fd, 0);
    dprintf(pid_fd, "%d\n", getpid());

    int last_state = -1;
    int check_counter = 0;

    while (g_running) {
        int state = compute_should_hide();
        if (state != last_state) {
            char tmp_path[] = "/tmp/salary-widget-hidden.tmp.XXXXXX";
            int fd = mkstemp(tmp_path);
            if (fd >= 0) {
                char val = state ? '1' : '0';
                write(fd, &val, 1);
                write(fd, "\n", 1);
                close(fd);
                rename(tmp_path, STATE_FILE);
            }
            last_state = state;
        }

        usleep(POLL_INTERVAL_US);

        // Every ~5 seconds (200 iterations of 25ms), verify widget is active
        if (++check_counter >= 200) {
            check_counter = 0;
            struct stat st;
            if (stat(HEARTBEAT_FILE, &st) == 0) {
                time_t now = time(NULL);
                if (now - st.st_mtime > 15) {
                    break;
                }
            }
        }
    }

    close(pid_fd);
    unlink(PID_FILE);
    unlink(STATE_FILE);
}

int main(int argc, char **argv) {
    if (argc > 1 && (strcmp(argv[1], "-d") == 0 || strcmp(argv[1], "--daemon") == 0)) {
        run_daemon();
        return 0;
    }

    int state = compute_should_hide();
    printf("%d\n", state);
    return 0;
}
