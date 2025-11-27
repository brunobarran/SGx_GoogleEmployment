# LifeArcade - Mac Installation Guide

Complete guide for installing LifeArcade in kiosk mode on Mac Mini M4.

**Total time:** ~15 minutes

---

## What You'll Install

1. **Docker Desktop** - Runs the app in a container
2. **LifeArcade.app** - macOS app bundle that launches in fullscreen kiosk mode

---

## Step 1: Install Prerequisites

### Docker Desktop

1. Go to: https://www.docker.com/products/docker-desktop
2. Click **"Download for Mac - Apple Chip"**
3. Open the downloaded `Docker.dmg`
4. Drag **Docker** to **Applications** folder
5. Open Docker from Applications
6. Enter your password when asked
7. Click **Accept** on the agreement
8. Wait for Docker to start (whale icon in menu bar)

### Google Chrome

1. Go to: https://www.google.com/chrome/
2. Download and install Chrome
3. Verify installation:

```bash
ls /Applications/Google\ Chrome.app
```

### Verify Docker Works

Open **Terminal** (Applications > Utilities > Terminal) and run:

```bash
docker --version
```

You should see: `Docker version 24.0.x` or similar

✅ Prerequisites ready!

---

## Step 2: Clone Repository

```bash
# Navigate to GitHub directory
cd ~/Documents/GitHub

# Clone repository
git clone https://github.com/brunobarran/SGx_GoogleEmployment.git

# Enter LifeArcade directory
cd SGx_GoogleEmployment/LifeArcade
```

**Important:** Project is configured for `/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade`

---

## Step 3: Build Docker Image

```bash
docker compose build
```

**Expected output:**
```
[+] Building 45.2s (15/15) FINISHED
 => [builder 1/6] FROM docker.io/library/node:22-alpine
 => [builder 6/6] RUN npm run build
 => exporting to image
```

**Time:** 1-3 minutes (first time)

---

## Step 4: Test Docker Container

```bash
# Start container
docker compose up -d

# Verify it's running
docker ps

# Test the server
curl http://localhost/installation.html

# Should return HTML (code 200)

# Stop container
docker compose down
```

✅ Docker is working!

---

## Step 5: Build LifeArcade.app

```bash
# Give execute permissions to scripts
chmod +x scripts/*.sh

# Build the app bundle
./scripts/build.sh
```

**Expected output:**
```
🔨 Building LifeArcade.app...
✅ Built: LifeArcade.app

📦 To install on Mac Mini:
   sudo mv LifeArcade.app /Applications/

🧪 To test locally:
   open LifeArcade.app
```

---

## Step 6: Test Locally (Recommended)

```bash
# Open the app WITHOUT installing
open LifeArcade.app
```

**What should happen:**
1. Terminal shows "Starting Docker container..."
2. Wait ~5-10 seconds
3. Chrome opens in fullscreen mode (automatically after 2 seconds)
4. Shows LifeArcade installation (idle screen)
5. When closing Chrome, asks if you want to stop Docker

**If something fails:**
- Verify Docker Desktop is running
- Check logs: `docker compose logs`
- Verify project is in correct path

---

## Step 7: Install to /Applications

```bash
# Move app to /Applications (requires password)
sudo mv LifeArcade.app /Applications/

# Verify installation
ls -la /Applications/LifeArcade.app
```

---

## Step 8: First Launch from Finder

1. Open **Finder**
2. Go to **Applications**
3. Find **LifeArcade**
4. **Double click** on LifeArcade.app

**macOS may show security alert (Gatekeeper):**

If you see: *"LifeArcade.app can't be opened because it is from an unidentified developer"*

**Solution:**
1. Go to **System Settings** → **Privacy & Security**
2. Scroll down
3. Look for message about blocked LifeArcade
4. Click **"Open Anyway"**
5. Confirm with password
6. Try opening LifeArcade again

**This is only needed the first time.**

---

## Step 9: Configure Auto-Start (Optional)

To have LifeArcade launch automatically when Mac turns on:

1. Go to **System Settings**
2. Click **General**
3. Click **Login Items**
4. Click the **"+"** button (bottom left)
5. Navigate to **Applications** → **LifeArcade**
6. Click **"Add"**
7. Verify it appears in list with ✓

**Result:** LifeArcade will open automatically on login.

---

## Daily Use

### Start LifeArcade

**Option 1: From Finder**
- Double click **Applications** → **LifeArcade**

**Option 2: From Terminal**
```bash
open /Applications/LifeArcade.app
```

**Option 3: Auto-start**
- If you configured Login Items, it starts automatically

---

### Close LifeArcade

1. Press **Cmd + Q** or close Chrome window
2. Terminal will ask: `Stop Docker container? (y/N):`
   - **y** = Stop container (frees port 80)
   - **N** = Leave container running (faster startup next time)

---

### Adjust Resolution (Development Only)

For testing the portrait display (1200×1920):

1. Press **F12** to open DevTools
2. Click the **device toggle** icon (or press `Cmd+Shift+M`)
3. In the dimensions dropdown, select **"Responsive"**
4. Set dimensions to **1200 × 1920**
5. Press **F12** again to hide DevTools and view fullscreen

**Note:** This is only for development testing. The Mac Mini kiosk uses the physical 1200×1920 portrait monitor.

---

## Maintenance

### Update Code

```bash
# Navigate to project
cd ~/Documents/GitHub/SGx_GoogleEmployment/LifeArcade

# Pull latest changes
git pull origin main

# Rebuild Docker image
docker compose down
docker compose build

# Rebuild app bundle (if launch.sh changed)
./scripts/build.sh
sudo mv LifeArcade.app /Applications/
```

---

### View Logs

```bash
# Docker container logs
cd ~/Documents/GitHub/SGx_GoogleEmployment/LifeArcade
docker compose logs -f
```

---

### Rebuild Everything

```bash
# Stop container
docker compose down

# Clean Docker build
docker compose build --no-cache

# Rebuild and install
./scripts/build.sh
sudo mv LifeArcade.app /Applications/
```

---

## Troubleshooting

### Error: "Docker is not installed"

**Solution:**
```bash
# Start Docker Desktop
open -a Docker

# Wait for whale icon in menu bar (~30 seconds)

# Verify
docker info
```

---

### Error: "Server did not respond in time"

**Possible causes:**
1. Port 80 is occupied
2. Docker build failed
3. Code has errors

**Solution:**
```bash
# Check port
lsof -i :80

# View Docker logs
docker compose logs

# Rebuild
docker compose down
docker compose build
docker compose up -d
```

---

### Chrome Opens but Blank Screen

**Solution:**
```bash
# Verify server responds
curl http://localhost/installation.html

# Should return HTML, not 404

# If 404, rebuild Vite
docker compose down
docker compose build
docker compose up -d
```

---

### Fullscreen Not Working

If Chrome opens in window mode instead of fullscreen:

**Verify AppleScript is in launch.sh:**
```bash
grep "osascript" /Applications/LifeArcade.app/Contents/MacOS/launch.sh
```

Should show:
```
osascript -e 'tell application "Google Chrome" to activate' \
```

**If missing, rebuild:**
```bash
cd ~/Documents/GitHub/SGx_GoogleEmployment/LifeArcade
./scripts/build.sh
sudo rm -rf /Applications/LifeArcade.app
sudo mv LifeArcade.app /Applications/
```

See `FULLSCREEN_SOLUTION.md` for detailed troubleshooting.

---

### Incorrect Resolution (not 1200×1920)

The resolution is configured with `--window-size=1200,1920` in `launch.sh`.

If your physical monitor is NOT 1200×1920:

1. Check monitor resolution:
   - System Settings → Displays → Resolution

2. Edit `scripts/launch.sh`:
```bash
# Change this line:
--window-size=1200,1920 \

# To your monitor resolution (example for 1080×1920):
--window-size=1080,1920 \
```

3. Rebuild app:
```bash
./scripts/build.sh
sudo mv LifeArcade.app /Applications/
```

---

### Auto-start Not Working

**Solution:**
1. Verify in **System Settings** → **Login Items**
2. LifeArcade should be in list with ✓
3. If not there, add it again
4. Restart Mac to test

**If still not working:**
- Docker Desktop must also be in Login Items
- Add Docker Desktop first, then LifeArcade

---

## System Specifications

### Optimal Configuration for Mac Mini M4

| Component | Specification |
|-----------|---------------|
| **Monitor** | 1200×1920 (portrait/vertical) |
| **RAM** | Minimum 8GB |
| **Docker Resources** | 2GB RAM, 2 CPUs |
| **Disk** | Minimum 5GB free |
| **macOS** | 10.15 Catalina or newer |
| **Chrome** | Latest version |

---

### Configure Docker Resources

If experiencing slowness:

1. Open **Docker Desktop**
2. Settings → Resources
3. Adjust:
   - **CPUs:** 2-4 (depending on your Mac)
   - **Memory:** 2-4 GB
   - **Swap:** 1 GB
4. Click **Apply & Restart**

---

## Installation Checklist

- [ ] Docker Desktop installed and running
- [ ] Google Chrome installed
- [ ] Repository cloned in `~/Documents/GitHub/SGx_GoogleEmployment/LifeArcade`
- [ ] `docker compose build` completed without errors
- [ ] `docker compose up -d` starts correctly
- [ ] `curl http://localhost/installation.html` returns HTML
- [ ] Scripts have execute permissions (`chmod +x`)
- [ ] `./scripts/build.sh` generates `LifeArcade.app`
- [ ] Local test successful (`open LifeArcade.app`)
- [ ] App installed in `/Applications/`
- [ ] First launch successful (bypassed Gatekeeper)
- [ ] Correct resolution (1200×1920)
- [ ] Auto-start configured (optional)
- [ ] Games work correctly

---

## Advanced Customization

### Change Port

If port 80 is occupied:

1. Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:4173"  # Change 80 to 8080
```

2. Edit `scripts/launch.sh`:
```bash
# Change:
http://localhost/installation.html
# To:
http://localhost:8080/installation.html
```

3. Rebuild:
```bash
docker compose down
docker compose build
./scripts/build.sh
sudo mv LifeArcade.app /Applications/
```

---

## Documentation

- **Fullscreen solution:** `FULLSCREEN_SOLUTION.md`
- **Fullscreen troubleshooting:** `TROUBLESHOOT_FULLSCREEN.md`
- **Kiosk mode (unattended):** `KIOSK_SETUP.md`
- **Scripts:** `scripts/README.md`
- **Development:** `CLAUDE.md`

---

## Step 10: Kiosk Mode (Optional)

For unattended operation where the Mac Mini:
- Turns on automatically when power is restored
- Restarts LifeArcade automatically if Chrome closes

See **`KIOSK_SETUP.md`** for complete instructions.

**Quick setup:**
```bash
# 1. Enable auto power-on
sudo systemsetup -setrestartpowerfailure on

# 2. Configure auto-login in System Settings

# 3. Install watchdog service
chmod +x scripts/*.sh
./scripts/install-service.sh
```

---

## ✅ Done!

LifeArcade is now installed and ready to use in kiosk mode.

**To start:** Double click **LifeArcade** in Applications.

**Enjoy the arcade! 🎮**
