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
    --glass-bg: linear-gradient(
      135deg,
      rgba(25, 45, 125, 0.62) 0%,
      rgba(55, 39, 137, 0.58) 52%,
      rgba(94, 47, 160, 0.54) 100%
    );
    --glass-border: rgba(170, 182, 255, 0.22);
    --glass-shadow-inset: rgba(196, 204, 255, 0.24);
    --glass-shadow-outer: rgba(16, 20, 58, 0.2);
    --text-primary: rgba(246, 249, 255, 0.96);
    --text-secondary: rgba(240, 245, 255, 0.9);
    --text-muted: rgba(232, 238, 252, 0.76);
    --text-subtle: rgba(224, 232, 248, 0.66);

    width: 300px;
    padding: 27px 20px;
    border-radius: 26px;

    background: var(--glass-bg);
    border: 1px solid var(--glass-border);

    box-shadow:
      inset 0 1px 0 var(--glass-shadow-inset),
      0 8px 32px var(--glass-shadow-outer);

    color: var(--text-primary);

    display: flex;
    flex-direction: column;
    gap: 14px;
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
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title-group {
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
