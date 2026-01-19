# Toggl Earnings Widget for Übersicht

Displays real-time earnings from Toggl time tracking in a beautiful glassmorphic widget on macOS desktop.

This repository contains an Übersicht widget that should be copied to:
`/Users/[username]/Library/Application Support/Übersicht/widgets/`

## Features

- 📊 **Dual Display**: Shows both today's and month-to-date earnings
- 💰 **Multi-Currency**: Displays in USD and UAH simultaneously
- ⚡ **Smart Caching**: 10-minute cache to respect Toggl's 30 req/hour API limit
- 🎨 **Glassmorphic Design**: Modern translucent widget design
- 🔄 **Auto-Refresh**: Updates every 2 minutes
- ✅ **Accurate Tracking**: Fetches ALL time entries (completed + running)

## How It Works

### Accuracy Improvements

**Old approach** (CLI-based):

- Used `toggl current` command → only shows currently running timer
- Problem: Missed all completed entries from earlier in the day
- Result: Inaccurate totals

**New approach** (API-based):

- Direct Toggl API v9 calls → fetches ALL time entries for the period
- Includes both completed and running timers
- Result: True daily and monthly totals

### Rate Limit Management

- Toggl Free Plan: 30 requests/hour
- Cache TTL: 10 minutes (max 6 req/hour)
- Safety margin: Uses only 20% of API quota
- Fallback: Shows cached data when rate limited

## Installation

### Prerequisites

1. macOS with [Übersicht](https://tracesof.net/uebersicht/) installed
2. Node.js (v14+)
3. [Toggl](https://toggl.com/) account with API token

### Setup

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd salary
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file:

   ```env
   TOGGL_TOKEN=your_api_token_here
   HOURLY_RATE=7
   EXCHANGE_RATE=42
   ```

4. Copy the widget to Übersicht widgets directory:

   ```bash
   cp -r salary.widget ~/Library/Application\ Support/Übersicht/widgets/
   ```

   Note: The widget directory must be copied to `/Users/[username]/Library/Application Support/Übersicht/widgets/`

5. Refresh Übersicht widgets

## Configuration

Edit `.env` file:

- `TOGGL_TOKEN` - Your Toggl API token (get from [toggl.com/app/profile](https://toggl.com/app/profile))
- `HOURLY_RATE` - Your hourly rate in USD
- `EXCHANGE_RATE` - USD to UAH exchange rate

## Usage

### Widget

The widget auto-refreshes every 2 minutes and displays:

- Today's earnings (current day from 00:00)
- Month's earnings (current month from day 1)

### Manual Testing

```bash
npm run widget  # Test the script output
```

## Project Structure

```
salary/
├── index.mjs          # Main script (fetches data, outputs for widget)
├── index.sh           # Shell wrapper for widget
├── package.json       # Dependencies
├── .env              # Configuration (not in git)
└── README.md         # This file
```

## Technical Details

- **API**: Toggl API v9 (`/me/time_entries`)
- **Cache**: `.cache-widget.json` (auto-generated, 10-min TTL)
- **Auth**: Basic authentication with API token
- **Date Range**:
  - Today: Current day 00:00 to now
  - Month: First day of month 00:00 to now

## Troubleshooting

### Widget shows 0.00

- Check if you have any time entries in Toggl
- Verify your `TOGGL_TOKEN` is correct
- Clear cache: `rm .cache-widget.json`

### Rate limit errors

- Normal if checking too frequently
- Widget uses cache to prevent this
- Quota resets every hour

### Widget not updating

- Refresh Übersicht (⌘R in Übersicht menu)
- Check console for errors
- Verify `index.sh` has correct Node.js path

## Dependencies

- `dotenv` - Environment variable management

No chart libraries needed - lightweight and focused!

## License

MIT - See [LICENSE](LICENSE) file for details

## Author

Oleksandr Chernysh
