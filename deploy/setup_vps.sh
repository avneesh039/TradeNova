#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# TradeNova SN — Automated VPS Deployment Script (Ubuntu / Debian)
# Sets up Node.js 20, MySQL, Nginx, Let's Encrypt SSL & Systemd
# Usage: sudo bash setup_vps.sh your-domain.com
# ═══════════════════════════════════════════════════════════════

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "✖ Error: Please specify your domain name or IP."
    echo "Usage: sudo bash setup_vps.sh your-domain.com"
    exit 1
fi

echo "=========================================================="
echo "🚀 Starting TradeNova SN Production VPS Installation"
echo "Target Domain: $DOMAIN"
echo "=========================================================="

# 1. Update OS Packages
echo "📦 Updating OS repositories..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git build-essential ufw nginx certbot python3-certbot-nginx mysql-server

# 2. Install Node.js 20 LTS
echo "📦 Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "✔ Node $(node -v) & NPM $(npm -v) installed."

# 3. Setup MySQL Database
echo "📦 Configuring MySQL..."
systemctl start mysql
systemctl enable mysql

mysql -e "CREATE DATABASE IF NOT EXISTS tradenova_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'tradenova_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'NovaTrade@2026!';"
mysql -e "GRANT ALL PRIVILEGES ON tradenova_db.* TO 'tradenova_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "✔ MySQL database 'tradenova_db' configured with user 'tradenova_user'."

# 4. Create App Directory
APP_DIR="/var/www/tradenova"
mkdir -p "$APP_DIR"
echo "📂 App directory prepared at $APP_DIR"

# 5. Setup Firewall (UFW)
echo "🛡️ Configuring Firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 6. Install Systemd Service
echo "⚙️ Setting up systemd service..."
cat <<EOF > /etc/systemd/system/tradenova.service
[Unit]
Description=TradeNova SN Service
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=tradenova
Environment=NODE_ENV=production
Environment=PORT=3000
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

# 7. Configure Nginx
echo "🌐 Configuring Nginx reverse proxy..."
sed "s/your-domain.com/$DOMAIN/g" ./deploy/nginx.conf > /etc/nginx/sites-available/tradenova.conf
ln -sf /etc/nginx/sites-available/tradenova.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=========================================================="
echo "✔ TradeNova SN VPS Infrastructure Ready!"
echo "1. Upload your code to: $APP_DIR"
echo "2. Run: cd $APP_DIR && npm install"
echo "3. Run: systemctl enable --now tradenova"
echo "4. Issue SSL: certbot --nginx -d $DOMAIN"
echo "=========================================================="
