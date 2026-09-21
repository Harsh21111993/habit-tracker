WWWW x MAN's - Daily Habit Tracker
====================================

A 100% offline, self-contained daily habit tracker. No internet (after first
load), no server, no Node.js. PWA-enabled - works as a real installed app
on iPhone, Android, Mac, Windows, and Linux.


NEW: INSTALL ON iPHONE 15 (works like a real iOS app)
-----------------------------------------------------

This is a PWA (Progressive Web App). When you install it on your iPhone 15,
it looks and behaves like a native iOS app:
  - Flame icon on your home screen, next to your other apps
  - Opens full-screen, no Safari URL bar
  - Has its own splash screen when launching
  - Works offline after first load
  - Can send 9 AM / 9 PM push notifications (iOS 16.4+ required - your
    iPhone 15 has this)

STEP 1: Get the tracker online (one-time, ~5 minutes)
  iOS Safari can only install a PWA from an HTTPS URL. You can't "Add to
  Home Screen" from a file:// path. The easiest free option:

  Option A - GitHub Pages (RECOMMENDED, totally free):
    1. Create a free account at github.com if you don't have one
    2. Click the "+" icon -> "New repository"
    3. Name it "habit-tracker", set to Public, click "Create repository"
    4. Click "uploading an existing file" link
    5. Drag ALL files from this habit-tracker folder into the upload area
       (including subfolders: _next, icons, ios-splash, scripts)
    6. Click "Commit changes"
    7. In the repo, click Settings (top tab) -> Pages (left sidebar)
    8. Under "Build and deployment", Source: "Deploy from a branch",
       Branch: "main" / "(root)" -> click Save
    9. Wait 1-2 minutes, refresh the Settings/Pages page
    10. You'll see "Your site is live at https://YOURNAME.github.io/habit-tracker/"

  Option B - Netlify drop (also free, even easier, no account needed):
    1. Go to https://app.netlify.com/drop
    2. Drag the entire habit-tracker folder into the drop area
    3. You instantly get a URL like "https://random-name-123.netlify.app"
    4. (Optional) Sign up free to claim the URL permanently

STEP 2: Install on your iPhone 15 (one-time, ~30 seconds)
  1. Open Safari on your iPhone 15 (NOT Chrome - iOS only allows PWA install
     from Safari)
  2. Type your URL from Step 1 in the address bar
  3. The tracker loads. Log in to your habit tracker once (just tap a habit
     to confirm it works)
  4. Tap the Share button at the bottom of Safari (square with up-arrow)
  5. Scroll down, tap "Add to Home Screen"
  6. (Optional) Edit the name - default is "WWWW x MAN's Tracker"
  7. Tap "Add" in the top right

DONE. You now have the flame icon on your iPhone 15 home screen. Tap it
anytime to open your tracker full-screen - no Safari URL bar, no browser
chrome, looks and feels like a real iOS app.

STEP 3: Enable push notifications on iPhone (one-time)
  1. Open the tracker from your home screen icon (NOT Safari)
  2. Tap "Reminders" button at the top right
  3. Tap "Allow notifications" - iOS will ask "Allow notifications from
     this website?" -> Tap "Allow"
  4. Tap "Send test notification now" to verify
  5. Close the settings panel

From now on, at 9:00 AM and 9:00 PM, your iPhone will show a notification:
  "Time to check your WWW tracker" / "Time to check your MAN's tracker"

IMPORTANT: For iOS Web Push to keep working:
  - Open the tracker at least once every 7 days (Apple pauses notifications
    for unused web apps, same as for native apps)
  - Notifications fire even when the tracker isn't open
  - May be delayed if your iPhone is in Low Power Mode or Focus mode
    (same as native apps)


LAUNCH ON WINDOWS
-----------------

STEP 1: Unblock the zip (one-time only)
  - Right-click habit-tracker.zip -> Properties
  - At the bottom, check "Unblock" -> Apply -> OK
  - Extract the zip (right-click -> Extract All)

STEP 2: Create desktop shortcut
  - Double-click Create-Desktop-Shortcut.bat
  - If a security prompt appears, click "Open"
  - "SUCCESS! Shortcut created." appears on screen.

STEP 3: Pin to Taskbar (one-click access forever)
  - Right-click the desktop shortcut -> "Pin to Taskbar"


LAUNCH ON MAC
-------------

Option A: Use the bundled .app (RECOMMENDED)
  1. Drag "WWWW x MAN's Tracker.app" from this folder to:
     - Your Applications folder (permanent install), OR
     - Your Dock (right side, next to other apps)
  2. First launch only: right-click the .app -> Open -> "Open" again
     (one-time macOS warning because it's from the internet)
  3. From now on, the flame icon sits in your Dock.

Option B: Use the .command file (lighter, stays in this folder)
  1. First time: right-click WWWWW-MANs.command -> Open -> "Open" anyway
  2. After that, just double-click it to launch.
  3. (Optional) Drag it to the right side of your Dock.


LAUNCH ON LINUX
--------------

Quick (just run it):
  1. Right-click WWWWW-MANs.sh -> Properties -> Permissions ->
     check "Allow executing file as program"
  2. Double-click WWWWW-MANs.sh to launch.

Pin to app menu / dock:
  1. cd /path/to/habit-tracker && chmod +x WWWWW-MANs.sh
  2. cp WWWWW-MANs.desktop ~/.local/share/applications/
  3. Edit Exec=, Icon=, Path= in that .desktop file to absolute paths
  4. update-desktop-database ~/.local/share/applications/
  5. Search "WWWW" in your app menu -> drag to dock to pin


NOTIFICATION SETTINGS
---------------------
Click "Reminders" in the top right corner to open the settings panel:
  - Toggle reminders on/off (master switch)
  - Pick the reminder times (default: 9:00 AM and 9:00 PM)
  - Enable/disable WWW reminder and MAN's reminder separately
  - Toggle the chime sound on/off (with preview button)
  - "Send test notification now" button (in-page only)
  - NEW: "Real push notifications" section with subscribe button
  - NEW: "Test server push now" button (sends a real push from Netlify)
  - "How it works" expandable section

All notification settings are saved on your device. They persist across
launches.


REAL PUSH NOTIFICATIONS (REQUIRES NETLIFY BACKEND SETUP)
---------------------------------------------------------
The default reminders only fire when the tracker tab is open. To get real
OS-level push notifications at 9 AM IST, 7 PM IST, and 9 PM IST EVEN when
the app is closed, you need to deploy the included Netlify Functions backend.

See NETLIFY-PUSH-SETUP.txt for a step-by-step guide.

Quick summary:
  1. Upload this folder to a GitHub repo (must include netlify/ folder)
  2. Connect the repo to Netlify (NOT Netlify Drop - that skips functions)
  3. Set 3 env vars in Netlify: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,
     VAPID_SUBJECT (values are in NETLIFY-PUSH-SETUP.txt)
  4. Re-deploy
  5. Open the tracker on your iPhone, tap "Reminders" -> "Enable push
     notifications"
  6. Tap "Test server push now" to verify

Cost: FREE on Netlify's free tier (~90 function calls/month at 3 reminders/day)


OS-LEVEL REMINDERS (FIRE EVEN IF BROWSER IS CLOSED)
---------------------------------------------------
For Windows/Mac/Linux users who want reminders even when their browser is
closed, run the install script in the scripts/ subfolder:
  - Windows: scripts\Install-OS-Reminders.bat (run as administrator)
  - Mac:     scripts/install-os-reminders-mac.sh (run in Terminal)
  - Linux:   scripts/install-os-reminders-linux.sh (run in terminal)

To uninstall, run the matching Uninstall script.

NOTE: iPhone/iOS doesn't support OS-level scheduled scripts - Apple's
restriction. Use the in-app Web Push notifications instead (see Step 3
above). They work just as well.


YOUR DATA STAYS PRIVATE ON YOUR DEVICE
---------------------------------------
  - This app does NOT use the internet (after first load).
  - It does NOT send anything to any server.
  - Everything - habit check-ins, reflections, streaks, notification
    settings - is stored ONLY inside your own browser using localStorage.

  IMPORTANT: Each device + browser has its own separate localStorage.
  Your iPhone's habit history is separate from your computer's.
  This is by design - your data is private to each device.

  To erase everything: click "Reset" at the top right of the app.


IF THE PAGE LOOKS BROKEN
-------------------------
  - Use a modern browser: Chrome, Firefox, Edge, or Safari (2020 or newer)
  - iPhone requires iOS 16.4+ for push notifications (you have this)
  - If a .bat file shows "Windows protected your PC" blue SmartScreen
    dialog, click "More info" -> "Run anyway".


FINAL WORD
----------
  "You do not rise to the level of your goals.
   You fall to the level of your systems."
                           - James Clear, Atomic Habits

  Win the morning. Don't break the chain. Become the person.
