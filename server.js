// ═══════════════════════════════════════════════════════════════
// TradeNova SN — Node.js Server
// Express + Socket.IO | Real-time Paper Trading Engine
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// ─── Middleware ──────────────────────────────────────────
// CORS for Native Mobile App (Capacitor / Android WebView)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

const sessionMiddleware = session({
  secret: 'tradeNova_SN_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
});
app.use(sessionMiddleware);

// Share session with Socket.IO
io.engine.use(sessionMiddleware);

// ═══════════════════════════════════════════════════════════════
// DATABASE (MySQL + In-Memory Fast Cache + JSON Fallback)
// ═══════════════════════════════════════════════════════════════
const {
  initMySQL,
  loadStateFromMySQL,
  saveUserToMySQL,
  deleteUserFromMySQL,
  saveOrderToMySQL,
  savePositionToMySQL,
  deletePositionFromMySQL,
  saveClosedTradeToMySQL,
  saveFundTxToMySQL,
  saveNotificationToMySQL
} = require('./database');
const whatsapp = require('./services/whatsapp');
const kite = require('./services/kite');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) { console.error('DB load error:', e); }
  return getDefaultDB();
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Backup JSON write error:', e.message);
  }
}

// Background async sync functions to MySQL
function syncUser(u) { if (u) saveUserToMySQL(u).catch(e => console.error('MySQL User sync err:', e.message)); }
function removeUser(id) { deleteUserFromMySQL(id).catch(e => console.error('MySQL User delete err:', e.message)); }
function syncOrder(o) { if (o) saveOrderToMySQL(o).catch(e => console.error('MySQL Order sync err:', e.message)); }
function syncPosition(p) { if (p) savePositionToMySQL(p).catch(e => console.error('MySQL Pos sync err:', e.message)); }
function removePosition(id) { deletePositionFromMySQL(id).catch(e => console.error('MySQL Pos delete err:', e.message)); }
function syncClosedTrade(t) { if (t) saveClosedTradeToMySQL(t).catch(e => console.error('MySQL Trade sync err:', e.message)); }
function syncFundTx(f) { if (f) saveFundTxToMySQL(f).catch(e => console.error('MySQL Fund sync err:', e.message)); }
function syncNotification(n) { if (n) saveNotificationToMySQL(n).catch(e => console.error('MySQL Notif sync err:', e.message)); }

function getDefaultDB() {
  const salt = bcrypt.genSaltSync(10);
  return {
    users: [
      { id: 1, name: 'Admin', username: 'admin', password: bcrypt.hashSync('admin123', salt), role: 'admin', phone: '9876543210', funds: 5000000, creditLimit: 10000000, status: 'active', broker: null, isDemo: false, createdAt: Date.now() },
      { id: 2, name: 'AG Vikas', username: 'AG', password: bcrypt.hashSync('123456', salt), role: 'admin', phone: '9876543211', funds: 1000000, creditLimit: 5000000, status: 'active', broker: null, isDemo: false, createdAt: Date.now() },
      { id: 3, name: 'NGP Sunil', username: 'NGP001', password: bcrypt.hashSync('123456', salt), role: 'broker', phone: '9876543212', funds: 500000, creditLimit: 2000000, status: 'active', broker: 'AG', isDemo: false, createdAt: Date.now() },
      { id: 4, name: 'AG Savita', username: 'AGS001', password: bcrypt.hashSync('123456', salt), role: 'client', phone: '9876543213', funds: 200000, creditLimit: 500000, status: 'active', broker: 'NGP001', isDemo: false, createdAt: Date.now() },
      { id: 5, name: 'Rahul Kumar', username: 'RK001', password: bcrypt.hashSync('123456', salt), role: 'client', phone: '9876543214', funds: 300000, creditLimit: 800000, status: 'active', broker: 'NGP001', isDemo: false, createdAt: Date.now() },
      { id: 6, name: 'Demo Trader', username: 'demo', password: bcrypt.hashSync('demo', salt), role: 'client', phone: '0000000000', funds: 1000000, creditLimit: 2000000, status: 'active', broker: 'AG', isDemo: true, createdAt: Date.now() },
    ],
    orders: [],
    positions: [],
    closedTrades: [],
    fundTransactions: [],
    notifications: [],
    nextId: 100,
  };
}

let db = loadDB(); // Initial state until MySQL finishes async init

function genId() { db.nextId = (db.nextId || 100) + 1; return db.nextId; }
const registrationOtps = new Map(); // CleanPhone -> { otp, name, username, phone, password, city, expiresAt, attempts }

// ═══════════════════════════════════════════════════════════════
// MARKET DATA ENGINE
// ═══════════════════════════════════════════════════════════════
const NSE_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2534.70, sector: 'Oil & Gas', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TCS', name: 'Tata Consultancy', price: 3856.25, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1523.40, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1634.85, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 967.30, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1245.60, sector: 'Telecom', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ITC', name: 'ITC Ltd', price: 436.15, sector: 'FMCG', lotSize: 1, exchange: 'NSE' },
  { symbol: 'SBIN', name: 'State Bank India', price: 612.40, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', price: 487.90, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2423.50, sector: 'FMCG', lotSize: 1, exchange: 'NSE' },
  { symbol: 'KOTAKBANK', name: 'Kotak Bank', price: 1768.35, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'LT', name: 'Larsen & Toubro', price: 3245.80, sector: 'Infra', lotSize: 1, exchange: 'NSE' },
  { symbol: 'AXISBANK', name: 'Axis Bank', price: 1058.70, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 2812.45, sector: 'Consumer', lotSize: 1, exchange: 'NSE' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 10534.20, sector: 'Auto', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TITAN', name: 'Titan Company', price: 3256.80, sector: 'Consumer', lotSize: 1, exchange: 'NSE' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', price: 1167.35, sector: 'Pharma', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 7234.60, sector: 'Finance', lotSize: 1, exchange: 'NSE' },
  { symbol: 'NTPC', name: 'NTPC Ltd', price: 356.25, sector: 'Power', lotSize: 1, exchange: 'NSE' },
  { symbol: 'POWERGRID', name: 'Power Grid', price: 284.70, sector: 'Power', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 658.40, sector: 'Auto', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2834.50, sector: 'Conglomerate', lotSize: 1, exchange: 'NSE' },
  { symbol: 'COALINDIA', name: 'Coal India', price: 405.60, sector: 'Mining', lotSize: 1, exchange: 'NSE' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', price: 856.90, sector: 'Metals', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TATASTEEL', name: 'Tata Steel', price: 132.45, sector: 'Metals', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ONGC', name: 'ONGC', price: 243.80, sector: 'Oil & Gas', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TECHM', name: 'Tech Mahindra', price: 1367.50, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'HCLTECH', name: 'HCL Tech', price: 1345.20, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', price: 9876.40, sector: 'Cement', lotSize: 1, exchange: 'NSE' },
  { symbol: 'NESTLEIND', name: 'Nestle India', price: 2456.70, sector: 'FMCG', lotSize: 1, exchange: 'NSE' },
  { symbol: 'DRREDDY', name: "Dr Reddy's", price: 5432.10, sector: 'Pharma', lotSize: 1, exchange: 'NSE' },
  { symbol: 'CIPLA', name: 'Cipla Ltd', price: 1234.50, sector: 'Pharma', lotSize: 1, exchange: 'NSE' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', price: 1567.80, sector: 'Auto', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', price: 1634.20, sector: 'Finance', lotSize: 1, exchange: 'NSE' },
  { symbol: 'HINDALCO', name: 'Hindalco', price: 534.60, sector: 'Metals', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BPCL', name: 'Bharat Petroleum', price: 345.80, sector: 'Oil & Gas', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd', price: 178.40, sector: 'Internet', lotSize: 1, exchange: 'NSE' },
  { symbol: 'DMART', name: 'Avenue Supermarts', price: 3890.50, sector: 'Retail', lotSize: 1, exchange: 'NSE' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', price: 5890.40, sector: 'Healthcare', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BRITANNIA', name: 'Britannia Ind.', price: 5678.30, sector: 'FMCG', lotSize: 1, exchange: 'NSE' },
];

const MCX_COMMODITIES = [
  { symbol: 'GOLD', name: 'Gold', price: 62345, unit: '10 gms', lotSize: 100, marginPct: 5, exchange: 'MCX', expiry: '05DEC2026' },
  { symbol: 'GOLDM', name: 'Gold Mini', price: 62340, unit: '10 gms', lotSize: 10, marginPct: 5, exchange: 'MCX', expiry: '05DEC2026' },
  { symbol: 'GOLDPETAL', name: 'Gold Petal', price: 6238, unit: '1 gm', lotSize: 1, marginPct: 5, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'SILVER', name: 'Silver', price: 75430, unit: 'kg', lotSize: 30, marginPct: 6, exchange: 'MCX', expiry: '05DEC2026' },
  { symbol: 'SILVERM', name: 'Silver Mini', price: 75425, unit: 'kg', lotSize: 5, marginPct: 6, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'CRUDEOIL', name: 'Crude Oil', price: 6534, unit: 'barrel', lotSize: 100, marginPct: 8, exchange: 'MCX', expiry: '19NOV2026' },
  { symbol: 'NATURALGAS', name: 'Natural Gas', price: 256.70, unit: 'mmBtu', lotSize: 1250, marginPct: 10, exchange: 'MCX', expiry: '25NOV2026' },
  { symbol: 'COPPER', name: 'Copper', price: 724.50, unit: 'kg', lotSize: 2500, marginPct: 7, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'ZINC', name: 'Zinc', price: 263.40, unit: 'kg', lotSize: 5000, marginPct: 7, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'LEAD', name: 'Lead', price: 187.60, unit: 'kg', lotSize: 5000, marginPct: 7, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'ALUMINIUM', name: 'Aluminium', price: 213.80, unit: 'kg', lotSize: 5000, marginPct: 7, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'NICKEL', name: 'Nickel', price: 1623.40, unit: 'kg', lotSize: 1500, marginPct: 8, exchange: 'MCX', expiry: '30NOV2026' },
];

const CURRENCY_PAIRS = [
  { symbol: 'USDINR', name: 'USD / INR', price: 83.524, lotSize: 1000, marginPct: 2, exchange: 'CDS', expiry: '27NOV2026' },
  { symbol: 'EURINR', name: 'EUR / INR', price: 90.673, lotSize: 1000, marginPct: 2, exchange: 'CDS', expiry: '27NOV2026' },
  { symbol: 'GBPINR', name: 'GBP / INR', price: 105.845, lotSize: 1000, marginPct: 2, exchange: 'CDS', expiry: '27NOV2026' },
  { symbol: 'JPYINR', name: 'JPY / INR', price: 0.558, lotSize: 1000, marginPct: 2, exchange: 'CDS', expiry: '27NOV2026' },
];

const INDEX_FUTURES = [
  { symbol: 'NIFTY-FUT', name: 'Nifty 50 Futures', price: 22567.50, lotSize: 50, marginPct: 12, exchange: 'NFO', expiry: '27NOV2026' },
  { symbol: 'BANKNIFTY-FUT', name: 'Bank Nifty Futures', price: 48234.75, lotSize: 25, marginPct: 12, exchange: 'NFO', expiry: '27NOV2026' },
  { symbol: 'FINNIFTY-FUT', name: 'Fin Nifty Futures', price: 21345.60, lotSize: 40, marginPct: 12, exchange: 'NFO', expiry: '27NOV2026' },
  { symbol: 'SENSEX-FUT', name: 'Sensex Futures', price: 74567.80, lotSize: 10, marginPct: 12, exchange: 'BSE-FO', expiry: '27NOV2026' },
];

const BSE_STOCKS = [
  { symbol: 'SENSEX', name: 'BSE SENSEX 30', price: 74234.80, sector: 'Index', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:RELIANCE', name: 'Reliance Industries (BSE)', price: 2535.10, sector: 'Oil & Gas', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:TCS', name: 'Tata Consultancy (BSE)', price: 3857.00, sector: 'IT', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:HDFCBANK', name: 'HDFC Bank (BSE)', price: 1635.20, sector: 'Banking', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:ICICIBANK', name: 'ICICI Bank (BSE)', price: 967.80, sector: 'Banking', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:INFY', name: 'Infosys Ltd (BSE)', price: 1523.90, sector: 'IT', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:BHARTIARTL', name: 'Bharti Airtel (BSE)', price: 1246.00, sector: 'Telecom', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:ITC', name: 'ITC Ltd (BSE)', price: 436.40, sector: 'FMCG', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:SBIN', name: 'State Bank India (BSE)', price: 612.80, sector: 'Banking', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:LT', name: 'Larsen & Toubro (BSE)', price: 3246.50, sector: 'Infra', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:KOTAKBANK', name: 'Kotak Bank (BSE)', price: 1769.10, sector: 'Banking', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:TATAMOTORS', name: 'Tata Motors (BSE)', price: 658.90, sector: 'Auto', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:MARUTI', name: 'Maruti Suzuki (BSE)', price: 10536.00, sector: 'Auto', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:BAJFINANCE', name: 'Bajaj Finance (BSE)', price: 7236.50, sector: 'Finance', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:ASIANPAINT', name: 'Asian Paints (BSE)', price: 2813.00, sector: 'Consumer', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:SUNPHARMA', name: 'Sun Pharma (BSE)', price: 1167.90, sector: 'Pharma', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:TITAN', name: 'Titan Company (BSE)', price: 3257.50, sector: 'Consumer', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:WIPRO', name: 'Wipro Ltd (BSE)', price: 488.30, sector: 'IT', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:NTPC', name: 'NTPC Ltd (BSE)', price: 356.60, sector: 'Power', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:POWERGRID', name: 'Power Grid (BSE)', price: 285.00, sector: 'Power', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:COALINDIA', name: 'Coal India (BSE)', price: 406.00, sector: 'Mining', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:TATASTEEL', name: 'Tata Steel (BSE)', price: 132.80, sector: 'Metals', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:JSWSTEEL', name: 'JSW Steel (BSE)', price: 857.40, sector: 'Metals', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:ADANIENT', name: 'Adani Enterprises (BSE)', price: 2835.20, sector: 'Conglomerate', lotSize: 1, exchange: 'BSE' },
  { symbol: 'BSE:ZOMATO', name: 'Zomato Ltd (BSE)', price: 178.90, sector: 'Internet', lotSize: 1, exchange: 'BSE' },
];

const ALL_INSTRUMENTS = [...NSE_STOCKS, ...BSE_STOCKS, ...MCX_COMMODITIES, ...CURRENCY_PAIRS, ...INDEX_FUTURES];

// Live price state
const liveData = {};
const BROKERAGE_RATE = 0.0003; // 0.03%

function r2(n) { return Math.round(n * 100) / 100; }

function initLiveData() {
  ALL_INSTRUMENTS.forEach(inst => {
    const open = r2(inst.price * (1 + (Math.random() - 0.5) * 0.01));
    const high = r2(Math.max(inst.price, open) + Math.abs(inst.price * 0.008 * Math.random()));
    const low = r2(Math.min(inst.price, open) - Math.abs(inst.price * 0.008 * Math.random()));
    liveData[inst.symbol] = {
      ...inst,
      ltp: inst.price,
      open, high, low,
      change: r2(inst.price - open),
      changePct: r2(((inst.price - open) / open) * 100),
      volume: Math.floor(Math.random() * 5000000) + 100000,
      bid: r2(inst.price - Math.random() * 0.5),
      ask: r2(inst.price + Math.random() * 0.5),
    };
  });
}

function generateHistoricalCandles(basePrice, count = 40) {
  const candles = [];
  let price = basePrice * 0.985;
  const now = Date.now();
  const interval = 60000;
  for (let i = count; i >= 0; i--) {
    const time = now - i * interval;
    const change = (Math.random() - 0.49) * (basePrice * 0.0035);
    const open = price;
    const close = Math.max(1, price + change);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.0018);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.0018);
    const volume = Math.floor(500 + Math.random() * 4500);
    candles.push({ time, open: r2(open), high: r2(high), low: r2(low), close: r2(close), volume });
    price = close;
  }
  candles[candles.length - 1].close = r2(basePrice);
  return candles;
}

function generateMarketDepth(ltp) {
  const spread = Math.max(0.05, ltp * 0.00025);
  const bids = [];
  const asks = [];
  let totalBidQty = 0, totalAskQty = 0;
  for (let i = 1; i <= 5; i++) {
    const bPrice = r2(ltp - (i * spread));
    const bQty = Math.floor(120 + Math.random() * 880) * (6 - i);
    const bOrders = Math.floor(2 + Math.random() * 12);
    totalBidQty += bQty;
    bids.push({ price: bPrice, qty: bQty, orders: bOrders });

    const aPrice = r2(ltp + (i * spread));
    const aQty = Math.floor(120 + Math.random() * 880) * (6 - i);
    const aOrders = Math.floor(2 + Math.random() * 12);
    totalAskQty += aQty;
    asks.push({ price: aPrice, qty: aQty, orders: aOrders });
  }
  return { bids, asks, totalBidQty, totalAskQty, ltp };
}

function tickPrices() {
  const symbols = Object.keys(liveData);
  const updates = {};
  const updateCount = Math.floor(symbols.length * 0.35);

  for (let i = 0; i < updateCount; i++) {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const d = liveData[sym];
    const vol = d.exchange === 'MCX' ? 0.003 : d.exchange === 'CDS' ? 0.0005 : 0.002;
    const tick = r2(d.ltp * vol * (Math.random() * 2 - 1));
    d.ltp = r2(d.ltp + tick);
    d.change = r2(d.ltp - d.open);
    d.changePct = r2((d.change / d.open) * 100);
    if (d.ltp > d.high) d.high = d.ltp;
    if (d.ltp < d.low) d.low = d.ltp;
    d.bid = r2(d.ltp - Math.random() * 0.5);
    d.ask = r2(d.ltp + Math.random() * 0.5);
    d.volume += Math.floor(Math.random() * 5000);
    updates[sym] = { ltp: d.ltp, change: d.change, changePct: d.changePct, high: d.high, low: d.low, bid: d.bid, ask: d.ask, volume: d.volume };
  }

  // Check pending orders
  checkPendingOrders();

  // Broadcast price updates
  io.emit('priceUpdate', updates);
}

function checkPendingOrders() {
  let changed = false;
  db.orders.filter(o => o.status === 'pending').forEach(o => {
    const d = liveData[o.symbol];
    if (!d) return;
    let execute = false;
    if (o.orderType === 'limit') {
      if (o.side === 'buy' && d.ltp <= o.price) execute = true;
      if (o.side === 'sell' && d.ltp >= o.price) execute = true;
    } else if (o.orderType === 'sl') {
      if (o.side === 'buy' && d.ltp >= o.price) execute = true;
      if (o.side === 'sell' && d.ltp <= o.price) execute = true;
    }
    if (execute) {
      o.status = 'executed';
      o.executedPrice = d.ltp;
      o.executedAt = Date.now();
      addPosition(o);
      syncOrder(o);
      const user = db.users.find(u => u.id === o.userId);
      if (user) {
        user.funds -= o.brokerage || 0;
        syncUser(user);
        whatsapp.notifyOrderExecuted(o, user);
      }
      io.emit('orderExecuted', { order: o, message: `${o.side.toUpperCase()} ${o.symbol} executed @ ₹${d.ltp.toFixed(2)}` });
      changed = true;
    }
  });
  if (changed) saveDB(db);
}

function addPosition(order) {
  const existing = db.positions.find(p => p.symbol === order.symbol && p.side === order.side && p.userId === order.userId);
  if (existing) {
    const totalQty = existing.qty + order.qty;
    existing.entryPrice = r2((existing.entryPrice * existing.qty + order.executedPrice * order.qty) / totalQty);
    existing.qty = totalQty;
    existing.lots = (existing.lots || 0) + (order.lots || 0);
    existing.margin = (existing.margin || 0) + (order.margin || 0);
    syncPosition(existing);
  } else {
    const pos = {
      id: genId(), symbol: order.symbol, name: order.name, exchange: order.exchange,
      side: order.side, qty: order.qty, lots: order.lots || order.qty,
      entryPrice: order.executedPrice, margin: order.margin || 0,
      userId: order.userId, timestamp: Date.now(),
    };
    db.positions.push(pos);
    syncPosition(pos);
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

function requireAdmin(req, res, next) {
  if (req.session && (req.session.role === 'admin' || req.session.role === 'broker')) return next();
  res.status(403).json({ error: 'Admin access required' });
}

// ═══════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.status !== 'active') return res.status(403).json({ error: 'Account inactive' });

  req.session.userId = user.id;
  req.session.role = user.role;
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  const user = db.users.find(u => u.id === req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// ═══════════════════════════════════════════════════════════════
// NEW TRADER REGISTRATION WITH WHATSAPP OTP
// ═══════════════════════════════════════════════════════════════
app.post('/api/register/send-otp', async (req, res) => {
  try {
    const { name, username, phone, password, city } = req.body;
    if (!name || !username || !phone || !password) {
      return res.status(400).json({ error: 'Full name, username, mobile number and password are required.' });
    }

    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number for WhatsApp.' });
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }

    // Check if username already exists
    const existing = db.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: `Username "${cleanUsername}" is already taken. Please choose another.` });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    registrationOtps.set(cleanPhone, {
      otp,
      name: name.trim(),
      username: cleanUsername,
      phone: cleanPhone,
      password,
      city: (city || '').trim(),
      expiresAt,
      attempts: 0
    });

    console.log(`[Register OTP] Generated OTP ${otp} for ${name} (${cleanPhone})`);

    // Dispatch via WhatsApp
    const sendRes = await whatsapp.notifyRegistrationOtp(cleanPhone, name.trim(), otp);

    res.json({
      success: true,
      phone: cleanPhone,
      simulated: !!sendRes?.simulated,
      devOtp: sendRes?.simulated ? otp : undefined,
      message: sendRes?.simulated
        ? `WhatsApp Bot is in simulation mode (OTP: ${otp})`
        : `Verification code sent to WhatsApp: +91 ${cleanPhone.slice(-10)}`
    });
  } catch (err) {
    console.error('Registration send OTP error:', err);
    res.status(500).json({ error: 'Failed to dispatch verification code: ' + err.message });
  }
});

app.post('/api/register/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required.' });
    }

    const record = registrationOtps.get(cleanPhone);
    if (!record) {
      return res.status(400).json({ error: 'No active verification session found for this number. Please register again.' });
    }

    if (Date.now() > record.expiresAt) {
      registrationOtps.delete(cleanPhone);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (record.otp !== String(otp).trim()) {
      record.attempts = (record.attempts || 0) + 1;
      if (record.attempts >= 5) {
        registrationOtps.delete(cleanPhone);
        return res.status(400).json({ error: 'Too many invalid attempts. Please request a new OTP.' });
      }
      return res.status(400).json({ error: 'Invalid verification code. Please check your WhatsApp and enter the 6-digit code.' });
    }

    // Re-verify username uniqueness
    if (db.users.find(u => u.username.toLowerCase() === record.username.toLowerCase())) {
      registrationOtps.delete(cleanPhone);
      return res.status(400).json({ error: 'Username was just registered by someone else. Please choose another username.' });
    }

    const newId = genId();
    const salt = bcrypt.genSaltSync(10);
    const newUser = {
      id: newId,
      name: record.name,
      username: record.username,
      phone: record.phone,
      mobile: record.phone,
      password: bcrypt.hashSync(record.password, salt),
      role: 'client',
      funds: 1000000, // ₹10,00,000 initial paper trading capital
      credits: 2000000,
      creditLimit: 2000000,
      openingBalance: 1000000,
      city: record.city || '',
      trade_block_time: 0,
      broker: 'AG',
      status: 'active',
      isDemo: false,
      demo: 0,
      createdAt: Date.now()
    };

    db.users.push(newUser);
    syncUser(newUser);
    saveDB(db);
    registrationOtps.delete(cleanPhone);

    // Send WhatsApp Welcome confirmation
    whatsapp.notifyWelcomeRegistration(newUser);

    // Automatically log in the user into session
    req.session.userId = newUser.id;
    req.session.role = newUser.role;

    console.log(`[Register] New trader registered successfully: ${newUser.name} (${newUser.username}) ID #${newUser.id}`);

    const { password: _, ...safeUser } = newUser;
    res.json({
      success: true,
      user: safeUser,
      message: `Registration verified! Welcome to TradeNova SN, ${newUser.name}!`
    });
  } catch (err) {
    console.error('Registration verify OTP error:', err);
    res.status(500).json({ error: 'Failed to verify account: ' + err.message });
  }
});

app.post('/api/register/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    const record = registrationOtps.get(cleanPhone);
    if (!record) {
      return res.status(400).json({ error: 'No pending registration session found. Please fill in registration details.' });
    }

    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    record.otp = newOtp;
    record.expiresAt = Date.now() + 10 * 60 * 1000;
    record.attempts = 0;

    console.log(`[Register OTP:Resend] Generated new OTP ${newOtp} for ${record.name} (${cleanPhone})`);

    const sendRes = await whatsapp.notifyRegistrationOtp(cleanPhone, record.name, newOtp);

    res.json({
      success: true,
      simulated: !!sendRes?.simulated,
      devOtp: sendRes?.simulated ? newOtp : undefined,
      message: sendRes?.simulated
        ? `New OTP generated in simulation mode (OTP: ${newOtp})`
        : `New verification code sent to WhatsApp: +91 ${cleanPhone.slice(-10)}`
    });
  } catch (err) {
    console.error('Registration resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend code: ' + err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// MARKET DATA ROUTES
// ═══════════════════════════════════════════════════════════════
app.get('/api/instruments', requireAuth, (req, res) => {
  const segment = req.query.segment;
  let data = Object.values(liveData);
  if (segment && segment !== 'ALL') {
    const segMap = { NSE: 'NSE', BSE: 'BSE', MCX: 'MCX', CURRENCY: 'CDS', FNO: ['NFO', 'BSE-FO'] };
    const exchanges = segMap[segment];
    if (exchanges) data = data.filter(d => Array.isArray(exchanges) ? exchanges.includes(d.exchange) : d.exchange === exchanges);
  }
  res.json(data);
});

app.get('/api/instrument/:symbol', requireAuth, (req, res) => {
  const d = liveData[req.params.symbol];
  if (!d) return res.status(404).json({ error: 'Instrument not found' });
  res.json(d);
});

app.get('/api/instrument/:symbol/candles', requireAuth, async (req, res) => {
  const symbol = req.params.symbol;
  if (kite.connected) {
    try {
      const realCandles = await kite.getCandles(symbol, req.query.interval || '5minute');
      if (realCandles && realCandles.length > 0) return res.json(realCandles);
    } catch (e) {
      console.warn('[Kite] Historical candles fallback for', symbol);
    }
  }
  const d = liveData[symbol];
  if (!d) return res.status(404).json({ error: 'Instrument not found' });
  const candles = generateHistoricalCandles(d.ltp, 40);
  res.json(candles);
});

app.get('/api/instrument/:symbol/depth', requireAuth, (req, res) => {
  const d = liveData[req.params.symbol];
  if (!d) return res.status(404).json({ error: 'Instrument not found' });
  if (d.depth && d.depth.bids && d.depth.bids.length > 0) {
    return res.json(d.depth);
  }
  const depth = generateMarketDepth(d.ltp);
  res.json(depth);
});

// ═══════════════════════════════════════════════════════════════
// ORDER ROUTES
// ═══════════════════════════════════════════════════════════════
app.post('/api/orders', requireAuth, (req, res) => {
  const { symbol, side, qty, orderType, price, clientId } = req.body;
  const d = liveData[symbol];
  if (!d) return res.status(400).json({ error: 'Invalid instrument' });
  if (!qty || qty <= 0) return res.status(400).json({ error: 'Invalid quantity' });

  const sessionUser = db.users.find(u => u.id === req.session.userId);
  if (!sessionUser) return res.status(404).json({ error: 'User not found' });

  let targetUser = sessionUser;
  if ((sessionUser.role === 'admin' || sessionUser.role === 'broker') && clientId) {
    const foundClient = db.users.find(u => u.id === parseInt(clientId) || u.username === clientId);
    if (!foundClient) {
      return res.status(400).json({ error: 'Selected client not found' });
    }
    targetUser = foundClient;
  }

  const effectiveQty = qty * (d.lotSize || 1);
  const isMarket = orderType === 'market' || !price || parseFloat(price) === 0;
  const execPrice = isMarket ? d.ltp : parseFloat(price);
  const value = execPrice * effectiveQty;
  const marginReq = d.marginPct ? (value * d.marginPct / 100) : value;
  const brokerage = r2(value * BROKERAGE_RATE);

  const availableFunds = (targetUser.funds || 0) + (targetUser.creditLimit || targetUser.credits || 0);
  if (marginReq > availableFunds) {
    return res.status(400).json({
      error: `Insufficient margin for ${targetUser.name} (${targetUser.username}). Required: ₹${marginReq.toFixed(2)}, Available: ₹${availableFunds.toFixed(2)}`
    });
  }

  const order = {
    id: genId(), symbol, name: d.name, exchange: d.exchange, side,
    qty: effectiveQty, lots: qty, price: execPrice, orderType: isMarket ? 'market' : 'limit',
    status: isMarket ? 'executed' : 'pending',
    executedPrice: isMarket ? d.ltp : null,
    executedAt: isMarket ? Date.now() : null,
    brokerage, margin: marginReq,
    userId: targetUser.id,
    clientName: targetUser.name,
    clientUsername: targetUser.username,
    placedBy: sessionUser.username,
    timestamp: Date.now(),
  };

  db.orders.push(order);
  syncOrder(order);
  if (order.status === 'executed') {
    addPosition(order);
    targetUser.funds -= brokerage;
    syncUser(targetUser);
    whatsapp.notifyOrderExecuted(order, targetUser);
  }
  saveDB(db);

  io.emit('orderUpdate', { userId: targetUser.id });
  if (sessionUser.id !== targetUser.id) {
    io.emit('orderUpdate', { userId: sessionUser.id });
  }

  const clientMsg = sessionUser.id !== targetUser.id ? ` on behalf of ${targetUser.name} (${targetUser.username})` : '';
  res.json({
    success: true,
    order,
    message: `${side.toUpperCase()} ${symbol} x${effectiveQty} — ${order.status === 'executed' ? 'Executed @ ₹' + d.ltp.toFixed(2) : 'Pending @ ₹' + execPrice.toFixed(2)}${clientMsg}`
  });
});

app.get('/api/orders', requireAuth, (req, res) => {
  const user = db.users.find(u => u.id === req.session.userId);
  let orders = db.orders;
  if (user && (user.role === 'admin' || user.role === 'broker')) {
    if (req.query.clientId) {
      orders = orders.filter(o => o.userId === parseInt(req.query.clientId) || o.clientUsername === req.query.clientId);
    }
  } else {
    orders = orders.filter(o => o.userId === req.session.userId);
  }
  res.json(orders.sort((a, b) => b.timestamp - a.timestamp));
});

app.delete('/api/orders/:id', requireAuth, (req, res) => {
  const user = db.users.find(u => u.id === req.session.userId);
  const isAdmin = user && (user.role === 'admin' || user.role === 'broker');
  const order = db.orders.find(o => o.id === parseInt(req.params.id) && (isAdmin || o.userId === req.session.userId));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'pending') return res.status(400).json({ error: 'Can only cancel pending orders' });
  order.status = 'cancelled';
  syncOrder(order);
  saveDB(db);
  res.json({ success: true, message: 'Order cancelled' });
});

// ═══════════════════════════════════════════════════════════════
// POSITION ROUTES
// ═══════════════════════════════════════════════════════════════
app.get('/api/positions', requireAuth, (req, res) => {
  const user = db.users.find(u => u.id === req.session.userId);
  let positions = db.positions;
  if (user && (user.role === 'admin' || user.role === 'broker')) {
    if (req.query.clientId) {
      positions = positions.filter(p => p.userId === parseInt(req.query.clientId));
    }
  } else {
    positions = positions.filter(p => p.userId === req.session.userId);
  }
  // Attach live P&L
  const enriched = positions.map(p => {
    const d = liveData[p.symbol];
    const ltp = d ? d.ltp : p.entryPrice;
    const pl = p.side === 'buy' ? (ltp - p.entryPrice) * p.qty : (p.entryPrice - ltp) * p.qty;
    return { ...p, ltp, pnl: r2(pl), pnlPct: r2((pl / (p.entryPrice * p.qty)) * 100) };
  });
  res.json(enriched);
});

app.post('/api/positions/:id/squareoff', requireAuth, (req, res) => {
  const idx = db.positions.findIndex(p => p.id === parseInt(req.params.id) && p.userId === req.session.userId);
  if (idx === -1) return res.status(404).json({ error: 'Position not found' });

  const p = db.positions[idx];
  const d = liveData[p.symbol];
  const exitPrice = d ? d.ltp : p.entryPrice;
  const pl = p.side === 'buy' ? (exitPrice - p.entryPrice) * p.qty : (p.entryPrice - exitPrice) * p.qty;
  const brokerage = r2(exitPrice * p.qty * BROKERAGE_RATE);

  const closed = {
    id: genId(), symbol: p.symbol, name: p.name, exchange: p.exchange,
    side: p.side, qty: p.qty, lots: p.lots, entryPrice: p.entryPrice,
    exitPrice, pnl: r2(pl - brokerage), brokerage, userId: p.userId,
    entryTime: p.timestamp, exitTime: Date.now(),
  };
  db.closedTrades.push(closed);
  syncClosedTrade(closed);
  removePosition(p.id);

  const user = db.users.find(u => u.id === req.session.userId);
  if (user) {
    user.funds += pl - brokerage;
    syncUser(user);
    whatsapp.notifyPositionClosed(closed, user);
  }
  db.positions.splice(idx, 1);
  saveDB(db);

  res.json({ success: true, pnl: r2(pl), message: `${p.symbol} squared off @ ₹${exitPrice.toFixed(2)} | P&L: ₹${pl.toFixed(2)}` });
});

app.post('/api/positions/squareoff-all', requireAuth, (req, res) => {
  const userPositions = db.positions.filter(p => p.userId === req.session.userId);
  if (userPositions.length === 0) return res.status(400).json({ error: 'No open positions to square off' });

  let netPL = 0;
  const user = db.users.find(u => u.id === req.session.userId);

  userPositions.forEach(p => {
    const d = liveData[p.symbol];
    const exitPrice = d ? d.ltp : p.entryPrice;
    const pl = p.side === 'buy' ? (exitPrice - p.entryPrice) * p.qty : (p.entryPrice - exitPrice) * p.qty;
    const brokerage = r2(exitPrice * p.qty * BROKERAGE_RATE);
    const finalPL = r2(pl - brokerage);
    netPL += finalPL;

    const closed = {
      id: genId(), symbol: p.symbol, name: p.name, exchange: p.exchange,
      side: p.side, qty: p.qty, lots: p.lots, entryPrice: p.entryPrice,
      exitPrice, pnl: finalPL, brokerage, userId: p.userId,
      entryTime: p.timestamp, exitTime: Date.now(),
    };
    db.closedTrades.push(closed);
    syncClosedTrade(closed);
    removePosition(p.id);
    if (user) user.funds += finalPL;
  });

  if (user) {
    syncUser(user);
    whatsapp.notifySquareoffAll(user, userPositions.length, netPL);
  }
  db.positions = db.positions.filter(p => p.userId !== req.session.userId);
  saveDB(db);

  res.json({ success: true, count: userPositions.length, netPL: r2(netPL), message: `Successfully squared off ${userPositions.length} positions | Realized P&L: ₹${netPL.toFixed(2)}` });
});

app.get('/api/closed-trades', requireAuth, (req, res) => {
  const trades = db.closedTrades.filter(t => t.userId === req.session.userId).sort((a, b) => b.exitTime - a.exitTime);
  res.json(trades);
});

// ═══════════════════════════════════════════════════════════════
// FUND ROUTES
// ═══════════════════════════════════════════════════════════════
app.get('/api/funds', requireAuth, (req, res) => {
  const user = db.users.find(u => u.id === req.session.userId);
  const marginUsed = db.positions.filter(p => p.userId === req.session.userId).reduce((s, p) => s + (p.margin || 0), 0);
  res.json({ balance: user.funds, marginUsed, available: user.funds - marginUsed, creditLimit: user.creditLimit });
});

app.post('/api/funds', requireAuth, (req, res) => {
  const { type, amount, notes } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const user = db.users.find(u => u.id === req.session.userId);
  if (type === 'withdraw' && amount > user.funds) return res.status(400).json({ error: 'Insufficient balance' });

  user.funds += type === 'deposit' ? amount : -amount;
  syncUser(user);
  const tx = { id: genId(), type, amount, notes: notes || '', userId: user.id, timestamp: Date.now() };
  db.fundTransactions.push(tx);
  syncFundTx(tx);
  saveDB(db);
  whatsapp.notifyFundTx(tx, user);
  res.json({ success: true, balance: user.funds });
});

app.get('/api/funds/transactions', requireAuth, (req, res) => {
  res.json(db.fundTransactions.filter(t => t.userId === req.session.userId).sort((a, b) => b.timestamp - a.timestamp));
});

// ═══════════════════════════════════════════════════════════════
// CLIENT ROUTES (Admin)
// ═══════════════════════════════════════════════════════════════
// CLIENT ROUTES (Admin — Matching /mcxusers/update & /mcxusers/create)
// ═══════════════════════════════════════════════════════════════
function enrichClientDefaults(u) {
  return {
    id: u.id,
    name: u.name || '',
    username: u.username || '',
    phone: u.phone || u.username || '',
    mobile: u.mobile || u.phone || '',
    credits: u.credits !== undefined ? u.credits : (u.creditLimit || 500000),
    creditLimit: u.creditLimit !== undefined ? u.creditLimit : (u.credits || 500000),
    funds: u.funds !== undefined ? u.funds : 100000,
    openingBalance: u.openingBalance !== undefined ? u.openingBalance : (u.funds || 100000),
    city: u.city || '',
    trade_block_time: u.trade_block_time !== undefined ? u.trade_block_time : 0,
    role: u.role || 'client',
    broker: u.broker || 'AG',
    demo: u.demo !== undefined ? (u.demo ? 1 : 0) : (u.isDemo ? 1 : 0),
    isDemo: u.isDemo !== undefined ? u.isDemo : !!u.demo,
    status: u.status || 'active',

    // Config (RMS & Execution Rules)
    aobhl: u.aobhl !== undefined ? u.aobhl : 1, // Allow Orders between High - Low
    toahl: u.toahl !== undefined ? u.toahl : 1, // Trigger orders at New High - Low rates
    trade_equity_as_units: u.trade_equity_as_units !== undefined ? u.trade_equity_as_units : 1,
    auto_square_close_at: u.auto_square_close_at !== undefined ? u.auto_square_close_at : 90,
    auto_square_notify_at: u.auto_square_notify_at !== undefined ? u.auto_square_notify_at : 70,

    // MCX Futures (Commodities)
    commodity: u.commodity !== undefined ? u.commodity : 1,
    min_size_trade_commodity: u.min_size_trade_commodity !== undefined ? u.min_size_trade_commodity : 0,
    max_size_trade_commodity: u.max_size_trade_commodity !== undefined ? u.max_size_trade_commodity : 2,
    max_size_script_commodity: u.max_size_script_commodity !== undefined ? u.max_size_script_commodity : 5,
    max_size_all_commodity: u.max_size_all_commodity !== undefined ? u.max_size_all_commodity : 20,
    mcx_brokerage_type: u.mcx_brokerage_type || 'per_crore',
    commodity_brokerage: u.commodity_brokerage !== undefined ? u.commodity_brokerage : 2000,
    exposure_mcx_type: u.exposure_mcx_type || 'per_turnover',
    exposure_mcx: u.exposure_mcx !== undefined ? u.exposure_mcx : 200,
    holding_exposure_mcx: u.holding_exposure_mcx !== undefined ? u.holding_exposure_mcx : 20,
    brokerage_mcx: u.brokerage_mcx || {
      GOLD: 500, SILVER: 200, CRUDEOIL: 200, NATURALGAS: 200, COPPER: 200,
      ZINC: 200, LEAD: 200, ALUMINIUM: 200, NICKEL: 200, BULLDEX: 500,
      'GOLD-MINI': 200, 'SILVER-MINI': 200, SILVERMIC: 200
    },
    exposure_mcx_lot: u.exposure_mcx_lot || {
      GOLD: 5, SILVER: 5, CRUDEOIL: 10, NATURALGAS: 10, COPPER: 5,
      ZINC: 5, LEAD: 5, ALUMINIUM: 5, NICKEL: 5, BULLDEX: 10,
      'GOLD-MINI': 10, 'SILVER-MINI': 10, SILVERMIC: 20
    },
    holding_exposure_mcx_lot: u.holding_exposure_mcx_lot || {
      GOLD: 2, SILVER: 2, CRUDEOIL: 5, NATURALGAS: 5, COPPER: 2,
      ZINC: 2, LEAD: 2, ALUMINIUM: 2, NICKEL: 2, BULLDEX: 5,
      'GOLD-MINI': 5, 'SILVER-MINI': 5, SILVERMIC: 10
    },

    // Equity Futures & Indices
    equity: u.equity !== undefined ? u.equity : 1,
    equity_brokerage_type: u.equity_brokerage_type || 'per_crore',
    equity_brokerage: u.equity_brokerage !== undefined ? u.equity_brokerage : 4000,
    min_size_trade_equity: u.min_size_trade_equity !== undefined ? u.min_size_trade_equity : 0,
    max_size_trade_equity: u.max_size_trade_equity !== undefined ? u.max_size_trade_equity : 2,
    min_size_trade_index: u.min_size_trade_index !== undefined ? u.min_size_trade_index : 0,
    max_size_trade_index: u.max_size_trade_index !== undefined ? u.max_size_trade_index : 5,
    max_size_script_equity: u.max_size_script_equity !== undefined ? u.max_size_script_equity : 5,
    max_size_script_index: u.max_size_script_index !== undefined ? u.max_size_script_index : 10,
    max_size_all_equity: u.max_size_all_equity !== undefined ? u.max_size_all_equity : 20,
    max_size_all_index: u.max_size_all_index !== undefined ? u.max_size_all_index : 20,
    exposure_equity: u.exposure_equity !== undefined ? u.exposure_equity : 200,
    holding_exposure_equity: u.holding_exposure_equity !== undefined ? u.holding_exposure_equity : 20,

    // Other & Security
    notes: u.notes || '',
    transaction_password: u.transaction_password || '',
    createdAt: u.createdAt || Date.now()
  };
}

app.get('/api/clients', requireAuth, requireAdmin, (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  let users = db.users || [];
  if (q) {
    users = users.filter(u => {
      const name = (u.name || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const phone = (u.phone || u.mobile || '').toLowerCase();
      const city = (u.city || '').toLowerCase();
      const id = String(u.id);
      return name.includes(q) || username.includes(q) || phone.includes(q) || city.includes(q) || id === q;
    });
  }
  res.json(users.map(u => enrichClientDefaults(u)));
});

app.get('/api/instruments/search', requireAuth, (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  const all = Object.values(liveData || {});
  if (!q) return res.json(all);
  const filtered = all.filter(s => {
    const sym = (s.symbol || '').toLowerCase();
    const name = (s.name || '').toLowerCase();
    const ex = (s.exchange || '').toLowerCase();
    return sym.includes(q) || name.includes(q) || ex.includes(q);
  });
  res.json(filtered);
});

app.get('/api/clients/:id', requireAuth, requireAdmin, (req, res) => {
  const user = db.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  const enriched = enrichClientDefaults(user);
  res.json(enriched);
});

app.post('/api/clients', requireAuth, requireAdmin, (req, res) => {
  const b = req.body;
  if (!b.name || !b.username) return res.status(400).json({ error: 'Name and username required' });
  if (db.users.find(u => u.username.toLowerCase() === b.username.toLowerCase())) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newId = genId();
  const user = {
    id: newId,
    name: b.name,
    username: b.username,
    phone: b.mobile || b.phone || b.username,
    mobile: b.mobile || b.phone || '',
    password: bcrypt.hashSync(b.password || '123456', 10),
    credits: parseFloat(b.credits || b.creditLimit || 500000),
    creditLimit: parseFloat(b.credits || b.creditLimit || 500000),
    funds: parseFloat(b.funds || 100000),
    openingBalance: parseFloat(b.funds || 100000),
    city: b.city || '',
    trade_block_time: parseInt(b.trade_block_time) || 0,
    role: b.role || 'client',
    broker: req.session.userId ? (db.users.find(u => u.id === req.session.userId)?.username || 'AG') : 'AG',
    demo: b.demo ? 1 : 0,
    isDemo: !!b.demo,
    status: b.status || 'active',

    // Config / RMS
    aobhl: b.aobhl !== undefined ? (b.aobhl ? 1 : 0) : 1,
    toahl: b.toahl !== undefined ? (b.toahl ? 1 : 0) : 1,
    trade_equity_as_units: b.trade_equity_as_units !== undefined ? (b.trade_equity_as_units ? 1 : 0) : 1,
    auto_square_close_at: parseFloat(b.auto_square_close_at || 90),
    auto_square_notify_at: parseFloat(b.auto_square_notify_at || 70),

    // MCX Futures
    commodity: b.commodity !== undefined ? (b.commodity ? 1 : 0) : 1,
    min_size_trade_commodity: parseFloat(b.min_size_trade_commodity || 0),
    max_size_trade_commodity: parseFloat(b.max_size_trade_commodity || 2),
    max_size_script_commodity: parseFloat(b.max_size_script_commodity || 5),
    max_size_all_commodity: parseFloat(b.max_size_all_commodity || 20),
    mcx_brokerage_type: b.mcx_brokerage_type || 'per_crore',
    commodity_brokerage: parseFloat(b.commodity_brokerage || 2000),
    exposure_mcx_type: b.exposure_mcx_type || 'per_turnover',
    exposure_mcx: parseFloat(b.exposure_mcx || 200),
    holding_exposure_mcx: parseFloat(b.holding_exposure_mcx || 20),
    brokerage_mcx: b.brokerage_mcx || {
      GOLD: 500, SILVER: 200, CRUDEOIL: 200, NATURALGAS: 200, COPPER: 200,
      ZINC: 200, LEAD: 200, ALUMINIUM: 200, NICKEL: 200, BULLDEX: 500,
      'GOLD-MINI': 200, 'SILVER-MINI': 200, SILVERMIC: 200
    },
    exposure_mcx_lot: b.exposure_mcx_lot || {
      GOLD: 5, SILVER: 5, CRUDEOIL: 10, NATURALGAS: 10, COPPER: 5,
      ZINC: 5, LEAD: 5, ALUMINIUM: 5, NICKEL: 5, BULLDEX: 10,
      'GOLD-MINI': 10, 'SILVER-MINI': 10, SILVERMIC: 20
    },
    holding_exposure_mcx_lot: b.holding_exposure_mcx_lot || {
      GOLD: 2, SILVER: 2, CRUDEOIL: 5, NATURALGAS: 5, COPPER: 2,
      ZINC: 2, LEAD: 2, ALUMINIUM: 2, NICKEL: 2, BULLDEX: 5,
      'GOLD-MINI': 5, 'SILVER-MINI': 5, SILVERMIC: 10
    },

    // Equity Futures
    equity: b.equity !== undefined ? (b.equity ? 1 : 0) : 1,
    equity_brokerage_type: b.equity_brokerage_type || 'per_crore',
    equity_brokerage: parseFloat(b.equity_brokerage || 4000),
    min_size_trade_equity: parseFloat(b.min_size_trade_equity || 0),
    max_size_trade_equity: parseFloat(b.max_size_trade_equity || 2),
    min_size_trade_index: parseFloat(b.min_size_trade_index || 0),
    max_size_trade_index: parseFloat(b.max_size_trade_index || 5),
    max_size_script_equity: parseFloat(b.max_size_script_equity || 5),
    max_size_script_index: parseFloat(b.max_size_script_index || 10),
    max_size_all_equity: parseFloat(b.max_size_all_equity || 20),
    max_size_all_index: parseFloat(b.max_size_all_index || 20),
    exposure_equity: parseFloat(b.exposure_equity || 200),
    holding_exposure_equity: parseFloat(b.holding_exposure_equity || 20),

    // Other & Security
    notes: b.notes || '',
    transaction_password: b.transaction_password || '',
    createdAt: Date.now()
  };

  db.users.push(user);
  syncUser(user);
  saveDB(db);
  whatsapp.notifyClientCreated(user, b.password || '123456');
  const enriched = enrichClientDefaults(user);
  res.json({ success: true, client: enriched });
});

app.put('/api/clients/:id', requireAuth, requireAdmin, (req, res) => {
  const user = db.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });

  const b = req.body;
  if (b.name) user.name = b.name;
  if (b.mobile) user.mobile = b.mobile;
  if (b.phone) user.phone = b.phone;
  if (b.city !== undefined) user.city = b.city;
  if (b.trade_block_time !== undefined) user.trade_block_time = parseInt(b.trade_block_time);
  if (b.role) user.role = b.role;
  if (b.funds !== undefined) user.funds = parseFloat(b.funds);
  if (b.creditLimit !== undefined) {
    user.creditLimit = parseFloat(b.creditLimit);
    user.credits = parseFloat(b.creditLimit);
  }
  if (b.credits !== undefined) {
    user.credits = parseFloat(b.credits);
    user.creditLimit = parseFloat(b.credits);
  }
  if (b.demo !== undefined) {
    user.demo = b.demo ? 1 : 0;
    user.isDemo = !!b.demo;
  }
  if (b.status) user.status = b.status;
  if (b.password) user.password = bcrypt.hashSync(b.password, 10);

  // Config / RMS
  if (b.aobhl !== undefined) user.aobhl = b.aobhl ? 1 : 0;
  if (b.toahl !== undefined) user.toahl = b.toahl ? 1 : 0;
  if (b.trade_equity_as_units !== undefined) user.trade_equity_as_units = b.trade_equity_as_units ? 1 : 0;
  if (b.auto_square_close_at !== undefined) user.auto_square_close_at = parseFloat(b.auto_square_close_at);
  if (b.auto_square_notify_at !== undefined) user.auto_square_notify_at = parseFloat(b.auto_square_notify_at);

  // MCX Futures
  if (b.commodity !== undefined) user.commodity = b.commodity ? 1 : 0;
  if (b.min_size_trade_commodity !== undefined) user.min_size_trade_commodity = parseFloat(b.min_size_trade_commodity);
  if (b.max_size_trade_commodity !== undefined) user.max_size_trade_commodity = parseFloat(b.max_size_trade_commodity);
  if (b.max_size_script_commodity !== undefined) user.max_size_script_commodity = parseFloat(b.max_size_script_commodity);
  if (b.max_size_all_commodity !== undefined) user.max_size_all_commodity = parseFloat(b.max_size_all_commodity);
  if (b.mcx_brokerage_type) user.mcx_brokerage_type = b.mcx_brokerage_type;
  if (b.commodity_brokerage !== undefined) user.commodity_brokerage = parseFloat(b.commodity_brokerage);
  if (b.exposure_mcx_type) user.exposure_mcx_type = b.exposure_mcx_type;
  if (b.exposure_mcx !== undefined) user.exposure_mcx = parseFloat(b.exposure_mcx);
  if (b.holding_exposure_mcx !== undefined) user.holding_exposure_mcx = parseFloat(b.holding_exposure_mcx);
  if (b.brokerage_mcx) user.brokerage_mcx = b.brokerage_mcx;
  if (b.exposure_mcx_lot) user.exposure_mcx_lot = b.exposure_mcx_lot;
  if (b.holding_exposure_mcx_lot) user.holding_exposure_mcx_lot = b.holding_exposure_mcx_lot;

  // Equity Futures
  if (b.equity !== undefined) user.equity = b.equity ? 1 : 0;
  if (b.equity_brokerage_type) user.equity_brokerage_type = b.equity_brokerage_type;
  if (b.equity_brokerage !== undefined) user.equity_brokerage = parseFloat(b.equity_brokerage);
  if (b.min_size_trade_equity !== undefined) user.min_size_trade_equity = parseFloat(b.min_size_trade_equity);
  if (b.max_size_trade_equity !== undefined) user.max_size_trade_equity = parseFloat(b.max_size_trade_equity);
  if (b.min_size_trade_index !== undefined) user.min_size_trade_index = parseFloat(b.min_size_trade_index);
  if (b.max_size_trade_index !== undefined) user.max_size_trade_index = parseFloat(b.max_size_trade_index);
  if (b.max_size_script_equity !== undefined) user.max_size_script_equity = parseFloat(b.max_size_script_equity);
  if (b.max_size_script_index !== undefined) user.max_size_script_index = parseFloat(b.max_size_script_index);
  if (b.max_size_all_equity !== undefined) user.max_size_all_equity = parseFloat(b.max_size_all_equity);
  if (b.max_size_all_index !== undefined) user.max_size_all_index = parseFloat(b.max_size_all_index);
  if (b.exposure_equity !== undefined) user.exposure_equity = parseFloat(b.exposure_equity);
  if (b.holding_exposure_equity !== undefined) user.holding_exposure_equity = parseFloat(b.holding_exposure_equity);

  // Other & Security
  if (b.notes !== undefined) user.notes = b.notes;
  if (b.transaction_password !== undefined) user.transaction_password = b.transaction_password;

  syncUser(user);
  saveDB(db);
  const enriched = enrichClientDefaults(user);
  res.json({ success: true, client: enriched });
});

app.patch('/api/clients/:id/toggle', requireAuth, requireAdmin, (req, res) => {
  const user = db.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.status = user.status === 'active' ? 'inactive' : 'active';
  syncUser(user);
  saveDB(db);
  res.json({ success: true, status: user.status });
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION ROUTES
// ═══════════════════════════════════════════════════════════════
app.get('/api/notifications', requireAuth, (req, res) => {
  res.json(db.notifications.sort((a, b) => b.timestamp - a.timestamp));
});

app.post('/api/notifications', requireAuth, requireAdmin, (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
  const notif = { id: genId(), title, message, from: req.session.userId, timestamp: Date.now() };
  db.notifications.push(notif);
  syncNotification(notif);
  saveDB(db);
  io.emit('notification', notif);
  res.json({ success: true });
});

// ─── Dashboard stats & Live M2M ────────────────────────
app.get('/api/dashboard', requireAuth, (req, res) => {
  const uid = req.session.userId;
  const user = db.users.find(u => u.id === uid);
  const isAdmin = ['admin', 'broker'].includes(user.role);

  const positions = db.positions.filter(p => isAdmin ? true : p.userId === uid);
  const userPositions = db.positions.filter(p => p.userId === uid);
  const orders = db.orders.filter(o => isAdmin ? true : o.userId === uid);
  const closed = db.closedTrades.filter(t => isAdmin ? true : t.userId === uid);

  let activePL = 0;
  userPositions.forEach(p => {
    const d = liveData[p.symbol];
    const ltp = d ? d.ltp : p.entryPrice;
    activePL += p.side === 'buy' ? (ltp - p.entryPrice) * p.qty : (p.entryPrice - ltp) * p.qty;
  });

  const closedPL = closed.reduce((s, t) => s + t.pnl, 0);
  const marginUsed = userPositions.reduce((s, p) => s + (p.margin || 0), 0);
  const totalTrades = orders.filter(o => o.status === 'executed').length;
  const totalBrokerage = orders.filter(o => o.status === 'executed').reduce((s, o) => s + (o.brokerage || 0), 0);
  const wins = closed.filter(t => t.pnl > 0).length;
  const losses = closed.filter(t => t.pnl < 0).length;

  // Global platform Live M2M Table (Per Client)
  const liveM2M = db.users.map(u => {
    const uPos = db.positions.filter(p => p.userId === u.id);
    let uPL = 0;
    let uMargin = 0;
    uPos.forEach(p => {
      const d = liveData[p.symbol];
      const ltp = d ? d.ltp : p.entryPrice;
      uPL += p.side === 'buy' ? (ltp - p.entryPrice) * p.qty : (p.entryPrice - ltp) * p.qty;
      uMargin += p.margin || 0;
    });
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role,
      ledgerBalance: r2(u.funds),
      m2m: r2(uPL),
      activePL: r2(uPL),
      activeTrades: uPos.length,
      marginUsed: r2(uMargin),
      creditLimit: u.creditLimit || 0,
      status: u.status
    };
  });

  // Turnover Calculations (MCX vs Equity)
  let mcxBuy = 0, mcxSell = 0, eqBuy = 0, eqSell = 0;
  db.orders.filter(o => o.status === 'executed').forEach(o => {
    const val = (o.price || o.executedPrice || 0) * (o.qty || 1);
    if (o.exchange === 'MCX') {
      if (o.side === 'buy') mcxBuy += val; else mcxSell += val;
    } else {
      if (o.side === 'buy') eqBuy += val; else eqSell += val;
    }
  });

  const activeBuyCount = db.positions.filter(p => p.side === 'buy').length;
  const activeSellCount = db.positions.filter(p => p.side === 'sell').length;

  res.json({
    portfolioValue: r2(user.funds + activePL),
    activePL: r2(activePL),
    closedPL: r2(closedPL),
    funds: user.funds,
    available: r2(user.funds - marginUsed),
    marginUsed: r2(marginUsed),
    totalTrades,
    activePositions: userPositions.length,
    totalBrokerage: r2(totalBrokerage),
    wins,
    losses,
    winRate: closed.length > 0 ? r2((wins / closed.length) * 100) : 0,
    liveM2M,
    activeBuyCount,
    activeSellCount,
    activeUsersCount: db.users.filter(u => u.status === 'active').length,
    turnover: {
      mcx: { buy: r2(mcxBuy), sell: r2(mcxSell), total: r2(mcxBuy + mcxSell) },
      equity: { buy: r2(eqBuy), sell: r2(eqSell), total: r2(eqBuy + eqSell) }
    },
    weeklyEarnings: {
      thisWeek: { gross: r2(closedPL * 1.15), brokerage: r2(totalBrokerage), net: r2(closedPL) },
      lastWeek: { gross: 145200.00, brokerage: 12450.00, net: 132750.00 }
    }
  });
});

// ─── Pending Orders Route ──────────────────────────────
app.get('/api/pending-orders', requireAuth, (req, res) => {
  const isAdmin = ['admin', 'broker'].includes(req.session.role);
  const pending = db.orders.filter(o => o.status === 'pending' && (isAdmin ? true : o.userId === req.session.userId));
  const enriched = pending.map((o, idx) => {
    const u = db.users.find(x => x.id === o.userId);
    return {
      index: idx + 1,
      ...o,
      userName: u ? u.name : 'Client #' + o.userId,
      userCode: u ? u.username : String(o.userId)
    };
  });
  res.json(enriched);
});

app.post('/api/pending-orders', requireAuth, (req, res) => {
  const { symbol, side, qty, price, orderType, condition, userId } = req.body;
  const d = liveData[symbol];
  if (!d) return res.status(400).json({ error: 'Invalid symbol' });
  const p = parseFloat(price);
  if (!p || p <= 0) return res.status(400).json({ error: 'Valid price required' });

  // Admin can create pending order for any client
  const targetUid = (req.session.role === 'admin' || req.session.role === 'broker') && userId
    ? parseInt(userId)
    : req.session.userId;

  const targetUser = db.users.find(u => u.id === targetUid) || db.users.find(u => u.id === req.session.userId);

  const effectiveQty = parseInt(qty) * (d.lotSize || 1);
  const order = {
    id: genId(), symbol, name: d.name, exchange: d.exchange, side,
    qty: effectiveQty, lots: parseInt(qty), price: p, orderType: orderType || 'limit',
    condition: condition || (side === 'buy' ? 'LTP <= Rate' : 'LTP >= Rate'),
    status: 'pending', executedPrice: null, executedAt: null,
    brokerage: r2(p * effectiveQty * BROKERAGE_RATE),
    margin: r2(d.marginPct ? (p * effectiveQty * d.marginPct / 100) : p * effectiveQty),
    userId: targetUser ? targetUser.id : req.session.userId,
    timestamp: Date.now()
  };
  db.orders.push(order);
  syncOrder(order);
  saveDB(db);
  res.json({ success: true, order, message: `Pending ${side.toUpperCase()} order created for ${targetUser ? targetUser.name : 'Client'} on ${symbol} @ ₹${p}` });
});

// ─── Executed Trades Route ──────────────────────────────
app.get('/api/trades', requireAuth, (req, res) => {
  const isAdmin = ['admin', 'broker'].includes(req.session.role);
  const executed = db.orders.filter(o => o.status === 'executed' && (isAdmin ? true : o.userId === req.session.userId));
  const list = executed.map(o => {
    const u = db.users.find(x => x.id === o.userId);
    const isBuy = o.side === 'buy';
    return {
      id: o.id,
      script: o.symbol,
      segment: o.exchange,
      userId: u ? u.username : o.userId,
      userName: u ? u.name : 'Trader',
      side: o.side,
      buyRate: isBuy ? o.executedPrice || o.price : null,
      sellRate: !isBuy ? o.executedPrice || o.price : null,
      lots: o.lots || Math.max(1, Math.floor(o.qty / (liveData[o.symbol]?.lotSize || 1))),
      qty: o.qty,
      boughtAt: isBuy ? o.executedAt || o.timestamp : null,
      soldAt: !isBuy ? o.executedAt || o.timestamp : null,
      timestamp: o.executedAt || o.timestamp
    };
  });
  res.json(list);
});

// ─── Funds WD Ledger Routes (Matching /funds-wd/index & /funds-wd/create) ───
app.get('/api/funds-wd', requireAuth, (req, res) => {
  const isAdmin = ['admin', 'broker'].includes(req.session.role);
  const txns = db.fundTransactions.filter(t => isAdmin ? true : t.userId === req.session.userId);
  const enriched = txns.map(t => {
    const u = db.users.find(x => x.id === t.userId);
    return {
      id: t.id,
      username: u ? u.username : String(t.userId),
      name: u ? u.name : 'Client',
      type: t.type,
      amount: t.amount,
      notes: t.notes,
      createdAt: t.timestamp
    };
  });
  res.json(enriched);
});

app.post('/api/funds-wd', requireAuth, (req, res) => {
  const { userId, amount, type, notes } = req.body;
  const numAmount = parseFloat(amount);
  if (!numAmount || numAmount <= 0) return res.status(400).json({ error: 'Valid amount required' });

  const targetUid = (req.session.role === 'admin' || req.session.role === 'broker') && userId
    ? parseInt(userId)
    : req.session.userId;

  const targetUser = db.users.find(u => u.id === targetUid);
  if (!targetUser) return res.status(404).json({ error: 'Target client not found' });

  const txType = (type || 'deposit').toLowerCase();
  if (txType === 'withdraw' && numAmount > targetUser.funds) {
    return res.status(400).json({ error: `Insufficient ledger funds. Available: ₹${targetUser.funds.toFixed(2)}` });
  }

  targetUser.funds += txType === 'deposit' ? numAmount : -numAmount;
  syncUser(targetUser);
  const tx = {
    id: genId(),
    type: txType,
    amount: numAmount,
    notes: notes || (txType === 'deposit' ? 'Capital Credit / IMPS' : 'Profit Withdrawal'),
    userId: targetUser.id,
    timestamp: Date.now()
  };
  db.fundTransactions.push(tx);
  syncFundTx(tx);
  saveDB(db);

  res.json({
    success: true,
    transaction: tx,
    newBalance: targetUser.funds,
    message: `${txType.toUpperCase()} of ₹${numAmount.toLocaleString('en-IN')} saved for ${targetUser.name}`
  });
});

// ═══════════════════════════════════════════════════════════════
// WHATSAPP BOT & NOTIFICATIONS (@open-wa/wa-automate)
// ═══════════════════════════════════════════════════════════════
app.get('/api/whatsapp/status', requireAuth, (req, res) => {
  res.json(whatsapp.getStatus());
});

app.post('/api/whatsapp/start', requireAuth, async (req, res) => {
  const user = db.users.find(u => u.id === req.session.userId);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required to start WhatsApp session' });

  try {
    const result = await whatsapp.start();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whatsapp/toggle', requireAuth, (req, res) => {
  const user = db.users.find(u => u.id === req.session.userId);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  const enabled = whatsapp.toggleEnabled(req.body.enabled);
  res.json({ success: true, enabled, message: enabled ? 'WhatsApp alerts enabled' : 'WhatsApp alerts disabled' });
});

app.post('/api/whatsapp/test', requireAuth, async (req, res) => {
  const user = db.users.find(u => u.id === req.session.userId);
  const targetPhone = req.body.phone || user?.phone;
  if (!targetPhone) return res.status(400).json({ error: 'Please enter a valid mobile number' });

  const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  const testMessage = [
    `🔔 *TRADENOVA SN — WHATSAPP TEST ALERT*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✅ WhatsApp alert integration is active!`,
    `👤 *Tested by:* ${user?.name || 'Admin'} (${user?.role || 'user'})`,
    `📱 *Recipient:* ${targetPhone}`,
    `⚡ *Engine:* @open-wa/wa-automate v5.6.7`,
    `⏱️ *Timestamp:* ${timeStr}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `_Live execution alerts for orders & square-offs will be delivered here._`
  ].join('\n');

  const result = await whatsapp.sendRawText(targetPhone, testMessage, 'TEST');
  res.json(result);
});

// ═══════════════════════════════════════════════════════════════
// KITE CONNECT v3 ROUTES
// ═══════════════════════════════════════════════════════════════
app.get('/api/kite/status', requireAuth, (req, res) => {
  res.json(kite.getStatus());
});

app.get('/api/kite/login', requireAuth, requireAdmin, (req, res) => {
  try {
    const loginUrl = kite.getLoginUrl();
    res.redirect(loginUrl);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate Kite login URL: ' + e.message });
  }
});

app.get('/api/kite/callback', async (req, res) => {
  const { request_token, status } = req.query;
  if (status === 'cancelled' || !request_token) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Kite Auth Cancelled</title><style>body{background:#0b0f19;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style></head>
      <body>
        <div style="text-align:center;background:#161d2f;padding:40px;border-radius:12px;border:1px solid #ff4444;">
          <h2 style="color:#ff4444;">Authentication Cancelled</h2>
          <p>Kite Connect login was cancelled or failed.</p>
          <a href="/" style="color:#38bdf8;text-decoration:none;font-weight:bold;">Return to TradeNova SN</a>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const result = await kite.handleCallback(request_token);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kite Connect Active</title>
        <meta http-equiv="refresh" content="3;url=/">
        <style>
          body { background: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #131b2e; border: 1px solid #10b981; border-radius: 16px; padding: 40px; text-align: center; max-width: 480px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
          .badge { background: #064e3b; color: #34d399; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 16px; }
          h2 { margin: 0 0 10px; font-size: 24px; color: #fff; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
          .btn { background: #2563eb; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● LIVE FEED CONNECTED</div>
          <h2>Zerodha Kite Connected!</h2>
          <p>Authenticated trader: <strong>${result.user || 'Admin'}</strong><br>WebSocket binary stream active for NSE, BSE, MCX, CDS & NFO.<br>Redirecting to TradeNova SN terminal...</p>
          <a href="/" class="btn">Enter Terminal Now</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Auth Failed</title><style>body{background:#0b0f19;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style></head>
      <body>
        <div style="text-align:center;background:#161d2f;padding:40px;border-radius:12px;border:1px solid #ef4444;max-width:500px;">
          <h2 style="color:#ef4444;">Kite Token Exchange Failed</h2>
          <p style="color:#94a3b8;">${err.message}</p>
          <a href="/" style="color:#38bdf8;text-decoration:none;">Back to Terminal</a>
        </div>
      </body>
      </html>
    `);
  }
});

app.post('/api/kite/disconnect', requireAuth, requireAdmin, (req, res) => {
  const result = kite.disconnect();
  res.json(result);
});

app.post('/api/kite/config', requireAuth, requireAdmin, (req, res) => {
  const { apiKey, apiSecret } = req.body;
  if (!apiKey || !apiSecret) return res.status(400).json({ error: 'API Key and Secret are required' });

  const status = kite.configure({ apiKey, apiSecret });

  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    if (envContent.includes('KITE_API_KEY=')) {
      envContent = envContent.replace(/KITE_API_KEY=.*/g, `KITE_API_KEY=${apiKey}`);
    } else {
      envContent += `\nKITE_API_KEY=${apiKey}`;
    }
    if (envContent.includes('KITE_API_SECRET=')) {
      envContent = envContent.replace(/KITE_API_SECRET=.*/g, `KITE_API_SECRET=${apiSecret}`);
    } else {
      envContent += `\nKITE_API_SECRET=${apiSecret}`;
    }
    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  } catch (e) {
    console.warn('Could not write credentials to .env:', e.message);
  }

  res.json({ success: true, status });
});

// ═══════════════════════════════════════════════════════════════
// BRANDING & LOGO MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════════
const BRANDING_FILE = path.join(DATA_DIR, 'branding.json');

function loadBranding() {
  try {
    if (fs.existsSync(BRANDING_FILE)) {
      return JSON.parse(fs.readFileSync(BRANDING_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load branding:', e.message);
  }
  return {
    appName: 'TradeNova SN',
    shortName: 'TradeNova',
    tagline: 'Institutional Paper Trading Terminal',
    logoUrl: '/icons/icon-192.png',
    faviconUrl: '/favicon.png',
    primaryColor: '#d4af37',
    updatedAt: Date.now()
  };
}

function saveBranding(cfg) {
  try {
    fs.writeFileSync(BRANDING_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save branding:', e.message);
  }
}

app.get(['/api/branding', '/api/admin/branding'], (req, res) => {
  const current = loadBranding();
  res.json({ success: true, branding: current, ...current });
});

// Direct Redirect Link for Admin Logo & Branding Settings
app.get(['/branding', '/admin/branding', '/settings', '/admin/settings', '/logo'], (req, res) => {
  res.redirect('/#branding');
});

app.post('/api/admin/branding', (req, res, next) => {
  if (req.session && (req.session.role === 'admin' || req.session.role === 'broker')) {
    return next();
  }
  if (req.session && req.session.userId) {
    const user = db.users.find(u => u.id === req.session.userId);
    if (user && (user.role === 'admin' || user.role === 'broker')) {
      req.session.role = user.role;
      return next();
    }
  }
  return res.status(403).json({ success: false, error: 'Admin access required. Please log in as admin.' });
}, (req, res) => {
  try {
    const { appName, shortName, tagline, primaryColor, logoBase64 } = req.body;
    const current = loadBranding();

    if (appName) current.appName = appName.trim();
    if (shortName) current.shortName = shortName.trim();
    if (tagline) current.tagline = tagline.trim();
    if (primaryColor) current.primaryColor = primaryColor.trim();
    current.updatedAt = Date.now();

    // If new logo is uploaded as base64 string
    if (logoBase64 && typeof logoBase64 === 'string' && logoBase64.includes('base64,')) {
      const parts = logoBase64.split('base64,');
      const buffer = Buffer.from(parts[1], 'base64');

      const pubDir = path.join(__dirname, 'public');
      const iconsDir = path.join(pubDir, 'icons');
      if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

      // Overwrite all web icons in public directory
      fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), buffer);
      fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), buffer);
      fs.writeFileSync(path.join(pubDir, 'favicon.png'), buffer);
      fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), buffer);
      fs.writeFileSync(path.join(pubDir, 'og-image.png'), buffer);

      // Overwrite root level icons if present
      try {
        fs.writeFileSync(path.join(__dirname, 'app_icon.png'), buffer);
        fs.writeFileSync(path.join(__dirname, 'app_icon.jpg'), buffer);
        const rootIcons = path.join(__dirname, 'icons');
        if (fs.existsSync(rootIcons)) {
          fs.writeFileSync(path.join(rootIcons, 'icon-192.png'), buffer);
          fs.writeFileSync(path.join(rootIcons, 'icon-512.png'), buffer);
        }
        if (fs.existsSync(path.join(__dirname, 'favicon.png'))) fs.writeFileSync(path.join(__dirname, 'favicon.png'), buffer);
        if (fs.existsSync(path.join(__dirname, 'og-image.png'))) fs.writeFileSync(path.join(__dirname, 'og-image.png'), buffer);
        if (fs.existsSync(path.join(__dirname, 'apple-touch-icon.png'))) fs.writeFileSync(path.join(__dirname, 'apple-touch-icon.png'), buffer);
      } catch (e) {}

      // Overwrite Android mipmap launcher icons if android folder exists
      const androidRes = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
      if (fs.existsSync(androidRes)) {
        const mipmaps = ['mipmap-hdpi', 'mipmap-mdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
        mipmaps.forEach(m => {
          const dir = path.join(androidRes, m);
          if (fs.existsSync(dir)) {
            try {
              fs.writeFileSync(path.join(dir, 'ic_launcher.png'), buffer);
              fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), buffer);
            } catch (e) {}
          }
        });
      }

      current.logoUrl = `/icons/icon-192.png?v=${current.updatedAt}`;
      current.faviconUrl = `/favicon.png?v=${current.updatedAt}`;
    }

    // Update manifest.json
    try {
      const manifestPath = path.join(__dirname, 'public', 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.name = `${current.appName} — Trading Terminal`;
        manifest.short_name = current.shortName;
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      }
    } catch (e) {
      console.warn('Failed to update manifest.json:', e.message);
    }

    saveBranding(current);

    // Broadcast live branding update to all connected clients & sockets
    io.emit('branding:updated', current);

    res.json({ success: true, branding: current, message: 'Platform branding updated and broadcasted live!' });
  } catch (err) {
    console.error('Branding update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update branding: ' + err.message });
  }
});

// ─── Serve SPA ──────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO
// ═══════════════════════════════════════════════════════════════
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send full market data, Kite feed status & current branding on connect
  socket.emit('marketData', liveData);
  socket.emit('kite:status', kite.getStatus());
  socket.emit('branding:updated', loadBranding());

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ═══════════════════════════════════════════════════════════════
// START WITH ASYNC MYSQL INITIALIZATION
// ═══════════════════════════════════════════════════════════════
async function startServer() {
  try {
    console.log('⚡ Initializing MySQL Database Connection...');
    await initMySQL();
    db = await loadStateFromMySQL();
    console.log(`\x1b[32m✔ Loaded operational state from MySQL: ${db.users.length} users, ${db.orders.length} orders, ${db.positions.length} positions, ${db.closedTrades.length} closed trades, ${db.fundTransactions.length} fund txns\x1b[0m`);
  } catch (err) {
    console.error('\x1b[31m✖ MySQL connection failed, falling back to local db.json:\x1b[0m', err.message);
    db = loadDB();
  }

  initLiveData();

  // Initialize Kite Connect v3 feed
  kite.init(io, (tickUpdates) => {
    Object.assign(liveData, tickUpdates);
    checkPendingOrders();
    io.emit('priceUpdate', tickUpdates);
  });

  // Dual engine ticker: uses real Zerodha ticks if connected, otherwise fallback to high-fidelity simulation
  setInterval(() => {
    if (!kite.connected) {
      tickPrices();
    }
  }, 1200);

  whatsapp.init(io);

  server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   ⚡ TradeNova SN — MySQL Paper Trading Portal ║
║                                               ║
║   Server running on http://localhost:${PORT}      ║
║   Database: MySQL (${process.env.DB_NAME || 'tradenova'} @ ${process.env.DB_HOST || '127.0.0.1'})  ║
║                                               ║
║   Default logins:                             ║
║   • admin / admin123  (Admin)                 ║
║   • AG    / 123456    (Admin)                 ║
║   • demo  / demo      (Client)               ║
║                                               ║
╚═══════════════════════════════════════════════╝
    `);
  });
}

startServer();
