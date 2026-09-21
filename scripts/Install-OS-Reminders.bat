@echo off
REM ============================================================
REM WWWW x MAN's Habit Tracker - Install OS-Level Reminders (Windows)
REM ============================================================
REM This installs two Windows Scheduled Tasks that fire at
REM 9:00 AM and 9:00 PM every day. They open your habit tracker
REM automatically so you can check in.
REM
REM HOW TO USE:
REM   1. Right-click this .bat file -> Run as administrator
REM      (You need admin rights to create Scheduled Tasks.)
REM   2. A confirmation message appears when done.
REM   3. From now on, at 9 AM your tracker opens automatically.
REM      At 9 PM, your tracker opens automatically.
REM
REM To UNINSTALL:
REM   Run Uninstall-OS-Reminders.bat (also as administrator).
REM
REM NOTE: These OS-level reminders are independent of the in-app
REM browser notifications. You can use either or both. The OS-level
REM reminders fire even if your browser is closed.
REM ============================================================

setlocal

REM Find the folder this .bat lives in (parent of scripts/)
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "APP_DIR=%SCRIPT_DIR%\.."
set "BAT_PATH=%APP_DIR%\WWWW-MANs.bat"

REM Resolve relative path
pushd "%APP_DIR%"
set "APP_DIR=%CD%"
set "BAT_PATH=%APP_DIR%\WWWW-MANs.bat"
popd

REM Verify the launcher exists
if not exist "%BAT_PATH%" (
    echo [ERROR] Cannot find WWWWW-MANs.bat at:
    echo   %BAT_PATH%
    echo Please keep this .bat file inside the habit-tracker\scripts folder.
    pause
    exit /b 1
)

REM Create the scheduled tasks
echo Creating 9:00 AM reminder (WWW)...
schtasks /create /tn "WWWW-MANs-AM" /tr "\"%BAT_PATH%\"" /sc daily /st 09:00 /f

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to create 9 AM task. Did you run as administrator?
    echo Right-click this .bat -> "Run as administrator"
    pause
    exit /b 1
)

echo Creating 9:00 PM reminder (MAN's)...
schtasks /create /tn "WWWW-MANs-PM" /tr "\"%BAT_PATH%\"" /sc daily /st 21:00 /f

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to create 9 PM task. Did you run as administrator?
    pause
    exit /b 1
)

echo.
echo ============================================
echo   SUCCESS! OS-level reminders installed.
echo ============================================
echo.
echo Two Scheduled Tasks were created:
echo   - WWWWW-MANs-AM   (fires daily at 9:00 AM)
echo   - WWWWW-MANs-PM   (fires daily at 9:00 PM)
echo.
echo Each task will open your habit tracker automatically
echo at the scheduled time. Just mark your habits and close.
echo.
echo To change the reminder times, edit this .bat file:
echo   Change /st 09:00 to /st 06:00 (or whatever time you want)
echo   Then re-run this installer.
echo.
echo To uninstall, run: Uninstall-OS-Reminders.bat
echo.
echo Press any key to close this window...
pause >nul
endlocal
