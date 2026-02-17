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
      rgba(25, 45, 125, 0.82) 0%,
      rgba(55, 39, 137, 0.8) 52%,
      rgba(94, 47, 160, 0.76) 100%
    );
    --glass-border: rgba(170, 182, 255, 0.35);
    --glass-shadow-inset: rgba(196, 204, 255, 0.4);
    --glass-shadow-outer: rgba(16, 20, 58, 0.32);
    --text-primary: rgba(228, 165, 72, 0.95);
    --text-secondary: rgba(228, 165, 72, 0.9);
    --text-muted: rgba(228, 165, 72, 0.75);
    --text-subtle: rgba(228, 165, 72, 0.65);

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
    font-size: 0.85rem;
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
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: -1px;
    color: var(--text-primary);
    margin-right: 4px;
  }

  .currency-text {
    font-size: 0.95rem;
    font-weight: 100;
    color: var(--text-subtle);
  }

  .period-label {
    font-size: 0.75rem;
    font-weight: 100;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
