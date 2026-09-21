#!/bin/bash
# ============================================================
# WWWW x MAN's Habit Tracker - Uninstall OS-Level Reminders (macOS)
# ============================================================

AM_PLIST="$HOME/Library/LaunchAgents/com.personal.wwww-mans-tracker.am.plist"
PM_PLIST="$HOME/Library/LaunchAgents/com.personal.wwww-mans-tracker.pm.plist"

echo "Removing 9 AM reminder..."
if [ -f "$AM_PLIST" ]; then
    launchctl unload "$AM_PLIST" 2>/dev/null || true
    rm -f "$AM_PLIST"
fi

echo "Removing 9 PM reminder..."
if [ -f "$PM_PLIST" ]; then
    launchctl unload "$PM_PLIST" 2>/dev/null || true
    rm -f "$PM_PLIST"
fi

echo ""
echo "============================================"
echo "  Reminders uninstalled."
echo "============================================"
echo ""
echo "The 9 AM and 9 PM launchd jobs have been removed."
echo "Your in-app reminders (browser notifications / chime) still work."
