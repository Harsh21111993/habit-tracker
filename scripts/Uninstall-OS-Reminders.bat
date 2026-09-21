@echo off
REM ============================================================
REM WWWW x MAN's Habit Tracker - Uninstall OS-Level Reminders (Windows)
REM ============================================================
REM Removes the 9 AM and 9 PM scheduled tasks that were created
REM by Install-OS-Reminders.bat.
REM ============================================================

setlocal

echo Removing WWWWW-MANs-AM task...
schtasks /delete /tn "WWWW-MANs-AM" /f 2>nul

echo Removing WWWWW-MANs-PM task...
schtasks /delete /tn "WWWW-MANs-PM" /f 2>nul

echo.
echo ============================================
echo   Reminders uninstalled.
echo ============================================
echo.
echo The 9 AM and 9 PM scheduled tasks have been removed.
echo Your in-app reminders (browser notifications / chime) still work.
echo.
echo Press any key to close this window...
pause >nul
endlocal
