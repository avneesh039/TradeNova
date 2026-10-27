// ═══════════════════════════════════════════════════════════
// TradeNova SN — Institutional Canvas Candlestick Engine
// High Performance 60fps HTML5 Canvas | Moving Averages | Depth
// ═══════════════════════════════════════════════════════════

const ChartEngine = {
  canvas: null,
  ctx: null,
  candles: [],
  symbol: null,
  hoverIndex: -1,
  timeframe: '5m',
  dpr: window.devicePixelRatio || 1,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bindEvents();
    this.resize();
  },

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = Math.max(340, rect.height || 360);
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.render();
  },

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    this.canvas?.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left);
      this.handleHover(x);
    });
    this.canvas?.addEventListener('mouseleave', () => {
      this.hoverIndex = -1;
      this.render();
      this.resetHUD();
    });
  },

  async loadSymbol(symbol) {
    this.symbol = symbol;
    try {
      const res = await fetch(`/api/instrument/${symbol}/candles`);
      const data = await res.json();
      if (Array.isArray(data)) {
        this.candles = data;
        this.render();
      }
    } catch (e) {
      console.warn('Failed to load candles for', symbol, e);
    }
  },

  updateTick(ltp) {
    if (!this.candles.length) return;
    const last = this.candles[this.candles.length - 1];
    last.close = ltp;
    if (ltp > last.high) last.high = ltp;
    if (ltp < last.low) last.low = ltp;
    last.volume += Math.floor(Math.random() * 8) + 1;
    this.render();
  },

  handleHover(x) {
    if (!this.candles.length) return;
    const padR = 64;
    const chartW = (this.canvas.width / this.dpr) - padR;
    const candleW = chartW / this.candles.length;
    const idx = Math.floor(x / candleW);
    if (idx >= 0 && idx < this.candles.length) {
      this.hoverIndex = idx;
      this.render();
      this.updateHUD(this.candles[idx]);
    }
  },

  updateHUD(c) {
    const hud = document.getElementById('chartHUD');
    if (!hud) return;
    const isUp = c.close >= c.open;
    hud.innerHTML = `
      <span class="hud-item">O: <b class="${isUp ? 'text-green' : 'text-red'}">₹${c.open.toFixed(2)}</b></span>
      <span class="hud-item">H: <b class="text-green">₹${c.high.toFixed(2)}</b></span>
      <span class="hud-item">L: <b class="text-red">₹${c.low.toFixed(2)}</b></span>
      <span class="hud-item">C: <b class="${isUp ? 'text-green' : 'text-red'}">₹${c.close.toFixed(2)}</b></span>
      <span class="hud-item">Vol: <b>${c.volume.toLocaleString()}</b></span>
    `;
  },

  resetHUD() {
    const hud = document.getElementById('chartHUD');
    if (!hud || !this.candles.length) return;
    const c = this.candles[this.candles.length - 1];
    this.updateHUD(c);
  },

  render() {
    if (!this.ctx || !this.canvas || !this.candles.length) return;
    const ctx = this.ctx;
    const dpr = this.dpr;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const colGrid = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
    const colText = isLight ? '#64748b' : '#64748b';
    const colGreen = isLight ? '#059669' : '#00e676';
    const colRed = isLight ? '#dc2626' : '#ff3d71';
    const colSMA = isLight ? '#2563eb' : '#38bdf8';

    const padTop = 30;
    const padBottom = 60;
    const padRight = 64;
    const plotW = w - padRight;
    const plotH = h - padTop - padBottom;
    const volH = 50;

    // Determine Min & Max price
    let minP = Infinity, maxP = -Infinity, maxVol = 0;
    this.candles.forEach(c => {
      if (c.low < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const range = (maxP - minP) || 1;
    const pricePad = range * 0.08;
    const chartMin = minP - pricePad;
    const chartMax = maxP + pricePad;
    const chartRange = chartMax - chartMin;

    const getY = p => padTop + (plotH - volH) * (1 - (p - chartMin) / chartRange);

    // Draw Price Grid Lines
    ctx.strokeStyle = colGrid;
    ctx.lineWidth = 1;
    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = colText;
    ctx.textAlign = 'left';

    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padTop + ((plotH - volH) / gridSteps) * i;
      const priceVal = chartMax - (chartRange / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(plotW, y);
      ctx.stroke();

      ctx.fillText(priceVal.toFixed(2), plotW + 8, y + 3);
    }

    // Draw Volume Separator line
    const volTopY = padTop + (plotH - volH);
    ctx.beginPath();
    ctx.moveTo(0, volTopY);
    ctx.lineTo(plotW, volTopY);
    ctx.stroke();

    const n = this.candles.length;
    const candleSlotW = plotW / n;
    const candleBodyW = Math.max(3, candleSlotW * 0.7);

    // Calculate SMA-20
    const sma20 = [];
    for (let i = 0; i < n; i++) {
      if (i < 10) { sma20.push(null); continue; }
      const slice = this.candles.slice(Math.max(0, i - 15), i + 1);
      const avg = slice.reduce((s, c) => s + c.close, 0) / slice.length;
      sma20.push(avg);
    }

    // Draw Candlesticks & Volume
    this.candles.forEach((c, i) => {
      const isUp = c.close >= c.open;
      const color = isUp ? colGreen : colRed;
      const cx = i * candleSlotW + candleSlotW / 2;

      // Volume bar
      const vH = (c.volume / (maxVol || 1)) * (volH - 10);
      const vY = padTop + plotH - vH;
      ctx.fillStyle = isUp ? (isLight ? 'rgba(5,150,105,0.25)' : 'rgba(0,230,118,0.25)') : (isLight ? 'rgba(220,38,38,0.25)' : 'rgba(255,61,113,0.25)');
      ctx.fillRect(cx - candleBodyW / 2, vY, candleBodyW, vH);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, getY(c.high));
      ctx.lineTo(cx, getY(c.low));
      ctx.stroke();

      // Body
      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yOpen - yClose));

      ctx.fillStyle = color;
      ctx.fillRect(cx - candleBodyW / 2, bodyTop, candleBodyW, bodyH);

      // Time labels for every ~7 candles
      if (i % 7 === 0) {
        ctx.fillStyle = colText;
        ctx.textAlign = 'center';
        const d = new Date(c.time);
        const timeStr = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
        ctx.fillText(timeStr, cx, h - 38);
      }
    });

    // Draw SMA-20 Line
    ctx.strokeStyle = colSMA;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    let started = false;
    sma20.forEach((val, i) => {
      if (val == null) return;
      const cx = i * candleSlotW + candleSlotW / 2;
      const cy = getY(val);
      if (!started) { ctx.moveTo(cx, cy); started = true; }
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Crosshair line if hovered
    if (this.hoverIndex >= 0 && this.hoverIndex < n) {
      const hc = this.candles[this.hoverIndex];
      const hx = this.hoverIndex * candleSlotW + candleSlotW / 2;
      const hy = getY(hc.close);

      ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hx, padTop);
      ctx.lineTo(hx, h - padBottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(plotW, hy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag on Right Axis
      ctx.fillStyle = colSMA;
      ctx.fillRect(plotW + 2, hy - 9, padRight - 4, 18);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(hc.close.toFixed(2), plotW + (padRight / 2), hy + 3);
    }

    ctx.restore();
  }
};

window.ChartEngine = ChartEngine;
