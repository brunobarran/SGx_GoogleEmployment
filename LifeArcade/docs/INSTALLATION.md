# LifeArcade - Installation Guide

Simple step-by-step guide for **macOS** and **Windows**.

---

## What You'll Install

1. **Git** - Version control to download the code
2. **Docker Desktop** - Runs the app in a container
3. **LifeArcade** - The game installation

**Total time:** ~20 minutes

---

## Step 1: Install Docker Desktop

### macOS (Mac Mini M4)

1. Go to: https://www.docker.com/products/docker-desktop
2. Click **"Download for Mac - Apple Chip"**
3. Open the downloaded `Docker.dmg`
4. Drag **Docker** to **Applications** folder
5. Open Docker from Applications
6. Enter your password when asked
7. Click **Accept** on the agreement
8. Wait for Docker to start (whale icon in menu bar)

### Windows

1. Go to: https://www.docker.com/products/docker-desktop
2. Click **"Download for Windows"**
3. Run `Docker Desktop Installer.exe`
4. Follow the installer (it will install WSL 2 automatically)
5. Restart your computer when asked
6. Open **Docker Desktop** from Start menu
7. Click **Accept** on the agreement
8. Wait for Docker to start (whale icon in system tray)

### Verify Docker Works

**macOS:** Open **Terminal** (Applications > Utilities > Terminal)
**Windows:** Open **PowerShell** (Start menu > type "PowerShell")

Run this command:

```bash
docker --version
```

You should see something like: `Docker version 24.0.x`

✅ Docker is installed!

---

## Step 2: Install Git

Git is required to download the LifeArcade code from GitHub.

### macOS

Git comes pre-installed on macOS. To verify:

```bash
git --version
```

If not installed, macOS will prompt you to install **Xcode Command Line Tools**. Click **Install** and wait.

### Windows

1. Go to: https://git-scm.com/download/win
2. Click **"Click here to download"** (64-bit version)
3. Run the installer `Git-X.XX.X-64-bit.exe`
4. Use default settings (click **Next** on each screen)
5. Click **Install**, then **Finish**

### Verify Git Works

**macOS:** Open **Terminal**
**Windows:** Open **PowerShell**

Run:

```bash
git --version
```

You should see something like: `git version 2.43.x`

✅ Git is installed!

---

## Step 3: Get LifeArcade

### Clone the Repository

**macOS:**

```bash
cd ~/Desktop
git clone https://github.com/brunobarran/SGx_GoogleEmployment.git
cd SGx_GoogleEmployment/LifeArcade
```

**Windows (PowerShell):**

```powershell
cd $HOME\Desktop
git clone https://github.com/brunobarran/SGx_GoogleEmployment.git
cd SGx_GoogleEmployment\LifeArcade
```

### Verify Files

Run:

```bash
ls
```

**Windows:** Use `dir` if `ls` doesn't work.

You should see files like:
- `Dockerfile`
- `docker-compose.yml`
- `package.json`

✅ Files are ready!

---

## Step 4: Run LifeArcade

### Start the Application

In the same Terminal/PowerShell window, run:

```bash
docker compose up --build -d
```

**What happens:**
- Downloads required software (~1-2 minutes)
- Builds the application (~1 minute)
- Starts the container

You'll see:
```
[+] Building...
[+] Running 1/1
 ✔ Container lifearcade-kiosk  Started
```

✅ Application is running!

### Open in Browser

Open **Google Chrome** and go to:

```
http://localhost/installation.html
```

🎮 **You should see LifeArcade!**

### Adjust Resolution (Development Only)

For testing the portrait display (1200×1920):

1. Press **F12** to open DevTools
2. Click the **device toggle** icon (or press `Ctrl+Shift+M` / `Cmd+Shift+M`)
3. In the dimensions dropdown, select **"Responsive"**
4. Set dimensions to **1200 × 1920**
5. Press **F12** again to hide DevTools and view fullscreen

**Note:** This is only for development testing. The Mac Mini kiosk uses the physical 1200×1920 portrait monitor.

---

## Step 5: Stop the Application

When you're done:

```bash
docker compose down
```

To start again:

```bash
docker compose up -d
```

**Note:** No need to `--build` again unless you change code.

---

## Updating the Application

To get the latest changes from GitHub:

### macOS

```bash
# Navigate to project directory
cd ~/Desktop/SGx_GoogleEmployment/LifeArcade

# Pull latest changes
git pull origin main

# Rebuild Docker image
docker compose down
docker compose build

# Restart container
docker compose up -d
```

### Windows

```powershell
# Navigate to project directory
cd $HOME\Desktop\SGx_GoogleEmployment\LifeArcade

# Pull latest changes
git pull origin main

# Rebuild Docker image
docker compose down
docker compose build

# Restart container
docker compose up -d
```

**Note:** If you're using the macOS kiosk app (LifeArcade.app), you may also need to rebuild the app bundle if `launch.sh` changed. See `docs/INSTALL_MAC.md` for details.

---

