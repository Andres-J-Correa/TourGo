# KVM VPS Hostinger Setup Guide

## Step 1: Connect to Root via SSH

To connect to your VPS as root:

```bash
ssh root@your_server_ip
```

## Step 2: Create a New User

1. Replace `newusername` with your desired username.

```bash
adduser newusername
```

2. Grant sudo privileges to the new user:

```bash
usermod -aG sudo newusername
```

## Step 3: Set Up SSH Access for the New User

1. Switch to the new user:

```bash
su - newusername
```

2. Create the `.ssh` directory and set permissions:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

3. Copy the root user's SSH key to the new user:

```bash
cp /root/.ssh/authorized_keys ~/.ssh/
chmod 600 ~/.ssh/authorized_keys
```

## Step 4: Test the New User

Ensure you can log in via SSH using the new user and perform administrative tasks with sudo:

```bash
ssh newusername@your_server_ip
sudo ls /
```

## Step 5: Enable SSH for the New User (if needed)

If the new user cannot connect via SSH:

1. Create the `.ssh` directory for the user:

```bash
mkdir -p /home/newusername/.ssh
```

2. Copy the `authorized_keys` file from root:

```bash
cp /root/.ssh/authorized_keys /home/newusername/.ssh/authorized_keys
```

3. Set the correct ownership and permissions:

```bash
chown -R newusername:newusername /home/newusername/.ssh
chmod 700 /home/newusername/.ssh
chmod 600 /home/newusername/.ssh/authorized_keys
```

## Step 6: SSH Hardening

For security purposes, disable password authentication and root login.

1. Edit the SSH configuration file:

```bash
sudo vim /etc/ssh/ssh_config
```

2. Change the following values:

```text
PasswordAuthentication no
PermitRootLogin no
UsePAM no
```

3. Edit the cloud-init configuration file:

```bash
sudo vim /etc/ssh/ssh_config.d/50cloud-init.conf
```

4. Change the following value:

```text
PasswordAuthentication no
```

5. Apply changes by reloading SSH:

```bash
sudo systemctl reload ssh
```

6. Test by attempting to log in as root and your new user.

## Step 7: Domain Configuration

1. Purchase a domain.
2. Update your DNS settings:
   - Add a **CNAME** record for `www` pointing to your IP address.
   - Add an **A** record for `@` pointing to your IP address.

This completes the initial setup for your KVM VPS on Hostinger. 🚀
