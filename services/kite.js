// ═══════════════════════════════════════════════════════════════
// TradeNova SN — Zerodha Kite Connect v3 Service Engine
// Official SDK: kiteconnect (KiteConnect + KiteTicker)
// Real-time market tick ingestion, Level 2 depth & historical candles
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const { KiteConnect, KiteTicker } = require('kiteconnect');

class KiteService {
  constructor() {
    this.apiKey = process.env.KITE_API_KEY || '';
    this.apiSecret = process.env.KITE_API_SECRET || '';
    this.accessToken = process.env.KITE_ACCESS_TOKEN || '';
    this.kc = null;
    this.ticker = null;
    this.connected = false;
    this.userName = null;
    this.instrumentMap = new Map(); // Symbol -> instrument_token
    this.tokenToSymbol = new Map(); // instrument_token -> metadata
    this.onTickCallback = null;
    this.io = null;
  }

  init(io, onTickCallback) {
    this.io = io;
    this.onTickCallback = onTickCallback;

    if (!this.apiKey) {
      console.log('[Kite Connect v3] Running in SIMULATION mode (KITE_API_KEY not configured).');
      return;
    }

    this.kc = new KiteConnect({ api_key: this.apiKey });
    console.log('[Kite Connect v3] Initialized with API Key:', this.apiKey.substring(0, 4) + '****');

    if (this.accessToken) {
      this.kc.setAccessToken(this.accessToken);
      this.startTicker();
    }
  }

  getLoginUrl() {
    if (!this.kc) {
      this.kc = new KiteConnect({ api_key: this.apiKey || process.env.KITE_API_KEY });
    }
    return this.kc.getLoginURL();
  }

  getStatus() {
    return {
      configured: !!(this.apiKey && this.apiSecret),
      connected: this.connected,
      mode: this.connected ? 'Kite Live' : 'Simulation',
      user: this.userName || (this.connected ? 'Kite User' : null),
      subscribedCount: this.instrumentMap.size
    };
  }

  async handleCallback(requestToken) {
    if (!this.kc) this.kc = new KiteConnect({ api_key: this.apiKey || process.env.KITE_API_KEY });
    const secret = this.apiSecret || process.env.KITE_API_SECRET;

    try {
      console.log('[Kite Connect v3] Exchanging request token for session access token...');
      const response = await this.kc.generateSession(requestToken, secret);
      this.accessToken = response.access_token;
      this.userName = response.user_name || response.user_id;
      this.kc.setAccessToken(this.accessToken);

      console.log(`\x1b[32m✔ [Kite Connect v3] Authenticated successfully for trader: ${this.userName}\x1b[0m`);

      // Sync master instruments
      await this.syncInstruments();

      // Launch WebSocket Ticker
      this.startTicker();

      if (this.io) {
        this.io.emit('kite:status', this.getStatus());
      }

      return { success: true, user: this.userName };
    } catch (err) {
      console.error('✖ [Kite Connect v3] Token Exchange Error:', err.message);
      throw err;
    }
  }

  async syncInstruments() {
    try {
      console.log('[Kite Connect v3] Ingesting exchange instruments master list...');
      const list = await this.kc.getInstruments(['NSE', 'BSE', 'MCX', 'NFO', 'CDS']);
      this.instrumentMap.clear();
      this.tokenToSymbol.clear();

      for (const inst of list) {
        const sym = inst.tradingsymbol;
        this.instrumentMap.set(sym, inst.instrument_token);
        this.instrumentMap.set(`${inst.exchange}:${sym}`, inst.instrument_token);
        this.tokenToSymbol.set(inst.instrument_token, {
          symbol: sym,
          exchange: inst.exchange,
          lotSize: inst.lot_size,
          tickSize: inst.tick_size
        });
      }
      console.log(`\x1b[32m✔ [Kite Connect v3] Successfully mapped ${list.length} instruments.\x1b[0m`);
    } catch (err) {
      console.warn('[Kite Connect v3] Instrument sync warning:', err.message);
    }
  }

  startTicker() {
    if (!this.accessToken) return;
    if (this.ticker) {
      try { this.ticker.disconnect(); } catch (e) {}
    }

    this.ticker = new KiteTicker({
      api_key: this.apiKey || process.env.KITE_API_KEY,
      access_token: this.accessToken
    });

    this.ticker.autoReconnect(true, 10, 5);

    this.ticker.on('connect', () => {
      console.log('\x1b[32m✔ [KiteTicker] Connected to live Zerodha binary WebSocket stream (wss://ws.kite.trade)\x1b[0m');
      this.connected = true;
      this.subscribeInstruments();
      if (this.io) this.io.emit('kite:status', this.getStatus());
    });

    this.ticker.on('ticks', (ticks) => {
      const updates = this.normalizeTicks(ticks);
      if (this.onTickCallback) {
        this.onTickCallback(updates);
      }
    });

    this.ticker.on('close', (reason) => {
      console.warn('[KiteTicker] Connection closed:', reason);
      this.connected = false;
      if (this.io) this.io.emit('kite:status', this.getStatus());
    });

    this.ticker.on('error', (err) => {
      console.error('[KiteTicker] WebSocket Error:', err.message || err);
    });

    this.ticker.connect();
  }

  subscribeInstruments() {
    if (!this.ticker || !this.connected) return;

    const tokens = [];
    for (const token of this.instrumentMap.values()) {
      tokens.push(token);
    }

    if (tokens.length > 0) {
      console.log(`[KiteTicker] Subscribing to ${tokens.length} instrument tokens in FULL DOM depth mode...`);
      this.ticker.subscribe(tokens);
      this.ticker.setMode(this.ticker.modeFull, tokens); // modeFull sends full 5-level Bids/Asks
    }
  }

  normalizeTicks(ticks) {
    const updates = {};
    for (const tick of ticks) {
      const meta = this.tokenToSymbol.get(tick.instrument_token);
      if (!meta) continue;

      const sym = meta.symbol;
      const ohlc = tick.ohlc || {};
      const depth = tick.depth || { buy: [], sell: [] };

      const ltp = tick.last_price || ohlc.close || 0;
      const open = ohlc.open || ltp;
      const high = ohlc.high || ltp;
      const low = ohlc.low || ltp;
      const close = ohlc.close || ltp;
      const change = Math.round((ltp - open) * 100) / 100;
      const changePct = open > 0 ? Math.round(((ltp - open) / open) * 10000) / 100 : 0;

      const bids = (depth.buy || []).map(b => ({
        price: b.price,
        qty: b.quantity,
        orders: b.orders
      }));

      const asks = (depth.sell || []).map(a => ({
        price: a.price,
        qty: a.quantity,
        orders: a.orders
      }));

      updates[sym] = {
        symbol: sym,
        exchange: meta.exchange,
        ltp,
        open,
        high,
        low,
        close,
        change,
        changePct,
        volume: tick.volume_traded || 0,
        bid: bids[0] ? bids[0].price : ltp,
        ask: asks[0] ? asks[0].price : ltp,
        depth: {
          bids,
          asks,
          totalBidQty: bids.reduce((acc, b) => acc + (b.qty || 0), 0),
          totalAskQty: asks.reduce((acc, a) => acc + (a.qty || 0), 0),
          ltp
        }
      };
    }
    return updates;
  }

  async getCandles(symbol, interval = '5minute', daysBack = 5) {
    if (!this.kc || !this.accessToken) return null;
    const token = this.instrumentMap.get(symbol);
    if (!token) return null;

    try {
      const to = new Date();
      const from = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
      const data = await this.kc.getHistoricalData(token, interval, from, to);
      return data.map(b => ({
        time: new Date(b[0]).getTime(),
        open: b[1],
        high: b[2],
        low: b[3],
        close: b[4],
        volume: b[5]
      }));
    } catch (err) {
      console.warn(`[Kite Connect v3] Candle fetch failed for ${symbol}:`, err.message);
      return null;
    }
  }

  disconnect() {
    if (this.ticker) {
      try { this.ticker.disconnect(); } catch (e) {}
    }
    this.connected = false;
    this.accessToken = '';
    this.userName = null;
    if (this.io) this.io.emit('kite:status', this.getStatus());
    console.log('[Kite Connect v3] Disconnected and session cleared.');
    return { success: true };
  }

  configure({ apiKey, apiSecret }) {
    if (apiKey) this.apiKey = apiKey.trim();
    if (apiSecret) this.apiSecret = apiSecret.trim();
    this.kc = new KiteConnect({ api_key: this.apiKey });
    console.log('[Kite Connect v3] Credentials updated.');
    return this.getStatus();
  }
}

module.exports = new KiteService();
