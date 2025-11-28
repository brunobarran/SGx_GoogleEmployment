#!/bin/bash

# =============================================================================
# LifeArcade Kiosk Launcher
# Starts Docker container and opens Chrome in fullscreen mode
# Uses macOS native fullscreen (always-on-top guaranteed)
# Follows KISS principle - simple and direct
# =============================================================================

PROJECT_DIR="/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade"
CHROME="/Applications/Chromium.app/Contents/MacOS/Chromium"

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Start Docker container
echo "Starting Docker container..."
docker compose up -d

# Wait for server (simple loop)
echo "Waiting for server..."
until curl -s http://localhost/installation.html > /dev/null; do
    sleep 1
    echo -n "."
done
echo ""
echo "Server ready!"

# Launch Chrome in app mode
echo "Launching Chrome in fullscreen mode..."
"$CHROME" \
    --app="http://localhost/installation.html" \
    --window-size=1200,1920 \
    --window-position=0,0 \
    --disable-session-crashed-bubble \
    --disable-infobars \
    --disable-restore-session-state \
    --no-first-run \
    --no-default-browser-check &

CHROME_PID=$!

# Wait for Chrome to open
sleep 2

# Force fullscreen with AppleScript (Cmd+Ctrl+F)
osascript -e 'tell application "Chromium" to activate' \
          -e 'tell application "System Events" to keystroke "f" using {control down, command down}'

# Wait for Chrome to close
wait $CHROME_PID

# Kiosk mode: Docker stays running for faster restart
echo "Chrome closed. Docker container still running."
