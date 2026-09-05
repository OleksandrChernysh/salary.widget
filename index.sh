#!/bin/bash
# Wrapper to run Node.js salary tracker

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Auto-compile check-stage helper if needed
if [ ! -x "./check-stage" ] || [ "./check-stage.c" -nt "./check-stage" ]; then
  clang -O3 -framework CoreGraphics -framework CoreFoundation check-stage.c -o check-stage 2>/dev/null
fi

PID_FILE="/tmp/salary-widget-check-stage.pid"
STATE_FILE="/tmp/salary-widget-hidden"
LAST_RUN_FILE="/tmp/salary-widget-last-run"

# Ensure background monitor daemon is alive
if [ ! -f "$PID_FILE" ] || ! kill -0 "$(cat "$PID_FILE" 2>/dev/null)" 2>/dev/null; then
  ./check-stage -d >/dev/null 2>&1 &
fi

# Touch heartbeat so daemon knows widget is actively running (zero subprocess overhead)
: > "$LAST_RUN_FILE"

# Instant state check from memory/file (~1ms, no subshell)
if [ -f "$STATE_FILE" ]; then
  read -r STATE < "$STATE_FILE"
  if [ "$STATE" = "1" ]; then
    echo "StageManager: 1"
    exit 0
  fi
elif [ -x "./check-stage" ]; then
  if [ "$(./check-stage 2>/dev/null)" = "1" ]; then
    echo "StageManager: 1"
    exit 0
  fi
fi

CACHE_OUT="/tmp/salary-widget-last-output.txt"
NOW=$(date +%s)
LAST_RUN=0

if [ -f "/tmp/salary-widget-node-run" ]; then
  read -r LAST_RUN < "/tmp/salary-widget-node-run" 2>/dev/null
fi

ELAPSED=$((NOW - LAST_RUN))

# Fast path: Serve cached stats immediately (0ms delay on reveal)
if [ -s "$CACHE_OUT" ]; then
  cat "$CACHE_OUT"
  # Refresh Node.js in background if >= 1s has elapsed
  if [ "$ELAPSED" -ge 1 ]; then
    echo "$NOW" > "/tmp/salary-widget-node-run"
    (
      export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
      if ! command -v node >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
        . "$HOME/.nvm/nvm.sh"
      fi
      node ./index.mjs > "$CACHE_OUT.tmp" 2>/dev/null && mv "$CACHE_OUT.tmp" "$CACHE_OUT"
    ) >/dev/null 2>&1 &
  fi
  exit 0
fi

# Cold path (first run only when no cache exists)
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
fi

echo "$NOW" > "/tmp/salary-widget-node-run"
node ./index.mjs | tee "$CACHE_OUT"
