#!/bin/bash

# =============================================================================
# LifeArcade Kiosk Service Uninstaller
# Removes launchd service
# =============================================================================

PLIST_NAME="com.google.lifearcade.kiosk.plist"
PLIST_DST="/Library/LaunchAgents/$PLIST_NAME"

echo "🎮 Uninstalling LifeArcade Kiosk Service..."
echo ""

# Check if installed
if [ ! -f "$PLIST_DST" ]; then
    echo "⚠️  Service not installed."
    exit 0
fi

# Unload service
echo "⏹️  Stopping service..."
launchctl unload "$PLIST_DST" 2>/dev/null

# Remove plist
echo "🗑️  Removing plist..."
sudo rm "$PLIST_DST"

echo ""
echo "✅ Service uninstalled."
echo ""
echo "Note: LifeArcade will no longer auto-restart."
echo "To reinstall: ./install-service.sh"
