#!/bin/bash
# ============================================================
# WWWW x MAN's Habit Tracker - Uninstall OS-Level Reminders (Linux)
# ============================================================

CRON_FILE=$(mktemp)
crontab -l > "$CRON_FILE" 2>/dev/null || true

# Remove any WWWWW-MANs entries
grep -v "WWWW-MANs.sh" "$CRON_FILE" > "${CRON_FILE}.new" || true
mv "${CRON_FILE}.new" "$CRON_FILE"

crontab "$CRON_FILE"
rm "$CRON_FILE"

echo ""
echo "============================================"
echo "  Reminders uninstalled."
echo "============================================"
echo ""
echo "The 9 AM and 9 PM cron jobs have been removed."
echo "Your in-app reminders (browser notifications / chime) still work."
