@echo off
REM ============================================================
REM WWWW x MAN's Habit Tracker - Create Desktop Shortcut
REM ============================================================
REM Creates a desktop shortcut with the flame icon.
REM Just double-click this .bat file - that's it.
REM
REM After running, you'll see "WWWW x MAN's Tracker" on your desktop.
REM Right-click that shortcut -> "Pin to Taskbar" for one-click access.
REM ============================================================

setlocal

REM Find the folder this .bat lives in (handles spaces in path)
set "APP_DIR=%~dp0"
set "APP_DIR=%APP_DIR:~0,-1%"
set "BAT_PATH=%APP_DIR%\WWWW-MANs.bat"
set "ICON_PATH=%APP_DIR%\icons\favicon.ico"
set "HTML_PATH=%APP_DIR%\index.html"

REM Verify the main launcher exists
if not exist "%BAT_PATH%" (
    echo.
    echo [ERROR] Cannot find WWWWW-MANs.bat in:
    echo   %APP_DIR%
    echo.
    echo Please keep this .bat file inside the habit-tracker folder.
    pause
    exit /b 1
)

REM Verify index.html exists
if not exist "%HTML_PATH%" (
    echo.
    echo [ERROR] Cannot find index.html in:
    echo   %APP_DIR%
    echo.
    pause
    exit /b 1
)

REM Get the user's Desktop path (try Desktop, OneDrive Desktop)
set "DESKTOP=%USERPROFILE%\Desktop"
if not exist "%DESKTOP%" set "DESKTOP=%USERPROFILE%\OneDrive\Desktop"
if not exist "%DESKTOP%" (
    echo [ERROR] Cannot find your Desktop folder at:
    echo   %USERPROFILE%\Desktop
    echo   %USERPROFILE%\OneDrive\Desktop
    echo.
    echo Please create the shortcut manually.
    pause
    exit /b 1
)

set "SHORTCUT_PATH=%DESKTOP%\WWWW x MAN's Tracker.lnk"

REM Create the shortcut using VBScript (always available on Windows)
set "VBS=%TEMP%\create_shortcut_%RANDOM%.vbs"
(
    echo Set WshShell = CreateObject("WScript.Shell"^)
    echo Set shortcut = WshShell.CreateShortcut("%SHORTCUT_PATH%"^)
    echo shortcut.TargetPath = "%BAT_PATH%"
    echo shortcut.WorkingDirectory = "%APP_DIR%"
    echo shortcut.WindowStyle = 7
    echo shortcut.IconLocation = "%ICON_PATH%"
    echo shortcut.Description = "Open the WWW x MAN's Habit Tracker in app mode"
    echo shortcut.Save
) > "%VBS%"

cscript //nologo "%VBS%"
del "%VBS%"

if exist "%SHORTCUT_PATH%" (
    echo.
    echo ============================================
    echo   SUCCESS! Shortcut created.
    echo ============================================
    echo.
    echo Desktop shortcut created at:
    echo   %SHORTCUT_PATH%
    echo.
    echo NEXT STEPS:
    echo   1. Look on your desktop - you'll see the "WWWW x MAN's Tracker"
    echo      shortcut with the flame icon.
    echo   2. Double-click it to open your habit tracker.
    echo   3. To pin to taskbar: right-click the desktop shortcut
    echo      and choose "Pin to Taskbar".
    echo.
) else (
    echo.
    echo [ERROR] Could not create the shortcut automatically.
    echo.
    echo MANUAL FALLBACK:
    echo   1. Right-click WWWWW-MANs.bat in this folder
    echo   2. Choose "Send to" -^> "Desktop (create shortcut)"
    echo   3. Right-click the new desktop shortcut -^> Properties
    echo   4. Click "Change Icon..." -^> Browse to:
    echo      %ICON_PATH%
    echo   5. Click OK, then OK again.
    echo.
)

echo Press any key to close this window...
pause >nul
endlocal
