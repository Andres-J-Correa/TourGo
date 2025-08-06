### Create a user for monitoring (optional but recommended)

```bash
sudo useradd -rs /bin/false prometheus
```

### Create a DB user for MySQL Exporter

```bash
sudo mysql -u root -p
```

```sql
CREATE USER 'exporter'@'localhost' IDENTIFIED BY ',exporter.';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Download MySQL Exporter

```bash
wget https://github.com/prometheus/mysqld_exporter/releases/download/v0.17.2/mysqld_exporter-0.17.2.linux-amd64.tar.gz
```

### Extract MySQL Exporter

```bash
tar -xzf mysqld_exporter-0.17.2.linux-amd64.tar.gz
```

### Create a directory in home for prometheus if it doesn't exist

```bash
cd /home
mkdir -p prometheus
cd prometheus
```

### Create a .cnf file for MySQL Exporter

```bash
nano /home/prometheus/.my.cnf
```

```ini
[client]
user=exporter
password=',exporter.'
```

Ensure the file has the correct permissions:

```bash
chmod 600 /home/prometheus/.my.cnf
sudo chown prometheus:prometheus /home/prometheus/.my.cnf
```

### copy the mysqld_exporter directory to /home/prometheus

```bash
cp -r mysqld_exporter-0.17.2.linux-amd64 /home/prometheus/
```

### create a systemd service file for mysqld_exporter

```bash
sudo nano /etc/systemd/system/mysqld_exporter.service
```

```ini
[Unit]
Description=Prometheus MySQL Exporter
After=network.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/home/prometheus/mysqld_exporter-0.17.2.linux-amd64/mysqld_exporter \
  --config.my-cnf=/home/prometheus/.my.cnf

Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Start and enable the mysqld_exporter service

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable --now mysqld_exporter
```

### Check the status of mysqld_exporter

```bash
sudo systemctl status mysqld_exporter
```

### Download Prometheus

Inside the `/home/prometheus` directory, download the latest version of Prometheus:

```bash
wget https://github.com/prometheus/prometheus/releases/download/v3.5.0/prometheus-3.5.0.linux-amd64.tar.gz
```

### Extract Prometheus

```bash
tar -xzf prometheus-3.5.0.linux-amd64.tar.gz
rm -rf prometheus-3.5.0.linux-amd64.tar.gz
```

### Copy Binaries and Set Permissions

```bash
cd prometheus-3.5.0.linux-amd64
sudo cp prometheus /usr/local/bin/
sudo cp promtool /usr/local/bin/
sudo chown prometheus:prometheus /usr/local/bin/prometheus /usr/local/bin/promtool
```

### Create Directories for Prometheus

```bash
sudo mkdir -p /etc/prometheus /var/lib/prometheus
sudo chown prometheus:prometheus /etc/prometheus /var/lib/prometheus
```

### Copy Configuration Files

```bash
sudo cp -r consoles /etc/prometheus -- doesn't exists in newer versions
sudo cp -r console_libraries /etc/prometheus -- doesn't exists in newer versions
sudo cp prometheus.yml /etc/prometheus/prometheus.yml
sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus
```

### Edit Prometheus Configuration

```bash
sudo nano /etc/prometheus/prometheus.yml
```

```yaml
- job_name: "mysql"
  static_configs:
    - targets: ["localhost:9104"]
```

### Create a systemd service file for Prometheus

```bash
sudo nano /etc/systemd/system/prometheus.service
```

```ini
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file=/etc/prometheus/prometheus.yml \
    --storage.tsdb.path=/var/lib/prometheus \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
```

### Start and enable the Prometheus service

```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
```

### Check the status of Prometheus

```bash
sudo systemctl status prometheus
```

### Access Prometheus Web Interface

You can access the Prometheus web interface by navigating to `http://<your-server-ip>:9090` in your web browser. Replace `<your-server-ip>` with the actual IP address of your server.

If you have a firewall enabled, make sure to allow traffic on port 9090:

```bash
sudo ufw allow 9090
```

After testing make sure to remove the firewall rule if you don't need it open to the public:

```bash
sudo ufw delete allow 9090
```

### Create Nginx Reverse Proxy for Prometheus

```bash
sudo nano /etc/nginx/sites-available/prometheus
```

```nginx
server {
    listen 80;
    server_name prometheus.tourgo.site;

    location / {
        proxy_pass http://localhost:9090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Enable the Nginx Configuration

```bash
sudo ln -s /etc/nginx/sites-available/prometheus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Secure with SSL (optional but recommended)

```bash
sudo certbot --nginx -d prometheus.tourgo.site
```

### Verify

https://prometheus.tourgo.site

This site is available to anyone, so we need to set up authentication to secure it.

### Set Up Basic Authentication for Prometheus

```bash
sudo apt install apache2-utils

sudo htpasswd -c /etc/nginx/.htpasswd prometheus

sudo nano /etc/nginx/sites-available/prometheus
```

```nginx
location / {
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;

    proxy_pass http://localhost:9090;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Now we will set up node_exporter to monitor the server itself

### Download Node Exporter

```bash
wget https://github.com/prometheus/node_exporter/releases/download/v1.9.1/node_exporter-1.9.1.linux-amd64.tar.gz
```

### Extract Node Exporter

```bash
tar -xzf node_exporter-1.9.1.linux-amd64.tar.gz
```

### create user for node_exporter

```bash
useradd -rs /bin/false nodeusr
```

#### Move Node Exporter to /usr/local/bin

```bash
mv node_exporter-1.9.1.linux-amd64/node_exporter /usr/local/bin/
```

### Create a systemd service file for Node Exporter

```bash
sudo nano /etc/systemd/system/node_exporter.service
```

```ini
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=nodeusr
Group=nodeusr
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
```

### Start and enable the Node Exporter service

```bash
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

### Check the status of Node Exporter

```bash
sudo systemctl status node_exporter
```

### Add Node Exporter to Prometheus Configuration

```bash
sudo nano /etc/prometheus/prometheus.yml
```

```yaml
- job_name: "node"
  static_configs:
    - targets: ["localhost:9100"]
```

### Restart Prometheus Configuration

```bash
sudo systemctl restart prometheus
```
