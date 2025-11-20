#!/bin/bash

# =============================================================================
# LifeArcade Kiosk Launcher
# Starts Docker container and opens Chrome in kiosk mode
# Follows KISS principle - simple and direct
# =============================================================================

PROJECT_DIR="/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

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

# Launch Chrome in kiosk mode
echo "Launching Chrome in kiosk mode..."
"$CHROME" \
    --kiosk \
    --app="http://localhost/installation.html" \
    --window-size=1200,1920 \
    --window-position=0,0 \
    --disable-session-crashed-bubble \
    --disable-infobars \
    --disable-restore-session-state \
    --no-first-run \
    --no-default-browser-check &

CHROME_PID=$!

# Wait for Chrome to close
wait $CHROME_PID

# Ask if user wants to stop Docker
echo ""
read -p "Stop Docker container? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Stopping Docker container..."
    docker compose down
    echo "Docker stopped."
else
    echo "Docker container still running."
fi
