export const styles = `
  /* Position variables */
  --widget-top: 378px;
  --widget-left: 16px;

  /* Positioning using CSS variables */
  top: var(--widget-top);
  left: var(--widget-left);
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, SF Pro Display, SF Pro Text, system-ui;

  /* Styles for the Salary Übersicht widget */

  /* Design tokens on the main card scope */
  .glass-card {
    --glass-bg: rgba(255, 255, 255, 0.25);
    --glass-border: rgba(255, 255, 255, 0.35);
    --glass-shadow-inset: rgba(255, 255, 255, 0.4);
    --glass-shadow-outer: rgba(0, 0, 0, 0.25);
    --text-primary: rgba(255, 255, 255, 0.95);
    --text-secondary: rgba(255, 255, 255, 0.9);
    --text-muted: rgba(255, 255, 255, 0.75);
    --text-subtle: rgba(255, 255, 255, 0.65);

    width: 310px;
    padding: 15px;
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
    font-weight: 300;
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
    font-weight: 700;
    letter-spacing: -1px;
    color: var(--text-primary);
    margin-right: 4px;
  }

  .currency-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-subtle);
  }

  .period-label {
    font-size: 0.75rem;
    font-weight: 500;
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
