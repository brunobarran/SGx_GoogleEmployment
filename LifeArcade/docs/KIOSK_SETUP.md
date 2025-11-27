# LifeArcade - Kiosk Mode Setup

Complete guide to configure Mac Mini M4 for unattended kiosk operation.

**Result:** Mac turns on automatically when power is restored, LifeArcade starts, and restarts if Chrome closes.

---

## Prerequisites

Before configuring kiosk mode, complete the standard installation:
- [ ] Docker Desktop installed
- [ ] LifeArcade.app installed in /Applications/
- [ ] First launch successful (Gatekeeper bypassed)

See `INSTALL_MAC.md` for full installation guide.

---

## Step 1: Auto Power-On

Configure Mac Mini to turn on automatically when power is restored.

### Option A: Terminal (Recommended)

```bash
# Enable auto power-on after power failure
sudo systemsetup -setrestartpowerfailure on

# Verify setting
sudo systemsetup -getrestartpowerfailure
# Expected: "Restart After Power Failure: On"
```

### Option B: System Settings

1. Open **System Settings**
2. Go to **Energy** (or Energy Saver)
3. Enable **"Start up automatically after a power failure"**

---

## Step 2: Auto Login

Configure the Mac to login automatically without password.

1. Open **System Settings**
2. Go to **Users & Groups**
3. Click **Login Options** (bottom of sidebar)
4. Set **Automatic login** to your user (e.g., "specialguestx")
5. Enter password when prompted

> **Security Note:** This is acceptable for a dedicated kiosk machine not connected to sensitive networks.

---

## Step 3: Docker Desktop Auto-Start

Ensure Docker Desktop starts on login (required before LifeArcade).

1. Open **Docker Desktop**
2. Go to **Settings** (gear icon)
3. Under **General**, enable **"Start Docker Desktop when you sign in"**
4. Click **Apply & Restart**

---

## Step 4: Install Watchdog Service

The watchdog service automatically restarts LifeArcade if Chrome closes.

```bash
# Navigate to project
cd ~/Documents/GitHub/SGx_GoogleEmployment/LifeArcade

# Make scripts executable
chmod +x scripts/*.sh

# Install service (requires password)
./scripts/install-service.sh
```

**Expected output:**
```
🎮 Installing LifeArcade Kiosk Service...

📁 Copying plist to /Library/LaunchAgents/...
🚀 Loading service...

✅ Service installed and running!

The service will:
  • Start LifeArcade on login
  • Restart automatically if Chrome closes
  • Wait 10 seconds between restarts
```

---

## Step 5: Verify Setup

### Test Power Recovery

1. Shut down Mac Mini normally
2. Unplug power cable
3. Wait 5 seconds
4. Plug power cable back in
5. Mac should turn on automatically

### Test Watchdog

1. With LifeArcade running, close Chrome (Cmd+Q)
2. Wait 10 seconds
3. LifeArcade should restart automatically

---

## Managing the Service

### Check Status

```bash
launchctl list | grep lifearcade
```

### Stop Service Temporarily

```bash
launchctl unload /Library/LaunchAgents/com.google.lifearcade.kiosk.plist
```

### Start Service Again

```bash
launchctl load /Library/LaunchAgents/com.google.lifearcade.kiosk.plist
```

### Uninstall Service

```bash
cd ~/Documents/GitHub/SGx_GoogleEmployment/LifeArcade
./scripts/uninstall-service.sh
```

---

## How It Works

### Power Cycle Flow

```
Power restored
    ↓
Mac Mini auto-boots (systemsetup)
    ↓
Auto-login to user account
    ↓
Docker Desktop starts (Login Item)
    ↓
launchd loads com.google.lifearcade.kiosk.plist
    ↓
launch.sh executes
    ↓
Docker container starts
    ↓
Chrome opens in fullscreen
    ↓
LifeArcade running!
```

### Restart Flow

```
Chrome closes (crash or manual)
    ↓
launch.sh exits
    ↓
launchd detects exit (KeepAlive: true)
    ↓
Waits 10 seconds (ThrottleInterval)
    ↓
Restarts launch.sh
    ↓
Docker already running (fast start)
    ↓
Chrome opens again
    ↓
LifeArcade running!
```

---

## Troubleshooting

### Service Not Starting

```bash
# Check if service is loaded
launchctl list | grep lifearcade

# If not listed, load manually
launchctl load /Library/LaunchAgents/com.google.lifearcade.kiosk.plist

# Check for errors
launchctl error <error_code>
```

### Chrome Not Opening

1. Verify Docker is running: `docker ps`
2. Test server manually: `curl http://localhost/installation.html`
3. Check Chrome path exists: `ls /Applications/Google\ Chrome.app`

### Docker Not Starting

Ensure Docker Desktop is in Login Items:
1. System Settings → General → Login Items
2. Verify Docker is listed with ✓

### Mac Not Powering On

1. Verify setting: `sudo systemsetup -getrestartpowerfailure`
2. Reset SMC if needed (see Apple documentation)

---

## Files

| File | Purpose |
|------|---------|
| `scripts/launch.sh` | Main launcher script |
| `scripts/com.google.lifearcade.kiosk.plist` | launchd service definition |
| `scripts/install-service.sh` | Service installer |
| `scripts/uninstall-service.sh` | Service uninstaller |

---

## Summary Checklist

- [ ] Auto power-on enabled (`systemsetup -setrestartpowerfailure on`)
- [ ] Auto-login configured (System Settings → Users & Groups)
- [ ] Docker Desktop in Login Items
- [ ] Watchdog service installed (`./scripts/install-service.sh`)
- [ ] Power cycle test passed
- [ ] Watchdog test passed (Chrome close → auto restart)

✅ **Kiosk mode configured!**
