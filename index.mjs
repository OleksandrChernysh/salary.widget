// widget.mjs - Combined output for Übersicht widget (daily + monthly)
import { exec } from "child_process";
import util from "util";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const execAsync = util.promisify(exec);

// Constants from .env
const HOURLY_RATE = parseFloat(process.env.HOURLY_RATE) || 7;
const EXCHANGE_RATE = parseFloat(process.env.EXCHANGE_RATE) || 41;
const TOGGL_TOKEN = process.env.TOGGL_TOKEN;
const CACHE_FILE = ".cache-widget.json";
const CACHE_TTL = 600000; // 10 minutes

// Fetch time entries for a date range
async function getTimeFromAPI(startDate, endDate) {
  if (!TOGGL_TOKEN) {
    return null;
  }

  try {
    const url = `https://api.track.toggl.com/api/v9/me/time_entries?start_date=${startDate}&end_date=${endDate}`;
    const auth = Buffer.from(`${TOGGL_TOKEN}:api_token`).toString("base64");

    const command = `curl -s -H "Authorization: Basic ${auth}" "${url}"`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr && (stderr.includes("limit") || stderr.includes("quota"))) {
      return null;
    }

    const entries = JSON.parse(stdout);
    let totalSeconds = 0;

    entries.forEach((entry) => {
      if (entry.duration > 0) {
        totalSeconds += entry.duration;
      } else if (entry.duration < 0) {
        const startTime = Math.abs(entry.duration);
        const now = Math.floor(Date.now() / 1000);
        totalSeconds += now - startTime;
      }
    });

    return totalSeconds;
  } catch (err) {
    return null;
  }
}

// Calculate earnings
function calculateEarnings(timeInSeconds) {
  const hoursWorked = timeInSeconds / 3600;
  const earningsUsd = hoursWorked * HOURLY_RATE;
  const earningsUah = earningsUsd * EXCHANGE_RATE;
  return { earningsUsd, earningsUah };
}

// Cache management
function readCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
      const age = Date.now() - data.timestamp;
      if (age < CACHE_TTL) {
        return data;
      }
    }
  } catch (err) {
    // Ignore
  }
  return null;
}

function writeCache(todayUsd, todayUah, monthUsd, monthUah) {
  try {
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({
        timestamp: Date.now(),
        todayUsd,
        todayUah,
        monthUsd,
        monthUah,
      }),
    );
  } catch (err) {
    // Ignore
  }
}

// Main function
async function main() {
  // Check cache first
  const cached = readCache();
  if (cached) {
    console.log(
      `Today: ${cached.todayUsd.toFixed(2)} USD / ${cached.todayUah.toFixed(2)} UAH`,
    );
    console.log(
      `Month: ${cached.monthUsd.toFixed(2)} USD / ${cached.monthUah.toFixed(2)} UAH`,
    );
    return;
  }

  // Fetch today's time
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const now = new Date().toISOString();

  const todaySeconds = await getTimeFromAPI(todayStart, now);

  // Fetch month's time
  const monthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  ).toISOString();

  const monthSeconds = await getTimeFromAPI(monthStart, now);

  // Handle rate limit
  if (todaySeconds === null || monthSeconds === null) {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const oldCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
        const ageMinutes = Math.floor(
          (Date.now() - oldCache.timestamp) / 60000,
        );
        console.log(`⚠️ Rate limited. Last known (${ageMinutes}m ago):`);
        console.log(
          `Today: ${oldCache.todayUsd.toFixed(2)} USD / ${oldCache.todayUah.toFixed(2)} UAH`,
        );
        console.log(
          `Month: ${oldCache.monthUsd.toFixed(2)} USD / ${oldCache.monthUah.toFixed(2)} UAH`,
        );
        return;
      }
    } catch (err) {
      // Ignore
    }
    console.log("Today: 0.00 USD / 0.00 UAH");
    console.log("Month: 0.00 USD / 0.00 UAH");
    return;
  }

  const { earningsUsd: todayUsd, earningsUah: todayUah } =
    calculateEarnings(todaySeconds);
  const { earningsUsd: monthUsd, earningsUah: monthUah } =
    calculateEarnings(monthSeconds);

  // Save to cache
  writeCache(todayUsd, todayUah, monthUsd, monthUah);

  // Output for widget
  console.log(`Today: ${todayUsd.toFixed(2)} USD / ${todayUah.toFixed(2)} UAH`);
  console.log(`Month: ${monthUsd.toFixed(2)} USD / ${monthUah.toFixed(2)} UAH`);
}

main();
