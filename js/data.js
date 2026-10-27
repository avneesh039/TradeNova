// ═══════════════════════════════════════════════════════════
// TradeNova SN — Market Data & Configuration
// Complete Indian Market Paper Trading Portal
// ═══════════════════════════════════════════════════════════

const MARKET_CONFIG = {
  tradingHours: { start: '09:15', end: '15:30' },
  mcxHours: { start: '09:00', end: '23:30' },
  currencyHours: { start: '09:00', end: '17:00' },
  tickInterval: 1500, // ms between price updates
  defaultFunds: 1000000, // 10 Lakh starting capital
  brokerageRate: 0.03, // 0.03% per trade
  sttRate: 0.1, // STT
  gstRate: 18, // GST on brokerage
};

// ─── NSE Stocks (Nifty 50 + Popular) ─────────────────────
const NSE_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2534.70, sector: 'Oil & Gas', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3856.25, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1523.40, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1634.85, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 967.30, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1245.60, sector: 'Telecom', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ITC', name: 'ITC Ltd', price: 436.15, sector: 'FMCG', lotSize: 1, exchange: 'NSE' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 612.40, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', price: 487.90, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2423.50, sector: 'FMCG', lotSize: 1, exchange: 'NSE' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1768.35, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'LT', name: 'Larsen & Toubro', price: 3245.80, sector: 'Infrastructure', lotSize: 1, exchange: 'NSE' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 1058.70, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', price: 2812.45, sector: 'Consumer', lotSize: 1, exchange: 'NSE' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 10534.20, sector: 'Auto', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TITAN', name: 'Titan Company Ltd', price: 3256.80, sector: 'Consumer', lotSize: 1, exchange: 'NSE' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma Industries', price: 1167.35, sector: 'Pharma', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', price: 7234.60, sector: 'Finance', lotSize: 1, exchange: 'NSE' },
  { symbol: 'NTPC', name: 'NTPC Ltd', price: 356.25, sector: 'Power', lotSize: 1, exchange: 'NSE' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp', price: 284.70, sector: 'Power', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 658.40, sector: 'Auto', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2834.50, sector: 'Conglomerate', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', price: 1215.30, sector: 'Infrastructure', lotSize: 1, exchange: 'NSE' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', price: 405.60, sector: 'Mining', lotSize: 1, exchange: 'NSE' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', price: 856.90, sector: 'Metals', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', price: 132.45, sector: 'Metals', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', price: 243.80, sector: 'Oil & Gas', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', price: 1367.50, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', price: 1423.65, sector: 'Banking', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', price: 8567.30, sector: 'Auto', lotSize: 1, exchange: 'NSE' },
  { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1345.20, sector: 'IT', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', price: 9876.40, sector: 'Cement', lotSize: 1, exchange: 'NSE' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', price: 2456.70, sector: 'FMCG', lotSize: 1, exchange: 'NSE' },
  { symbol: 'DIVISLAB', name: "Divi's Laboratories", price: 3678.90, sector: 'Pharma', lotSize: 1, exchange: 'NSE' },
  { symbol: 'DRREDDY', name: "Dr Reddy's Labs", price: 5432.10, sector: 'Pharma', lotSize: 1, exchange: 'NSE' },
  { symbol: 'CIPLA', name: 'Cipla Ltd', price: 1234.50, sector: 'Pharma', lotSize: 1, exchange: 'NSE' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors', price: 4567.80, sector: 'Auto', lotSize: 1, exchange: 'NSE' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', price: 4123.60, sector: 'Auto', lotSize: 1, exchange: 'NSE' },
  { symbol: 'GRASIM', name: 'Grasim Industries', price: 2345.70, sector: 'Cement', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries', price: 5678.30, sector: 'FMCG', lotSize: 1, exchange: 'NSE' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', price: 5890.40, sector: 'Healthcare', lotSize: 1, exchange: 'NSE' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products', price: 1123.50, sector: 'FMCG', lotSize: 1, exchange: 'NSE' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', price: 1567.80, sector: 'Auto', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', price: 1634.20, sector: 'Finance', lotSize: 1, exchange: 'NSE' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries', price: 534.60, sector: 'Metals', lotSize: 1, exchange: 'NSE' },
  { symbol: 'BPCL', name: 'Bharat Petroleum', price: 345.80, sector: 'Oil & Gas', lotSize: 1, exchange: 'NSE' },
  { symbol: 'VEDL', name: 'Vedanta Ltd', price: 278.90, sector: 'Mining', lotSize: 1, exchange: 'NSE' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd', price: 178.40, sector: 'Internet', lotSize: 1, exchange: 'NSE' },
  { symbol: 'PAYTM', name: 'One97 Communications', price: 645.30, sector: 'Fintech', lotSize: 1, exchange: 'NSE' },
  { symbol: 'DMART', name: 'Avenue Supermarts', price: 3890.50, sector: 'Retail', lotSize: 1, exchange: 'NSE' },
];

// ─── MCX Commodities ─────────────────────────────────────
const MCX_COMMODITIES = [
  { symbol: 'GOLD', name: 'Gold', price: 62345.00, unit: '10 gms', lotSize: 100, marginPct: 5, exchange: 'MCX', expiry: '05DEC2026' },
  { symbol: 'GOLDM', name: 'Gold Mini', price: 62340.00, unit: '10 gms', lotSize: 10, marginPct: 5, exchange: 'MCX', expiry: '05DEC2026' },
  { symbol: 'GOLDPETAL', name: 'Gold Petal', price: 6238.00, unit: '1 gm', lotSize: 1, marginPct: 5, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'SILVER', name: 'Silver', price: 75430.00, unit: 'kg', lotSize: 30, marginPct: 6, exchange: 'MCX', expiry: '05DEC2026' },
  { symbol: 'SILVERM', name: 'Silver Mini', price: 75425.00, unit: 'kg', lotSize: 5, marginPct: 6, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'CRUDEOIL', name: 'Crude Oil', price: 6534.00, unit: 'barrel', lotSize: 100, marginPct: 8, exchange: 'MCX', expiry: '19NOV2026' },
  { symbol: 'NATURALGAS', name: 'Natural Gas', price: 256.70, unit: 'mmBtu', lotSize: 1250, marginPct: 10, exchange: 'MCX', expiry: '25NOV2026' },
  { symbol: 'COPPER', name: 'Copper', price: 724.50, unit: 'kg', lotSize: 2500, marginPct: 7, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'ZINC', name: 'Zinc', price: 263.40, unit: 'kg', lotSize: 5000, marginPct: 7, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'LEAD', name: 'Lead', price: 187.60, unit: 'kg', lotSize: 5000, marginPct: 7, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'ALUMINIUM', name: 'Aluminium', price: 213.80, unit: 'kg', lotSize: 5000, marginPct: 7, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'NICKEL', name: 'Nickel', price: 1623.40, unit: 'kg', lotSize: 1500, marginPct: 8, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'MENTHAOIL', name: 'Mentha Oil', price: 987.50, unit: 'kg', lotSize: 360, marginPct: 8, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'COTTON', name: 'Cotton', price: 26340.00, unit: 'bales', lotSize: 25, marginPct: 8, exchange: 'MCX', expiry: '30NOV2026' },
  { symbol: 'CPO', name: 'Crude Palm Oil', price: 8456.00, unit: 'MT', lotSize: 10, marginPct: 7, exchange: 'MCX', expiry: '30NOV2026' },
];

// ─── Currency Pairs ──────────────────────────────────────
const CURRENCY_PAIRS = [
  { symbol: 'USDINR', name: 'US Dollar / INR', price: 83.5240, lotSize: 1000, marginPct: 2, exchange: 'NSE-CDS', expiry: '27NOV2026' },
  { symbol: 'EURINR', name: 'Euro / INR', price: 90.6730, lotSize: 1000, marginPct: 2, exchange: 'NSE-CDS', expiry: '27NOV2026' },
  { symbol: 'GBPINR', name: 'British Pound / INR', price: 105.8450, lotSize: 1000, marginPct: 2, exchange: 'NSE-CDS', expiry: '27NOV2026' },
  { symbol: 'JPYINR', name: 'Japanese Yen / INR', price: 0.5580, lotSize: 1000, marginPct: 2, exchange: 'NSE-CDS', expiry: '27NOV2026' },
  { symbol: 'CHFINR', name: 'Swiss Franc / INR', price: 92.3450, lotSize: 1000, marginPct: 2, exchange: 'NSE-CDS', expiry: '27NOV2026' },
  { symbol: 'CADINR', name: 'Canadian Dollar / INR', price: 61.8920, lotSize: 1000, marginPct: 2, exchange: 'NSE-CDS', expiry: '27NOV2026' },
];

// ─── Index Futures ────────────────────────────────────────
const INDEX_FUTURES = [
  { symbol: 'NIFTY FUT', name: 'Nifty 50 Futures', price: 22567.50, lotSize: 50, marginPct: 12, exchange: 'NSE-FO', expiry: '27NOV2026' },
  { symbol: 'BANKNIFTY FUT', name: 'Bank Nifty Futures', price: 48234.75, lotSize: 25, marginPct: 12, exchange: 'NSE-FO', expiry: '27NOV2026' },
  { symbol: 'FINNIFTY FUT', name: 'Fin Nifty Futures', price: 21345.60, lotSize: 40, marginPct: 12, exchange: 'NSE-FO', expiry: '27NOV2026' },
  { symbol: 'MIDCPNIFTY FUT', name: 'Mid Cap Nifty Futures', price: 10567.30, lotSize: 75, marginPct: 12, exchange: 'NSE-FO', expiry: '27NOV2026' },
  { symbol: 'SENSEX FUT', name: 'Sensex Futures', price: 74567.80, lotSize: 10, marginPct: 12, exchange: 'BSE-FO', expiry: '27NOV2026' },
];

// ─── Market Indices (for ticker strip) ───────────────────
const MARKET_INDICES = [
  { symbol: 'NIFTY 50', value: 22534.60, change: 127.45, changePct: 0.57 },
  { symbol: 'SENSEX', value: 74234.80, change: 412.30, changePct: 0.56 },
  { symbol: 'BANK NIFTY', value: 48123.40, change: -89.60, changePct: -0.19 },
  { symbol: 'NIFTY IT', value: 33456.70, change: 234.50, changePct: 0.71 },
  { symbol: 'NIFTY PHARMA', value: 18234.50, change: -45.30, changePct: -0.25 },
  { symbol: 'NIFTY METAL', value: 7834.20, change: 56.80, changePct: 0.73 },
  { symbol: 'INDIA VIX', value: 13.45, change: -0.34, changePct: -2.47 },
  { symbol: 'NIFTY FIN', value: 21234.50, change: 102.30, changePct: 0.48 },
];

// ─── Segment Configuration ───────────────────────────────
const SEGMENTS = {
  NSE: { name: 'NSE', fullName: 'National Stock Exchange', color: '#3b82f6', icon: '📈' },
  BSE: { name: 'BSE', fullName: 'Bombay Stock Exchange', color: '#8b5cf6', icon: '📊' },
  MCX: { name: 'MCX', fullName: 'Multi Commodity Exchange', color: '#f59e0b', icon: '🏭' },
  CURRENCY: { name: 'Currency', fullName: 'Currency Derivatives', color: '#10b981', icon: '💱' },
  FNO: { name: 'F&O', fullName: 'Futures & Options', color: '#ef4444', icon: '📉' },
};

// ─── Default Users ───────────────────────────────────────
const DEFAULT_USERS = [
  { id: 1, name: 'Admin', username: 'admin', password: 'admin123', role: 'admin', phone: '9876543210', funds: 5000000, creditLimit: 10000000, status: 'active', broker: null, isDemo: false },
  { id: 2, name: 'AG Vikas', username: 'AG', password: '123456', role: 'admin', phone: '9876543211', funds: 1000000, creditLimit: 5000000, status: 'active', broker: null, isDemo: false },
  { id: 3, name: 'NGP Sunil', username: 'NGP001', password: '123456', role: 'broker', phone: '9876543212', funds: 500000, creditLimit: 2000000, status: 'active', broker: 'AG', isDemo: false },
  { id: 4, name: 'AG Savita', username: 'AGS001', password: '123456', role: 'client', phone: '9876543213', funds: 200000, creditLimit: 500000, status: 'active', broker: 'NGP001', isDemo: false },
  { id: 5, name: 'Rahul Kumar', username: 'RK001', password: '123456', role: 'client', phone: '9876543214', funds: 300000, creditLimit: 800000, status: 'active', broker: 'NGP001', isDemo: false },
  { id: 6, name: 'Demo User', username: 'demo', password: 'demo', role: 'client', phone: '0000000000', funds: 1000000, creditLimit: 2000000, status: 'active', broker: 'AG', isDemo: true },
];

// ─── Price Simulation Utilities ──────────────────────────
function generatePriceChange(currentPrice, volatility = 0.002) {
  const change = currentPrice * volatility * (Math.random() * 2 - 1);
  return Math.round(change * 100) / 100;
}

function generateOHLC(basePrice) {
  const open = basePrice + generatePriceChange(basePrice, 0.005);
  const high = Math.max(open, basePrice) + Math.abs(generatePriceChange(basePrice, 0.008));
  const low = Math.min(open, basePrice) - Math.abs(generatePriceChange(basePrice, 0.008));
  const close = basePrice;
  const volume = Math.floor(Math.random() * 5000000) + 100000;
  return { open: r2(open), high: r2(high), low: r2(low), close: r2(close), volume };
}

function r2(n) { return Math.round(n * 100) / 100; }

function formatINR(amount) {
  if (amount === undefined || amount === null) return '₹0.00';
  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const parts = abs.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];
  // Indian numbering: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    let rest = intPart.slice(0, -3);
    const groups = [];
    while (rest.length > 2) {
      groups.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest.length > 0) groups.unshift(rest);
    intPart = groups.join(',') + ',' + last3;
  }
  return (isNeg ? '-₹' : '₹') + intPart + '.' + decPart;
}

function formatNumber(num) {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
  if (num >= 1000) return (num / 1000).toFixed(2) + ' K';
  return num.toFixed(2);
}

function getTimeString() {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getDateString() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Export all data ─────────────────────────────────────
const ALL_INSTRUMENTS = {
  NSE: NSE_STOCKS,
  MCX: MCX_COMMODITIES,
  CURRENCY: CURRENCY_PAIRS,
  FNO: INDEX_FUTURES,
};
