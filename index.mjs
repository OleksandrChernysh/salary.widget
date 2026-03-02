// widget.mjs - Combined output for Übersicht widget (daily + monthly)
import { exec } from "child_process";
import util from "util";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const execAsync = util.promisify(exec);

// Constants from .env
const HOURLY_RATE = parseFloat(process.env.HOURLY_RATE);
const TOGGL_TOKEN = process.env.TOGGL_TOKEN;
const CACHE_FILE = process.env.CACHE_FILE;
const CACHE_TTL = parseInt(process.env.CACHE_TTL);
const NBU_API_URL = process.env.NBU_API_URL;

// Fetch exchange rate from NBU
async function getExchangeRate() {
  try {
    const command = `curl -s "${NBU_API_URL}"`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      return null;
    }

    const data = JSON.parse(stdout);
    if (Array.isArray(data) && data.length > 0 && data[0].rate) {
      return data[0].rate;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Fetch time entries for a date range
// Returns object with: { totalSeconds, completedSeconds, runningTimerStart }
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
    let completedSeconds = 0;
    let runningTimerStart = null;

    entries.forEach((entry) => {
      if (entry.duration > 0) {
        completedSeconds += entry.duration;
      } else if (entry.duration < 0) {
        // Running timer - store its start time
        runningTimerStart = Math.abs(entry.duration);
      }
    });

    // Calculate total including running timer
    let totalSeconds = completedSeconds;
    if (runningTimerStart) {
      const now = Math.floor(Date.now() / 1000);
      totalSeconds += now - runningTimerStart;
    }

    return { totalSeconds, completedSeconds, runningTimerStart };
  } catch (err) {
    return null;
  }
}

// Calculate earnings
function calculateEarnings(timeInSeconds, exchangeRate) {
  const hoursWorked = timeInSeconds / 3600;
  const earningsUsd = hoursWorked * HOURLY_RATE;
  const earningsUah = earningsUsd * exchangeRate;
  return { earningsUsd, earningsUah };
}

// Cache management - reads and calculates live time if timer is running
function readCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
      const age = Date.now() - data.timestamp;
      if (age < CACHE_TTL) {
        // If there's a running timer, calculate additional time since last sync
        if (data.runningTimerStart) {
          const now = Math.floor(Date.now() / 1000);
          const additionalSeconds = now - data.runningTimerStart;

          const todaySeconds = data.todayCompletedSeconds + additionalSeconds;
          const monthSeconds = data.monthCompletedSeconds + additionalSeconds;

          const { earningsUsd: todayUsd, earningsUah: todayUah } =
            calculateEarnings(todaySeconds, data.exchangeRate);
          const { earningsUsd: monthUsd, earningsUah: monthUah } =
            calculateEarnings(monthSeconds, data.exchangeRate);

          return {
            ...data,
            todayUsd,
            todayUah,
            monthUsd,
            monthUah,
          };
        }
        return data;
      }
    }
  } catch (err) {
    // Ignore
  }
  return null;
}

function writeCache(
  todayUsd,
  todayUah,
  monthUsd,
  monthUah,
  exchangeRate,
  todayCompletedSeconds,
  monthCompletedSeconds,
  runningTimerStart,
) {
  try {
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({
        timestamp: Date.now(),
        todayUsd,
        todayUah,
        monthUsd,
        monthUah,
        exchangeRate,
        todayCompletedSeconds,
        monthCompletedSeconds,
        runningTimerStart,
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
    const displayRate =
      cached.exchangeRate || parseFloat(process.env.EXCHANGE_RATE) || 41;
    console.log(
      `Rates: ${HOURLY_RATE.toFixed(2)} USD/hr | ${displayRate.toFixed(2)} UAH/USD`,
    );
    console.log(
      `Today: ${cached.todayUsd.toFixed(2)} USD / ${cached.todayUah.toFixed(2)} UAH`,
    );
    console.log(
      `Month: ${cached.monthUsd.toFixed(2)} USD / ${cached.monthUah.toFixed(2)} UAH`,
    );
    return;
  }

  // Fetch exchange rate
  const exchangeRate = await getExchangeRate();

  // Fallback to env variable if API fails
  const finalExchangeRate =
    exchangeRate || parseFloat(process.env.EXCHANGE_RATE) || 41;

  // Fetch today's time
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const now = new Date().toISOString();

  const todayData = await getTimeFromAPI(todayStart, now);

  // Fetch month's time
  const monthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  ).toISOString();

  const monthData = await getTimeFromAPI(monthStart, now);

  // Handle rate limit
  if (todayData === null || monthData === null) {
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

  const { earningsUsd: todayUsd, earningsUah: todayUah } = calculateEarnings(
    todayData.totalSeconds,
    finalExchangeRate,
  );
  const { earningsUsd: monthUsd, earningsUah: monthUah } = calculateEarnings(
    monthData.totalSeconds,
    finalExchangeRate,
  );

  // Save to cache with running timer info
  writeCache(
    todayUsd,
    todayUah,
    monthUsd,
    monthUah,
    finalExchangeRate,
    todayData.completedSeconds,
    monthData.completedSeconds,
    todayData.runningTimerStart,
  );

  // Output for widget
  console.log(
    `Rates: ${HOURLY_RATE.toFixed(2)} USD/hr | ${finalExchangeRate.toFixed(2)} UAH/USD`,
  );
  console.log(`Today: ${todayUsd.toFixed(2)} USD / ${todayUah.toFixed(2)} UAH`);
  console.log(`Month: ${monthUsd.toFixed(2)} USD / ${monthUah.toFixed(2)} UAH`);
}

main();
