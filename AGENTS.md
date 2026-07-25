# AGENTS.md

This is an **Übersicht widget** for macOS that displays Toggl time tracking earnings in a glassmorphic desktop widget.

## Project Overview

- **Framework**: Übersicht (macOS desktop widget system)
- **Language**: ES Modules (`.mjs`, `.jsx`)
- **Dependencies**: `dotenv` only
- **Build**: None required — runs directly with Node.js

---

## Build / Run / Test Commands

```bash
# Install dependencies
npm install

# Run widget locally (for testing output)
npm run widget

# Or directly
node ./index.mjs

# Refresh Übersicht widgets after changes
# Press Cmd+R in Übersicht menu bar
```

### Environment Setup

```bash
# Copy and configure environment
cp .env.dist .env

# Edit .env with your values:
# TOGGL_TOKEN=your_api_token
# HOURLY_RATE=7
```

---

## Code Style Guidelines

### File Extensions

| File Type | Extension | Notes |
|-----------|-----------|-------|
| Backend/Logic | `.mjs` | ES Modules, runs in Node.js |
| React Component | `.jsx` | Ü Übersicht widget renderer |
| Styles | `.mjs` | Template literal CSS export |
| Config | `.json` | package.json, VSCode settings |

### JavaScript Conventions

**Modules**
```js
// Use ES modules — import/export only
import { exec } from "child_process";
import util from "util";
import dotenv from "dotenv";

// Named exports preferred
export const refreshFrequency = 1000;
export const command = "...";
export const render = () => { ... };
```

**Naming Conventions**
| Construct | Convention | Example |
|-----------|------------|---------|
| Variables | camelCase | `hourlyRate`, `exchangeRate` |
| Constants | camelCase or SCREAMING_SNAKE | `CACHE_TTL`, `HOURLY_RATE` |
| Functions | camelCase | `getExchangeRate()`, `calculateEarnings()` |
| File names | kebab-case | `index.mjs`, `styles.mjs` |

**Error Handling**
```js
// Always handle errors explicitly — never swallow silently
try {
  // operation
} catch (err) {
  console.error(`Error description: ${err.message}`);
  return null; // or appropriate fallback
}
```

**Async/Await**
```js
// Prefer async/await over raw Promise chains
const result = await fetchData();
if (!result) return null;
```

### React/JSX Conventions (index.jsx)

```jsx
// Named exports from index.jsx (Übersicht requirement)
export const refreshFrequency = 1000;
export const command = "...";
export const render = ({ output, error }) => {
  // Return JSX
  return <div className="glass-card">...</div>;
};

// Props destructuring in render
const { today, month, hourlyRate } = parseOutput(output);
```

### CSS/Styles Conventions (styles.mjs)

```js
// Export styles as template literal
export const styles = `
  .glass-card {
    /* Use CSS custom properties for design tokens */
    --text-primary: rgba(228, 165, 72, 0.95);
    color: var(--text-primary);
  }

  /* BEM-ish naming for components */
  .glass-card {}
  .glass-card__header {}
  .glass-card--featured {}
`;
```

### Key Patterns

**Shell Wrapper (index.sh)**
```bash
#!/bin/bash
# Load nvm if available for Node.js
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi
cd "$(dirname "$0")"
node ./index.mjs
```

**Environment Variables**
```js
// Use dotenv with quiet mode
dotenv.config({ quiet: true });

// Parse numbers explicitly
const HOURLY_RATE = parseFloat(process.env.HOURLY_RATE);
const CACHE_TTL = parseInt(process.env.CACHE_TTL);
```

**Output Format for Widget**
```js
// Output is parsed by index.jsx — keep format stable
console.log(`Rates: ${HOURLY_RATE} USD/hr | ${exchangeRate} UAH/USD`);
console.log(`Today: ${todayUsd} USD / ${todayUah} UAH`);
console.log(`Month: ${monthUsd} USD / ${monthUah} UAH`);
```

---

## Project Structure

```
salary.widget/
├── index.mjs          # Backend: API calls, caching, calculations
├── index.jsx          # React component: renders widget UI
├── styles.mjs         # CSS: glassmorphic styling
├── index.sh           # Shell wrapper: loads Node, runs index.mjs
├── package.json       # Dependencies
├── .env.dist          # Environment template
├── .env               # Local config (gitignored)
└── .cache-widget.json # API cache (gitignored)
```

---

## Common Tasks

### Adding a new API endpoint
1. Add URL to `.env.dist` and `.env`
2. Add fetch function in `index.mjs`
3. Parse response and update output format
4. Update `parseOutput()` in `index.jsx`

### Modifying widget appearance
1. Edit `styles.mjs` — CSS goes in the template literal
2. Use CSS custom properties for colors/fonts
3. Restart Übersicht (Cmd+R) to see changes

### Debugging
```bash
# Run directly to see console output
node ./index.mjs

# Check cache
cat .cache-widget.json

# Clear cache
rm .cache-widget.json
```

---

## Constraints

- **No build step**: Widget runs directly with Node.js
- **No tests**: This is a personal utility widget
- **Single dependency**: `dotenv` only
- **macOS only**: Depends on Übersicht framework
