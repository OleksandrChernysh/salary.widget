import { activeTheme } from "./themes.mjs";

const { glassCard } = activeTheme;

export const styles = `
  /* Position variables */
  --widget-bottom: 50px;
  --widget-left: 35px;

  /* Positioning using CSS variables */
  bottom: var(--widget-bottom);
  left: var(--widget-left);
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, SF Pro Display, SF Pro Text, system-ui;

  /* Styles for the Salary Übersicht widget */

  /* Design tokens on the main card scope */
  .glass-card {
    --glass-bg: ${glassCard.glassBg};
    --glass-border: ${glassCard.glassBorder};
    --glass-shadow-inset: ${glassCard.glassShadowInset};
    --text-primary: ${glassCard.textPrimary};
    --text-secondary: ${glassCard.textSecondary};
    --text-muted: ${glassCard.textMuted};
    --text-subtle: ${glassCard.textSubtle};

    width: 300px;
    padding: 27px 20px;
    border-radius: 26px;

    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    backdrop-filter: ${glassCard.backdropFilter};
    -webkit-backdrop-filter: ${glassCard.backdropFilter};

    box-shadow:
      inset 0 1px 0 var(--glass-shadow-inset),
      ${glassCard.extraInsetShadow},
      ${glassCard.outerShadow};

    color: var(--text-primary);

    display: flex;
    flex-direction: column;
    gap: 14px;

    transition: 
      opacity 0.37s cubic-bezier(0.16, 1, 0.3, 1), 
      transform 0.37s cubic-bezier(0.16, 1, 0.3, 1),
      filter 0.37s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px);
    will-change: opacity, transform, filter;
  }

  .glass-card--hidden {
    opacity: 0;
    transform: scale(0.95) translateY(6px);
    filter: blur(8px);
    pointer-events: none;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    font-weight: 100;
    color: var(--text-muted);
  }

  .rates-info {
    flex: 0 0 43%;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title-group {
    flex: 0 0 50%;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
  }

  .stats-row {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
  }

  .amount-text {
    font-size: 1.7rem;
    font-weight: 400;
    letter-spacing: -1px;
    color: var(--text-primary);
    margin-right: 4px;
  }

  .currency-text {
    font-size: 0.75rem;
    font-weight: 100;
    color: var(--text-subtle);
  }

  .period-label {
    font-size: 0.65rem;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--text-muted);
    opacity: 0.9;
  }

  .double-section {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 46px;
    min-height: 70px;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .section-bottom-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .error-box {
    color: red;
    padding: 20px;
    background: white;
  }
`;
