#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TRADENOVA SN — ONE-CLICK PRODUCTION DEPLOY SCRIPT
# Run this on your VPS: bash deploy_server.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "🚀 Starting TradeNova SN deployment for ciggymart.shop..."

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs || yum install -y nodejs
fi

echo "✔ Node version: $(node -v)"
echo "✔ NPM version: $(npm -v)"

# 2. Check / Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# 3. Install App Dependencies
echo "📦 Installing npm dependencies..."
npm install --production

# 4. Start or Reload Application via PM2
echo "⚡ Starting TradeNova server on port 3000..."
if pm2 describe tradenova-sn > /dev/null 2>&1; then
    pm2 reload tradenova-sn
else
    pm2 start ecosystem.config.js
fi

pm2 save

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ TradeNova SN is LIVE on port 3000!"
echo "   PM2 Status:"
pm2 status
echo "═══════════════════════════════════════════════════════════════"
