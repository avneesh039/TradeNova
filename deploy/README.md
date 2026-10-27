# TradeNova SN — Production VPS & Reverse Proxy Deployment Guide

This directory contains turnkey deployment scripts and configurations to run TradeNova SN on an Ubuntu/Debian VPS with Nginx, SSL, WebSocket reverse proxying, and zero-tracking privacy architecture.

---

## 1. Quick VPS Setup (One Command)

On a clean Ubuntu 22.04 / 24.04 or Debian 12 VPS:

```bash
# 1. Clone or copy your TradeNova SN directory to /var/www/tradenova
sudo mkdir -p /var/www/tradenova
# Upload files via scp/rsync/git

# 2. Run the automated VPS setup script
cd /var/www/tradenova
sudo bash deploy/setup_vps.sh your-domain.com
```

This automated script performs:
1. System package update & security patches
2. Installs **Node.js 20 LTS** & **MySQL Server**
3. Configures MySQL database `tradenova_db` with optimized UTF8mb4 schema
4. Installs **Nginx Reverse Proxy** and configures WebSocket streaming for Socket.IO (`/socket.io/`)
5. Sets up **Systemd Service** (`systemctl status tradenova`) with auto-restart on crashes or reboots
6. Enables UFW firewall allowing only SSH (22), HTTP (80), and HTTPS (443)

---

## 2. Obtain Free SSL with Certbot (Let's Encrypt)

Once your domain DNS A-record points to your VPS IP:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot will configure SSL certificates automatically and setup auto-renewal cron jobs.

---

## 3. Zerodha Kite Connect v3 Configuration

1. Log into [Zerodha Developer Console](https://developers.kite.trade/apps).
2. Create your Kite Connect app.
3. Set the **Redirect URL** to:
   ```
   https://your-domain.com/api/kite/callback
   ```
4. Enter your `KITE_API_KEY` and `KITE_API_SECRET` either:
   - In `.env` on your VPS, OR
   - Directly in the TradeNova admin UI by clicking **Zerodha Kite Feed** in the sidebar.
5. Click **⚡ Connect Zerodha Kite** each morning around 9:00 AM to authenticate your session and begin the live binary WebSocket stream.

---

## 4. Zero-Tracing Privacy Architecture

When using Zerodha Kite Connect v3 with TradeNova SN:
- **1-Way Market Feed Only:** TradeNova only receives inbound quotes (LTP, OHLC, 5-level Market Depth, and candles) from Zerodha.
- **Client Ledger Stays Local:** Client registrations, demo/real balances, orders, execution prices, and P&L calculations are processed **strictly inside your local MySQL database**.
- **No Client Data Shared:** Zerodha **never** sees your client user IDs, order volume, or broker margin allocations.
