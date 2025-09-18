// main.mjs
import { exec } from "child_process";
import util from "util";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const execAsync = util.promisify(exec);

// Constants from .env
const HOURLY_RATE = parseFloat(process.env.HOURLY_RATE) || 7;
const EXCHANGE_RATE = parseFloat(process.env.EXCHANGE_RATE) || 41;
const TOGGL_TOKEN = process.env.TOGGL_TOKEN;
const SAVE_CHART = process.env.SAVE_CHART === "true"; // toggle chart saving

// Function to extract total time from Toggl output
function parseTimeEntries(output) {
  let totalSeconds = 0;
  const regex = /(\d{1,2}):(\d{2}):(\d{2})/g;
  let match;

  while ((match = regex.exec(output)) !== null) {
    const [_, h, m, s] = match;
    totalSeconds += parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
  }

  return totalSeconds;
}

// Function to fetch time data from Toggl
async function getTogglTime(command) {
  try {
    const { stdout } = await execAsync(command);
    return parseTimeEntries(stdout);
  } catch (err) {
    console.error("Error running Toggl command:", err.message);
    return 0;
  }
}

// Function to calculate earnings
function calculateEarnings(timeInSeconds) {
  const hoursWorked = timeInSeconds / 3600;
  const earningsUsd = hoursWorked * HOURLY_RATE;
  const earningsUah = earningsUsd * EXCHANGE_RATE;
  return { earningsUsd, earningsUah };
}

async function plotEarningsGraph(earningsToday) {
  const MAX_HOURS = 4;
  const HOURLY_RATE = parseFloat(process.env.HOURLY_RATE) || 7;
  const EXCHANGE_RATE = parseFloat(process.env.EXCHANGE_RATE) || 41;

  const maxEarningsUah = MAX_HOURS * HOURLY_RATE * EXCHANGE_RATE;
  const remaining = Math.max(maxEarningsUah - earningsToday, 0);

  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 230, height: 230 });

  const config = {
    type: "doughnut",
    data: {
      labels: ["Earned", "Remaining"],
      datasets: [
        {
          data: [earningsToday, remaining],
          backgroundColor: ["green", "#e0e0e0"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
      },
      cutout: "60%", // makes it a doughnut
    },
  };

  const image = await chartJSNodeCanvas.renderToBuffer(config);
  fs.writeFileSync("earnings.png", image);
}

// Main function
async function main() {
  // Toggl auth
  if (TOGGL_TOKEN) {
    await execAsync(`toggl auth ${TOGGL_TOKEN}`);
  }

  // Fetch today's work time
  const timeToday = await getTogglTime("toggl current");
  const { earningsUsd: earningsTodayUsd, earningsUah: earningsTodayUah } =
    calculateEarnings(timeToday);

  // Print earnings (Conky will read this)
  console.log(
    `Today: ${earningsTodayUsd.toFixed(2)} USD / ${earningsTodayUah.toFixed(
      2
    )} UAH`
  );

  // Optionally save chart
  if (SAVE_CHART) {
    await plotEarningsGraph(earningsTodayUah);
  }
}

main();
