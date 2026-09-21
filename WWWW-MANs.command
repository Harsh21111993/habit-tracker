#!/bin/bash
# ============================================================
# WWWW x MAN's Habit Tracker - macOS Quick Launcher
# ============================================================
# Opens the tracker in a clean "app window" (no URL bar, no tabs).
#
# HOW TO USE:
#   1. First time: right-click it -> Open -> Open anyway
#      (macOS will warn because it's from the internet).
#   2. After that, just double-click to launch.
#   3. (Optional) Drag this .command file to your Dock for one-click access.
#
# Note: For the best Mac experience, use the included
# "WWWW x MAN's Tracker.app" bundle instead - it can sit in your
# Dock / Applications folder like a real Mac app.
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HTML_FILE="$SCRIPT_DIR/index.html"

if [ ! -f "$HTML_FILE" ]; then
    echo "[ERROR] Cannot find index.html in: $SCRIPT_DIR"
    echo "Please keep this .command file inside the habit-tracker folder."
    read -p "Press Enter to close..."
    exit 1
fi

FILE_URL="file://$HTML_FILE"

# Find the best available Chromium browser (Chrome > Edge > Brave > Safari)
BROWSER_PATH=""

if [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    BROWSER_PATH="/Applications/Google Chrome.app"
elif [ -x "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" ]; then
    BROWSER_PATH="/Applications/Microsoft Edge.app"
elif [ -x "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" ]; then
    BROWSER_PATH="/Applications/Brave Browser.app"
fi

if [ -n "$BROWSER_PATH" ]; then
    open -a "$BROWSER_PATH" --new --args --app="$FILE_URL" --app-id=wwww-mans-tracker
else
    echo "No Chromium browser found. Opening in default browser."
    echo "For the best app-like experience, install Chrome or Edge."
    open "$FILE_URL"
fi
