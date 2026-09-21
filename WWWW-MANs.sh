#!/bin/bash
# ============================================================
# WWWW x MAN's Habit Tracker - Linux Launcher
# ============================================================
# Opens the tracker in a clean "app window" (no URL bar, no tabs).
#
# HOW TO USE:
#   1. Right-click this file -> Properties -> Permissions ->
#      check "Allow executing file as program"
#   2. Double-click to launch
#   3. For dock/app-menu integration, see README.txt
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HTML_FILE="$SCRIPT_DIR/index.html"

if [ ! -f "$HTML_FILE" ]; then
    echo "[ERROR] Cannot find index.html in: $SCRIPT_DIR"
    echo "Please keep this .sh file inside the habit-tracker folder."
    read -p "Press Enter to close..."
    exit 1
fi

FILE_URL="file://$HTML_FILE"

BROWSER=""
for b in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge brave-browser; do
    if command -v "$b" >/dev/null 2>&1; then
        BROWSER="$b"
        break
    fi
done

if [ -n "$BROWSER" ]; then
    if [ "$BROWSER" = "firefox" ] || [ "$BROWSER" = "brave-browser" ]; then
        "$BROWSER" "$FILE_URL"
    else
        "$BROWSER" --app="$FILE_URL" --app-id=wwww-mans-tracker
    fi
else
    echo "No Chromium browser found. Opening in default browser."
    echo "For the best app-like experience, install Chrome or Chromium."
    xdg-open "$FILE_URL"
fi
