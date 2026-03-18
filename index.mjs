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
// Returns array of entries
async function getTimeEntries(startDate, endDate) {
  if (!TOGGL_TOKEN) {
    return null;
  }

  try {
    // Both start_date and end_date are required in v9
    const url = `https://api.track.toggl.com/api/v9/me/time_entries?start_date=${startDate}&end_date=${endDate}`;
    const auth = Buffer.from(`${TOGGL_TOKEN}:api_token`).toString("base64");

    const command = `curl -s -H "Authorization: Basic ${auth}" "${url}"`;
    const { stdout, stderr } = await execAsync(command);

    try {
      return JSON.parse(stdout);
    } catch (parseErr) {
      if (stdout.includes("limit") || stdout.includes("quota") || stdout.includes("Payment Required")) {
        // Fallback for non-JSON error messages from Toggl (like 402)
        return null;
      }
      console.error(`Toggl API JSON parse error: ${parseErr.message}\nResponse body: ${stdout}`);
      return null;
    }
  } catch (err) {
    console.error(`getTimeEntries exception: ${err.message}`);
    return null;
  }
}

// Calculate total seconds for "Today" and "Month" from entries
function processEntries(entries, todayStartTimestamp) {
  let todayCompletedSeconds = 0;
  let monthCompletedSeconds = 0;
  let runningTimerStart = null;
  const now = Math.floor(Date.now() / 1000);

  entries.forEach((entry) => {
    const entryStart = Math.floor(new Date(entry.start).getTime() / 1000);
    
    if (entry.duration > 0) {
      // Completed entry
      monthCompletedSeconds += entry.duration;
      
      const effectiveStart = Math.max(entryStart, todayStartTimestamp);
      const entryEnd = entryStart + entry.duration;
      if (entryEnd > todayStartTimestamp) {
        todayCompletedSeconds += entryEnd - effectiveStart;
      }
    } else if (entry.duration < 0) {
      // Running timer
      const startTimestamp = Math.abs(entry.duration);
      runningTimerStart = startTimestamp;
      
      const durationSinceStart = now - startTimestamp;
      monthCompletedSeconds += durationSinceStart;
      
      const effectiveStart = Math.max(startTimestamp, todayStartTimestamp);
      if (now > todayStartTimestamp) {
        todayCompletedSeconds += now - effectiveStart;
      }
    }
  });

  return {
    todayTotalSeconds: todayCompletedSeconds,
    monthTotalSeconds: monthCompletedSeconds,
    todayCompletedSeconds, // Simplified for cache, will be refined if needed
    monthCompletedSeconds,
    runningTimerStart,
  };
}

// Calculate earnings
function calculateEarnings(timeInSeconds, exchangeRate) {
  const hoursWorked = timeInSeconds / 3600;
  const earningsUsd = hoursWorked * HOURLY_RATE;
  const earningsUah = earningsUsd * exchangeRate;
  return { earningsUsd, earningsUah };
}

// Cache management
function readCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
      const age = Date.now() - data.timestamp;
      if (age < CACHE_TTL) {
        if (data.runningTimerStart) {
          const now = Math.floor(Date.now() / 1000);
          const additionalSeconds = now - (data.lastSyncNow || Math.floor(data.timestamp / 1000));
          
          // Only add time if it's still "today" for the daily total
          // For simplicity, we just add the elapsed time since last sync
          const todaySeconds = data.todayTotalSeconds + additionalSeconds;
          const monthSeconds = data.monthTotalSeconds + additionalSeconds;

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
  todayTotalSeconds,
  monthTotalSeconds,
  runningTimerStart,
) {
  try {
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({
        timestamp: Date.now(),
        lastSyncNow: Math.floor(Date.now() / 1000),
        todayUsd,
        todayUah,
        monthUsd,
        monthUah,
        exchangeRate,
        todayTotalSeconds,
        monthTotalSeconds,
        runningTimerStart,
      }),
    );
  } catch (err) {
    // Ignore
  }
}

// Main function
async function main() {
  const cached = readCache();
  if (cached) {
    const displayRate = cached.exchangeRate || parseFloat(process.env.EXCHANGE_RATE) || 41;
    console.log(`Rates: ${HOURLY_RATE.toFixed(2)} USD/hr | ${displayRate.toFixed(2)} UAH/USD`);
    console.log(`Today: ${cached.todayUsd.toFixed(2)} USD / ${cached.todayUah.toFixed(2)} UAH`);
    console.log(`Month: ${cached.monthUsd.toFixed(2)} USD / ${cached.monthUah.toFixed(2)} UAH`);
    return;
  }

  const exchangeRate = await getExchangeRate();
  const finalExchangeRate = exchangeRate || parseFloat(process.env.EXCHANGE_RATE) || 41;

  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayStartISO = todayStart.toISOString();
  const todayStartTimestamp = Math.floor(todayStart.getTime() / 1000);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartISO = monthStart.toISOString();
  
  // Set end_date to tomorrow to ensure we get currently running timers
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString();

  // Fetch for the whole month
  const entries = await getTimeEntries(monthStartISO, tomorrowISO);

  if (entries === null || !Array.isArray(entries)) {
    // Handle error/rate limit with old cache if available
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const oldCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
        const now = new Date();
        const cacheDate = new Date(oldCache.timestamp);
        const isDifferentDay = now.toDateString() !== cacheDate.toDateString();

        const ageMinutes = Math.floor((now.getTime() - oldCache.timestamp) / 60000);
        const displayRate = oldCache.exchangeRate || parseFloat(process.env.EXCHANGE_RATE) || 41;

        // Reset daily totals if the cache is from a previous day
        const todayUsd = isDifferentDay ? 0 : oldCache.todayUsd;
        const todayUah = isDifferentDay ? 0 : oldCache.todayUah;
        const todayTotalSeconds = isDifferentDay ? 0 : oldCache.todayTotalSeconds;
        
        console.log(`Rates: ${HOURLY_RATE.toFixed(2)} USD/hr | ${displayRate.toFixed(2)} UAH/USD`);
        console.log(`⚠️ Toggl API busy. Last sync (${ageMinutes}m ago):`);
        console.log(`Today: ${todayUsd.toFixed(2)} USD / ${todayUah.toFixed(2)} UAH`);
        console.log(`Month: ${oldCache.monthUsd.toFixed(2)} USD / ${oldCache.monthUah.toFixed(2)} UAH`);

        writeCache(
          todayUsd,
          todayUah,
          oldCache.monthUsd,
          oldCache.monthUah,
          oldCache.exchangeRate,
          todayTotalSeconds,
          oldCache.monthTotalSeconds,
          oldCache.runningTimerStart,
        );
        return;
      }
    } catch (err) {
      console.error("Cache read error during fallback:", err);
    }
    console.log(`Rates: ${HOURLY_RATE.toFixed(2)} USD/hr | ${finalExchangeRate.toFixed(2)} UAH/USD`);
    console.log("Today: 0.00 USD / 0.00 UAH");
    console.log("This Month: 0.00 USD / 0.00 UAH");
    
    // Create an initial cache even on failure to avoid spamming the API
    writeCache(0, 0, 0, 0, finalExchangeRate, 0, 0, null);
    return;
  }

  const { todayTotalSeconds, monthTotalSeconds, runningTimerStart } = 
    processEntries(entries, todayStartTimestamp);

  const { earningsUsd: todayUsd, earningsUah: todayUah } = calculateEarnings(todayTotalSeconds, finalExchangeRate);
  const { earningsUsd: monthUsd, earningsUah: monthUah } = calculateEarnings(monthTotalSeconds, finalExchangeRate);

  writeCache(
    todayUsd,
    todayUah,
    monthUsd,
    monthUah,
    finalExchangeRate,
    todayTotalSeconds,
    monthTotalSeconds,
    runningTimerStart,
  );

  console.log(`Rates: ${HOURLY_RATE.toFixed(2)} USD/hr | ${finalExchangeRate.toFixed(2)} UAH/USD`);
  console.log(`Today: ${todayUsd.toFixed(2)} USD / ${todayUah.toFixed(2)} UAH`);
  console.log(`Month: ${monthUsd.toFixed(2)} USD / ${monthUah.toFixed(2)} UAH`);
}


main();
