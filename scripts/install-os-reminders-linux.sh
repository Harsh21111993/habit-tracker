#!/bin/bash
# ============================================================
# WWWW x MAN's Habit Tracker - Install OS-Level Reminders (Linux)
# ============================================================
# Installs two cron jobs that fire at 9:00 AM and 9:00 PM every day.
# They open your habit tracker in your browser.
#
# HOW TO USE:
#   1. Open a terminal
#   2. cd /path/to/habit-tracker/scripts
#   3. chmod +x install-os-reminders-linux.sh
#   4. ./install-os-reminders-linux.sh
#
# To UNINSTALL:
#   ./uninstall-os-reminders-linux.sh
#
# NOTE: These OS-level reminders are independent of the in-app
# browser notifications. They fire even if your browser is closed.
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HABIT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SH_PATH="$HABIT_DIR/WWWW-MANs.sh"

if [ ! -f "$SH_PATH" ]; then
    echo "[ERROR] Cannot find WWWWW-MANs.sh in: $HABIT_DIR"
    echo "Please keep this script inside the habit-tracker/scripts folder."
    exit 1
fi

chmod +x "$SH_PATH"

# Read current crontab (could be empty)
CRON_FILE=$(mktemp)
crontab -l > "$CRON_FILE" 2>/dev/null || true

# Remove any old WWWWW-MANs entries (idempotent)
grep -v "WWWW-MANs.sh" "$CRON_FILE" > "${CRON_FILE}.new" || true
mv "${CRON_FILE}.new" "$CRON_FILE"

# Add the 9 AM and 9 PM entries
# Format: minute hour day month dayofweek command
echo "0 9 * * * $SH_PATH # WWWWW-MANs-AM reminder" >> "$CRON_FILE"
echo "0 21 * * * $SH_PATH # WWWWW-MANs-PM reminder" >> "$CRON_FILE"

# Install the new crontab
crontab "$CRON_FILE"
rm "$CRON_FILE"

echo ""
echo "============================================"
echo "  SUCCESS! OS-level reminders installed."
echo "============================================"
echo ""
echo "Two cron jobs were added to your crontab:"
echo "  - 9:00 AM daily  -> runs $SH_PATH"
echo "  - 9:00 PM daily  -> runs $SH_PATH"
echo ""
echo "NOTE: If your browser doesn't open from cron, you may need to"
echo "set DISPLAY=:0 in your crontab. Edit with: crontab -e"
echo "Then prepend DISPLAY=:0 to each WWWWW-MANs entry."
echo ""
echo "To change the reminder times, edit this script (change the"
echo "0 9 and 0 21 values to your preferred hours), then re-run."
echo ""
echo "To uninstall: ./uninstall-os-reminders-linux.sh"
