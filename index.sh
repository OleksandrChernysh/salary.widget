#!/bin/bash
# Wrapper to run Node.js salary tracker

# Go into script folder
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Load nvm if it exists
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

# Run widget script (outputs both daily and monthly)
node ./index.mjs
