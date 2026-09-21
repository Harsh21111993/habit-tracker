#!/bin/bash
# ============================================================
# WWWW x MAN's Habit Tracker - Install OS-Level Reminders (macOS)
# ============================================================
# Installs two launchd jobs that fire at 9:00 AM and 9:00 PM
# every day. They open your habit tracker in your default browser
# (or Chrome/Edge in app mode if available).
#
# HOW TO USE:
#   1. Open Terminal
#   2. cd /path/to/habit-tracker/scripts
#   3. chmod +x install-os-reminders-mac.sh
#   4. ./install-os-reminders-mac.sh
#
# To UNINSTALL:
#   ./uninstall-os-reminders-mac.sh
#
# NOTE: These OS-level reminders are independent of the in-app
# browser notifications. They fire even if your browser is closed.
# ============================================================

set -e

# Find the habit-tracker folder (parent of scripts/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HABIT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_PATH="$HABIT_DIR/WWWW-MAN's Tracker.app"

# Verify the .app exists
if [ ! -d "$APP_PATH" ]; then
    echo "[ERROR] Cannot find WWWWW-MAN's Tracker.app in: $HABIT_DIR"
    echo "Please keep this script inside the habit-tracker/scripts folder."
    exit 1
fi

AM_PLIST="$HOME/Library/LaunchAgents/com.personal.wwww-mans-tracker.am.plist"
PM_PLIST="$HOME/Library/LaunchAgents/com.personal.wwww-mans-tracker.pm.plist"

# Helper to write a plist
write_plist() {
    local plist_path="$1"
    local hour="$2"
    local label="$3"

    mkdir -p "$(dirname "$plist_path")"
    cat > "$plist_path" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$label</string>
    <key>ProgramArguments</key>
    <array>
        <string>open</string>
        <string>-a</string>
        <string>$APP_PATH</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>$hour</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
EOF
}

echo "Installing 9:00 AM reminder (WWW)..."
write_plist "$AM_PLIST" 9 com.personal.wwww-mans-tracker.am
launchctl unload "$AM_PLIST" 2>/dev/null || true
launchctl load "$AM_PLIST"

echo "Installing 9:00 PM reminder (MAN's)..."
write_plist "$PM_PLIST" 21 com.personal.wwww-mans-tracker.pm
launchctl unload "$PM_PLIST" 2>/dev/null || true
launchctl load "$PM_PLIST"

echo ""
echo "============================================"
echo "  SUCCESS! OS-level reminders installed."
echo "============================================"
echo ""
echo "Two launchd jobs were created:"
echo "  - 9:00 AM daily  -> opens $APP_PATH"
echo "  - 9:00 PM daily  -> opens $APP_PATH"
echo ""
echo "To change the reminder times, edit this script (change the"
echo "Hour values, currently 9 and 21), then re-run."
echo ""
echo "To uninstall: ./uninstall-os-reminders-mac.sh"
