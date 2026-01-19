export const refreshFrequency = 120000; // 2 minutes - respects Toggl's 30 req/hour free plan limit

export const command = `"$HOME/Library/Application Support/Übersicht/widgets/salary.widget/index.sh" 2>&1`;

export const className = `
  bottom: 88px;
  left: 16px;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, SF Pro Display, SF Pro Text, system-ui;

  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.35);
  --glass-shadow-inset: rgba(255, 255, 255, 0.4);
  --glass-shadow-outer: rgba(0, 0, 0, 0.25);
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.9);
  --text-muted: rgba(255, 255, 255, 0.75);
  --text-subtle: rgba(255, 255, 255, 0.65);

  .glass-card {
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
`;

export const render = ({ output, error }) => {
  // Debug: show errors or raw output if something goes wrong
  if (error) {
    return (
      <div style={{ color: "red", padding: "20px", background: "white" }}>
        Error: {error}
      </div>
    );
  }

  // Parse output with both daily and monthly stats
  const parseOutput = (text) => {
    if (!text) {
      return {
        today: { usd: "0.00", uah: "0.00" },
        month: { usd: "0.00", uah: "0.00" },
        isRateLimited: false,
      };
    }

    const isRateLimited = text.includes("Rate limited");
    const lines = text.split("\n");

    let todayUsd = "0.00",
      todayUah = "0.00";
    let monthUsd = "0.00",
      monthUah = "0.00";

    lines.forEach((line) => {
      if (line.includes("Today:")) {
        const match = line.match(/([\d.]+)\s*USD\s*\/\s*([\d.]+)\s*UAH/);
        if (match) {
          todayUsd = match[1];
          todayUah = match[2];
        }
      } else if (line.includes("Month:")) {
        const match = line.match(/([\d.]+)\s*USD\s*\/\s*([\d.]+)\s*UAH/);
        if (match) {
          monthUsd = match[1];
          monthUah = match[2];
        }
      }
    });

    return {
      today: { usd: todayUsd, uah: todayUah },
      month: { usd: monthUsd, uah: monthUah },
      isRateLimited,
    };
  };

  const { today, month, isRateLimited } = parseOutput(output);

  return (
    <div className="glass-card">
      <div className="header-row">
        <div className="title-group">Earnings</div>
        {isRateLimited && (
          <span style={{ fontSize: "0.75rem" }}>⚠️ Cached</span>
        )}
      </div>

      <div className="double-section">
        <div className="section">
          <div className="period-label">Today</div>
          <div className="stats-row">
            <div className="amount-text">{today.uah}</div>
            <div className="currency-text">UAH</div>
          </div>
          <div className="section-bottom-row">
            <div className="currency-text">${today.usd} USD</div>
          </div>
        </div>

        <div className="section">
          <div className="period-label">This Month</div>
          <div className="stats-row">
            <div className="amount-text">{month.uah}</div>
            <div className="currency-text">UAH</div>
          </div>
          <div className="section-bottom-row">
            <div className="currency-text">${month.usd} USD</div>
          </div>
        </div>
      </div>
    </div>
  );
};
