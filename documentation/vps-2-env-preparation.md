# VPS Environment Preparation Guide

## Step 1: Preparing the VPS Environment

### 1. Connect to Your VPS

On your local machine, open a terminal and connect to your VPS using SSH:

```bash
ssh username@your_vps_ip
```

If this is your first time connecting, accept the fingerprint confirmation.

### 2. Update System Packages

Ensure your system is up to date:

```bash
sudo apt update && sudo apt upgrade -y
```

## Step 2: Install Node.js v20.15.0

### 1. Add the NodeSource Repository

Add the NodeSource repository (even if it's already added, this won't hurt):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

### 2. Install the Specific Version

```bash
sudo apt install -y nodejs=20.15.0-1nodesource1
```

### 3. Prevent Automatic Upgrades

Prevent automatic upgrades to newer versions by holding the package:

```bash
sudo apt-mark hold nodejs
```

### 4. Verify Installation

Check the installed version:

```bash
node -v
```

You should see:

```bash
v20.15.0
```

### 5. Confirm NPM Version

Since NPM is bundled with Node.js, verify it too:

```bash
npm -v
```

## Step 3: Install .NET SDK 8.0.114

### 1. Set Up Microsoft Repo

Add Microsoft’s package repository to access newer versions like 8.0.300 or 8.0.401 (or later):

```bash
wget https://packages.microsoft.com/config/ubuntu/24.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y apt-transport-https
sudo apt-get update
```

### 2. Check Available Versions

```bash
apt-cache madison dotnet-sdk-8.0
```

You might see 8.0.300, 8.0.401, etc.

### 3. Install SDK 8.0.114

1. Update Package Lists:

```bash
sudo apt-get update
```

2. Install SDK 8.0.114:

```bash
sudo apt-get install -y dotnet-sdk-8.0=8.0.114-0ubuntu1~24.04.1
```

3. Verify Installation:

```bash
dotnet --list-sdks
```

## Step 4: Install Nginx

### 1. Install and Start Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Verify Nginx is Running

```bash
sudo systemctl status nginx
```

### 3. Open Firewall Ports

Allow HTTP/HTTPS traffic:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```
