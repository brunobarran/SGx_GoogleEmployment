#!/bin/bash

# =============================================================================
# LifeArcade Kiosk Service Installer
# Installs launchd service for automatic restart on Chrome close
# =============================================================================

PLIST_NAME="com.google.lifearcade.kiosk.plist"
PLIST_SRC="$(dirname "$0")/$PLIST_NAME"
PLIST_DST="/Library/LaunchAgents/$PLIST_NAME"

echo "🎮 Installing LifeArcade Kiosk Service..."
echo ""

# Check if plist exists
if [ ! -f "$PLIST_SRC" ]; then
    echo "❌ Error: $PLIST_SRC not found"
    exit 1
fi

# Check if already installed
if [ -f "$PLIST_DST" ]; then
    echo "⚠️  Service already installed. Unloading first..."
    launchctl unload "$PLIST_DST" 2>/dev/null
fi

# Copy plist (requires sudo)
echo "📁 Copying plist to /Library/LaunchAgents/..."
sudo cp "$PLIST_SRC" "$PLIST_DST"
sudo chown root:wheel "$PLIST_DST"
sudo chmod 644 "$PLIST_DST"

# Load service
echo "🚀 Loading service..."
launchctl load "$PLIST_DST"

# Verify
echo ""
if launchctl list | grep -q "com.google.lifearcade.kiosk"; then
    echo "✅ Service installed and running!"
    echo ""
    echo "The service will:"
    echo "  • Start LifeArcade on login"
    echo "  • Restart automatically if Chrome closes"
    echo "  • Wait 10 seconds between restarts"
    echo ""
    echo "To uninstall: ./uninstall-service.sh"
else
    echo "❌ Service failed to load. Check with:"
    echo "   launchctl list | grep lifearcade"
fi
