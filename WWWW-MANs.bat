@echo off
REM ============================================================
REM WWWW x MAN's Habit Tracker - Windows Launcher
REM ============================================================
REM Opens the habit tracker in a clean "app window"
REM (no URL bar, no tabs - looks like a real installed app).
REM
REM HOW TO USE:
REM   - Just double-click this .bat file
REM   - To create a desktop shortcut with the flame icon, run:
REM     Create-Desktop-Shortcut.bat instead
REM ============================================================

setlocal

REM Find the folder this .bat lives in (handles spaces in path)
set "APP_DIR=%~dp0"
set "APP_DIR=%APP_DIR:~0,-1%"
set "HTML_FILE=%APP_DIR%\index.html"

REM Verify index.html exists
if not exist "%HTML_FILE%" (
    echo.
    echo [ERROR] Cannot find index.html in:
    echo   %APP_DIR%
    echo.
    echo Please make sure this .bat file stays inside the habit-tracker folder.
    pause
    exit /b 1
)

REM File URL (with triple-slash for absolute local path)
set "FILE_URL=file:///%HTML_FILE%"
REM Replace backslashes with forward slashes
set "FILE_URL=%FILE_URL:\=/%"

REM Find the best available Chromium browser (Chrome > Edge > Brave > default)
set "BROWSER="
set "BROWSER_ARGS=--app=%FILE_URL% --app-id=wwww-mans-tracker"

REM Try Google Chrome
for %%P in (
    "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
    "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
    "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) do (
    if exist %%P (
        set "BROWSER=%%~P"
        goto :found
    )
)

REM Try Microsoft Edge
for %%P in (
    "%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"
    "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
    "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) do (
    if exist %%P (
        set "BROWSER=%%~P"
        goto :found
    )
)

REM Try Brave
for %%P in (
    "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe"
    "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
    "%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe"
) do (
    if exist %%P (
        set "BROWSER=%%~P"
        goto :found
    )
)

:found
if defined BROWSER (
    REM Launch in app mode (clean window, no browser chrome)
    start "" "%BROWSER%" %BROWSER_ARGS%
) else (
    REM Fallback: open in default browser (will show URL bar)
    echo.
    echo No Chromium browser found. Opening in default browser.
    echo For the best "app-like" experience, install Chrome or Edge.
    echo.
    start "" "%HTML_FILE%"
)

endlocal
