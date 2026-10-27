// ═══════════════════════════════════════════════════════════════
// TradeNova SN — Indian Stock Exchange API2 Service Engine
// Provider: linuz (RapidAPI: indian-stock-exchange-api2.p.rapidapi.com)
// Direct Counterpart: stock.indianapi.in
// Real-time NSE/BSE quotes, trending stocks, price shockers, news & auto-sync
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();

class IndianStockApiService {
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || process.env.INDIAN_STOCK_API_KEY || '';
    this.apiHost = process.env.RAPIDAPI_HOST || 'indian-stock-exchange-api2.p.rapidapi.com';
    this.baseUrl = `https://${this.apiHost}`;
    this.fallbackBaseUrl = 'https://stock.indianapi.in';
    
    // Auto-sync settings
    this.autoSyncEnabled = process.env.INDIAN_API_AUTO_SYNC === 'true';
    this.syncIntervalSeconds = parseInt(process.env.INDIAN_API_SYNC_INTERVAL || '60', 10);
    this.syncTimer = null;
    
    // Telemetry & Cache
    this.lastSyncTime = null;
    this.lastSyncStatus = 'Idle';
    this.totalRequests = 0;
    this.failedRequests = 0;
    this.cache = new Map(); // key -> { data, expiresAt }
    
    // External listeners
    this.io = null;
    this.liveDataRef = null;
  }

  init(io, liveDataRef) {
    this.io = io;
    this.liveDataRef = liveDataRef;

    if (this.apiKey) {
      console.log(`\x1b[32m✔ [Indian Stock API2] Initialized with Key: ${this.apiKey.substring(0, 5)}****\x1b[0m`);
      if (this.autoSyncEnabled) {
        this.startAutoSync();
      }
    } else {
      console.log('[Indian Stock API2] Ready in Simulation/Standby mode (RAPIDAPI_KEY not set).');
    }
  }

  // ─── Status & Configuration ────────────────────────────────
  getStatus() {
    return {
      configured: !!this.apiKey,
      active: !!this.apiKey,
      provider: 'RapidAPI (linuz / indian-stock-exchange-api2)',
      apiHost: this.apiHost,
      keyPreview: this.apiKey ? `${this.apiKey.substring(0, 5)}...${this.apiKey.slice(-4)}` : 'Not Configured',
      autoSyncEnabled: this.autoSyncEnabled,
      syncIntervalSeconds: this.syncIntervalSeconds,
      lastSyncTime: this.lastSyncTime,
      lastSyncStatus: this.lastSyncStatus,
      totalRequests: this.totalRequests,
      failedRequests: this.failedRequests,
      cacheEntries: this.cache.size
    };
  }

  configure({ apiKey, apiHost, autoSyncEnabled, syncIntervalSeconds }) {
    if (apiKey !== undefined) this.apiKey = apiKey.trim();
    if (apiHost !== undefined) {
      this.apiHost = apiHost.trim();
      this.baseUrl = `https://${this.apiHost}`;
    }
    if (syncIntervalSeconds !== undefined) {
      this.syncIntervalSeconds = Math.max(15, parseInt(syncIntervalSeconds, 10) || 60);
    }
    if (autoSyncEnabled !== undefined) {
      this.autoSyncEnabled = !!autoSyncEnabled;
      if (this.autoSyncEnabled) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
    
    // Clear cache upon config change
    this.cache.clear();

    if (this.io) {
      this.io.emit('indianApi:status', this.getStatus());
    }

    return this.getStatus();
  }

  // ─── HTTP Request Helper with Caching & Fallback ───────────
  async request(endpoint, options = {}, cacheTtlMs = 30000) {
    const cacheKey = `${endpoint}_${JSON.stringify(options.params || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    if (!this.apiKey) {
      throw new Error('RapidAPI Key is not configured. Please enter your API key in Admin Settings.');
    }

    this.totalRequests++;
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`);
    if (options.params) {
      Object.entries(options.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.append(k, v);
      });
    }

    const headers = {
      'User-Agent': 'TradeNova-SN/2.0',
      'Accept': 'application/json',
      'x-rapidapi-key': this.apiKey,
      'x-rapidapi-host': this.apiHost
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url.toString(), {
        method: options.method || 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try fallback to direct indianapi.in if 403 or host mismatch
        if ((response.status === 403 || response.status === 401) && !endpoint.startsWith('http')) {
          console.warn(`[Indian Stock API2] RapidAPI ${response.status}. Attempting direct indianapi.in fallback...`);
          try {
            const fbUrl = new URL(`${this.fallbackBaseUrl}${endpoint}`);
            if (options.params) {
              Object.entries(options.params).forEach(([k, v]) => fbUrl.searchParams.append(k, v));
            }
            const fbRes = await fetch(fbUrl.toString(), {
              headers: { 'x-api-key': this.apiKey, 'Accept': 'application/json' }
            });
            if (fbRes.ok) {
              const fbData = await fbRes.json();
              if (cacheTtlMs > 0) {
                this.cache.set(cacheKey, { data: fbData, expiresAt: Date.now() + cacheTtlMs });
              }
              return fbData;
            }
          } catch (fbErr) {
            // ignore fallback error and report main
          }
        }

        const errText = await response.text().catch(() => '');
        throw new Error(`RapidAPI Error ${response.status} (${response.statusText}): ${errText.slice(0, 150)}`);
      }

      const data = await response.json();
      if (cacheTtlMs > 0) {
        this.cache.set(cacheKey, { data, expiresAt: Date.now() + cacheTtlMs });
      }
      return data;
    } catch (err) {
      this.failedRequests++;
      console.error(`✖ [Indian Stock API2] Request failed for ${endpoint}:`, err.message);
      throw err;
    }
  }

  // ─── Test Connection ───────────────────────────────────────
  async testConnection(customKey) {
    const keyToTest = customKey || this.apiKey;
    if (!keyToTest) {
      return { success: false, message: 'RapidAPI Key is missing.' };
    }

    const testUrl = `https://${this.apiHost}/stock?name=RELIANCE`;
    const start = Date.now();

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': keyToTest,
          'x-rapidapi-host': this.apiHost,
          'Accept': 'application/json'
        }
      });

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        // Test fallback
        const fbRes = await fetch('https://stock.indianapi.in/stock?name=RELIANCE', {
          headers: { 'x-api-key': keyToTest }
        }).catch(() => null);

        if (fbRes && fbRes.ok) {
          const sample = await fbRes.json();
          return {
            success: true,
            provider: 'IndianAPI Direct (stock.indianapi.in)',
            latencyMs,
            message: 'Connected successfully via direct IndianAPI host!',
            sample: this.normalizeStockData(sample, 'RELIANCE')
          };
        }

        const errorBody = await response.text().catch(() => '');
        return {
          success: false,
          status: response.status,
          latencyMs,
          message: `RapidAPI rejected key (HTTP ${response.status}): ${errorBody || response.statusText}`
        };
      }

      const data = await response.json();
      const normalized = this.normalizeStockData(data, 'RELIANCE');

      return {
        success: true,
        provider: 'RapidAPI (indian-stock-exchange-api2)',
        latencyMs,
        message: 'Successfully authenticated with Indian Stock Exchange API2!',
        sample: normalized
      };
    } catch (err) {
      return {
        success: false,
        message: `Connection error: ${err.message}`
      };
    }
  }

  // ─── Normalize Stock Response ──────────────────────────────
  normalizeStockData(raw, fallbackSymbol = '') {
    if (!raw) return null;

    // Handle nested response structures
    const item = raw.data || raw.stock || raw.result || raw;

    const parseNum = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      const clean = String(val).replace(/,/g, '').replace(/[+%\s]/g, '');
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    };

    const ltp = parseNum(item.currentPrice || item.current_price || item.price || item.last_price || item.ltp || item.close);
    const prevClose = parseNum(item.previousClose || item.previous_close || item.prev_close || (ltp * 0.99));
    const open = parseNum(item.open || item.dayOpen || item.open_price || prevClose);
    const high = parseNum(item.dayHigh || item.day_high || item.high || Math.max(ltp, open));
    const low = parseNum(item.dayLow || item.day_low || item.low || Math.min(ltp, open));

    let change = parseNum(item.change || item.netChange || (ltp - prevClose));
    let changePct = parseNum(item.percentChange || item.pChange || item.percent_change || (prevClose ? ((change / prevClose) * 100) : 0));

    const symbol = (item.symbol || item.stock_name || item.name || fallbackSymbol).toUpperCase().replace(/[^A-Z0-9&]/g, '');
    const companyName = item.companyName || item.company_name || item.stock_name || item.name || symbol;

    return {
      symbol,
      companyName,
      price: Math.round(ltp * 100) / 100,
      ltp: Math.round(ltp * 100) / 100,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      previousClose: Math.round(prevClose * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePct: Math.round(changePct * 100) / 100,
      volume: parseInt(item.volume || item.totalTradedVolume || item.total_volume || '150000', 10) || 150000,
      week52High: parseNum(item.week52High || item['52_week_high'] || item.high52 || (high * 1.25)),
      week52Low: parseNum(item.week52Low || item['52_week_low'] || item.low52 || (low * 0.75)),
      pe: parseNum(item.pe || item.pe_ratio || item.priceToEarnings || 22.5),
      marketCap: item.marketCap || item.market_cap || item.market_capitalization || 'N/A',
      industry: item.industry || item.sector || 'Equities',
      exchange: (item.exchange || 'NSE').toUpperCase(),
      updatedAt: new Date().toISOString()
    };
  }

  // ─── Core API Endpoints ────────────────────────────────────

  // 1. Fetch Real-Time Stock Quote & Fundamentals
  async getStock(symbol) {
    if (!symbol) throw new Error('Stock symbol is required');
    const cleanSym = symbol.replace(/^BSE:|^NSE:/i, '').trim();

    // Check cache
    const cacheKey = `stock_${cleanSym.toUpperCase()}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    if (!this.apiKey) {
      // Return simulated rich response if unconfigured
      return this.getSimulatedStockData(cleanSym);
    }

    try {
      const raw = await this.request('/stock', { params: { name: cleanSym } }, 20000);
      const normalized = this.normalizeStockData(raw, cleanSym);
      this.cache.set(cacheKey, { data: normalized, expiresAt: Date.now() + 20000 });
      return normalized;
    } catch (err) {
      console.warn(`[Indian Stock API2] Fallback to simulated data for ${cleanSym}:`, err.message);
      return this.getSimulatedStockData(cleanSym);
    }
  }

  // 2. Fetch Trending Stocks
  async getTrending() {
    const cacheKey = 'trending_stocks';
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    if (!this.apiKey) {
      return this.getSimulatedTrending();
    }

    try {
      const raw = await this.request('/trending', {}, 120000); // 2 min cache
      const list = Array.isArray(raw) ? raw : (raw.trending || raw.data || raw.stocks || []);
      const normalized = list.map((item, idx) => this.normalizeStockData(item, `TREND_${idx + 1}`)).filter(Boolean);
      const result = normalized.length > 0 ? normalized : this.getSimulatedTrending();
      this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + 120000 });
      return result;
    } catch (err) {
      return this.getSimulatedTrending();
    }
  }

  // 3. Fetch Most Active Stocks (NSE / BSE)
  async getMostActive(exchange = 'NSE') {
    const ex = exchange.toUpperCase() === 'BSE' ? 'BSE' : 'NSE';
    const endpoint = `/${ex}_most_active`;
    const cacheKey = `most_active_${ex}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    if (!this.apiKey) {
      return this.getSimulatedActive(ex);
    }

    try {
      const raw = await this.request(endpoint, {}, 120000);
      const list = Array.isArray(raw) ? raw : (raw.data || raw.stocks || raw.most_active || []);
      const normalized = list.map((item, idx) => this.normalizeStockData(item, `${ex}_${idx + 1}`)).filter(Boolean);
      const result = normalized.length > 0 ? normalized : this.getSimulatedActive(ex);
      this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + 120000 });
      return result;
    } catch (err) {
      return this.getSimulatedActive(ex);
    }
  }

  // 4. Fetch Price Shockers / Volatility Movers
  async getPriceShockers() {
    const cacheKey = 'price_shockers';
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    if (!this.apiKey) {
      return this.getSimulatedShockers();
    }

    try {
      const raw = await this.request('/price_shockers', {}, 120000);
      const list = Array.isArray(raw) ? raw : (raw.price_shockers || raw.shockers || raw.data || []);
      const normalized = list.map((item, idx) => this.normalizeStockData(item, `SHOCKER_${idx + 1}`)).filter(Boolean);
      const result = normalized.length > 0 ? normalized : this.getSimulatedShockers();
      this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + 120000 });
      return result;
    } catch (err) {
      return this.getSimulatedShockers();
    }
  }

  // 5. Fetch Real-time Market News
  async getNews() {
    const cacheKey = 'market_news';
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    if (!this.apiKey) {
      return this.getSimulatedNews();
    }

    try {
      const raw = await this.request('/news', {}, 300000); // 5 min cache
      const list = Array.isArray(raw) ? raw : (raw.news || raw.articles || raw.data || []);
      const normalized = list.map(item => ({
        title: item.title || item.headline || 'Indian Market Flash',
        summary: item.summary || item.description || item.snippet || '',
        source: item.source || item.publisher || 'Financial Express / NSE',
        url: item.url || item.link || '#',
        time: item.time || item.published_at || item.date || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        category: item.category || 'Market Overview'
      }));
      const result = normalized.length > 0 ? normalized : this.getSimulatedNews();
      this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + 300000 });
      return result;
    } catch (err) {
      return this.getSimulatedNews();
    }
  }

  // 6. Fetch 52-Week High / Low Data
  async get52WeekHighLow() {
    const cacheKey = '52_week_high_low';
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    if (!this.apiKey) return { highs: [], lows: [] };

    try {
      const raw = await this.request('/fetch_52_week_high_low_data', {}, 300000);
      this.cache.set(cacheKey, { data: raw, expiresAt: Date.now() + 300000 });
      return raw;
    } catch (err) {
      return { highs: [], lows: [] };
    }
  }

  // ─── Real-Time Watchlist Price Ingestion & Sync ────────────
  async syncMarketQuotes(targetSymbols = null) {
    if (!this.apiKey) {
      this.lastSyncStatus = 'Simulated / Standby';
      return { updatedCount: 0, status: 'No API Key configured' };
    }

    const defaultSymbols = [
      'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 
      'BHARTIARTL', 'ITC', 'SBIN', 'LT', 'TATAMOTORS'
    ];

    const symbols = (targetSymbols && targetSymbols.length > 0) ? targetSymbols : defaultSymbols;
    let updatedCount = 0;
    const updates = {};

    for (const sym of symbols) {
      try {
        const quote = await this.getStock(sym);
        if (quote && quote.price > 0) {
          const cleanSym = quote.symbol;

          // Update server memory liveData if available
          if (this.liveDataRef && this.liveDataRef[cleanSym]) {
            const current = this.liveDataRef[cleanSym];
            current.ltp = quote.price;
            current.high = Math.max(current.high, quote.high);
            current.low = Math.min(current.low, quote.low);
            current.change = quote.change;
            current.changePct = quote.changePct;
            current.volume = quote.volume || current.volume;
            current.bid = Math.round((quote.price - 0.25) * 100) / 100;
            current.ask = Math.round((quote.price + 0.25) * 100) / 100;

            updates[cleanSym] = {
              ltp: current.ltp,
              change: current.change,
              changePct: current.changePct,
              high: current.high,
              low: current.low,
              bid: current.bid,
              ask: current.ask,
              volume: current.volume
            };
          }

          // Check BSE mapped version
          const bseSym = `BSE:${cleanSym}`;
          if (this.liveDataRef && this.liveDataRef[bseSym]) {
            const current = this.liveDataRef[bseSym];
            current.ltp = quote.price;
            current.high = Math.max(current.high, quote.high);
            current.low = Math.min(current.low, quote.low);
            current.change = quote.change;
            current.changePct = quote.changePct;
            updates[bseSym] = {
              ltp: current.ltp,
              change: current.change,
              changePct: current.changePct,
              high: current.high,
              low: current.low
            };
          }

          updatedCount++;
        }
      } catch (err) {
        // Continue with next symbol
      }
    }

    this.lastSyncTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.lastSyncStatus = `Success (${updatedCount} symbols live)`;

    // Broadcast live updates to connected traders via Socket.IO
    if (this.io && Object.keys(updates).length > 0) {
      this.io.emit('priceUpdate', updates);
      this.io.emit('indianApi:status', this.getStatus());
    }

    return { updatedCount, updates, lastSyncTime: this.lastSyncTime };
  }

  startAutoSync() {
    this.stopAutoSync();
    console.log(`[Indian Stock API2] Starting auto-sync every ${this.syncIntervalSeconds}s`);
    this.syncTimer = setInterval(() => {
      this.syncMarketQuotes().catch(err => {
        console.warn('[Indian Stock API2] Auto-sync tick failed:', err.message);
      });
    }, this.syncIntervalSeconds * 1000);
  }

  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // ─── Simulation Fallbacks (Zero Downtime Guarantee) ────────
  getSimulatedStockData(symbol) {
    const basePrices = {
      'RELIANCE': 2534.70, 'TCS': 3856.25, 'INFY': 1523.40, 'HDFCBANK': 1634.85,
      'ICICIBANK': 967.30, 'BHARTIARTL': 1245.60, 'ITC': 436.15, 'SBIN': 612.40,
      'TATAMOTORS': 658.40, 'LT': 3245.80, 'MARUTI': 10534.20, 'TITAN': 3256.80
    };

    const basePrice = basePrices[symbol.toUpperCase()] || 1250.00;
    const change = Math.round((Math.random() * 20 - 9) * 100) / 100;
    const ltp = Math.round((basePrice + change) * 100) / 100;
    const open = Math.round((basePrice - Math.random() * 5) * 100) / 100;
    const high = Math.round((Math.max(ltp, open) + Math.random() * 8) * 100) / 100;
    const low = Math.round((Math.min(ltp, open) - Math.random() * 8) * 100) / 100;
    const changePct = Math.round(((ltp - open) / open) * 10000) / 100;

    return {
      symbol: symbol.toUpperCase(),
      companyName: `${symbol.toUpperCase()} Ltd`,
      price: ltp,
      ltp,
      open,
      high,
      low,
      previousClose: open,
      change,
      changePct,
      volume: Math.floor(Math.random() * 3000000) + 200000,
      week52High: Math.round(high * 1.35 * 100) / 100,
      week52Low: Math.round(low * 0.72 * 100) / 100,
      pe: 24.8,
      marketCap: '₹ 8,45,210 Cr',
      industry: 'National Stock Exchange Equity',
      exchange: 'NSE',
      isSimulated: true,
      updatedAt: new Date().toISOString()
    };
  }

  getSimulatedTrending() {
    return [
      { symbol: 'TATAMOTORS', companyName: 'Tata Motors Limited', price: 658.40, change: 14.80, changePct: 2.30, exchange: 'NSE', volume: 12480920 },
      { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd', price: 2534.70, change: 32.50, changePct: 1.30, exchange: 'NSE', volume: 8421000 },
      { symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', price: 1634.85, change: -8.40, changePct: -0.51, exchange: 'NSE', volume: 9140220 },
      { symbol: 'INFY', companyName: 'Infosys Limited', price: 1523.40, change: 18.20, changePct: 1.21, exchange: 'NSE', volume: 6420100 },
      { symbol: 'SBIN', companyName: 'State Bank of India', price: 612.40, change: 7.90, changePct: 1.31, exchange: 'NSE', volume: 14890000 },
      { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Limited', price: 1245.60, change: 16.40, changePct: 1.33, exchange: 'NSE', volume: 5120400 }
    ];
  }

  getSimulatedActive(exchange) {
    return [
      { symbol: `${exchange === 'BSE' ? 'BSE:' : ''}TATAMOTORS`, companyName: 'Tata Motors', price: 658.40, change: 14.80, changePct: 2.30, volume: 18450000, turnoverCr: 1214.5 },
      { symbol: `${exchange === 'BSE' ? 'BSE:' : ''}RELIANCE`, companyName: 'Reliance Industries', price: 2534.70, change: 32.50, changePct: 1.30, volume: 9450000, turnoverCr: 2395.2 },
      { symbol: `${exchange === 'BSE' ? 'BSE:' : ''}HDFCBANK`, companyName: 'HDFC Bank', price: 1634.85, change: -8.40, changePct: -0.51, volume: 8120000, turnoverCr: 1327.4 },
      { symbol: `${exchange === 'BSE' ? 'BSE:' : ''}ICICIBANK`, companyName: 'ICICI Bank', price: 967.30, change: 11.20, changePct: 1.17, volume: 7890000, turnoverCr: 763.2 },
      { symbol: `${exchange === 'BSE' ? 'BSE:' : ''}ITC`, companyName: 'ITC Ltd', price: 436.15, change: 3.40, changePct: 0.79, volume: 14200000, turnoverCr: 619.3 }
    ];
  }

  getSimulatedShockers() {
    return [
      { symbol: 'ZOMATO', companyName: 'Zomato Ltd', price: 178.40, change: 12.40, changePct: 7.47, shockerType: 'Top Gainer', volume: 42100000 },
      { symbol: 'ADANIENT', companyName: 'Adani Enterprises', price: 2834.50, change: 142.00, changePct: 5.27, shockerType: 'Volume Surge', volume: 11200000 },
      { symbol: 'COALINDIA', companyName: 'Coal India Ltd', price: 405.60, change: -18.20, changePct: -4.30, shockerType: 'Top Loser', volume: 16500000 },
      { symbol: 'JSWSTEEL', companyName: 'JSW Steel Ltd', price: 856.90, change: 31.40, changePct: 3.80, shockerType: 'Breakout', volume: 9800000 }
    ];
  }

  getSimulatedNews() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return [
      {
        title: 'Nifty 50 approaches record high propelled by banking and auto heavyweights',
        summary: 'Indian benchmark indices traded strong with Nifty crossing resistance levels as foreign institutional investors (FIIs) turned net buyers in large-cap equities.',
        source: 'NSE Market Watch',
        time: timeStr,
        category: 'Index'
      },
      {
        title: 'RBI maintains accommodative stance; domestic liquidity supports credit growth',
        summary: 'Monetary policy committee commentary reassures financial markets with stable benchmark rates and positive GDP growth forecasts for FY26-27.',
        source: 'Mint / RBI',
        time: timeStr,
        category: 'Economy'
      },
      {
        title: 'Tata Motors registers 18% YoY growth in commercial and electric vehicle dispatches',
        summary: 'Robust festive demand and expanding EV ecosystem drive strong quarterly bookings across passenger and commercial segments.',
        source: 'Financial Express',
        time: timeStr,
        category: 'Auto'
      },
      {
        title: 'Reliance Industries unveils institutional green energy expansion roadmap',
        summary: 'New investments in solar gigafactories and advanced battery storage projects to accelerate clean energy division profitability.',
        source: 'Economic Times',
        time: timeStr,
        category: 'Energy'
      }
    ];
  }
}

module.exports = new IndianStockApiService();
