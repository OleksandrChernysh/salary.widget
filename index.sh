#!/bin/bash
# Wrapper to run Node.js salary tracker

# Go into script folder
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Run widget script (outputs both daily and monthly)
"$HOME/.nvm/versions/node/v24.13.0/bin/node" ./index.mjs
