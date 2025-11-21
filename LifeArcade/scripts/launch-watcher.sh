#!/bin/bash

# =============================================================================
# LifeArcade Kiosk Launcher with Auto-Restart (EXPERIMENTAL)
#
# This is a development version with auto-restart capabilities.
# NOT YAGNI compliant - use only for testing crash recovery scenarios.
#
# Production version: launch.sh (simple, KISS compliant)
# =============================================================================

PROJECT_DIR="/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# =============================================================================
# Cleanup Function - Executed on SIGTERM/SIGINT/SIGHUP
# =============================================================================
cleanup() {
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Shutdown signal received"
    echo "🧹 Cleaning up resources..."

    # Kill Chrome if running
    if [ ! -z "$CHROME_PID" ] && kill -0 $CHROME_PID 2>/dev/null; then
        echo "   → Closing Chrome (PID: $CHROME_PID)..."
        kill $CHROME_PID 2>/dev/null
        wait $CHROME_PID 2>/dev/null
    fi

    # Stop Docker
    echo "   → Stopping Docker container..."
    cd "$PROJECT_DIR"
    docker compose down

    echo "✅ LifeArcade stopped cleanly"
    exit 0
}

# =============================================================================
# Install Signal Traps
# =============================================================================
# SIGINT  = Ctrl+C in terminal
# SIGTERM = System shutdown / kill command (Mac shutdown button)
# SIGHUP  = Terminal closed
trap cleanup INT TERM HUP

# =============================================================================
# Initialize
# =============================================================================
echo "🎮 LifeArcade Kiosk Launcher (Auto-Restart Mode)"
echo "=================================================="
echo ""
echo "⚠️  EXPERIMENTAL VERSION"
echo "    This version auto-restarts Chrome on crash."
echo "    For production, use launch.sh (simple, KISS)."
echo ""

cd "$PROJECT_DIR" || {
    echo "❌ Error: Cannot access project directory"
    echo "   Expected: $PROJECT_DIR"
    exit 1
}

# Start Docker container
echo "🐳 Starting Docker container..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to start Docker container"
    exit 1
fi

# Wait for server to be ready
echo "⏳ Waiting for server to respond..."
RETRY_COUNT=0
MAX_RETRIES=30

until curl -s http://localhost/installation.html > /dev/null; do
    sleep 1
    echo -n "."
    RETRY_COUNT=$((RETRY_COUNT + 1))

    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo ""
        echo "❌ Error: Server did not respond after ${MAX_RETRIES}s"
        echo "   Check Docker logs: docker compose logs"
        docker compose down
        exit 1
    fi
done

echo ""
echo "✅ Server ready at http://localhost/installation.html"
echo ""
echo "🔄 Auto-restart loop enabled"
echo "📌 To stop:"
echo "   - Press Ctrl+C in this terminal"
echo "   - Shutdown Mac (hold power button > 5s)"
echo ""

# =============================================================================
# Auto-Restart Loop
# =============================================================================
RESTART_COUNT=0

while true; do
    echo "────────────────────────────────────────────────"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Launching Chrome (restart #$RESTART_COUNT)"

    # Launch Chrome in kiosk mode
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

    # Verify Chrome started
    sleep 1
    if ! kill -0 $CHROME_PID 2>/dev/null; then
        echo "❌ Error: Chrome failed to start"
        echo "   Retrying in 5 seconds..."
        sleep 5
        continue
    fi

    echo "   Chrome PID: $CHROME_PID"

    # Wait for Chrome to fully open
    sleep 2

    # Force fullscreen with AppleScript
    echo "   Forcing fullscreen mode..."
    osascript -e 'tell application "Google Chrome" to activate' \
              -e 'tell application "System Events" to keystroke "f" using {control down, command down}' \
              2>/dev/null

    if [ $? -eq 0 ]; then
        echo "   ✅ Fullscreen activated"
    else
        echo "   ⚠️  Warning: Could not activate fullscreen (AppleScript failed)"
    fi

    # Wait for Chrome to exit
    wait $CHROME_PID
    EXIT_CODE=$?

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 💥 Chrome exited with code $EXIT_CODE"

    # Analyze exit code
    case $EXIT_CODE in
        0)
            echo "   Normal exit (user closed Chrome)"
            ;;
        1)
            echo "   ⚠️  Chrome crashed (exit code 1)"
            ;;
        *)
            echo "   ⚠️  Unexpected exit code: $EXIT_CODE"
            ;;
    esac

    # Increment restart counter
    RESTART_COUNT=$((RESTART_COUNT + 1))

    # Restart delay
    RESTART_DELAY=3
    echo "   ↻ Restarting in ${RESTART_DELAY} seconds..."
    sleep $RESTART_DELAY
done
