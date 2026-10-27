// ═══════════════════════════════════════════════════════════════
// TradeNova SN — WhatsApp Notification Service
// Powered by @open-wa/wa-automate (https://www.open-wa.org/)
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.status = 'DISCONNECTED'; // 'DISCONNECTED' | 'STARTING' | 'SCAN_QR' | 'CONNECTED' | 'ERROR'
    this.qrCode = null; // Base64 Data URL
    this.asciiQR = null;
    this.error = null;
    this.enabled = true;
    this.io = null;
    this.startedAt = null;
    this.me = null;
    this.recentLogs = [];
  }

  init(io) {
    this.io = io;
    console.log('[WhatsApp] Service initialized in standby mode (ready on demand).');
  }

  logMessage(type, recipient, text, status = 'SENT', err = null) {
    const entry = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      type,
      recipient,
      preview: text.length > 80 ? text.substring(0, 80) + '...' : text,
      fullText: text,
      status,
      error: err ? err.message || String(err) : null,
      timestamp: Date.now()
    };
    this.recentLogs.unshift(entry);
    if (this.recentLogs.length > 50) this.recentLogs.pop();
    if (this.io) {
      this.io.emit('whatsapp:log', entry);
    }
  }

  broadcastState() {
    if (!this.io) return;
    this.io.emit('whatsapp:status', this.getStatus());
  }

  getStatus() {
    return {
      status: this.status,
      connected: this.status === 'CONNECTED',
      qrCode: this.qrCode,
      enabled: this.enabled,
      startedAt: this.startedAt,
      me: this.me,
      error: this.error,
      recentLogs: this.recentLogs.slice(0, 15)
    };
  }

  toggleEnabled(val) {
    this.enabled = typeof val === 'boolean' ? val : !this.enabled;
    this.broadcastState();
    return this.enabled;
  }

  async start() {
    if (this.status === 'CONNECTED' && this.client) {
      console.log('[WhatsApp] Already connected.');
      return { success: true, message: 'Already connected' };
    }

    if (this.status === 'STARTING') {
      return { success: true, message: 'Session initialization already in progress' };
    }

    this.status = 'STARTING';
    this.error = null;
    this.broadcastState();

    try {
      let wa;
      try {
        wa = require('@open-wa/wa-automate');
      } catch (requireErr) {
        this.status = 'ERROR';
        this.error = '@open-wa/wa-automate package is not yet ready or installing. Error: ' + requireErr.message;
        this.broadcastState();
        console.error('[WhatsApp]', this.error);
        return { success: false, error: this.error };
      }

      console.log('[WhatsApp] Launching Open-WA automate browser session...');

      const chromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
      ];
      let executablePath = chromePaths.find(p => fs.existsSync(p)) || undefined;

      const launchConfig = {
        sessionId: 'TRADENOVA_WA_SESSION',
        multiDevice: true,
        authTimeout: 300,
        blockCrashLogs: true,
        disableSpins: true,
        headless: true,
        logConsole: false,
        qrTimeout: 0,
        popup: false,
        useChrome: true,
        restartOnCrash: true,
        killProcessOnBrowserClose: false,
        cacheEnabled: true,
        cachedPatch: true,
        navigationTimeoutMs: 120000,
        chromiumArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--disable-gpu'
        ]
      };

      if (executablePath) {
        launchConfig.executablePath = executablePath;
        console.log('[WhatsApp] Using local browser binary at:', executablePath);
      }

      // Intercept Open-WA CLI output sink to stream QR code directly to the Web UI
      if (typeof wa.setCliOutputSink === 'function') {
        const originalSink = typeof wa.getCliOutputSink === 'function' ? wa.getCliOutputSink() : null;
        wa.setCliOutputSink({
          promptChoice: (p) => originalSink?.promptChoice?.(p),
          write: (entry) => {
            if (originalSink?.write) originalSink.write(entry);
          },
          status: (update) => {
            console.log('[WhatsApp Sink Status]', update?.phase, update?.detail || '');
            if (update?.phase === 'client.ready') {
              this.status = 'CONNECTED';
              this.qrCode = null;
              this.startedAt = Date.now();
              this.broadcastState();
            } else if (update?.phase === 'auth.qr') {
              this.status = 'SCAN_QR';
              this.broadcastState();
            }
          },
          qr: async (payload) => {
            this.status = 'SCAN_QR';
            this.asciiQR = payload.qr;
            try {
              this.qrCode = await QRCode.toDataURL(payload.qr, { margin: 2, scale: 6 });
            } catch (qrErr) {
              console.error('[WhatsApp] QR DataURL conversion failed:', qrErr.message);
            }
            console.log('[WhatsApp] New QR code generated & broadcasted to Web UI!');
            this.broadcastState();
            if (originalSink?.qr) {
              try { originalSink.qr(payload); } catch (e) {}
            }
          }
        });
      }

      // Launch creation in background so the API call does not block waiting for phone scan
      wa.create({
        ...launchConfig,
        catchQR: async (qrCode, asciiQR, attempt) => {
          this.status = 'SCAN_QR';
          this.asciiQR = asciiQR;
          if (qrCode && qrCode.startsWith('data:')) {
            this.qrCode = qrCode;
          } else if (qrCode) {
            try {
              this.qrCode = await QRCode.toDataURL(qrCode, { margin: 2, scale: 6 });
            } catch (e) {}
          }
          console.log(`[WhatsApp] New QR code generated (attempt ${attempt}). Broadcasted to Web UI!`);
          this.broadcastState();
        },
        statusFind: (statusSession) => {
          console.log(`[WhatsApp] Session state: ${statusSession}`);
          if (statusSession === 'isLogged' || statusSession === 'chatsAvailable' || statusSession === 'inChat') {
            this.status = 'CONNECTED';
            this.qrCode = null;
            this.startedAt = Date.now();
            this.broadcastState();
          } else if (statusSession === 'notLogged') {
            this.status = 'SCAN_QR';
            this.broadcastState();
          } else if (statusSession === 'browserClose' || statusSession === 'qrReadFail') {
            this.status = 'DISCONNECTED';
            this.broadcastState();
          }
        }
      }).then(async (client) => {
        this.client = client;
        this.status = 'CONNECTED';
        this.qrCode = null;
        this.startedAt = Date.now();

        try {
          const me = await this.client.getMe();
          this.me = me ? { id: me.id, pushname: me.pushname || 'TradeNova Bot' } : null;
        } catch (meErr) {}

        console.log('[WhatsApp] Successfully connected to WhatsApp via Open-WA!');
        this.broadcastState();

        if (this.client.onStateChanged) {
          this.client.onStateChanged((state) => {
            console.log('[WhatsApp] State changed:', state);
            if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
              this.client.forceRefocus();
            }
            if (state === 'DISCONNECTED') {
              this.status = 'DISCONNECTED';
              this.broadcastState();
            }
          });
        }
      }).catch((err) => {
        this.status = 'ERROR';
        this.error = err.message || String(err);
        this.broadcastState();
        console.error('[WhatsApp] Failed to create session:', err.message);
      });

      return { success: true, message: 'WhatsApp session started, generating QR code...' };
    } catch (err) {
      this.status = 'ERROR';
      this.error = err.message || String(err);
      this.broadcastState();
      console.error('[WhatsApp] Failed to initiate session:', err);
      return { success: false, error: this.error };
    }
  }

  formatChatId(phone) {
    if (!phone) return null;
    let clean = String(phone).replace(/[^0-9]/g, '');
    if (!clean) return null;
    // Standard Indian 10-digit number -> prepend country code 91
    if (clean.length === 10) clean = '91' + clean;
    return `${clean}@c.us`;
  }

  async sendRawText(toPhone, message, type = 'ALERT') {
    if (!this.enabled) {
      console.log(`[WhatsApp:Disabled] Message to ${toPhone} skipped because service is disabled.`);
      this.logMessage(type, toPhone, message, 'SKIPPED_DISABLED');
      return { success: false, reason: 'WhatsApp notifications disabled in settings' };
    }

    const chatId = this.formatChatId(toPhone);
    if (!chatId) {
      console.warn(`[WhatsApp] Invalid phone number provided: ${toPhone}`);
      this.logMessage(type, toPhone, message, 'FAILED_INVALID_PHONE');
      return { success: false, reason: 'Invalid phone number' };
    }

    if (this.status !== 'CONNECTED' || !this.client) {
      console.log(`[WhatsApp:Simulated] Client not connected (${this.status}). Message logged:`);
      console.log(`-> To: ${chatId}\n-> Content:\n${message}\n`);
      this.logMessage(type, toPhone, message, 'SIMULATED_NOT_CONNECTED');
      return { success: true, simulated: true, reason: 'WhatsApp bot not linked yet' };
    }

    try {
      const res = await this.client.sendText(chatId, message);
      this.logMessage(type, toPhone, message, 'DELIVERED');
      return { success: true, res };
    } catch (err) {
      console.error(`[WhatsApp] Send error to ${chatId}:`, err.message);
      this.logMessage(type, toPhone, message, 'ERROR', err);
      return { success: false, error: err.message };
    }
  }

  // ═════════════════════════════════════════════════════════════
  // TRADE NOTIFICATION TEMPLATES
  // ═════════════════════════════════════════════════════════════

  notifyOrderExecuted(order, user) {
    if (!user || !user.phone) return;
    const isBuy = order.side.toLowerCase() === 'buy';
    const sideIcon = isBuy ? '🟢' : '🔴';
    const timeStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });

    const valStr = (order.price * order.qty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const priceStr = order.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const marginStr = (order.margin || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const msg = [
      `${sideIcon} *TRADENOVA SN — TRADE EXECUTED*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Trader:* ${user.name} (${user.username})`,
      `📈 *Script:* *${order.symbol}* (${order.exchange})`,
      `🎯 *Side:* *${order.side.toUpperCase()}*`,
      `📦 *Lots / Qty:* ${order.lots} Lots (${order.qty} units)`,
      `💰 *Exec Price:* ₹${priceStr}`,
      `💵 *Order Value:* ₹${valStr}`,
      `🛡️ *Margin Req:* ₹${marginStr}`,
      `⚡ *Order ID:* #${order.id}`,
      `⏱️ *Time:* ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Automated confirmation via TradeNova SN Terminal_`
    ].join('\n');

    return this.sendRawText(user.phone, msg, 'ORDER_EXEC');
  }

  notifyPositionClosed(closedTrade, user) {
    if (!user || !user.phone) return;
    const isProfit = closedTrade.pnl >= 0;
    const icon = isProfit ? '✅' : '🛑';
    const timeStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });

    const entryStr = (closedTrade.entryPrice || 0).toFixed(2);
    const exitStr = (closedTrade.exitPrice || 0).toFixed(2);
    const pnlStr = (isProfit ? '+' : '') + '₹' + Math.abs(closedTrade.pnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const msg = [
      `${icon} *TRADENOVA SN — POSITION SQUARED OFF*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Trader:* ${user.name} (${user.username})`,
      `📈 *Script:* *${closedTrade.symbol}* (${closedTrade.exchange})`,
      `📦 *Quantity:* ${closedTrade.qty} units`,
      `🎯 *Original Side:* ${closedTrade.side.toUpperCase()}`,
      `📉 *Entry Price:* ₹${entryStr}`,
      `📈 *Exit Price:* ₹${exitStr}`,
      `✨ *Realized P&L:* *${pnlStr}* (${isProfit ? 'PROFIT' : 'LOSS'})`,
      `💼 *Brokerage:* ₹${(closedTrade.brokerage || 0).toFixed(2)}`,
      `⏱️ *Time:* ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Trade closed & ledger updated automatically_`
    ].join('\n');

    return this.sendRawText(user.phone, msg, 'SQUARE_OFF');
  }

  notifySquareoffAll(user, count, netPL) {
    if (!user || !user.phone) return;
    const isProfit = netPL >= 0;
    const icon = isProfit ? '🟢' : '🔴';
    const timeStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const pnlStr = (isProfit ? '+' : '') + '₹' + Math.abs(netPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const msg = [
      `${icon} *TRADENOVA SN — BULK SQUAREOFF COMPLETED*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Trader:* ${user.name} (${user.username})`,
      `📦 *Total Positions Closed:* ${count}`,
      `✨ *Net Realized P&L:* *${pnlStr}*`,
      `⏱️ *Time:* ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_All open intraday market positions are now flat._`
    ].join('\n');

    return this.sendRawText(user.phone, msg, 'SQUAREOFF_ALL');
  }

  notifyFundTx(tx, user) {
    if (!user || !user.phone) return;
    const isDeposit = tx.type === 'deposit';
    const icon = isDeposit ? '💰' : '💸';
    const timeStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const amtStr = '₹' + tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const balStr = '₹' + user.funds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const msg = [
      `${icon} *TRADENOVA SN — FUNDS ${tx.type.toUpperCase()}*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Trader:* ${user.name} (${user.username})`,
      `💵 *Amount:* *${amtStr}*`,
      `💳 *Available Balance:* *${balStr}*`,
      `📝 *Notes:* ${tx.notes || 'Ledger entry'}`,
      `⏱️ *Time:* ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Funds transaction recorded in your TradeNova account._`
    ].join('\n');

    return this.sendRawText(user.phone, msg, 'FUNDS');
  }

  notifyRegistrationOtp(phone, name, otp) {
    const timeStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const msg = [
      `🔐 *TRADENOVA SN — VERIFICATION OTP*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Hello *${name}*,`,
      `Welcome to TradeNova SN Institutional Paper Trading!`,
      ``,
      `Your verification code to complete trader registration is:`,
      `👉 *${otp}* 👈`,
      ``,
      `⏱️ *Valid for:* 10 minutes`,
      `🛡️ *Security:* Do NOT share this code with anyone.`,
      `⏱️ *Time:* ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_TradeNova SN Automated Verification Engine_`
    ].join('\n');

    return this.sendRawText(phone, msg, 'OTP_VERIFICATION');
  }

  notifyWelcomeRegistration(user) {
    if (!user || !user.phone) return;
    const timeStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const supportPhone = process.env.SUPPORT_PHONE || '9876543210';
    const portalUrl = process.env.PORTAL_URL || 'http://localhost:3000';

    const msg = [
      `🎉 *WELCOME TO TRADENOVA SN!*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Hello *${user.name}*,`,
      `Your trader account has been successfully verified & activated!`,
      ``,
      `👤 *User ID:* *${user.username}*`,
      `💰 *Paper Trading Funds:* ₹${(user.funds || 1000000).toLocaleString('en-IN')}`,
      `🛡️ *Credit Margin Limit:* ₹${(user.creditLimit || 2000000).toLocaleString('en-IN')}`,
      `📈 *Exchanges Enabled:* NSE, MCX, F&O, CDS`,
      `⏱️ *Registered At:* ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🔘 *QUICK ACTION BUTTONS:*`,
      ``,
      `1️⃣ *[VISIT WEBSITE]*`,
      `🌐 ${portalUrl}`,
      ``,
      `2️⃣ *[CALL US / DESK HELPLINE]*`,
      `📞 +91 ${supportPhone}`,
      `📲 Tap to Dial: tel:+91${supportPhone.replace(/[^0-9]/g, '')}`,
      `💬 WhatsApp Chat: https://wa.me/91${supportPhone.replace(/[^0-9]/g, '')}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Happy & Disciplined Trading!_`
    ].join('\n');

    return this.sendRawText(user.phone, msg, 'REGISTRATION_WELCOME');
  }

  notifyClientCreated(user, rawPassword) {
    const targetPhone = user.mobile || user.phone;
    if (!user || !targetPhone) return;
    const timeStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const roleName = user.role === 'admin' ? 'Super Admin' : user.role === 'broker' ? 'Master Broker' : 'Client Trader';
    const acctType = user.demo || user.isDemo ? 'Demo Paper Account' : 'Live Institutional Account';

    const supportPhone = process.env.SUPPORT_PHONE || '9876543210';
    const portalUrl = process.env.PORTAL_URL || 'http://localhost:3000';

    const msg = [
      `🎉 *TRADENOVA SN — TRADER ACCOUNT CREATED*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Hello *${user.name}*,`,
      `Your trading portal account has been configured by your broker/admin!`,
      ``,
      `📋 *LOGIN CREDENTIALS:*`,
      `👤 *User ID / Client Code:* *${user.username}*`,
      `🔑 *Account Password:* *${rawPassword || '123456'}*`,
      ``,
      `💰 *MARGIN & FINANCIAL LIMITS:*`,
      `💵 *Initial Ledger Margin:* ₹${(user.funds || 0).toLocaleString('en-IN')}`,
      `🛡️ *Total Credit Limit:* ₹${(user.creditLimit || user.credits || 0).toLocaleString('en-IN')}`,
      `🏷️ *Account Role:* ${roleName}`,
      `📊 *Account Type:* ${acctType}`,
      user.city ? `📍 *City / Hub:* ${user.city}` : null,
      ``,
      `📈 *MARKETS ENABLED:*`,
      `• MCX Commodity Futures: ✅ Active`,
      `• NSE Equity Cash & F&O: ✅ Active`,
      `• Currency Derivatives (CDS): ✅ Active`,
      ``,
      `⏱️ *Registered At:* ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🔘 *QUICK ACTION BUTTONS:*`,
      ``,
      `1️⃣ *[VISIT WEBSITE]*`,
      `🌐 ${portalUrl}`,
      ``,
      `2️⃣ *[CALL US / DESK HELPLINE]*`,
      `📞 +91 ${supportPhone}`,
      `📲 Tap to Dial: tel:+91${supportPhone.replace(/[^0-9]/g, '')}`,
      `💬 WhatsApp Chat: https://wa.me/91${supportPhone.replace(/[^0-9]/g, '')}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Keep your login credentials secure. Welcome to TradeNova SN!_`
    ].filter(Boolean).join('\n');

    // Attempt native buttons if client supports sendButtons, with graceful fallback to interactive text
    const chatId = this.formatChatId(targetPhone);
    if (this.status === 'CONNECTED' && this.client && typeof this.client.sendButtons === 'function') {
      try {
        const buttons = [
          { id: 'btn_visit_website', text: '🌐 Visit Website' },
          { id: 'btn_call_us', text: '📞 Call Us' }
        ];
        return this.client.sendButtons(chatId, msg, buttons, 'TradeNova SN Portal', 'Institutional Desk Support')
          .catch(err => {
            console.warn('[WhatsApp] sendButtons fallback to sendText:', err.message);
            return this.sendRawText(targetPhone, msg, 'ACCOUNT_CREATED');
          });
      } catch (btnErr) {
        return this.sendRawText(targetPhone, msg, 'ACCOUNT_CREATED');
      }
    }

    return this.sendRawText(targetPhone, msg, 'ACCOUNT_CREATED');
  }
}

const whatsappService = new WhatsAppService();
module.exports = whatsappService;
