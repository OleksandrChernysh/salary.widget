export const themes = {
  current: {
    name: "salary-widget-current-theme",
    description:
      "Snapshot of the original cool-toned glass theme before the warm liquid-glass refresh.",
    glassCard: {
      glassBg:
        "linear-gradient(135deg, rgba(25, 45, 125, 0.62) 0%, rgba(55, 39, 137, 0.58) 52%, rgba(94, 47, 160, 0.54) 100%)",
      glassBorder: "rgba(170, 182, 255, 0.22)",
      glassShadowInset: "rgba(196, 204, 255, 0.24)",
      glassShadowOuter: "rgba(16, 20, 58, 0.2)",
      textPrimary: "rgba(246, 249, 255, 0.96)",
      textSecondary: "rgba(240, 245, 255, 0.9)",
      textMuted: "rgba(232, 238, 252, 0.76)",
      textSubtle: "rgba(224, 232, 248, 0.66)",
      backdropFilter: "blur(14px) saturate(140%)",
      extraInsetShadow: "inset 0 -10px 20px rgba(255, 255, 255, 0.04)",
      outerShadow: "0 8px 32px rgba(16, 20, 58, 0.2)",
    },
  },
  liquidGlass: {
    name: "salary-widget-liquid-glass-warm",
    description:
      "Warm liquid-glass theme based on the provided HSLA palette with contrast-safe text and soft amber highlights.",
    sourcePalette: {
      primary: "hsla(8, 39%, 57%, 1.00)",
      secondary: "hsla(22, 53%, 53%, 1.00)",
    },
    glassCard: {
      glassBg:
        "radial-gradient(circle at top left, rgba(255, 241, 225, 0.34) 0%, rgba(255, 241, 225, 0) 54%), linear-gradient(145deg, hsla(8, 39%, 57%, 0.88) 0%, hsla(22, 53%, 53%, 0.82) 52%, hsla(30, 58%, 68%, 0.72) 100%)",
      glassBorder: "rgba(255, 235, 214, 0.42)",
      glassShadowInset: "rgba(255, 249, 242, 0.38)",
      glassShadowOuter: "rgba(94, 45, 18, 0.28)",
      textPrimary: "rgba(39, 20, 11, 0.96)",
      textSecondary: "rgba(67, 36, 20, 0.9)",
      textMuted: "rgba(88, 49, 27, 0.78)",
      textSubtle: "rgba(110, 65, 38, 0.7)",
      backdropFilter: "blur(18px) saturate(155%)",
      extraInsetShadow: "inset 0 -12px 24px rgba(255, 255, 255, 0.08)",
      outerShadow: "0 16px 42px rgba(94, 45, 18, 0.28)",
    },
  },
};

export const activeThemeName = "liquidGlass";
export const activeTheme = themes[activeThemeName];
