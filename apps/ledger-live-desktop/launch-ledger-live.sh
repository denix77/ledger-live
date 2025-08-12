#!/bin/bash

# Ledger Live Desktop Launcher
# This script launches Ledger Live Desktop application

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the desktop app directory
cd "$SCRIPT_DIR"

echo "🚀 Starting Ledger Live Desktop..."

# Launch the application silently
pnpm start:prod > /dev/null 2>&1 &

echo "✅ Ledger Live Desktop launched successfully!"
echo "   The application should appear shortly."

# Optional: Wait a moment and then exit
sleep 2
