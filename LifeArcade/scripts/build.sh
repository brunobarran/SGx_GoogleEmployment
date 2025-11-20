#!/bin/bash

# =============================================================================
# Build LifeArcade.app Bundle
# Creates a macOS application bundle for double-click execution
# Follows KISS principle - minimal necessary structure
# =============================================================================

APP="LifeArcade.app"

echo "🔨 Building $APP..."

# Create macOS app bundle structure
mkdir -p "$APP/Contents/MacOS"

# Copy launch script
cp scripts/launch.sh "$APP/Contents/MacOS/"
chmod +x "$APP/Contents/MacOS/launch.sh"

# Create Info.plist
cat > "$APP/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launch.sh</string>

    <key>CFBundleName</key>
    <string>LifeArcade</string>

    <key>CFBundleDisplayName</key>
    <string>LifeArcade Kiosk</string>

    <key>CFBundleIdentifier</key>
    <string>com.google.lifearcade</string>

    <key>CFBundleVersion</key>
    <string>1.0</string>

    <key>CFBundleShortVersionString</key>
    <string>1.0</string>

    <key>CFBundlePackageType</key>
    <string>APPL</string>

    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>

    <key>LSUIElement</key>
    <false/>

    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo "✅ Built: $APP"
echo ""
echo "📦 To install on Mac Mini:"
echo "   sudo mv $APP /Applications/"
echo ""
echo "🧪 To test locally:"
echo "   open $APP"
