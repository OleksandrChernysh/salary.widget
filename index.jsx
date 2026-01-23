import { styles } from "./styles.mjs";
export const refreshFrequency = 120000; // 2 minutes - respects Toggl's 30 req/hour free plan limit

export const command = `"$HOME/Library/Application Support/Übersicht/widgets/salary.widget/index.sh" 2>&1`;

export const className = styles;

export const render = ({ output, error }) => {
  // Debug: show errors or raw output if something goes wrong
  if (error) {
    return <div className="error-box">Error: {error}</div>;
  }

  // Parse output with both daily and monthly stats
  const parseOutput = (text) => {
    if (!text) {
      return {
        today: { usd: "0.00", uah: "0.00" },
        month: { usd: "0.00", uah: "0.00" },
        hourlyRate: "0.00",
        exchangeRate: "0.00",
        isRateLimited: false,
      };
    }

    const isRateLimited = text.includes("Rate limited");
    const lines = text.split("\n");

    let todayUsd = "0.00",
      todayUah = "0.00";
    let monthUsd = "0.00",
      monthUah = "0.00";
    let hourlyRate = "0.00",
      exchangeRate = "0.00";

    lines.forEach((line) => {
      if (line.includes("Rates:")) {
        const match = line.match(
          /([\d.]+)\s*USD\/hr\s*\|\s*([\d.]+)\s*UAH\/USD/,
        );
        if (match) {
          hourlyRate = match[1];
          exchangeRate = match[2];
        }
      } else if (line.includes("Today:")) {
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
      hourlyRate,
      exchangeRate,
      isRateLimited,
    };
  };

  const { today, month, hourlyRate, exchangeRate, isRateLimited } =
    parseOutput(output);

  return (
    <div>
      <div className="glass-card">
        <div className="header-row">
          <div className="title-group">Earnings</div>
          <div className="rates-info">
            <span>
              ${hourlyRate}/hr · ₴{exchangeRate}
            </span>
            {isRateLimited && <span>⚠️</span>}
          </div>
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
    </div>
  );
};
