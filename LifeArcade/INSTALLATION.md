# LifeArcade - Installation Guide

Simple step-by-step guide for **macOS** and **Windows**.

---

## What You'll Install

1. **Docker Desktop** - Runs the app in a container
2. **LifeArcade** - The game installation

**Total time:** ~15 minutes

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

## Step 2: Get LifeArcade

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

## Step 3: Run LifeArcade

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

---

## Step 4: Stop the Application

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

