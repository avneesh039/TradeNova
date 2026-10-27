// ═══════════════════════════════════════════════════════════
// TradeNova SN v2.0 — Dual Theme Institutional Terminal
// Exact Clone & Enhanced Engine for admin.theindicator.in
// Live M2M | Turnover Grid | Pending Orders | Trades Register
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// TRADINGVIEW REAL-TIME CHARTING MANAGER
// ═══════════════════════════════════════════════════════════
const TV_SYMBOL_MAP = {
  // MCX Commodities -> Mapped to TradingView continuous feeds to avoid AAPL fallback
  'GOLD': 'TVC:GOLD',
  'GOLDM': 'TVC:GOLD',
  'GOLDPETAL': 'TVC:GOLD',
  'SILVER': 'TVC:SILVER',
  'SILVERM': 'TVC:SILVER',
  'SILVERMIC': 'TVC:SILVER',
  'CRUDEOIL': 'TVC:USOIL',
  'NATURALGAS': 'TVC:USNG',
  'COPPER': 'TVC:COPPER',
  'ZINC': 'TVC:ZINC',
  'LEAD': 'TVC:LEAD',
  'ALUMINIUM': 'TVC:ALUMINIUM',
  'NICKEL': 'TVC:NICKEL',
  'BULLDEX': 'TVC:GOLD',
  // Indian Equities -> Mapped to BSE continuous/free feeds on TradingView embed to avoid NSE licensing block
  'RELIANCE': 'BSE:RELIANCE',
  'TCS': 'BSE:TCS',
  'INFY': 'BSE:INFY',
  'HDFCBANK': 'BSE:HDFCBANK',
  'ICICIBANK': 'BSE:ICICIBANK',
  'BHARTIARTL': 'BSE:BHARTIARTL',
  'ITC': 'BSE:ITC',
  'SBIN': 'BSE:SBIN',
  'WIPRO': 'BSE:WIPRO',
  'HINDUNILVR': 'BSE:HINDUNILVR',
  'KOTAKBANK': 'BSE:KOTAKBANK',
  'LT': 'BSE:LT',
  'AXISBANK': 'BSE:AXISBANK',
  'ASIANPAINT': 'BSE:ASIANPAINT',
  'MARUTI': 'BSE:MARUTI',
  'TITAN': 'BSE:TITAN',
  'SUNPHARMA': 'BSE:SUNPHARMA',
  'BAJFINANCE': 'BSE:BAJFINANCE',
  'NTPC': 'BSE:NTPC',
  'POWERGRID': 'BSE:POWERGRID',
  'TATAMOTORS': 'BSE:TATAMOTORS',
  'ADANIENT': 'BSE:ADANIENT',
  'COALINDIA': 'BSE:COALINDIA',
  'JSWSTEEL': 'BSE:JSWSTEEL',
  'TATASTEEL': 'BSE:TATASTEEL',
  'ONGC': 'BSE:ONGC',
  'TECHM': 'BSE:TECHM',
  'HCLTECH': 'BSE:HCLTECH',
  'ULTRACEMCO': 'BSE:ULTRACEMCO',
  'NESTLEIND': 'BSE:NESTLEIND',
  'DRREDDY': 'BSE:DRREDDY',
  'CIPLA': 'BSE:CIPLA',
  'M&M': 'BSE:M_M',
  'BAJAJFINSV': 'BSE:BAJAJFINSV',
  'HINDALCO': 'BSE:HINDALCO',
  'BPCL': 'BSE:BPCL',
  'ZOMATO': 'BSE:ZOMATO',
  'DMART': 'BSE:DMART',
  'APOLLOHOSP': 'BSE:APOLLOHOSP',
  'BRITANNIA': 'BSE:BRITANNIA',
  // F&O & Indices
  'NIFTY-FUT': 'NSE:NIFTY',
  'BANKNIFTY-FUT': 'NSE:BANKNIFTY',
  'FINNIFTY-FUT': 'NSE:FINNIFTY',
  'SENSEX-FUT': 'BSE:SENSEX',
  'SENSEX': 'BSE:SENSEX',
  // Currency CDS
  'USDINR': 'FX_IDC:USDINR',
  'EURINR': 'FX_IDC:EURINR',
  'GBPINR': 'FX_IDC:GBPINR',
  'JPYINR': 'FX_IDC:JPYINR'
};

function getTradingViewSymbol(sym, exchange) {
  if (TV_SYMBOL_MAP[sym]) return TV_SYMBOL_MAP[sym];
  if (sym.startsWith('BSE:')) {
    const raw = sym.replace('BSE:', '');
    return `BSE:${raw}`;
  }
  if (sym === 'SENSEX' || sym === 'SENSEX-FUT') return 'BSE:SENSEX';
  if (exchange === 'BSE' || exchange === 'BSE-FO') return `BSE:${sym.replace('-FUT', '')}`;
  if (exchange === 'MCX') {
    const s = sym.toUpperCase();
    if (s.includes('GOLD')) return 'TVC:GOLD';
    if (s.includes('SILVER')) return 'TVC:SILVER';
    if (s.includes('CRUDE') || s.includes('OIL')) return 'TVC:USOIL';
    if (s.includes('GAS')) return 'TVC:USNG';
    if (s.includes('COPPER')) return 'TVC:COPPER';
    if (s.includes('ZINC')) return 'TVC:ZINC';
    if (s.includes('LEAD')) return 'TVC:LEAD';
    if (s.includes('ALUM')) return 'TVC:ALUMINIUM';
    if (s.includes('NICKEL')) return 'TVC:NICKEL';
    return 'TVC:GOLD';
  }
  if (exchange === 'CDS') return `FX_IDC:${sym}`;
  // For Indian equities on TradingView embed, BSE feeds load without the NSE distribution block
  return `BSE:${sym.replace('-FUT', '')}`;
}

const TVChart = {
  currentSymbol: 'GOLDM',
  currentInterval: '5',
  activeEngine: 'tv',

  init(symbol, interval = '5') {
    this.currentSymbol = symbol || this.currentSymbol || 'GOLDM';
    this.currentInterval = interval || this.currentInterval || '5';
    this.render();
  },

  render() {
    const wrapper = document.getElementById('tvChartWrapper');
    if (!wrapper) return;

    const sym = this.currentSymbol || (window.App && App.selectedSymbol) || 'GOLDM';
    this.currentSymbol = sym;
    const d = (window.App && App.liveData) ? App.liveData[sym] : null;
    const ex = d?.exchange || (sym.startsWith('BSE:') ? 'BSE' : (sym.includes('GOLD') || sym.includes('SILVER') || sym.includes('CRUDE') ? 'MCX' : 'NSE'));
    const tvSym = getTradingViewSymbol(sym, ex);
    const interval = this.currentInterval || "5";
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const theme = isLight ? 'light' : 'dark';

    // Update active chart header indicator telemetry if present
    const symDisp = document.getElementById('tradeSymDisplay');
    const symName = document.getElementById('tradeSymName');
    const exBadge = document.getElementById('tradeSymExchange');
    if (symDisp) symDisp.textContent = sym;
    if (exBadge) {
      exBadge.textContent = ex;
      const exLower = ex.toLowerCase();
      exBadge.className = 'segment-badge ' + (exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo'))));
    }
    if (symName && d) symName.textContent = d.name;

    // Advanced Chart configuration
    const config = {
      autosize: true,
      symbol: tvSym,
      interval: interval,
      timezone: "Asia/Kolkata",
      theme: theme,
      style: "1",
      locale: "in",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      withdateranges: true
    };

    const targetUrl = 'https://www.tradingview.com/embed-widget/advanced-chart/?locale=in#' + encodeURIComponent(JSON.stringify(config));

    // Clear wrapper entirely to destroy previous iframe document & avoid hash reuse
    wrapper.innerHTML = '';

    const container = document.createElement('div');
    container.id = 'tv_chart_container';
    container.style.width = '100%';
    container.style.height = '100%';

    const iframe = document.createElement('iframe');
    iframe.id = 'tv_iframe_' + Date.now();
    iframe.title = 'TradingView Chart - ' + tvSym;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('loading', 'eager');
    iframe.setAttribute('data-tv-symbol', tvSym);
    iframe.setAttribute('data-tv-interval', interval);
    iframe.setAttribute('data-tv-theme', theme);
    iframe.src = targetUrl;

    container.appendChild(iframe);
    wrapper.appendChild(container);
  },

  updateTheme() {
    if (this.activeEngine === 'tv') {
      this.render();
    }
  },

  switchSymbol(sym) {
    if (!sym) return;
    if (this.currentSymbol === sym && document.getElementById('tvChartWrapper')?.querySelector('iframe')) {
      return;
    }
    this.currentSymbol = sym;
    if (this.activeEngine === 'tv') {
      this.render();
    }
  },

  setInterval(tf) {
    if (!tf || this.currentInterval === tf) return;
    this.currentInterval = tf;
    if (this.activeEngine === 'tv') {
      this.render();
    }
  }
};

window.TVChart = TVChart;

const App = {
  user: null,
  page: 'dashboard',
  segment: 'NSE',
  tradeSegment: 'ALL',
  tradeType: 'buy',
  productType: 'MIS',
  selectedSymbol: 'GOLDM',
  liveData: {},
  socket: null,
  watchlist: JSON.parse(localStorage.getItem('tn_watchlist') || '[]'),

  // ─── Init ────────────────────────────────────────────
  init() {
    this.initSplashScreen();
    this.initTheme();
    this.initIcons();
    this.bindLogin();
    this.bindModals();
    this.initTerminalResizer();
    this.initPWA();
    this.initHashRouting();
    this.fetchBranding();
    if (window.SoundEngine) SoundEngine.init();
    if (window.ChartEngine) ChartEngine.init('tradeCanvas');
    this.checkSession();
  },

  bindModals() {
    window.addEventListener('click', (e) => {
      const om = document.getElementById('orderModal');
      const dm = document.getElementById('depthModal');
      if (om && e.target === om) this.closeOrderModal();
      if (dm && e.target === dm) this.closeDepthModal();

      // Close search-select dropdowns on outside click
      const symWrap = document.getElementById('symbolSearchSelectWrap');
      const clientWrap = document.getElementById('clientSearchSelectWrap');
      if (symWrap && !symWrap.contains(e.target)) this.closeSymbolSearchSelect();
      if (clientWrap && !clientWrap.contains(e.target)) this.closeClientSearchSelect();
    });

    window.addEventListener('keydown', (e) => {
      // Escape closes open search dropdown or open modals
      if (e.key === 'Escape' || e.keyCode === 27) {
        const symWrap = document.getElementById('symbolSearchSelectWrap');
        const clientWrap = document.getElementById('clientSearchSelectWrap');
        const symOpen = symWrap && symWrap.classList.contains('open');
        const clientOpen = clientWrap && clientWrap.classList.contains('open');
        if (symOpen || clientOpen) {
          this.closeSymbolSearchSelect();
          this.closeClientSearchSelect();
          return;
        }
        this.closeOrderModal();
        this.closeDepthModal();
        return;
      }

      const om = document.getElementById('orderModal');
      const isModalOpen = om && om.classList.contains('active');

      if (isModalOpen) {
        // Pressing Enter inside modal submits order
        if (e.key === 'Enter') {
          const activeId = document.activeElement ? document.activeElement.id : '';
          if (activeId === 'tradeQty' || activeId === 'tradePrice' || activeId === 'orderType' || activeId === 'orderClientSelect' || activeId === 'orderSymbolSelect' || !document.activeElement || document.activeElement.tagName.toLowerCase() !== 'input') {
            e.preventDefault();
            this.placeOrder();
          }
        } else if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
          const activeId = document.activeElement ? document.activeElement.id : '';
          if (activeId !== 'clientSearchInput' && activeId !== 'symbolSearchInput' && activeId !== 'tradePrice') {
            e.preventDefault();
            this.setOrderSide('buy');
          }
        } else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
          const activeId = document.activeElement ? document.activeElement.id : '';
          if (activeId !== 'clientSearchInput' && activeId !== 'symbolSearchInput' && activeId !== 'tradePrice') {
            e.preventDefault();
            this.setOrderSide('sell');
          }
        }
        return;
      }

      // Check if user is typing inside another modal (e.g. Client config or Broadcast)
      const otherModalOpen = document.querySelector('.modal-overlay.active, .modal-overlay[style*="display: flex"], .modal-overlay[style*="display: block"]');
      if (otherModalOpen && otherModalOpen.id !== 'orderModal') return;

      const key = e.key;
      const code = e.code;
      const keyCode = e.keyCode || e.which;

      // Detection for BUY key: '+' / '=' / NumpadAdd / F1 / keyCode 107 / keyCode 187
      const isBuyKey = key === '+' || key === '=' || code === 'NumpadAdd' || code === 'Equal' || keyCode === 107 || keyCode === 187 || key === 'Add' || key === 'Plus' || key === 'F1' || keyCode === 112;

      // Detection for SELL key: '-' / '_' / NumpadSubtract / Minus / F2 / keyCode 109 / keyCode 189
      const isSellKey = key === '-' || key === '_' || code === 'NumpadSubtract' || code === 'Minus' || keyCode === 109 || keyCode === 189 || key === 'Subtract' || key === 'F2' || keyCode === 113;

      if (!isBuyKey && !isSellKey) return;

      // Resolve the best active symbol to trade
      let targetSym = this.selectedSymbol;
      if (!targetSym || !this.liveData[targetSym]) {
        // Try active selected row in Market Watch
        const activeRow = document.querySelector('#mwBody tr.active-script-row');
        if (activeRow && activeRow.id) {
          targetSym = activeRow.id.replace('mw-', '');
        } else {
          // Fallback to first visible row in Market Watch or first live symbol
          const firstRow = document.querySelector('#mwBody tr');
          if (firstRow && firstRow.id) {
            targetSym = firstRow.id.replace('mw-', '');
          } else {
            targetSym = Object.keys(this.liveData || {})[0] || 'CRUDEOIL';
          }
        }
      }

      // If search bar is focused, blur it and prevent typing '+' or '-' into the search box
      if (document.activeElement && document.activeElement.tagName.toLowerCase() === 'input') {
        document.activeElement.blur();
      }

      e.preventDefault();
      e.stopPropagation();

      if (isBuyKey) {
        this.openOrderModal('buy', targetSym);
      } else if (isSellKey) {
        this.openOrderModal('sell', targetSym);
      }
    });
  },

  // ─── Theme Engine (Dark & Light Mode) ────────────────
  initTheme() {
    const saved = localStorage.getItem('tradenova_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeUI(saved);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tradenova_theme', next);
    this.updateThemeUI(next);
    if (window.ChartEngine) ChartEngine.render();
    if (window.TVChart) TVChart.updateTheme();
    this.toast(`Switched to ${next === 'dark' ? 'Dark Terminal' : 'Light Institutional'} mode`, 'info');
  },

  updateThemeUI(theme) {
    const isDark = theme === 'dark';
    const iconFn = isDark ? Icons.sun(15) : Icons.moon(15);
    const label = isDark ? 'Light' : 'Dark';

    const loginIcon = document.getElementById('loginThemeIcon');
    const loginLabel = document.getElementById('loginThemeLabel');
    if (loginIcon) loginIcon.innerHTML = iconFn;
    if (loginLabel) loginLabel.textContent = label;

    const sideIcon = document.getElementById('sidebarThemeIcon');
    const sideLabel = document.getElementById('sidebarThemeLabel');
    if (sideIcon) sideIcon.innerHTML = iconFn;
    if (sideLabel) sideLabel.textContent = label;

    const mobThemeIcon = document.getElementById('mobileThemeIcon');
    if (mobThemeIcon) mobThemeIcon.innerHTML = iconFn;
  },

  // ─── SVG Icon Injector ───────────────────────────────
  initIcons() {
    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    setHtml('loginLogoIcon', Icons.logo(38));
    setHtml('sidebarLogo', Icons.logo(22));
    setHtml('mobileLogo', Icons.logo(20));
    setHtml('demoIcon', Icons.gamepad(15));
    setHtml('logoutIcon', Icons.logout(14));

    // Mobile Bottom Nav icons
    setHtml('mobNavIcon-mw', Icons.marketwatch(20));
    setHtml('mobNavIcon-trading', Icons.trade(20));
    setHtml('mobNavIcon-positions', Icons.positions(20));
    setHtml('mobNavIcon-orders', Icons.orders(20));
    setHtml('mobNavIcon-dash', Icons.dashboard(20));

    // Nav icons
    setHtml('navIcon-dashboard', Icons.dashboard(18));
    setHtml('navIcon-marketwatch', Icons.marketwatch(18));
    setHtml('navIcon-trading', Icons.trade(18));
    setHtml('navIcon-positions', Icons.positions(18));
    setHtml('navIcon-closed', Icons.closed(18));
    setHtml('navIcon-trades', Icons.reports(18));
    setHtml('navIcon-pending', Icons.target(18));
    setHtml('navIcon-orders', Icons.orders(18));
    setHtml('navIcon-funds', Icons.funds(18));
    setHtml('navIcon-reports', Icons.reports(18));
    setHtml('navIcon-notifications', Icons.notifications(18));
    setHtml('navIcon-clients', Icons.clients(18));
    setHtml('navIcon-whatsapp', Icons.whatsapp(18));
    setHtml('navIcon-kite', Icons.kite(18));
    setHtml('navIcon-branding', Icons.branding(18));

    // Dashboard operational KPI icons
    setHtml('statIcon-users', Icons.clients(22));
    setHtml('statIcon-activePL', Icons.activity(22));
    setHtml('statIcon-brokerage', Icons.bank(22));
    setHtml('statIcon-activeBuy', Icons.gainers(22));
    setHtml('statIcon-activeSell', Icons.losers(22));
    setHtml('liveM2MIcon', Icons.activity(14));

    // Dashboard card headers
    setHtml('titleTopGainers', `${Icons.gainers(14, 'text-green')} Top Gainers`);
    setHtml('titleTopLosers', `${Icons.losers(14, 'text-red')} Top Losers`);
    setHtml('titleMarketActivity', `${Icons.activity(14, 'text-blue')} Live Streaming Volume`);

    // Market watch segment tabs
    setHtml('tabIcon-nse', Icons.activity(13));
    setHtml('tabIcon-bse', Icons.bse(13));
    setHtml('tabIcon-mcx', Icons.bank(13));
    setHtml('tabIcon-cur', Icons.funds(13));
    setHtml('tabIcon-fno', Icons.marketwatch(13));
    setHtml('tabIcon-wl', Icons.star(13));

    // Search lenses
    setHtml('searchIcon-mw', Icons.search(16));
    setHtml('searchIcon-trade', Icons.search(16));

    // Trade buttons
    setHtml('tradeTypeBuyIcon', Icons.gainers(13));
    setHtml('tradeTypeSellIcon', Icons.losers(13));
    setHtml('btnPlaceOrderIcon', Icons.trade(14));
    setHtml('depthIcon', Icons.marketwatch(14));
    setHtml('panicSquareOffIcon', Icons.close(13));

    // Modals
    setHtml('closeFundModalBtn', Icons.close(16));
    setHtml('closeClientModalBtn', Icons.close(16));
    setHtml('closeNotifModalBtn', Icons.close(16));
    setHtml('closeWAModalBtn', Icons.close(16));
    setHtml('btnSendNotifIcon', Icons.notifications(13));

    // Client modal tabs
    setHtml('clientTabIcon-personal', Icons.clientPersonal(15));
    setHtml('clientTabIcon-rms', Icons.clientRMS(15));
    setHtml('clientTabIcon-mcx', Icons.clientMCX(15));
    setHtml('clientTabIcon-equity', Icons.clientEquity(15));
    setHtml('clientTabIcon-other', Icons.clientSecurity(15));

    // Financial module buttons & actions
    setHtml('btnExportFundsIcon', Icons.excel(14));
    setHtml('btnDepositFundsIcon', Icons.deposit(14));
    setHtml('btnWithdrawFundsIcon', Icons.withdraw(14));
    setHtml('btnExportClientsIcon', Icons.excel(14));
    setHtml('btnAddClientIcon', Icons.userPlus(14));
    setHtml('btnExportTradesIcon', Icons.excel(14));
    setHtml('btnCreatePendingIcon', Icons.plus(13));
    setHtml('chartModeTVIcon', Icons.lightning(13));
    setHtml('chartModeCanvasIcon', Icons.chartBar(13));

    // Reports
    setHtml('statIcon-rptTrades', Icons.trade(22));
    setHtml('statIcon-rptNetPL', Icons.activity(22));
    setHtml('statIcon-rptBrokerage', Icons.bank(22));
    setHtml('statIcon-rptWinRate', Icons.target(22));
    setHtml('titleWins', `${Icons.checkCircle(14, 'text-green')} Winning Trades`);
    setHtml('titleLosses', `${Icons.crossCircle(14, 'text-red')} Losing Trades`);
  },

  // ─── API & Live Server Resolution ───────────────────
  getApiBaseUrl() {
    // If inside Capacitor Native App, file protocol, or remote port, route to live VPS
    if (window.Capacitor || 
        window.location.protocol === 'file:' || 
        window.location.origin.includes('capacitor://') ||
        window.location.origin.includes('localhost') && window.location.port !== '3000') {
      return 'https://ciggymart.shop';
    }
    return '';
  },

  async api(url, opts = {}, maybeBody) {
    let options = {};
    if (typeof opts === 'string') {
      options.method = opts.toUpperCase();
      if (maybeBody !== undefined) options.body = maybeBody;
    } else if (opts && typeof opts === 'object') {
      options = { ...opts };
    }

    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const base = this.getApiBaseUrl();
    const fullUrl = (url.startsWith('http') || !base) ? url : (base + (url.startsWith('/') ? url : '/' + url));

    const fetchConfig = {
      method: options.method || 'GET',
      headers,
      credentials: 'include',
    };
    if (options.body !== undefined && options.method !== 'GET' && options.method !== 'HEAD') {
      fetchConfig.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    let res;
    try {
      res = await fetch(fullUrl, fetchConfig);
    } catch (networkErr) {
      // If relative URL failed on mobile, retry with live production server
      if (!fullUrl.startsWith('https://ciggymart.shop')) {
        try {
          const fallbackUrl = 'https://ciggymart.shop' + (url.startsWith('/') ? url : '/' + url);
          res = await fetch(fallbackUrl, fetchConfig);
        } catch (fbErr) {
          throw new Error('Unable to connect to trading engine. Please verify internet connectivity.');
        }
      } else {
        throw new Error('Unable to reach server. Please check internet connection.');
      }
    }

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText || 'Error'}`);
      }
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Invalid server response (Status ${res.status}): expected JSON`);
      }
    }

    if (!res.ok) throw new Error((data && data.error) || `Request failed with status ${res.status}`);
    return data;
  },

  // ─── 3-Slide Indian Model Splash & Onboarding Lifecycle ──
  currentSplashSlide: 0,
  splashTouchStartX: 0,
  splashTouchEndX: 0,

  initSplashScreen() {
    const splash = document.getElementById('mobileSplashScreen');
    if (!splash) return;

    this.currentSplashSlide = 0;
    this.setSplashSlide(0);

    // Bind swipe gestures for mobile touch devices
    if (!splash._hasSwipeListeners) {
      splash._hasSwipeListeners = true;
      splash.addEventListener('touchstart', (e) => {
        this.splashTouchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      splash.addEventListener('touchend', (e) => {
        this.splashTouchEndX = e.changedTouches[0].screenX;
        this.handleSplashSwipe();
      }, { passive: true });
    }
  },

  handleSplashSwipe() {
    const diff = this.splashTouchEndX - this.splashTouchStartX;
    const threshold = 45; // Minimum px to trigger slide transition
    if (diff < -threshold) {
      // Swiped Left -> Next Slide
      if (this.currentSplashSlide < 2) {
        this.setSplashSlide(this.currentSplashSlide + 1);
      }
    } else if (diff > threshold) {
      // Swiped Right -> Previous Slide
      if (this.currentSplashSlide > 0) {
        this.setSplashSlide(this.currentSplashSlide - 1);
      }
    }
  },

  setSplashSlide(idx) {
    const clamped = Math.max(0, Math.min(2, idx));
    this.currentSplashSlide = clamped;

    const track = document.getElementById('splashCarouselTrack');
    if (track) {
      track.style.transform = `translateX(-${clamped * 100}%)`;
    }

    // Update active class on slides
    for (let i = 0; i <= 2; i++) {
      const slide = document.getElementById(`splashSlide-${i}`);
      const dot = document.getElementById(`splashDot-${i}`);
      if (slide) {
        slide.classList.toggle('active', i === clamped);
      }
      if (dot) {
        dot.classList.toggle('active', i === clamped);
      }
    }

    // Update main action button text
    const label = document.getElementById('splashActionLabel');
    if (label) {
      if (clamped === 2) {
        label.textContent = 'Get Started';
      } else {
        label.textContent = clamped === 0 ? 'Explore Margin & Desk →' : 'Get Instant Access →';
      }
    }
  },

  nextSplashSlide() {
    if (this.currentSplashSlide < 2) {
      this.setSplashSlide(this.currentSplashSlide + 1);
    } else {
      // User tapped "Get Started" on the final slide
      localStorage.setItem('tradenova_onboarded', 'true');
      this.dismissSplashScreen(false);
      this.switchAuthTab('login');
      this.vibrate(50);
      const userIn = document.getElementById('loginUser');
      if (userIn) setTimeout(() => userIn.focus(), 300);
    }
  },

  dismissSplashScreen(authenticated = false) {
    const splash = document.getElementById('mobileSplashScreen');
    if (!splash) return;

    localStorage.setItem('tradenova_onboarded', 'true');
    splash.classList.add('splash-fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
      splash.classList.remove('splash-fade-out');
    }, 450);
  },

  previewSplashScreen() {
    const splash = document.getElementById('mobileSplashScreen');
    if (!splash) return;
    this.toggleMobileProfileSheet(false);
    splash.classList.remove('splash-fade-out');
    splash.style.display = 'flex';
    this.initSplashScreen();
    this.toast('Previewing 3-Slide Indian Model Onboarding', 'info');
  },

  togglePasswordVisibility(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btn) {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
      }
    } else {
      input.type = 'password';
      if (btn) {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      }
    }
  },

  openWhatsAppDesk(topic = 'General Support') {
    const phone = '919876543210';
    const text = encodeURIComponent(`Hello TradeNova Desk, I need assistance with ${topic} on the TradeNova SN Portal.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  },

  toggleMobileProfileSheet(forceState) {
    const overlay = document.getElementById('mobileUserSheetOverlay');
    if (!overlay) return;
    const shouldOpen = forceState !== undefined ? forceState : !overlay.classList.contains('active');
    
    if (shouldOpen) {
      if (this.user) {
        const uName = document.getElementById('sheetUserName');
        const uRole = document.getElementById('sheetUserRole');
        const uId = document.getElementById('sheetUserId');
        const uAvatar = document.getElementById('sheetAvatar');
        const uAccType = document.getElementById('sheetAccountType');
        if (uName) uName.textContent = this.user.name || this.user.username;
        if (uRole) uRole.textContent = this.user.role || 'trader';
        if (uId) uId.textContent = `@${this.user.username}`;
        if (uAvatar) uAvatar.textContent = (this.user.name || this.user.username || 'A')[0].toUpperCase();
        if (uAccType) uAccType.textContent = (this.user.role === 'admin' ? 'Super Administrator' : 'Institutional Paper');
      }
      overlay.style.display = 'flex';
      requestAnimationFrame(() => overlay.classList.add('active'));
    } else {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (!overlay.classList.contains('active')) overlay.style.display = 'none';
      }, 300);
    }
  },

  // ─── Session Check ───────────────────────────────────
  async checkSession() {
    try {
      const user = await this.api('/api/me');
      this.user = user;
      this.dismissSplashScreen(true);
      this.showApp();
    } catch (e) {
      // Not logged in
      const splash = document.getElementById('mobileSplashScreen');
      const lp = document.getElementById('loginPage');
      const as = document.getElementById('appShell');
      if (as) as.classList.remove('active');
      if (lp) lp.style.display = 'flex';

      const onboarded = localStorage.getItem('tradenova_onboarded');
      if (onboarded === 'true') {
        this.dismissSplashScreen(false);
      } else {
        // Keep 3-slide Indian model onboarding active
        if (splash) {
          splash.style.display = 'flex';
          splash.classList.remove('splash-fade-out');
          this.initSplashScreen();
        }
      }
    }
  },

  // ─── Login ───────────────────────────────────────────
  bindLogin() {
    document.getElementById('loginForm')?.addEventListener('submit', e => { e.preventDefault(); this.login(); });
    document.getElementById('demoLogin')?.addEventListener('click', () => this.loginAs('demo', 'demo'));

    // Pre-fill remembered username
    const saved = localStorage.getItem('tradenova_remember_user');
    if (saved) {
      const uInput = document.getElementById('loginUsername');
      if (uInput && !uInput.value) uInput.value = saved;
    }
  },

  async login() {
    const uInput = document.getElementById('loginUsername');
    const pInput = document.getElementById('loginPassword');
    const username = (uInput?.value || '').trim();
    const password = pInput?.value || '';
    const err = document.getElementById('loginError');
    const remember = document.getElementById('rememberUserId')?.checked;
    const btn = document.getElementById('btnLoginSubmit');

    if (!username || !password) {
      if (err) {
        err.textContent = 'Please enter your username and password.';
        err.style.display = 'block';
      }
      return;
    }

    if (remember && username) {
      localStorage.setItem('tradenova_remember_user', username);
    } else if (!remember) {
      localStorage.removeItem('tradenova_remember_user');
    }

    const origBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Verifying Credentials...</span>';
    }
    if (err) err.style.display = 'none';

    try {
      const data = await this.api('/api/login', { method: 'POST', body: { username, password } });
      this.user = data.user;
      this.toast(`Welcome back, ${data.user.name || data.user.username}!`, 'success');
      this.showApp();
    } catch (e) {
      if (err) {
        err.textContent = e.message || 'Invalid username or password. Check credentials.';
        err.style.display = 'block';
        setTimeout(() => { if (err) err.style.display = 'none'; }, 5000);
      }
      this.toast(e.message || 'Login failed', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origBtnHtml;
      }
    }
  },

  async loginAs(u, p) {
    const uInput = document.getElementById('loginUsername');
    const pInput = document.getElementById('loginPassword');
    if (uInput) uInput.value = u;
    if (pInput) pInput.value = p;

    const demoBtn = document.getElementById('btnQuickDemoLogin');
    const origDemoHtml = demoBtn ? demoBtn.innerHTML : '';
    if (demoBtn) {
      demoBtn.innerHTML = '<span>⏳ Logging in as ' + u + '...</span>';
    }

    try {
      const data = await this.api('/api/login', { method: 'POST', body: { username: u, password: p } });
      this.user = data.user;
      this.toast(`Signed in as ${data.user.name}!`, 'success');
      this.showApp();
    } catch (e) {
      this.toast(e.message || 'Failed to sign in', 'error');
      const err = document.getElementById('loginError');
      if (err) {
        err.textContent = e.message;
        err.style.display = 'block';
      }
    } finally {
      if (demoBtn) {
        demoBtn.innerHTML = origDemoHtml;
      }
    }
  },

  async logout() {
    try { await this.api('/api/logout', { method: 'POST' }); } catch (e) {}
    this.user = null;
    if (this.socket) this.socket.disconnect();
    this.toggleMobileProfileSheet(false);
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('appShell').classList.remove('active');
    this.switchAuthTab('login');
  },

  // ─── Registration & WhatsApp OTP Flow ────────────────
  switchAuthTab(tab) {
    const tabLogin = document.getElementById('tabBtnLogin');
    const tabReg = document.getElementById('tabBtnRegister');
    const formLogin = document.getElementById('loginForm');
    const formReg = document.getElementById('registerForm');
    const otpView = document.getElementById('registerOtpView');
    const footer = document.getElementById('loginFooter');

    if (tab === 'register') {
      tabReg?.classList.add('active');
      tabLogin?.classList.remove('active');
      if (formLogin) formLogin.style.display = 'none';
      if (formReg) formReg.style.display = 'block';
      if (otpView) otpView.style.display = 'none';
      if (footer) footer.style.display = 'none';
    } else {
      tabLogin?.classList.add('active');
      tabReg?.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formReg) formReg.style.display = 'none';
      if (otpView) otpView.style.display = 'none';
      if (footer) footer.style.display = 'block';
    }
  },

  async submitRegisterDetails(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const city = document.getElementById('regCity').value.trim();
    const password = document.getElementById('regPassword').value;
    const btn = document.getElementById('btnSendOtp');
    const err = document.getElementById('registerError');

    if (err) err.style.display = 'none';

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      if (err) {
        err.textContent = 'Please enter a valid 10-digit WhatsApp mobile number.';
        err.style.display = 'block';
      }
      return;
    }

    const origBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ Sending WhatsApp OTP...</span>';
    }

    try {
      const res = await this.api('/api/register/send-otp', {
        method: 'POST',
        body: { name, phone: cleanPhone, username, city, password }
      });

      this.pendingRegistrationPhone = cleanPhone;
      document.getElementById('registerForm').style.display = 'none';
      document.getElementById('registerOtpView').style.display = 'block';
      document.getElementById('otpTargetPhone').textContent = `+91 ${cleanPhone.slice(-10)}`;

      const devBanner = document.getElementById('devOtpBanner');
      if (devBanner) {
        if (res.devOtp) {
          devBanner.innerHTML = `🔑 <b>Simulated Mode:</b> Your test OTP is <b>${res.devOtp}</b>`;
          devBanner.style.display = 'block';
          const otpInput = document.getElementById('regOtpInput');
          if (otpInput && !otpInput.value) otpInput.value = res.devOtp;
        } else {
          devBanner.style.display = 'none';
        }
      }

      this.startOtpCountdown(60);
      this.toast(res.message, 'success');
      document.getElementById('regOtpInput')?.focus();
    } catch (e) {
      if (err) {
        err.textContent = e.message;
        err.style.display = 'block';
      }
      this.toast(e.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origBtnHtml;
      }
    }
  },

  async submitVerifyOtp(e) {
    e.preventDefault();
    const otp = document.getElementById('regOtpInput').value.trim();
    const btn = document.getElementById('btnVerifyOtpSubmit');
    const err = document.getElementById('otpError');

    if (err) err.style.display = 'none';

    if (!otp || otp.length !== 6) {
      if (err) {
        err.textContent = 'Please enter the 6-digit verification code.';
        err.style.display = 'block';
      }
      return;
    }

    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ Verifying Code...</span>';
    }

    try {
      const res = await this.api('/api/register/verify-otp', {
        method: 'POST',
        body: { phone: this.pendingRegistrationPhone, otp }
      });

      if (this.otpTimer) clearInterval(this.otpTimer);
      this.toast(res.message, 'success');
      this.user = res.user;
      this.showApp();
    } catch (e) {
      if (err) {
        err.textContent = e.message;
        err.style.display = 'block';
      }
      this.toast(e.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  },

  async resendRegisterOtp() {
    const btn = document.getElementById('btnResendOtp');
    if (this.otpCountdownSecs > 0) {
      this.toast(`Please wait ${this.otpCountdownSecs}s before requesting a new code`, 'info');
      return;
    }

    try {
      const res = await this.api('/api/register/resend-otp', {
        method: 'POST',
        body: { phone: this.pendingRegistrationPhone }
      });

      const devBanner = document.getElementById('devOtpBanner');
      if (devBanner && res.devOtp) {
        devBanner.innerHTML = `🔑 <b>Simulated Mode:</b> Your new test OTP is <b>${res.devOtp}</b>`;
        devBanner.style.display = 'block';
        const otpInput = document.getElementById('regOtpInput');
        if (otpInput) otpInput.value = res.devOtp;
      }

      this.startOtpCountdown(60);
      this.toast(res.message, 'success');
    } catch (e) {
      this.toast(e.message, 'error');
    }
  },

  backToRegisterForm() {
    if (this.otpTimer) clearInterval(this.otpTimer);
    document.getElementById('registerOtpView').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  },

  startOtpCountdown(seconds = 60) {
    if (this.otpTimer) clearInterval(this.otpTimer);
    this.otpCountdownSecs = seconds;
    const timerEl = document.getElementById('resendTimer');
    const btn = document.getElementById('btnResendOtp');

    const updateUI = () => {
      if (timerEl) timerEl.textContent = this.otpCountdownSecs;
      if (btn) {
        if (this.otpCountdownSecs > 0) {
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
        } else {
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      }
    };

    updateUI();
    this.otpTimer = setInterval(() => {
      this.otpCountdownSecs--;
      updateUI();
      if (this.otpCountdownSecs <= 0) {
        clearInterval(this.otpTimer);
      }
    }, 1000);
  },

  // ─── Show App ────────────────────────────────────────
  showApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('appShell').classList.add('active');
    this.setupSidebar();
    this.connectSocket();
    this.fetchKiteStatus();
    this.fetchIndianApiStatus();

    // Check if user came via a direct redirect URL (e.g. /#branding or #branding)
    const targetHash = (window.location.hash || '').replace('#', '').toLowerCase();
    if (['branding', 'settings', 'logo'].includes(targetHash) && ['admin', 'broker'].includes(this.user?.role)) {
      this.nav('branding');
    } else if (targetHash && document.getElementById('page-' + targetHash)) {
      this.nav(targetHash);
    } else {
      this.nav('dashboard');
    }
  },

  // ─── Socket.IO ───────────────────────────────────────
  connectSocket() {
    const socketUrl = this.getApiBaseUrl() || undefined;
    this.socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    this.socket.on('connect', () => {
      document.getElementById('connDot').className = 'conn-dot connected';
      document.getElementById('connText').textContent = 'Live Active';
    });

    this.socket.on('disconnect', () => {
      document.getElementById('connDot').className = 'conn-dot disconnected';
      document.getElementById('connText').textContent = 'Disconnected';
    });

    this.socket.on('marketData', data => {
      this.liveData = data;
      this.renderTicker();
      if (this.page === 'marketwatch') this.renderMarketWatch();
      if (this.page === 'dashboard') this.renderDashboard();
      if (this.page === 'trading') {
        this.renderTrading();
        if (this.selectedSymbol && ChartEngine && !ChartEngine.candles.length) {
          ChartEngine.loadSymbol(this.selectedSymbol);
          this.loadDepth(this.selectedSymbol);
        }
      }
    });

    this.socket.on('priceUpdate', updates => {
      Object.entries(updates).forEach(([sym, d]) => {
        if (this.liveData[sym]) Object.assign(this.liveData[sym], d);
      });
      if (this.page === 'marketwatch') this.updateMWPrices(updates);
      if (this.page === 'dashboard') this.renderDashboard();
      if (this.page === 'positions') this.loadPositions();
      if (this.page === 'trading') {
        this.updateTradePrice();
        this.updateTTScriptPrices(updates);
        if (this.selectedSymbol && updates[this.selectedSymbol] && ChartEngine) {
          ChartEngine.updateTick(updates[this.selectedSymbol].ltp);
        }
      }
      this.updateTicker(updates);
    });

    this.socket.on('orderExecuted', data => {
      this.toast(data.message, 'success');
      if (window.SoundEngine) SoundEngine.playSuccess();
      if (this.page === 'orders') this.loadOrders();
      if (this.page === 'positions') this.loadPositions();
      if (this.page === 'pending-orders') this.loadPendingOrders();
      if (this.page === 'trades') this.loadTradesRegister();
    });

    this.socket.on('notification', n => {
      this.toast(`${n.title}: ${n.message}`, 'info');
      if (window.SoundEngine) SoundEngine.playAlert();
    });

    this.socket.on('whatsapp:status', data => {
      this.handleWAStatus(data);
    });

    this.socket.on('whatsapp:log', log => {
      this.appendWALog(log);
    });

    this.socket.on('kite:status', data => {
      this.handleKiteStatus(data);
    });

    this.socket.on('indianApi:status', data => {
      this.handleIndianApiStatus(data);
    });

    this.socket.on('branding:updated', data => {
      this.applyBranding(data);
    });
  },

  // ─── Sidebar ─────────────────────────────────────────
  setupSidebar() {
    document.getElementById('sidebarUserName').textContent = this.user.name;
    const mobAvatar = document.getElementById('mobileAvatar');
    const mobRole = document.getElementById('mobileRoleBadge');
    if (mobAvatar) mobAvatar.textContent = this.user.name.charAt(0).toUpperCase();
    if (mobRole) mobRole.textContent = (this.user.role || 'client').toUpperCase();

    document.querySelectorAll('.nav-admin-only').forEach(el => {
      el.style.display = ['admin', 'broker'].includes(this.user.role) ? 'flex' : 'none';
    });
    if (['admin', 'broker'].includes(this.user.role)) {
      this.fetchWAStatus();
    }
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const p = item.dataset.page;
        if (p) this.nav(p);
      });
    });
    document.getElementById('btnLogout').addEventListener('click', () => this.logout());
  },

  toggleMobileSidebar() {
    const sb = document.querySelector('.sidebar');
    const bd = document.getElementById('sidebarBackdrop');
    if (!sb) return;
    const isOpen = sb.classList.toggle('mobile-open');
    if (bd) bd.classList.toggle('active', isOpen);
  },

  closeMobileSidebar() {
    const sb = document.querySelector('.sidebar');
    const bd = document.getElementById('sidebarBackdrop');
    if (sb) sb.classList.remove('mobile-open');
    if (bd) bd.classList.remove('active');
  },

  // ─── Navigation ──────────────────────────────────────
  nav(page) {
    this.page = page;
    this.closeMobileSidebar();
    if (window.location.hash !== '#' + page) {
      try { history.replaceState(null, '', '#' + page); } catch (e) {}
    }
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.mob-nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    document.getElementById('page-' + page)?.classList.add('active');
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
    this.renderPage(page);

    if (page === 'trading') {
      setTimeout(() => {
        if (window.TVChart && TVChart.activeEngine === 'tv') {
          TVChart.render();
        } else if (window.ChartEngine) {
          ChartEngine.resize();
          if (this.selectedSymbol) {
            ChartEngine.loadSymbol(this.selectedSymbol);
            this.loadDepth(this.selectedSymbol);
          }
        }
      }, 50);
    }
  },

  renderPage(p) {
    const handlers = {
      dashboard: () => this.renderDashboard(),
      marketwatch: () => this.renderMarketWatch(),
      trading: () => this.renderTrading(),
      positions: () => this.loadPositions(),
      closed: () => this.loadClosed(),
      trades: () => this.loadTradesRegister(),
      'pending-orders': () => this.loadPendingOrders(),
      orders: () => this.loadOrders(),
      funds: () => this.loadFunds(),
      clients: () => this.loadClients(),
      notifications: () => this.loadNotifications(),
      reports: () => this.loadReports(),
      whatsapp: () => this.renderWhatsAppPage(),
      branding: () => this.renderBrandingPage(),
    };
    handlers[p]?.();
  },

  // ─── Ticker Strip ───────────────────────────────────
  renderTicker() {
    const indices = [
      { sym: 'NIFTY 50', val: 22534.60, chg: 127.45 },
      { sym: 'SENSEX', val: 74234.80, chg: 412.30 },
      { sym: 'BANK NIFTY', val: 48123.40, chg: -89.60 },
      { sym: 'NIFTY IT', val: 33456.70, chg: 234.50 },
      { sym: 'INDIA VIX', val: 13.45, chg: -0.34 },
      { sym: 'GOLD', val: this.liveData['GOLD']?.ltp || 62345, chg: this.liveData['GOLD']?.change || 0 },
      { sym: 'CRUDEOIL', val: this.liveData['CRUDEOIL']?.ltp || 6534, chg: this.liveData['CRUDEOIL']?.change || 0 },
      { sym: 'USDINR', val: this.liveData['USDINR']?.ltp || 83.52, chg: this.liveData['USDINR']?.change || 0 },
    ];
    let html = '';
    for (let r = 0; r < 3; r++) {
      indices.forEach(i => {
        const up = i.chg >= 0;
        const arrow = up ? Icons.gainers(10, 'text-green') : Icons.losers(10, 'text-red');
        html += `<div class="ticker-item"><span class="t-sym">${i.sym}</span><span class="t-val">${i.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><span class="t-chg ${up ? 'up' : 'down'}">${arrow} ${Math.abs(i.chg).toFixed(2)}</span></div>`;
      });
    }
    document.getElementById('tickerContent').innerHTML = html;
  },

  updateTicker(updates) {},

  // ═══════════════════════════════════════════════════════
  // DASHBOARD (Exact clone of admin.theindicator.in)
  // ═══════════════════════════════════════════════════════
  async renderDashboard() {
    try {
      const d = await this.api('/api/dashboard');

      // Top 5 Operational KPIs
      document.getElementById('dashActiveUsers').textContent = d.activeUsersCount || 0;
      const plEl = document.getElementById('dashTotalPL');
      plEl.textContent = this.inr(d.closedPL);
      plEl.className = 'stat-value text-mono ' + (d.closedPL >= 0 ? 'text-green' : 'text-red');
      document.getElementById('dashBrokerage').textContent = this.inr(d.totalBrokerage);
      document.getElementById('dashActiveBuy').textContent = d.activeBuyCount || 0;
      document.getElementById('dashActiveSell').textContent = d.activeSellCount || 0;

      // Live M2M Table (All Clients)
      if (d.liveM2M) {
        document.getElementById('liveM2MBody').innerHTML = d.liveM2M.map(u => {
          const m2mUp = u.m2m >= 0;
          return `<tr>
            <td class="text fw-700">
              ${u.name} <span class="text-muted" style="font-size:11px;font-weight:normal">(${u.username})</span>
            </td>
            <td class="text-right">${this.inr(u.ledgerBalance)}</td>
            <td class="text-right ${m2mUp ? 'green' : 'red'} fw-700">${this.inr(u.m2m)}</td>
            <td class="text-right ${m2mUp ? 'green' : 'red'} fw-700">${this.inr(u.activePL)}</td>
            <td class="text-right fw-600">${u.activeTrades}</td>
            <td class="text-right text-yellow">${this.inr(u.marginUsed)}</td>
            <td style="text-align:center"><span class="client-status ${u.status}">${u.status}</span></td>
          </tr>`;
        }).join('');
      }

      // Turnover Section (MCX vs Equity)
      if (d.turnover) {
        document.getElementById('mcxBuyTurnover').textContent = this.inr(d.turnover.mcx.buy);
        document.getElementById('mcxSellTurnover').textContent = this.inr(d.turnover.mcx.sell);
        document.getElementById('mcxTotalTurnover').textContent = this.inr(d.turnover.mcx.total);

        document.getElementById('eqBuyTurnover').textContent = this.inr(d.turnover.equity.buy);
        document.getElementById('eqSellTurnover').textContent = this.inr(d.turnover.equity.sell);
        document.getElementById('eqTotalTurnover').textContent = this.inr(d.turnover.equity.total);
      }

      // Weekly Earnings Summary
      if (d.weeklyEarnings) {
        document.getElementById('thisWeekGross').textContent = this.inr(d.weeklyEarnings.thisWeek.gross);
        document.getElementById('thisWeekBrok').textContent = this.inr(d.weeklyEarnings.thisWeek.brokerage);
        document.getElementById('thisWeekNet').textContent = this.inr(d.weeklyEarnings.thisWeek.net);

        document.getElementById('lastWeekGross').textContent = this.inr(d.weeklyEarnings.lastWeek.gross);
        document.getElementById('lastWeekBrok').textContent = this.inr(d.weeklyEarnings.lastWeek.brokerage);
        document.getElementById('lastWeekNet').textContent = this.inr(d.weeklyEarnings.lastWeek.net);
      }
    } catch (e) {}

    this.renderTopMovers();
    this.renderMiniChart();
  },

  renderTopMovers() {
    const sorted = Object.values(this.liveData).sort((a, b) => b.changePct - a.changePct);
    const gainers = sorted.slice(0, 5);
    const losers = sorted.slice(-5).reverse();

    document.getElementById('topGainers').innerHTML = gainers.map(s =>
      `<div class="top-mover"><div><div class="m-sym">${s.symbol}</div><div class="m-name">${s.name}</div></div><div class="text-right"><div class="m-price">${s.ltp.toFixed(2)}</div><div class="m-chg text-green">${Icons.gainers(11, 'text-green')} ${s.changePct.toFixed(2)}%</div></div></div>`
    ).join('');

    document.getElementById('topLosers').innerHTML = losers.map(s =>
      `<div class="top-mover"><div><div class="m-sym">${s.symbol}</div><div class="m-name">${s.name}</div></div><div class="text-right"><div class="m-price">${s.ltp.toFixed(2)}</div><div class="m-chg text-red">${Icons.losers(11, 'text-red')} ${Math.abs(s.changePct).toFixed(2)}%</div></div></div>`
    ).join('');
  },

  renderMiniChart() {
    document.getElementById('miniChartBars').innerHTML = Array.from({ length: 24 }, () =>
      `<div class="bar" style="height:${8 + Math.random() * 36}px"></div>`
    ).join('');
  },

  // ═══════════════════════════════════════════════════════
  // MARKET WATCH
  // ═══════════════════════════════════════════════════════
  selectMWSymbol(sym) {
    this.selectedSymbol = sym;
    document.querySelectorAll('#mwBody tr').forEach(r => r.classList.remove('active-script-row'));
    document.getElementById(`mw-${sym}`)?.classList.add('active-script-row');
  },

  renderMarketWatch() {
    const data = this.getSegmentData();
    if ((!this.selectedSymbol || !data.some(d => d.symbol === this.selectedSymbol)) && data.length) {
      this.selectedSymbol = data[0].symbol;
    }
    document.getElementById('mwBody').innerHTML = data.map(d => {
      const up = d.change >= 0;
      const inWL = this.watchlist.includes(d.symbol);
      const isSelected = d.symbol === this.selectedSymbol;
      const exLower = (d.exchange || 'mcx').toLowerCase();
      return `<tr id="mw-${d.symbol}" class="mw-row ${isSelected ? 'active-script-row' : ''}" onclick="App.selectMWSymbol('${d.symbol}')" ondblclick="App.openOrderModal('buy', '${d.symbol}')" style="cursor: pointer;" title="Double click or press + to Buy, - to Sell">
        <td class="text fw-700">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>${d.symbol}</span>
            <span class="segment-badge ${exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo')))}">${d.exchange}</span>
          </div>
        </td>
        <td class="text" style="color:var(--text-secondary);font-size:12px">${d.name}</td>
        <td class="text-right text-green font-mono" id="bid-${d.symbol}">₹${d.bid ? d.bid.toFixed(2) : d.ltp.toFixed(2)}</td>
        <td class="text-right text-red font-mono" id="ask-${d.symbol}">₹${d.ask ? d.ask.toFixed(2) : d.ltp.toFixed(2)}</td>
        <td class="text-right fw-700 font-mono" id="ltp-${d.symbol}">₹${d.ltp.toFixed(2)}</td>
        <td class="text-right font-mono ${up ? 'text-green' : 'text-red'}" id="chg-${d.symbol}">${up ? '+' : ''}${d.change.toFixed(2)}</td>
        <td class="text-right font-mono ${up ? 'text-green' : 'text-red'}" id="chgp-${d.symbol}">${up ? '+' : ''}${d.changePct.toFixed(2)}%</td>
        <td class="text-right font-mono">₹${(d.high || d.ltp).toFixed(2)}</td>
        <td class="text-right font-mono">₹${(d.low || d.ltp).toFixed(2)}</td>
        <td>
          <div class="row-actions">
            <button type="button" class="btn-buy-sm" onclick="event.stopPropagation(); App.openOrderModal('buy', '${d.symbol}')" title="Buy ${d.symbol} (Press +)">+ BUY</button>
            <button type="button" class="btn-sell-sm" onclick="event.stopPropagation(); App.openOrderModal('sell', '${d.symbol}')" title="Sell ${d.symbol} (Press -)">- SELL</button>
            <button type="button" class="btn-xs btn-ghost" onclick="event.stopPropagation(); App.toggleWL('${d.symbol}')" title="Toggle Watchlist">
              ${Icons.star(13, inWL ? 'text-yellow' : '', inWL)}
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  getSegmentData() {
    const seg = this.segment;
    let data = Object.values(this.liveData);
    if (seg === 'NSE') data = data.filter(d => d.exchange === 'NSE');
    else if (seg === 'BSE') data = data.filter(d => d.exchange === 'BSE');
    else if (seg === 'MCX') data = data.filter(d => d.exchange === 'MCX');
    else if (seg === 'CURRENCY') data = data.filter(d => d.exchange === 'CDS');
    else if (seg === 'FNO') data = data.filter(d => ['NFO', 'BSE-FO'].includes(d.exchange));
    else if (seg === 'WATCHLIST') data = data.filter(d => this.watchlist.includes(d.symbol));
    return data;
  },

  switchSeg(seg) {
    this.segment = seg;
    document.querySelectorAll('#mwTabs .segment-tab').forEach(t => t.classList.toggle('active', t.dataset.seg === seg));
    this.renderMarketWatch();
  },

  filterMW(q) {
    q = q.toLowerCase();
    document.querySelectorAll('#mwBody tr').forEach(r => {
      const s = r.children[0]?.textContent.toLowerCase() || '';
      const n = r.children[1]?.textContent.toLowerCase() || '';
      r.style.display = (s.includes(q) || n.includes(q)) ? '' : 'none';
    });
  },

  updateMWPrices(updates) {
    Object.entries(updates).forEach(([sym, d]) => {
      const el = document.getElementById('ltp-' + sym);
      if (!el) return;
      const prev = parseFloat(el.textContent);
      el.textContent = d.ltp.toFixed(2);
      if (d.ltp > prev) { el.classList.remove('price-down'); el.classList.add('price-up'); }
      else if (d.ltp < prev) { el.classList.remove('price-up'); el.classList.add('price-down'); }
      const chgEl = document.getElementById('chg-' + sym);
      const chgpEl = document.getElementById('chgp-' + sym);
      if (chgEl) { chgEl.textContent = (d.change >= 0 ? '+' : '') + d.change.toFixed(2); chgEl.className = 'text-right ' + (d.change >= 0 ? 'green' : 'red'); }
      if (chgpEl) { chgpEl.textContent = (d.changePct >= 0 ? '+' : '') + d.changePct.toFixed(2) + '%'; chgpEl.className = 'text-right ' + (d.changePct >= 0 ? 'green' : 'red'); }
    });
  },

  toggleWL(sym) {
    const idx = this.watchlist.indexOf(sym);
    if (idx > -1) { this.watchlist.splice(idx, 1); this.toast(`${sym} removed from watchlist`, 'info'); }
    else { this.watchlist.push(sym); this.toast(`${sym} added to watchlist`, 'success'); }
    localStorage.setItem('tn_watchlist', JSON.stringify(this.watchlist));
    if (this.page === 'marketwatch') this.renderMarketWatch();
  },

  // ═══════════════════════════════════════════════════════
  // TRADING TERMINAL & LIVE CHARTING (TRADINGVIEW PRO)
  // ═══════════════════════════════════════════════════════
  renderTrading() {
    if (!this.selectedSymbol) this.selectedSymbol = 'GOLDM';
    this.updateTradePrice();

    // Render Watchlist with Segment Filtering
    this.renderTradeWatchlist();

    // Initialize or switch TradingView Chart
    if (window.TVChart) {
      window.TVChart.switchSymbol(this.selectedSymbol);
    } else if (typeof TVChart !== 'undefined') {
      TVChart.switchSymbol(this.selectedSymbol);
    }

    if (window.ChartEngine) {
      ChartEngine.resize();
      ChartEngine.loadSymbol(this.selectedSymbol);
    }

    this.loadDepth(this.selectedSymbol);
    this.updateTerminalPosition();
  },

  renderTradeWatchlist() {
    const q = (document.getElementById('tradeWatchSearch')?.value || '').toLowerCase().trim();
    const seg = this.tradeSegment || 'ALL';

    const all = Object.values(this.liveData);
    const filtered = all.filter(d => {
      if (seg === 'MCX' && d.exchange !== 'MCX') return false;
      if (seg === 'NSE' && d.exchange !== 'NSE') return false;
      if (seg === 'BSE' && d.exchange !== 'BSE') return false;
      if (seg === 'FNO' && d.exchange !== 'NFO' && d.exchange !== 'BSE-FO') return false;
      if (seg === 'CDS' && d.exchange !== 'CDS') return false;
      if (q && !d.symbol.toLowerCase().includes(q) && !d.name.toLowerCase().includes(q)) return false;
      return true;
    });

    const countEl = document.getElementById('ttScriptCount');
    if (countEl) countEl.textContent = filtered.length;

    const tbody = document.getElementById('tradeWatchBody');
    if (!tbody) return;

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 40px; color: var(--text-muted);">No instruments found matching "${q}" in ${seg}</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.slice(0, 100).map(d => {
      const up = d.change >= 0;
      const sel = d.symbol === this.selectedSymbol;
      const bidVal = (d.bid !== undefined ? d.bid : (d.ltp ? d.ltp * 0.9998 : 0)).toFixed(2);
      const askVal = (d.ask !== undefined ? d.ask : (d.ltp ? d.ltp * 1.0002 : 0)).toFixed(2);
      const ltpVal = d.ltp.toFixed(2);
      const chgVal = (up ? '+' : '') + d.change.toFixed(2);
      const chgPctVal = (up ? '+' : '') + d.changePct.toFixed(2) + '%';
      const highVal = (d.high || d.ltp).toFixed(2);
      const lowVal = (d.low || d.ltp).toFixed(2);
      const exLower = d.exchange.toLowerCase();

      return `<tr class="trade-script-row ${sel ? 'active-script-row' : ''}" onclick="App.selectSym('${d.symbol}')" id="tt-row-${d.symbol}" title="Click to view chart">
        <td class="ts-script-col">
          <div class="ts-sym-head">
            <span class="ts-sym-title">${d.symbol}</span>
            <span class="segment-badge ${exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo')))}">${d.exchange}</span>
          </div>
          <div class="ts-sym-sub">${d.name} · Lot:${d.lotSize || 1}</div>
        </td>
        <td class="text-right ts-bid-col text-green font-mono" id="tt-bid-${d.symbol}">₹${bidVal}</td>
        <td class="text-right ts-ask-col text-red font-mono" id="tt-ask-${d.symbol}">₹${askVal}</td>
        <td class="text-right ts-ltp-col font-mono fw-700" id="tt-ltp-${d.symbol}">₹${ltpVal}</td>
        <td class="text-right ts-chg-col font-mono ${up ? 'text-green' : 'text-red'}" id="tt-chg-${d.symbol}">
          <div>${chgVal}</div>
          <div class="ts-chg-pct">(${chgPctVal})</div>
        </td>
        <td class="text-right ts-high-col font-mono" id="tt-high-${d.symbol}">₹${highVal}</td>
        <td class="text-right ts-low-col font-mono" id="tt-low-${d.symbol}">₹${lowVal}</td>
        <td class="text-center ts-action-col">
          <div class="ts-row-btn-group">
            <button type="button" class="btn-script-buy" onclick="event.stopPropagation(); App.quickBuyRow('${d.symbol}')" title="Buy ${d.symbol}">BUY</button>
            <button type="button" class="btn-script-sell" onclick="event.stopPropagation(); App.quickSellRow('${d.symbol}')" title="Sell ${d.symbol}">SELL</button>
            <button type="button" class="btn-script-chart" onclick="event.stopPropagation(); App.selectSym('${d.symbol}')" title="View Chart">📈</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  updateTTScriptPrices(updates) {
    if (this.page !== 'trading') return;
    Object.entries(updates).forEach(([sym, d]) => {
      const row = document.getElementById(`tt-row-${sym}`);
      if (!row) return;

      const bidEl = document.getElementById(`tt-bid-${sym}`);
      const askEl = document.getElementById(`tt-ask-${sym}`);
      const ltpEl = document.getElementById(`tt-ltp-${sym}`);
      const chgEl = document.getElementById(`tt-chg-${sym}`);
      const highEl = document.getElementById(`tt-high-${sym}`);
      const lowEl = document.getElementById(`tt-low-${sym}`);

      const up = d.change >= 0;
      const bidVal = (d.bid !== undefined ? d.bid : (d.ltp ? d.ltp * 0.9998 : 0)).toFixed(2);
      const askVal = (d.ask !== undefined ? d.ask : (d.ltp ? d.ltp * 1.0002 : 0)).toFixed(2);

      if (bidEl) bidEl.textContent = `₹${bidVal}`;
      if (askEl) askEl.textContent = `₹${askVal}`;
      if (ltpEl) {
        ltpEl.textContent = `₹${d.ltp.toFixed(2)}`;
        ltpEl.classList.remove('flash-green', 'flash-red');
        void ltpEl.offsetWidth;
        ltpEl.classList.add(up ? 'flash-green' : 'flash-red');
      }
      if (chgEl) {
        chgEl.className = `text-right ts-chg-col font-mono ${up ? 'text-green' : 'text-red'}`;
        chgEl.innerHTML = `<div>${up ? '+' : ''}${d.change.toFixed(2)}</div><div class="ts-chg-pct">(${up ? '+' : ''}${d.changePct.toFixed(2)}%)</div>`;
      }
      if (highEl && d.high) highEl.textContent = `₹${d.high.toFixed(2)}`;
      if (lowEl && d.low) lowEl.textContent = `₹${d.low.toFixed(2)}`;
    });
  },

  filterTradeSegment(seg, btn) {
    this.tradeSegment = seg;
    document.querySelectorAll('.watch-seg-tab, .tt-wl-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.renderTradeWatchlist();
  },

  filterTradeWatch(q) {
    this.renderTradeWatchlist();
  },

  async loadClientsForOrder() {
    if (this.clientsList && this.clientsList.length) return this.clientsList;
    try {
      this.clientsList = await this.api('/api/clients');
      return this.clientsList;
    } catch (e) {
      console.warn('Could not load clients list:', e.message);
      return [];
    }
  },

  async populateOrderClientSelect(preselectId = null) {
    const sel = document.getElementById('orderClientSelect');
    const clients = await this.loadClientsForOrder();
    const activeClients = (clients || []).filter(c => c.status !== 'disabled');
    if (sel) {
      sel.innerHTML = '<option value="">Please Select a client</option>' + activeClients.map(c => {
        const isSel = preselectId && (String(preselectId) === String(c.id) || String(preselectId) === String(c.username));
        return `<option value="${c.id}" ${isSel ? 'selected' : ''}>${c.name} (${c.username}) — Funds: ${this.inr(c.funds || 0)}</option>`;
      }).join('');
    }

    if (preselectId) {
      const c = activeClients.find(x => String(x.id) === String(preselectId) || x.username === preselectId);
      this.updateClientTriggerDisplay(c);
      if (sel) sel.value = c ? c.id : '';
    } else {
      this.updateClientTriggerDisplay(null);
      if (sel) sel.value = '';
    }

    this.onOrderClientChanged();
  },

  onOrderClientChanged() {
    const sel = document.getElementById('orderClientSelect');
    const badge = document.getElementById('omClientFundsInfo');
    const roleBadge = document.getElementById('omClientRoleBadge');
    if (!sel || !badge) return;
    const clientId = sel.value;
    if (!clientId) {
      badge.style.display = 'none';
      if (roleBadge) roleBadge.style.display = 'none';
      this.selectedOrderClient = null;
      this.updateClientTriggerDisplay(null);
      this.updateOrderSum();
      return;
    }

    const c = this.clientsList?.find(x => String(x.id) === String(clientId) || x.username === clientId);
    if (!c) {
      badge.style.display = 'none';
      if (roleBadge) roleBadge.style.display = 'none';
      this.updateClientTriggerDisplay(null);
      return;
    }

    this.selectedOrderClient = c;
    this.updateClientTriggerDisplay(c);

    badge.style.display = 'flex';
    badge.innerHTML = `
      <span style="display:inline-flex; align-items:center; gap:5px;">${Icons.wallet(12, 'text-gold')} Funds: <b>${this.inr(c.funds || 0)}</b></span>
      <span style="display:inline-flex; align-items:center; gap:5px;">${Icons.shield(12, 'text-cyan')} Limit: <b>${this.inr(c.creditLimit || c.credits || 0)}</b></span>
    `;

    if (roleBadge) {
      roleBadge.style.display = 'inline-block';
      roleBadge.textContent = (c.role || 'client').toUpperCase();
      roleBadge.className = 'role-badge ' + (c.role || 'client');
    }

    this.updateOrderSum();
  },

  // ═══════════════════════════════════════════════════════════
  // SEARCH-SELECT CONTROLLER (INSTRUMENTS & LIVE AJAX CLIENTS)
  // ═══════════════════════════════════════════════════════════
  clientSearchTimer: null,
  highlightedClientIdx: -1,
  highlightedSymbolIdx: -1,

  // ── 1. Symbol Search-Select ──
  toggleSymbolSearchSelect(e) {
    if (e) e.stopPropagation();
    this.closeClientSearchSelect();
    const wrap = document.getElementById('symbolSearchSelectWrap');
    const dd = document.getElementById('symbolSearchDropdown');
    const inp = document.getElementById('symbolSearchInput');
    if (!wrap || !dd) return;

    const isOpen = wrap.classList.toggle('open');
    dd.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      this.renderSymbolOptions(inp ? inp.value : '');
      setTimeout(() => inp?.focus(), 50);
    }
  },

  closeSymbolSearchSelect() {
    const wrap = document.getElementById('symbolSearchSelectWrap');
    const dd = document.getElementById('symbolSearchDropdown');
    if (wrap) wrap.classList.remove('open');
    if (dd) dd.style.display = 'none';
    this.highlightedSymbolIdx = -1;
  },

  onSymbolSearchInput(q) {
    this.highlightedSymbolIdx = 0;
    this.renderSymbolOptions(q);
  },

  clearSymbolSearch(e) {
    if (e) e.stopPropagation();
    const inp = document.getElementById('symbolSearchInput');
    if (inp) inp.value = '';
    this.renderSymbolOptions('');
    inp?.focus();
  },

  renderSymbolOptions(query = '') {
    const list = document.getElementById('symbolOptionsList');
    const countEl = document.getElementById('symbolSearchCount');
    if (!list) return;

    const q = (query || '').trim().toLowerCase();
    const all = Object.values(this.liveData || {});
    const filtered = q ? all.filter(s => {
      const sym = (s.symbol || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      const ex = (s.exchange || '').toLowerCase();
      return sym.includes(q) || name.includes(q) || ex.includes(q);
    }) : all;

    if (countEl) countEl.textContent = `${filtered.length} scripts`;

    if (!filtered.length) {
      list.innerHTML = `<div class="ss-no-results"><span>No instruments found matching "${query}"</span></div>`;
      return;
    }

    list.innerHTML = filtered.map((s, idx) => {
      const isSelected = s.symbol === this.selectedSymbol;
      const isHigh = idx === this.highlightedSymbolIdx;
      const exLower = (s.exchange || 'mcx').toLowerCase();
      const exBadgeClass = exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo')));
      const chgClass = (s.change >= 0) ? 'text-green' : 'text-red';
      const chgSign = (s.changePct >= 0) ? '+' : '';

      return `
        <div class="ss-item ${isSelected ? 'selected' : ''} ${isHigh ? 'highlighted' : ''}" data-idx="${idx}" onclick="App.selectSymbolFromSearch('${s.symbol}')">
          <div class="ss-item-left">
            <span class="segment-badge ${exBadgeClass}" style="font-size:10px; padding:2px 5px;">${s.exchange}</span>
            <div class="ss-meta">
              <span class="ss-main-title">${s.symbol} ${isSelected ? Icons.check(13, 'ss-selected-check') : ''}</span>
              <span class="ss-sub-title">${s.name || ''}</span>
            </div>
          </div>
          <div class="ss-item-right">
            <span class="ss-funds-val" style="color:var(--text-heading)">₹${s.ltp.toFixed(2)}</span>
            <span class="${chgClass}" style="font-size:10px; font-weight:700">${chgSign}${s.changePct.toFixed(2)}%</span>
          </div>
        </div>
      `;
    }).join('');
  },

  selectSymbolFromSearch(sym) {
    this.onOrderSymbolSelect(sym);
    this.closeSymbolSearchSelect();
  },

  onSymbolSearchKeyDown(e) {
    const list = document.getElementById('symbolOptionsList');
    if (!list) return;
    const items = list.querySelectorAll('.ss-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlightedSymbolIdx = Math.min(items.length - 1, this.highlightedSymbolIdx + 1);
      this.updateItemHighlight(items, this.highlightedSymbolIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlightedSymbolIdx = Math.max(0, this.highlightedSymbolIdx - 1);
      this.updateItemHighlight(items, this.highlightedSymbolIdx);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.highlightedSymbolIdx >= 0 && items[this.highlightedSymbolIdx]) {
        items[this.highlightedSymbolIdx].click();
      }
    } else if (e.key === 'Escape') {
      this.closeSymbolSearchSelect();
    }
  },

  updateItemHighlight(items, idx) {
    items.forEach((it, i) => {
      it.classList.toggle('highlighted', i === idx);
      if (i === idx) it.scrollIntoView({ block: 'nearest' });
    });
  },

  // ── 2. Client AJAX Search-Select ──
  async toggleClientSearchSelect(e) {
    if (e) e.stopPropagation();
    this.closeSymbolSearchSelect();
    const wrap = document.getElementById('clientSearchSelectWrap');
    const dd = document.getElementById('clientSearchDropdown');
    const inp = document.getElementById('clientSearchInput');
    if (!wrap || !dd) return;

    const isOpen = wrap.classList.toggle('open');
    dd.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      if (!this.clientsList || !this.clientsList.length) {
        await this.loadClientsForOrder();
      }
      this.renderClientOptions(inp ? inp.value : '');
      setTimeout(() => inp?.focus(), 50);
    }
  },

  closeClientSearchSelect() {
    const wrap = document.getElementById('clientSearchSelectWrap');
    const dd = document.getElementById('clientSearchDropdown');
    if (wrap) wrap.classList.remove('open');
    if (dd) dd.style.display = 'none';
    this.highlightedClientIdx = -1;
  },

  onClientSearchInput(q) {
    this.highlightedClientIdx = 0;
    // 1. Instant local filter against loaded clients
    this.renderClientOptions(q);

    // 2. Real-time debounced AJAX query to server
    clearTimeout(this.clientSearchTimer);
    const statusEl = document.getElementById('clientSearchStatus');
    if (statusEl) {
      statusEl.innerHTML = `<span><span class="ss-spinner"></span> Searching traders via AJAX...</span><span class="ss-count">Live</span>`;
    }
    this.clientSearchTimer = setTimeout(async () => {
      await this.ajaxSearchClients(q);
    }, 180);
  },

  async ajaxSearchClients(q) {
    try {
      const results = await this.api(`/api/clients?q=${encodeURIComponent(q || '')}`);
      if (Array.isArray(results)) {
        if (!this.clientsList) this.clientsList = [];
        const existingIds = new Set(this.clientsList.map(x => String(x.id)));
        results.forEach(r => {
          if (!existingIds.has(String(r.id))) {
            this.clientsList.push(r);
          } else {
            const idx = this.clientsList.findIndex(x => String(x.id) === String(r.id));
            if (idx >= 0) this.clientsList[idx] = r;
          }
        });
        this.renderClientOptions(q, results);
      }
    } catch (e) {
      console.warn('AJAX client search error:', e);
      this.renderClientOptions(q);
    }
  },

  clearClientSearch(e) {
    if (e) e.stopPropagation();
    const inp = document.getElementById('clientSearchInput');
    if (inp) inp.value = '';
    this.renderClientOptions('');
    inp?.focus();
  },

  renderClientOptions(query = '', customList = null) {
    const list = document.getElementById('clientOptionsList');
    const statusEl = document.getElementById('clientSearchStatus');
    if (!list) return;

    const q = (query || '').trim().toLowerCase();
    let source = customList || this.clientsList || [];
    let filtered = source.filter(c => c.status !== 'disabled');

    if (q && !customList) {
      filtered = filtered.filter(c => {
        const name = (c.name || '').toLowerCase();
        const username = (c.username || '').toLowerCase();
        const phone = (c.phone || c.mobile || '').toLowerCase();
        const city = (c.city || '').toLowerCase();
        const id = String(c.id);
        return name.includes(q) || username.includes(q) || phone.includes(q) || city.includes(q) || id === q;
      });
    }

    if (statusEl) {
      statusEl.innerHTML = `<span>${q ? 'AJAX Search Results' : 'Registered Traders & Clients'}</span><span class="ss-count">${filtered.length} found</span>`;
    }

    if (!filtered.length) {
      list.innerHTML = `
        <div class="ss-no-results">
          <span>No traders found for "${query}"</span>
          <span style="font-size:11px; opacity:0.7">Search by client name, trader user ID, or mobile number</span>
        </div>
      `;
      return;
    }

    const currentSelId = document.getElementById('orderClientSelect')?.value;

    list.innerHTML = filtered.map((c, idx) => {
      const isSelected = currentSelId && (String(currentSelId) === String(c.id) || String(currentSelId) === String(c.username));
      const isHigh = idx === this.highlightedClientIdx;
      const initials = (c.name || c.username || 'U').charAt(0).toUpperCase();
      const phone = c.phone || c.mobile || '';

      return `
        <div class="ss-item ${isSelected ? 'selected' : ''} ${isHigh ? 'highlighted' : ''}" data-idx="${idx}" onclick="App.selectClientFromSearch('${c.id}')">
          <div class="ss-item-left">
            <span class="ss-avatar">${initials}</span>
            <div class="ss-meta">
              <span class="ss-main-title">
                ${c.name}
                <span class="role-badge ${c.role || 'client'}" style="font-size:9px; padding:1px 5px;">${c.username}</span>
                ${isSelected ? Icons.check(13, 'ss-selected-check') : ''}
              </span>
              <span class="ss-sub-title">
                ${phone ? `<span class="ss-phone-chip">${Icons.phone(12, 'ss-phone-svg')} +91 ${phone}</span>` : '<span class="ss-phone-chip">No mobile</span>'}
                ${c.city ? `<span class="ss-city-chip">${Icons.mapPin(11, 'ss-city-svg')} ${c.city}</span>` : ''}
              </span>
            </div>
          </div>
          <div class="ss-item-right">
            <span class="ss-funds-val">${this.inr(c.funds || 0)}</span>
            <span class="ss-limit-val">Limit: ${this.inr(c.creditLimit || c.credits || 0)}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  selectClientFromSearch(clientId) {
    const sel = document.getElementById('orderClientSelect');
    if (sel) sel.value = clientId;
    const c = this.clientsList?.find(x => String(x.id) === String(clientId) || x.username === clientId);
    this.updateClientTriggerDisplay(c);
    this.onOrderClientChanged();
    this.closeClientSearchSelect();
  },

  updateClientTriggerDisplay(client) {
    const disp = document.getElementById('clientSelectedDisplay');
    if (!disp) return;
    if (!client) {
      disp.innerHTML = `<span class="ss-placeholder">Please Select a client</span>`;
      return;
    }
    const initials = (client.name || client.username || 'U').charAt(0).toUpperCase();
    const phone = client.phone || client.mobile || '';
    disp.innerHTML = `
      <span class="ss-avatar" style="width:22px; height:22px; font-size:10px;">${initials}</span>
      <span style="font-weight:800; color:var(--text-heading); font-size:12.5px;">${client.name}</span>
      <span class="role-badge ${client.role || 'client'}" style="font-size:9.5px; padding:1px 5px;">${client.username}</span>
      ${phone ? `<span class="ss-trigger-phone">${Icons.phone(12, 'ss-phone-svg')} +91 ${phone}</span>` : ''}
    `;
  },

  onClientSearchKeyDown(e) {
    const list = document.getElementById('clientOptionsList');
    if (!list) return;
    const items = list.querySelectorAll('.ss-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlightedClientIdx = Math.min(items.length - 1, this.highlightedClientIdx + 1);
      this.updateItemHighlight(items, this.highlightedClientIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlightedClientIdx = Math.max(0, this.highlightedClientIdx - 1);
      this.updateItemHighlight(items, this.highlightedClientIdx);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.highlightedClientIdx >= 0 && items[this.highlightedClientIdx]) {
        items[this.highlightedClientIdx].click();
      }
    } else if (e.key === 'Escape') {
      this.closeClientSearchSelect();
    }
  },

  setOrderType(type) {
    const sel = document.getElementById('orderType');
    if (sel) sel.value = type;
    this.onOrderTypeChanged();
  },

  setOrderSide(side) {
    this.setTradeType(side);
  },

  onOrderTypeChanged() {
    const ot = document.getElementById('orderType')?.value || 'market';
    const priceInp = document.getElementById('tradePrice');
    const priceLtpLink = document.getElementById('omPriceLtpLink');
    const priceHint = document.getElementById('omPriceHint');

    document.getElementById('omTypeMarket')?.classList.toggle('active', ot === 'market');
    document.getElementById('omTypeLimit')?.classList.toggle('active', ot === 'limit');

    const sym = this.selectedSymbol;
    const d = sym && this.liveData ? this.liveData[sym] : null;

    if (ot === 'market') {
      if (priceInp && d) {
        priceInp.value = d.ltp.toFixed(2);
        priceInp.readOnly = true;
        priceInp.style.opacity = '0.75';
      }
      if (priceLtpLink) priceLtpLink.style.display = 'none';
      if (priceHint) {
        priceHint.textContent = 'Market Execution @ Live LTP';
        priceHint.style.color = '#f5be38';
      }
    } else {
      // Limit order
      if (priceInp) {
        priceInp.readOnly = false;
        priceInp.style.opacity = '1';
        if (d && (!priceInp.value || parseFloat(priceInp.value) === 0)) {
          priceInp.value = d.ltp.toFixed(2);
        }
      }
      if (priceLtpLink) priceLtpLink.style.display = 'inline';
      if (priceHint) {
        priceHint.textContent = 'Limit Order Price (₹)';
        priceHint.style.color = 'var(--text-muted)';
      }
    }

    this.updateOrderSum();
  },

  onOrderSymbolSelect(sym) {
    if (!sym) return;
    this.selectedSymbol = sym;
    const d = this.liveData ? this.liveData[sym] : null;
    const omSym = document.getElementById('omSymbol');
    const omEx = document.getElementById('omExchange');
    const omLtp = document.getElementById('omLtp');
    const omChg = document.getElementById('omChg');
    const lotHint = document.getElementById('tradeLotHint');
    const priceInp = document.getElementById('tradePrice');

    if (omSym) omSym.textContent = sym;
    if (d) {
      if (omEx) {
        omEx.textContent = d.exchange;
        const exLower = (d.exchange || 'mcx').toLowerCase();
        omEx.className = 'segment-badge ' + (exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo'))));
      }
      if (omLtp) omLtp.textContent = '₹' + d.ltp.toFixed(2);
      if (omChg) {
        omChg.textContent = `${d.changePct >= 0 ? '+' : ''}${d.changePct.toFixed(2)}%`;
        omChg.className = 'om-chg ' + (d.change >= 0 ? 'text-green' : 'text-red');
      }
      if (lotHint) lotHint.textContent = `1 Lot = ${d.lotSize || 1} units`;
      const ot = document.getElementById('orderType')?.value || 'market';
      if (priceInp && (ot === 'market' || !priceInp.value || parseFloat(priceInp.value) === 0)) {
        priceInp.value = d.ltp.toFixed(2);
      }
    }

    // Keep dropdown and trigger in sync
    const sel = document.getElementById('orderSymbolSelect');
    if (sel && sel.value !== sym) sel.value = sym;

    const trigTitle = document.getElementById('ssSelectedSymTitle');
    const trigEx = document.getElementById('ssSelectedSymEx');
    const trigLtp = document.getElementById('ssSelectedSymLtp');
    if (trigTitle) trigTitle.textContent = sym;
    if (d) {
      if (trigEx) {
        trigEx.textContent = d.exchange;
        const exLower = (d.exchange || 'mcx').toLowerCase();
        trigEx.className = 'segment-badge ' + (exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo'))));
      }
      if (trigLtp) trigLtp.textContent = '₹' + d.ltp.toFixed(2);
    }

    // Highlight row in active tables
    this.selectMWSymbol(sym);
    this.updateOrderSum();
  },

  async openOrderModal(side = 'buy', sym = null) {
    if (sym) {
      this.selectedSymbol = sym;
    } else if (!this.selectedSymbol || !this.liveData[this.selectedSymbol]) {
      const activeRow = document.querySelector('#mwBody tr.active-script-row') || document.querySelector('#mwBody tr');
      this.selectedSymbol = activeRow ? activeRow.id.replace('mw-', '') : (Object.keys(this.liveData || {})[0] || 'CRUDEOIL');
    }
    const currentSym = this.selectedSymbol;
    const d = this.liveData ? this.liveData[currentSym] : null;

    this.tradeType = side;

    const modal = document.getElementById('orderModal');
    if (!modal) return;
    modal.classList.add('active');
    modal.style.display = 'flex';

    this.closeSymbolSearchSelect();
    this.closeClientSearchSelect();

    const omHeader = document.getElementById('omHeader');
    const sideLbl = document.getElementById('omSideLabel');
    const omSym = document.getElementById('omSymbol');
    const omEx = document.getElementById('omExchange');
    const omLtp = document.getElementById('omLtp');
    const omChg = document.getElementById('omChg');
    const btnPlace = document.getElementById('btnPlaceOrder');

    this.setTradeType(side);
    if (omSym) omSym.textContent = currentSym;
    if (omEx && d) {
      omEx.textContent = d.exchange;
      const exLower = (d.exchange || 'mcx').toLowerCase();
      omEx.className = 'segment-badge ' + (exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo'))));
    }
    if (d) {
      if (omLtp) omLtp.textContent = '₹' + d.ltp.toFixed(2);
      if (omChg) {
        omChg.textContent = `${d.changePct >= 0 ? '+' : ''}${d.changePct.toFixed(2)}%`;
        omChg.className = 'om-chg ' + (d.change >= 0 ? 'text-green' : 'text-red');
      }
      const lotHint = document.getElementById('tradeLotHint');
      if (lotHint) lotHint.textContent = `1 Lot = ${d.lotSize || 1} units`;
    }

    // Sync Search-Select Trigger for Symbol
    const trigTitle = document.getElementById('ssSelectedSymTitle');
    const trigEx = document.getElementById('ssSelectedSymEx');
    const trigLtp = document.getElementById('ssSelectedSymLtp');
    if (trigTitle) trigTitle.textContent = currentSym;
    if (d) {
      if (trigEx) {
        trigEx.textContent = d.exchange;
        const exLower = (d.exchange || 'mcx').toLowerCase();
        trigEx.className = 'segment-badge ' + (exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo'))));
      }
      if (trigLtp) trigLtp.textContent = '₹' + d.ltp.toFixed(2);
    }

    // Populate Symbol Select Dropdown with all live instruments
    const symSelect = document.getElementById('orderSymbolSelect');
    if (symSelect && this.liveData) {
      const allSyms = Object.values(this.liveData);
      symSelect.innerHTML = allSyms.map(s => {
        return `<option value="${s.symbol}" ${s.symbol === currentSym ? 'selected' : ''}>${s.symbol} (${s.exchange}) — ₹${s.ltp.toFixed(2)}</option>`;
      }).join('');
      symSelect.value = currentSym;
    }

    // Setup Client Dropdown for Admin & Broker
    const clientGroup = document.getElementById('omClientGroup');
    const isAdminOrBroker = this.user && (this.user.role === 'admin' || this.user.role === 'broker');
    if (clientGroup) {
      if (isAdminOrBroker) {
        clientGroup.style.display = 'block';
        await this.populateOrderClientSelect(this.selectedOrderClient?.id);
      } else {
        clientGroup.style.display = 'none';
      }
    }

    // Setup Order Type: market vs limit
    const otSelect = document.getElementById('orderType');
    if (otSelect) {
      if (!otSelect.value) otSelect.value = 'market';
      this.onOrderTypeChanged();
    }

    // Setup Submit Button
    if (btnPlace) {
      btnPlace.className = 'om-submit-btn ' + side;
      btnPlace.textContent = side.toUpperCase();
    }

    this.updateOrderSum();

    setTimeout(() => {
      const qInput = document.getElementById('tradeQty');
      if (qInput) { qInput.focus(); qInput.select(); }
    }, 100);
  },

  closeOrderModal() {
    this.closeSymbolSearchSelect();
    this.closeClientSearchSelect();
    const modal = document.getElementById('orderModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  },

  openDepthModal() {
    const modal = document.getElementById('depthModal');
    if (!modal) return;
    modal.classList.add('active');

    const sym = this.selectedSymbol || 'GOLDM';
    const d = this.liveData ? this.liveData[sym] : null;
    const dmSym = document.getElementById('dmSymbol');
    const dmEx = document.getElementById('dmExchange');

    if (dmSym) dmSym.textContent = sym;
    if (dmEx && d) {
      dmEx.textContent = d.exchange;
      const exLower = d.exchange.toLowerCase();
      dmEx.className = 'segment-badge ' + (exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo'))));
    }

    this.loadDepth(sym);
  },

  closeDepthModal() {
    const modal = document.getElementById('depthModal');
    if (modal) modal.classList.remove('active');
  },

  quickBuyRow(sym) {
    this.selectedSymbol = sym;
    this.selectSym(sym);
    this.openOrderModal('buy', sym);
  },

  quickSellRow(sym) {
    this.selectedSymbol = sym;
    this.selectSym(sym);
    this.openOrderModal('sell', sym);
  },

  stepQty(delta) {
    const qtyInput = document.getElementById('tradeQty');
    if (!qtyInput) return;
    let val = parseInt(qtyInput.value) || 1;
    val = Math.max(1, val + delta);
    qtyInput.value = val;
    this.updateOrderSum();
  },

  fillMarketPrice() {
    if (!this.selectedSymbol) return;
    const d = this.liveData[this.selectedSymbol];
    if (!d) return;
    const pInput = document.getElementById('tradePrice');
    if (pInput) {
      pInput.value = d.ltp.toFixed(2);
      this.updateOrderSum();
      this.toast(`Filled Market LTP: ₹${d.ltp.toFixed(2)}`, 'info');
    }
  },

  focusDepth() {
    this.openDepthModal();
  },

  setChartEngine(mode) {
    if (window.TVChart) TVChart.activeEngine = mode;
    const tvWrap = document.getElementById('tvChartWrapper');
    const canvasWrap = document.getElementById('canvasChartWrapper');
    const btnTV = document.getElementById('btnModeTV');
    const btnCanvas = document.getElementById('btnModeCanvas');

    if (mode === 'tv') {
      if (tvWrap) tvWrap.style.display = 'block';
      if (canvasWrap) canvasWrap.style.display = 'none';
      btnTV?.classList.add('active');
      btnCanvas?.classList.remove('active');
      if (window.TVChart) TVChart.render();
      this.toast('TradingView Pro Chart activated', 'info');
    } else {
      if (tvWrap) tvWrap.style.display = 'none';
      if (canvasWrap) canvasWrap.style.display = 'block';
      btnTV?.classList.remove('active');
      btnCanvas?.classList.add('active');
      if (window.ChartEngine) {
        ChartEngine.resize();
        ChartEngine.loadSymbol(this.selectedSymbol);
      }
      this.toast('Canvas 60fps Chart activated', 'info');
    }
  },

  selectSym(sym) {
    this.selectedSymbol = sym;
    const d = this.liveData[sym];
    if (d) {
      const symDisp = document.getElementById('tradeSymDisplay');
      const symName = document.getElementById('tradeSymName');
      const exBadge = document.getElementById('tradeSymExchange');
      const priceInp = document.getElementById('tradePrice');
      const lotHint = document.getElementById('tradeLotHint');

      if (symDisp) symDisp.textContent = sym;
      if (symName) symName.textContent = d.name;
      if (exBadge) {
        exBadge.textContent = d.exchange;
        const exLower = d.exchange.toLowerCase();
        exBadge.className = 'segment-badge ' + (exLower.includes('mcx') ? 'mcx' : (exLower.includes('bse') ? 'bse' : (exLower.includes('nse') ? 'nse' : (exLower.includes('cds') ? 'cds' : 'nfo'))));
      }
      if (priceInp) priceInp.value = d.ltp.toFixed(2);
      if (lotHint) lotHint.textContent = `1 Lot = ${d.lotSize || 1} units`;
    }

    this.updateTradePrice();

    if (window.TVChart) {
      window.TVChart.switchSymbol(sym);
    } else if (typeof TVChart !== 'undefined') {
      TVChart.switchSymbol(sym);
    }
    if (window.ChartEngine) {
      ChartEngine.loadSymbol(sym);
    }

    this.loadDepth(sym);
    this.renderTradeWatchlist();
    this.updateTerminalPosition();
    this.setTradeType(this.tradeType || 'buy');
  },

  setTF(tf, btn) {
    document.querySelectorAll('#terminalTfBar .tf-btn, #terminalTfBar .tt-tf').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (window.TVChart) {
      window.TVChart.setInterval(tf);
    } else if (typeof TVChart !== 'undefined') {
      TVChart.setInterval(tf);
    }
    if (window.ChartEngine && this.selectedSymbol) {
      ChartEngine.loadSymbol(this.selectedSymbol);
    }
    this.toast(`Timeframe: ${tf === 'D' ? '1 Day' : (tf === '60' ? '1 Hour' : tf + 'm')}`, 'info');
  },

  initTerminalResizer() {
    const layout = document.getElementById('ttLayout');
    const resizer = document.getElementById('ttResizer');
    const sidebar = document.getElementById('ttChartSidebar');
    if (!layout || !resizer || !sidebar) return;

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = sidebar.getBoundingClientRect().width;
      document.body.classList.add('resizing-horizontal');
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = startX - e.clientX;
      const totalWidth = layout.getBoundingClientRect().width;
      let newWidth = startWidth + dx;
      const minW = 280;
      const maxW = totalWidth - 280;
      newWidth = Math.max(minW, Math.min(newWidth, maxW));

      sidebar.style.width = newWidth + 'px';
      sidebar.style.flex = `0 0 ${newWidth}px`;
      localStorage.setItem('tn_chart_sidebar_width', newWidth);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.classList.remove('resizing-horizontal');
      }
    });

    // Touch events for tablet / touchscreens
    resizer.addEventListener('touchstart', (e) => {
      if (!e.touches.length) return;
      isDragging = true;
      startX = e.touches[0].clientX;
      startWidth = sidebar.getBoundingClientRect().width;
      document.body.classList.add('resizing-horizontal');
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || !e.touches.length) return;
      const dx = startX - e.touches[0].clientX;
      const totalWidth = layout.getBoundingClientRect().width;
      let newWidth = startWidth + dx;
      newWidth = Math.max(280, Math.min(newWidth, totalWidth - 280));
      sidebar.style.width = newWidth + 'px';
      sidebar.style.flex = `0 0 ${newWidth}px`;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        document.body.classList.remove('resizing-horizontal');
      }
    });

    // Restore saved width if present
    const saved = localStorage.getItem('tn_chart_sidebar_width');
    if (saved && !isNaN(saved)) {
      const w = parseInt(saved);
      if (w >= 280 && w <= 1200) {
        sidebar.style.width = w + 'px';
        sidebar.style.flex = `0 0 ${w}px`;
      }
    }
  },

  adjustChartWidth(delta) {
    const sidebar = document.getElementById('ttChartSidebar');
    const layout = document.getElementById('ttLayout');
    if (!sidebar || !layout) return;

    if (layout.classList.contains('chart-maximized') || layout.classList.contains('chart-minimized')) {
      layout.classList.remove('chart-maximized', 'chart-minimized');
    }

    const curW = sidebar.getBoundingClientRect().width;
    const totalW = layout.getBoundingClientRect().width;
    let nextW = curW + delta;
    nextW = Math.max(280, Math.min(nextW, totalW - 280));

    sidebar.style.display = 'flex';
    sidebar.style.width = nextW + 'px';
    sidebar.style.flex = `0 0 ${nextW}px`;
    localStorage.setItem('tn_chart_sidebar_width', nextW);

    document.getElementById('btnRestoreChart')?.style.setProperty('display', 'none');
    document.getElementById('ttResizer')?.style.setProperty('display', 'flex');
    this.toast(`Chart width: ${Math.round(nextW)}px`, 'info');
  },

  setChartSize(mode) {
    const layout = document.getElementById('ttLayout');
    const sidebar = document.getElementById('ttChartSidebar');
    const resizer = document.getElementById('ttResizer');
    const btnRestore = document.getElementById('btnRestoreChart');
    const maxIcon = document.getElementById('iconChartMax');
    if (!layout || !sidebar) return;

    layout.classList.remove('chart-maximized', 'chart-minimized');

    if (mode === 'min') {
      layout.classList.add('chart-minimized');
      if (btnRestore) btnRestore.style.display = 'inline-flex';
      this.toast('Chart minimized — Full scripts layout', 'info');
    } else if (mode === 'max') {
      layout.classList.add('chart-maximized');
      if (btnRestore) btnRestore.style.display = 'none';
      if (maxIcon) {
        maxIcon.innerHTML = '<rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2.5"/><line x1="9" y1="9" x2="15" y2="15" stroke-width="2.5"/><line x1="15" y1="9" x2="9" y2="15" stroke-width="2.5"/>';
      }
      this.toast('Chart maximized to full screen view', 'info');
    } else { // 'normal'
      sidebar.style.display = 'flex';
      sidebar.style.width = '420px';
      sidebar.style.flex = '0 0 420px';
      if (resizer) resizer.style.display = 'flex';
      if (btnRestore) btnRestore.style.display = 'none';
      if (maxIcon) {
        maxIcon.innerHTML = '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>';
      }
      localStorage.setItem('tn_chart_sidebar_width', '420');
      this.toast('Chart restored to 420px', 'info');
    }
  },

  toggleChartMax() {
    const layout = document.getElementById('ttLayout');
    if (layout?.classList.contains('chart-maximized')) {
      this.setChartSize('normal');
    } else {
      this.setChartSize('max');
    }
  },

  toggleChartHeight() {
    const container = document.getElementById('ttSmallChartContainer') || document.getElementById('ttChartContainer');
    const btn = document.getElementById('btnToggleHeight');
    if (!container) return;
    const isTall = container.classList.toggle('chart-tall');
    if (btn) btn.classList.toggle('active', isTall);
    this.toast(isTall ? 'Chart height expanded' : 'Chart height compact (350px)', 'info');
  },

  focusOrderPad() {
    const qtyInput = document.getElementById('tradeQty');
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  },

  async loadDepth(sym) {
    try {
      const depth = await this.api(`/api/instrument/${sym}/depth`);
      const bidsEl = document.getElementById('depthBidsBody');
      const asksEl = document.getElementById('depthAsksBody');

      if (bidsEl && depth.bids) {
        const maxBid = Math.max(...depth.bids.map(b => b.qty), 1);
        bidsEl.innerHTML = depth.bids.map(b => {
          const pct = Math.min(100, Math.round((b.qty / maxBid) * 100));
          return `<tr onclick="App.prefillPrice(${b.price})" style="cursor:pointer; background: linear-gradient(to left, rgba(34, 197, 94, 0.16) ${pct}%, transparent ${pct}%);" title="Click to prefill Limit Price ₹${b.price.toFixed(2)}">
            <td>${b.orders}</td>
            <td class="text-right" style="font-family:'JetBrains Mono',monospace">${b.qty}</td>
            <td class="text-right text-green fw-700" style="font-family:'JetBrains Mono',monospace">${b.price.toFixed(2)}</td>
          </tr>`;
        }).join('');
      }

      if (asksEl && depth.asks) {
        const maxAsk = Math.max(...depth.asks.map(a => a.qty), 1);
        asksEl.innerHTML = depth.asks.map(a => {
          const pct = Math.min(100, Math.round((a.qty / maxAsk) * 100));
          return `<tr onclick="App.prefillPrice(${a.price})" style="cursor:pointer; background: linear-gradient(to right, rgba(239, 68, 68, 0.16) ${pct}%, transparent ${pct}%);" title="Click to prefill Limit Price ₹${a.price.toFixed(2)}">
            <td class="text-red fw-700" style="font-family:'JetBrains Mono',monospace">${a.price.toFixed(2)}</td>
            <td class="text-right" style="font-family:'JetBrains Mono',monospace">${a.qty}</td>
            <td class="text-right">${a.orders}</td>
          </tr>`;
        }).join('');
      }

      const total = (depth.totalBidQty + depth.totalAskQty) || 1;
      const bidPct = Math.round((depth.totalBidQty / total) * 100);
      const askPct = 100 - bidPct;

      const meterBid = document.getElementById('depthMeterBid');
      const meterAsk = document.getElementById('depthMeterAsk');
      if (meterBid) meterBid.style.width = bidPct + '%';
      if (meterAsk) meterAsk.style.width = askPct + '%';

      const tb = document.getElementById('depthTotalBids');
      const ta = document.getElementById('depthTotalAsks');
      const bp = document.getElementById('depthBidPct');
      const ap = document.getElementById('depthAskPct');
      if (tb) tb.textContent = depth.totalBidQty.toLocaleString();
      if (ta) ta.textContent = depth.totalAskQty.toLocaleString();
      if (bp) bp.textContent = bidPct + '%';
      if (ap) ap.textContent = askPct + '%';
    } catch (e) {}
  },

  prefillPrice(price) {
    const pInput = document.getElementById('tradePrice');
    const otSelect = document.getElementById('orderType');
    if (pInput) pInput.value = price.toFixed(2);
    if (otSelect) otSelect.value = 'limit';
    this.updateOrderSum();
    this.toast(`Pre-filled Limit Price: ₹${price.toFixed(2)}`, 'info');
  },

  async updateTerminalPosition() {
    const card = document.getElementById('terminalSymbolPosition');
    if (!card) return;

    try {
      const positions = await this.api('/api/positions');
      const pos = positions.find(p => p.symbol === this.selectedSymbol);

      if (pos) {
        card.style.display = 'block';
        const sideBadge = document.getElementById('termPosSideBadge');
        const qtyEl = document.getElementById('termPosQty');
        const avgEl = document.getElementById('termPosAvg');
        const plEl = document.getElementById('termPosPL');

        if (sideBadge) {
          sideBadge.textContent = pos.side.toUpperCase();
          sideBadge.className = 'badge ' + (pos.side === 'buy' ? 'badge-success' : 'badge-danger');
        }
        if (qtyEl) qtyEl.textContent = pos.qty;
        if (avgEl) avgEl.textContent = pos.entryPrice.toFixed(2);
        if (plEl) {
          plEl.textContent = `${pos.pnl >= 0 ? '+' : ''}${this.inr(pos.pnl)}`;
          plEl.className = pos.pnl >= 0 ? 'text-green' : 'text-red';
        }
        this._currentTerminalPosId = pos.id;
      } else {
        card.style.display = 'none';
        this._currentTerminalPosId = null;
      }
    } catch (e) {
      card.style.display = 'none';
    }
  },

  async squareOffCurrentSymbol() {
    if (!this._currentTerminalPosId) return;
    try {
      const res = await this.api(`/api/positions/${this._currentTerminalPosId}/squareoff`, { method: 'POST' });
      this.toast(res.message, res.pnl >= 0 ? 'success' : 'warning');
      if (window.SoundEngine) SoundEngine.playSquareOff();
      this.updateTerminalPosition();
    } catch (e) {
      this.toast(e.message, 'error');
    }
  },

  setProductType(pt) {
    this.productType = pt;
    document.getElementById('prodMIS')?.classList.toggle('active', pt === 'MIS');
    document.getElementById('prodCNC')?.classList.toggle('active', pt === 'CNC');
    document.getElementById('omProdMIS')?.classList.toggle('active', pt === 'MIS');
    document.getElementById('omProdCNC')?.classList.toggle('active', pt === 'CNC');
    this.updateOrderSum();
    this.toast(`Product mode: ${pt === 'MIS' ? 'Intraday (5x Leverage)' : 'Delivery (Normal 1x)'}`, 'info');
  },

  quickTrade(sym, side) {
    this.selectedSymbol = sym;
    this.tradeType = side;
    this.nav('trading');
    this.selectSym(sym);
    this.openOrderModal(side, sym);
  },

  setTradeType(t) {
    this.tradeType = t;
    document.querySelectorAll('.trade-type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.trade-type-btn.${t}`)?.classList.add('active');

    const modalBox = document.getElementById('orderModalBox');
    if (modalBox) {
      modalBox.classList.toggle('sell-mode', t === 'sell');
    }
    const omHeader = document.getElementById('omHeader');
    if (omHeader) {
      omHeader.className = 'om-header ' + (t === 'buy' ? 'buy-mode' : 'sell-mode');
    }
    const tabBuy = document.getElementById('omTabBuy');
    const tabSell = document.getElementById('omTabSell');
    if (tabBuy && tabSell) {
      tabBuy.classList.toggle('active', t === 'buy');
      tabSell.classList.toggle('active', t === 'sell');
    }

    const btn = document.getElementById('btnPlaceOrder');
    if (btn) {
      const isOm = btn.classList.contains('om-submit-btn') || btn.id === 'btnPlaceOrder';
      btn.className = (isOm ? 'om-submit-btn ' : 'btn-place-order ') + t;
    }
    this.updateOrderSum();
  },

  updateTradePrice() {
    if (!this.selectedSymbol) return;
    const d = this.liveData[this.selectedSymbol];
    if (!d) return;

    const el = document.getElementById('tradeLTP');
    const chg = document.getElementById('tradeChg');
    const high = document.getElementById('tradeHigh');
    const low = document.getElementById('tradeLow');
    const vol = document.getElementById('tradeVol');
    const lotSz = document.getElementById('tradeLotSize');
    const lotHint = document.getElementById('tradeLotHint');

    if (el) {
      el.textContent = '₹' + d.ltp.toFixed(2);
      el.className = 'tt-ltp ' + (d.change >= 0 ? 'text-green' : 'text-red');
    }
    if (chg) {
      chg.textContent = `${d.change >= 0 ? '+' : ''}₹${d.change.toFixed(2)} (${d.changePct >= 0 ? '+' : ''}${d.changePct.toFixed(2)}%)`;
      chg.className = 'tt-chg ' + (d.change >= 0 ? 'text-green' : 'text-red');
    }
    if (high) high.textContent = '₹' + (d.high || d.ltp).toFixed(2);
    if (low) low.textContent = '₹' + (d.low || d.ltp).toFixed(2);
    if (vol) vol.textContent = (d.volume || 10000).toLocaleString('en-IN');
    if (lotSz) lotSz.textContent = `${d.lotSize || 1} units`;
    if (lotHint) lotHint.textContent = `1 Lot = ${d.lotSize || 1} units`;

    // Modal elements
    const omLtp = document.getElementById('omLtp');
    const omChg = document.getElementById('omChg');
    const ssLtp = document.getElementById('ssSelectedSymLtp');
    if (omLtp) omLtp.textContent = '₹' + d.ltp.toFixed(2);
    if (ssLtp) {
      ssLtp.textContent = '₹' + d.ltp.toFixed(2);
      ssLtp.className = 'ss-sym-ltp ' + (d.change >= 0 ? 'text-green' : 'text-red');
    }
    if (omChg) {
      omChg.textContent = `${d.changePct >= 0 ? '+' : ''}${d.changePct.toFixed(2)}%`;
      omChg.className = 'om-chg ' + (d.change >= 0 ? 'text-green' : 'text-red');
    }

    // Active chart indicators if present
    const actLtp = document.getElementById('activeChartLtp');
    const actChg = document.getElementById('activeChartChg');
    const actHigh = document.getElementById('activeChartHigh');
    const actLow = document.getElementById('activeChartLow');
    const actVol = document.getElementById('activeChartVol');
    if (actLtp) {
      actLtp.textContent = '₹' + d.ltp.toFixed(2);
      actLtp.className = 'c-active-ltp ' + (d.change >= 0 ? 'text-green' : 'text-red');
    }
    if (actChg) {
      actChg.textContent = `${d.change >= 0 ? '+' : ''}₹${d.change.toFixed(2)} (${d.changePct >= 0 ? '+' : ''}${d.changePct.toFixed(2)}%)`;
      actChg.className = 'c-active-chg ' + (d.change >= 0 ? 'text-green' : 'text-red');
    }
    if (actHigh) actHigh.textContent = '₹' + (d.high || d.ltp).toFixed(2);
    if (actLow) actLow.textContent = '₹' + (d.low || d.ltp).toFixed(2);
    if (actVol) actVol.textContent = (d.volume || 10000).toLocaleString('en-IN');

    this.updateOrderSum();
  },

  updateOrderSum() {
    const sym = this.selectedSymbol;
    if (!sym) return;
    const d = this.liveData[sym];
    if (!d) return;
    const qty = parseInt(document.getElementById('tradeQty')?.value) || 0;
    const ot = document.getElementById('orderType')?.value || 'market';
    const price = ot === 'market' ? d.ltp : (parseFloat(document.getElementById('tradePrice')?.value) || d.ltp);
    const lotSz = d.lotSize || 1;
    const totalQty = qty * lotSz;
    const value = price * totalQty;

    let margin = d.marginPct ? (value * d.marginPct / 100) : value;
    if (this.productType === 'MIS') {
      margin = margin * 0.2;
    }

    // Determine available funds (client's if admin selected client, else user's)
    let userAvailable = 0;
    let userName = 'Your Balance';
    const isAdminOrBroker = this.user && (this.user.role === 'admin' || this.user.role === 'broker');
    if (isAdminOrBroker && this.selectedOrderClient) {
      const c = this.selectedOrderClient;
      userAvailable = (c.funds || 0) + (c.creditLimit || c.credits || 0);
      userName = `Client ${c.name}`;
    } else {
      userAvailable = this.user ? ((this.user.funds || 0) + (this.user.creditLimit || this.user.credits || 0)) : 100000;
    }

    const isSufficient = userAvailable >= margin;
    const formatFundsCompact = (val) => {
      if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + ' Cr';
      if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + ' L';
      return this.inr(val);
    };

    const el = document.getElementById('orderSumContent');
    if (el) el.innerHTML = `
      <div class="om-summary-grid">
        <div class="om-sum-item">
          <span class="om-sum-label">Units (Lots)</span>
          <span class="om-sum-val">${totalQty} <small>(${qty} L)</small></span>
        </div>
        <div class="om-sum-item">
          <span class="om-sum-label">Order Value</span>
          <span class="om-sum-val">${this.inr(value)}</span>
        </div>
        <div class="om-sum-item om-sum-item-right">
          <span class="om-sum-label">Product • Exec</span>
          <span class="om-sum-val text-gold">${this.productType === 'MIS' ? 'MIS (5x)' : 'CNC (1x)'} • <span class="text-cyan">${ot.toUpperCase()}</span></span>
        </div>
      </div>
      <div class="om-margin-bar">
        <div class="om-margin-left">
          <span class="om-margin-title">Margin</span>
          <span class="om-margin-amount ${isSufficient ? 'text-green' : 'text-red'}">${this.inr(margin)}</span>
        </div>
        <div class="om-margin-right">
          <span class="om-avail-label">Avail: ${formatFundsCompact(userAvailable)}</span>
          <span class="om-status-chip ${isSufficient ? 'chip-green' : 'chip-red'}">
            ${isSufficient ? `${Icons.check(10)} Sufficient` : `${Icons.alertTriangle(10)} Low`}
          </span>
        </div>
      </div>
      ${!isSufficient ? `<div class="om-margin-warn">${Icons.alertTriangle(11, 'text-red')} Shortfall of ${this.inr(margin - userAvailable)} for ${userName}</div>` : ''}
    `;

    const btn = document.getElementById('btnPlaceOrder');
    if (btn) {
      btn.className = 'om-submit-btn ' + this.tradeType;
      const sideText = this.tradeType.toUpperCase();
      const isMarket = ot === 'market';
      btn.innerHTML = `${Icons.trade(13)} ${sideText} ${totalQty} ${sym} @ ${isMarket ? 'MKT' : '₹' + price.toFixed(2)}`;
    }
  },

  async placeOrder() {
    this.vibrate(50);
    const sym = this.selectedSymbol;
    if (!sym) return this.toast('Select an instrument', 'error');
    const qty = parseInt(document.getElementById('tradeQty').value) || 0;
    if (qty <= 0) return this.toast('Enter valid quantity / lots', 'error');
    const orderType = document.getElementById('orderType').value;
    const price = document.getElementById('tradePrice').value;

    const body = {
      symbol: sym,
      side: this.tradeType,
      qty,
      orderType,
      price
    };

    // If admin or broker, require client selection
    const isAdminOrBroker = this.user && (this.user.role === 'admin' || this.user.role === 'broker');
    if (isAdminOrBroker) {
      const clientSelect = document.getElementById('orderClientSelect');
      const clientId = clientSelect ? clientSelect.value : '';
      if (!clientId) {
        return this.toast('Please Select a client to take trade on their behalf', 'error');
      }
      body.clientId = clientId;
    }

    try {
      const res = await this.api('/api/orders', { method: 'POST', body });
      this.toast(res.message, 'success');
      if (window.SoundEngine) SoundEngine.playSuccess();
      document.getElementById('tradeQty').value = '1';
      this.closeOrderModal();
      this.updateTerminalPosition();
      this.loadPositions();
      this.loadOrders();
      if (isAdminOrBroker) this.loadClients();
    } catch (e) {
      this.toast(e.message, 'error');
      if (window.SoundEngine) SoundEngine.playError();
    }
  },

  // ═══════════════════════════════════════════════════════
  // ACTIVE POSITIONS
  // ═══════════════════════════════════════════════════════
  async loadPositions() {
    try {
      const positions = await this.api('/api/positions');
      let totalPL = 0, totalMargin = 0;
      document.getElementById('posBody').innerHTML = positions.length === 0
        ? '<tr><td colspan="8" class="text-center text-muted" style="padding:40px">No active positions open</td></tr>'
        : positions.map(p => {
          totalPL += p.pnl;
          totalMargin += p.margin || 0;
          return `<tr>
            <td class="text fw-700">${p.symbol}</td>
            <td class="text">${p.exchange}</td>
            <td><span class="${p.side === 'buy' ? 'text-green' : 'text-red'} fw-700">${p.side.toUpperCase()}</span></td>
            <td>${p.qty}</td>
            <td>${p.entryPrice.toFixed(2)}</td>
            <td>${p.ltp.toFixed(2)}</td>
            <td class="${p.pnl >= 0 ? 'green' : 'red'} fw-700">${this.inr(p.pnl)} (${p.pnlPct >= 0 ? '+' : ''}${p.pnlPct}%)</td>
            <td><button class="btn-square-off" onclick="App.squareOff(${p.id})">${Icons.zapOff(12)} Square Off</button></td>
          </tr>`;
        }).join('');

      document.getElementById('posTotalPL').textContent = this.inr(totalPL);
      document.getElementById('posTotalPL').className = 'value ' + (totalPL >= 0 ? 'text-green' : 'text-red');
      document.getElementById('posTotalMargin').textContent = this.inr(totalMargin);
      document.getElementById('posTotalCount').textContent = positions.length;
    } catch (e) {}
  },

  async squareOff(id) {
    try {
      const res = await this.api(`/api/positions/${id}/squareoff`, { method: 'POST' });
      this.toast(res.message, res.pnl >= 0 ? 'success' : 'warning');
      if (window.SoundEngine) SoundEngine.playSquareOff();
      this.loadPositions();
    } catch (e) { this.toast(e.message, 'error'); }
  },

  async squareOffAll() {
    if (!confirm('Are you sure you want to SQUARE OFF ALL open positions immediately?')) return;
    try {
      const res = await this.api('/api/positions/squareoff-all', { method: 'POST' });
      this.toast(res.message, res.netPL >= 0 ? 'success' : 'warning');
      if (window.SoundEngine) SoundEngine.playSquareOff();
      this.loadPositions();
      this.renderDashboard();
    } catch (e) { this.toast(e.message, 'error'); }
  },

  // ═══════════════════════════════════════════════════════
  // CLOSED TRADES SCRIPTWISE
  // ═══════════════════════════════════════════════════════
  async loadClosed() {
    try {
      const trades = await this.api('/api/closed-trades');
      let totalPL = 0;
      document.getElementById('closedBody').innerHTML = trades.length === 0
        ? '<tr><td colspan="10" class="text-center text-muted" style="padding:40px">No closed trades</td></tr>'
        : trades.map(t => {
          totalPL += t.pnl;
          const gross = t.pnl + (t.brokerage || 0);
          return `<tr>
            <td class="text fw-700">${t.symbol}</td>
            <td class="text">${t.exchange}</td>
            <td><span class="${t.side === 'buy' ? 'text-green' : 'text-red'} fw-700">${t.side.toUpperCase()}</span></td>
            <td>${t.qty}</td>
            <td>${t.entryPrice.toFixed(2)}</td>
            <td>${t.exitPrice.toFixed(2)}</td>
            <td class="${gross >= 0 ? 'green' : 'red'}">${this.inr(gross)}</td>
            <td class="text-yellow">${this.inr(t.brokerage || 0)}</td>
            <td class="${t.pnl >= 0 ? 'green' : 'red'} fw-700">${this.inr(t.pnl)}</td>
            <td class="text">${new Date(t.exitTime).toLocaleString('en-IN')}</td>
          </tr>`;
        }).join('');
      const el = document.getElementById('closedTotalPL');
      el.textContent = this.inr(totalPL);
      el.className = 'value ' + (totalPL >= 0 ? 'text-green' : 'text-red');
    } catch (e) {}
  },

  // ═══════════════════════════════════════════════════════
  // TRADES REGISTER (Matching /trades/index)
  // ═══════════════════════════════════════════════════════
  async loadTradesRegister() {
    try {
      const trades = await this.api('/api/trades');
      document.getElementById('tradesRegisterBody').innerHTML = trades.length === 0
        ? '<tr><td colspan="9" class="text-center text-muted" style="padding:40px">No executed matched trades</td></tr>'
        : trades.map(t => `<tr>
          <td class="text">#${t.id}</td>
          <td class="text fw-700">${t.script}</td>
          <td class="text"><span class="role-badge client">${t.segment}</span></td>
          <td class="text fw-600">${t.userId}</td>
          <td class="text-right ${t.buyRate ? 'text-green fw-700' : 'text-muted'}">${t.buyRate ? t.buyRate.toFixed(2) : '-'}</td>
          <td class="text-right ${t.sellRate ? 'text-red fw-700' : 'text-muted'}">${t.sellRate ? t.sellRate.toFixed(2) : '-'}</td>
          <td class="text-right">${t.lots} Lots (${t.qty})</td>
          <td class="text">${t.boughtAt ? new Date(t.boughtAt).toLocaleTimeString('en-IN') : '-'}</td>
          <td class="text">${t.soldAt ? new Date(t.soldAt).toLocaleTimeString('en-IN') : '-'}</td>
        </tr>`).join('');
    } catch (e) {}
  },

  exportTradesExcel() {
    this.api('/api/trades').then(data => {
      let csv = 'ID,Script,Segment,User_ID,Buy_Rate,Sell_Rate,Lots,Qty,Bought_At,Sold_At\n';
      data.forEach(t => {
        csv += `${t.id},${t.script},${t.segment},${t.userId},${t.buyRate || ''},${t.sellRate || ''},${t.lots},${t.qty},${t.boughtAt || ''},${t.soldAt || ''}\n`;
      });
      this.downloadCSV(csv, 'Trades_Register_Export.csv');
      this.toast('Trades exported to Excel CSV', 'success');
    });
  },

  // ═══════════════════════════════════════════════════════
  // PENDING ORDERS (Matching /pending-orders/index)
  // ═══════════════════════════════════════════════════════
  async loadPendingOrders() {
    try {
      const orders = await this.api('/api/pending-orders');
      document.getElementById('pendingOrdersBody').innerHTML = orders.length === 0
        ? '<tr><td colspan="10" class="text-center text-muted" style="padding:40px">No active pending orders in register</td></tr>'
        : orders.map(o => `<tr>
          <td>${o.index}</td>
          <td class="text">#${o.id}</td>
          <td class="text fw-700">${o.symbol}</td>
          <td class="text fw-600">${o.userCode || o.userId}</td>
          <td><span class="${o.side === 'buy' ? 'text-green' : 'text-red'} fw-700">${o.side.toUpperCase()}</span></td>
          <td class="text-right fw-700">${o.price.toFixed(2)}</td>
          <td class="text-right">${o.lots || 1}</td>
          <td class="text text-muted">${o.condition || '-'}</td>
          <td><span class="role-badge broker">${o.status.toUpperCase()}</span></td>
          <td><button class="btn-xs btn-danger" onclick="App.cancelOrder(${o.id})">${Icons.close(11)} Cancel</button></td>
        </tr>`).join('');
    } catch (e) {}
  },

  async loadUsersForDropdowns() {
    try {
      const clients = await this.api('/api/clients');
      const optHtml = clients.map(c => `<option value="${c.id}">${c.id} : ${c.username} (${c.name})</option>`).join('');
      const pEl = document.getElementById('pendingUserId');
      const fEl = document.getElementById('fundUserId');
      if (pEl) pEl.innerHTML = optHtml;
      if (fEl) fEl.innerHTML = optHtml;
    } catch (e) {}
  },

  onPendingSegmentChange() {
    const seg = document.getElementById('pendingSegment')?.value || 'MCX';
    const symEl = document.getElementById('pendingSym');
    if (!symEl) return;

    const symMap = {
      MCX: [
        { val: 'GOLDM', name: 'GOLDM (Gold Mini)' },
        { val: 'CRUDEOIL', name: 'CRUDEOIL (Crude Oil)' },
        { val: 'SILVERM', name: 'SILVERM (Silver Mini)' },
        { val: 'NATURALGAS', name: 'NATURALGAS (Natural Gas)' },
        { val: 'COPPER', name: 'COPPER (Copper)' },
        { val: 'ZINC', name: 'ZINC (Zinc)' },
        { val: 'ALUMINIUM', name: 'ALUMINIUM (Aluminium)' },
      ],
      NSE: [
        { val: 'RELIANCE', name: 'RELIANCE (Reliance Ind.)' },
        { val: 'TCS', name: 'TCS (Tata Consultancy)' },
        { val: 'INFY', name: 'INFY (Infosys)' },
        { val: 'HDFCBANK', name: 'HDFCBANK (HDFC Bank)' },
        { val: 'ICICIBANK', name: 'ICICIBANK (ICICI Bank)' },
        { val: 'SBIN', name: 'SBIN (State Bank of India)' },
      ],
      BSE: [
        { val: 'SENSEX', name: 'SENSEX (BSE SENSEX 30)' },
        { val: 'BSE:RELIANCE', name: 'RELIANCE (Reliance Ind. BSE)' },
        { val: 'BSE:TCS', name: 'TCS (Tata Consultancy BSE)' },
        { val: 'BSE:HDFCBANK', name: 'HDFCBANK (HDFC Bank BSE)' },
        { val: 'BSE:INFY', name: 'INFY (Infosys BSE)' },
        { val: 'BSE:TATAMOTORS', name: 'TATAMOTORS (Tata Motors BSE)' },
        { val: 'BSE:SBIN', name: 'SBIN (State Bank of India BSE)' },
      ],
      FNO: [
        { val: 'NIFTY-FUT', name: 'NIFTY-FUT (Nifty 50 Futures)' },
        { val: 'BANKNIFTY-FUT', name: 'BANKNIFTY-FUT (Bank Nifty Futures)' },
        { val: 'FINNIFTY-FUT', name: 'FINNIFTY-FUT (Fin Nifty Futures)' },
      ],
      CDS: [
        { val: 'USDINR', name: 'USDINR (US Dollar / INR)' },
        { val: 'EURINR', name: 'EURINR (Euro / INR)' },
        { val: 'GBPINR', name: 'GBPINR (British Pound / INR)' },
      ]
    };

    const list = symMap[seg] || symMap.MCX;
    symEl.innerHTML = list.map(item => `<option value="${item.val}">${item.name}</option>`).join('');
  },

  async showCreatePendingModal() {
    await this.loadUsersForDropdowns();
    this.onPendingSegmentChange();
    document.getElementById('pendingRate').value = '';
    document.getElementById('pendingLots').value = '1';
    const txP = document.getElementById('pendingTxPass');
    if (txP) txP.value = '';
    document.getElementById('pendingOrderModal').classList.add('active');
  },

  closePendingModal() {
    document.getElementById('pendingOrderModal').classList.remove('active');
  },

  async submitPendingOrder() {
    const userId = document.getElementById('pendingUserId')?.value;
    const symbol = document.getElementById('pendingSym').value;
    const side = document.getElementById('pendingSide').value;
    const lots = parseInt(document.getElementById('pendingLots').value) || 1;
    const price = parseFloat(document.getElementById('pendingRate').value);
    const condition = document.getElementById('pendingCondition').value;

    if (!price || price <= 0) return this.toast('Enter valid trigger price', 'error');

    try {
      const res = await this.api('/api/pending-orders', {
        method: 'POST',
        body: { userId, symbol, side, qty: lots, price, condition, orderType: 'limit' }
      });
      this.closePendingModal();
      this.toast(res.message || 'Pending order created in register', 'success');
      if (window.SoundEngine) SoundEngine.playSuccess();
      this.loadPendingOrders();
    } catch (e) { this.toast(e.message, 'error'); }
  },

  async showFundModal(type = 'deposit') {
    await this.loadUsersForDropdowns();
    const typeSelect = document.getElementById('fundModalType');
    if (typeSelect) typeSelect.value = type;
    const title = document.getElementById('fundModalTitle');
    if (title) title.textContent = type === 'deposit' ? 'Create Funds Wd (Deposit)' : 'Create Funds Wd (Withdrawal)';
    document.getElementById('fundAmount').value = '';
    document.getElementById('fundNotes').value = '';
    const txP = document.getElementById('fundTxPass');
    if (txP) txP.value = '';
    document.getElementById('fundModal').classList.add('active');
  },

  closeFundModal() {
    document.getElementById('fundModal').classList.remove('active');
  },

  async submitFund() {
    const userId = document.getElementById('fundUserId')?.value;
    const type = document.getElementById('fundModalType')?.value || 'deposit';
    const amount = parseFloat(document.getElementById('fundAmount').value);
    const notes = document.getElementById('fundNotes').value.trim();

    if (!amount || amount <= 0) return this.toast('Enter valid fund amount', 'error');

    try {
      const res = await this.api('/api/funds-wd', {
        method: 'POST',
        body: { userId, amount, type, notes }
      });
      this.closeFundModal();
      this.toast(res.message || 'Funds transaction recorded successfully', 'success');
      if (window.SoundEngine) SoundEngine.playSuccess();
      this.loadFunds();
    } catch (e) { this.toast(e.message, 'error'); }
  },

  // ═══════════════════════════════════════════════════════
  // ORDERS BOOK
  // ═══════════════════════════════════════════════════════
  async loadOrders() {
    try {
      const orders = await this.api('/api/orders');
      document.getElementById('ordersBody').innerHTML = orders.length === 0
        ? '<tr><td colspan="9" class="text-center text-muted" style="padding:40px">No orders in register</td></tr>'
        : orders.map(o => {
          const sc = o.status === 'executed' ? 'text-green' : o.status === 'cancelled' ? 'text-red' : 'text-yellow';
          return `<tr>
            <td class="text">#${o.id}</td>
            <td class="text fw-700">${o.symbol}</td>
            <td><span class="${o.side === 'buy' ? 'text-green' : 'text-red'} fw-700">${o.side.toUpperCase()}</span></td>
            <td>${o.orderType.toUpperCase()}</td>
            <td>${o.qty}</td>
            <td>${o.price.toFixed(2)}</td>
            <td class="${sc} fw-700">${o.status.toUpperCase()}</td>
            <td class="text">${new Date(o.timestamp).toLocaleString('en-IN')}</td>
            <td>${o.status === 'pending' ? `<button class="btn-xs btn-danger" onclick="App.cancelOrder(${o.id})">${Icons.close(11)} Cancel</button>` : ''}</td>
          </tr>`;
        }).join('');
    } catch (e) {}
  },

  async cancelOrder(id) {
    try {
      await this.api(`/api/orders/${id}`, { method: 'DELETE' });
      this.toast('Order cancelled', 'info');
      this.loadOrders();
      this.loadPendingOrders();
    } catch (e) { this.toast(e.message, 'error'); }
  },

  // ═══════════════════════════════════════════════════════
  // TRADING CLIENTS (Matching /mcxusers/index)
  // ═══════════════════════════════════════════════════════
  async loadClients() {
    try {
      const clients = await this.api('/api/clients');
      document.getElementById('clientsBody').innerHTML = clients.map((c, i) => {
        const netPL = (c.funds || 0) - (c.openingBalance || 100000);
        const plUp = netPL >= 0;
        return `<tr>
          <td>${i + 1}</td>
          <td class="text">#${c.id}</td>
          <td class="text fw-700">${c.name}</td>
          <td class="text">${c.username}</td>
          <td class="text-right text-yellow fw-700">${this.inr(c.creditLimit)}</td>
          <td class="text-right fw-700">${this.inr(c.funds)}</td>
          <td class="text-right ${plUp ? 'green' : 'red'} fw-700">${this.inr(netPL)}</td>
          <td><span class="role-badge ${c.role}">${c.role}</span></td>
          <td class="text-muted">${c.broker || 'AG'}</td>
          <td>${c.isDemo ? '<span class="role-badge broker">Demo</span>' : '<span class="role-badge client">Live</span>'}</td>
          <td><span class="client-status ${c.status}">${c.status}</span></td>
          <td>
            <div class="flex gap-8">
              <button class="btn-xs btn-ghost" onclick="App.editClient(${c.id})">${Icons.edit(11)} Edit</button>
              <button class="btn-xs ${c.status === 'active' ? 'btn-danger' : 'btn-success'}" onclick="App.toggleClient(${c.id})">
                ${c.status === 'active' ? `${Icons.slash(11)} Disable` : `${Icons.check(11)} Enable`}
              </button>
            </div>
          </td>
        </tr>`;
      }).join('');
    } catch (e) { this.toast(e.message, 'error'); }
  },

  exportClientsExcel() {
    this.api('/api/clients').then(clients => {
      let csv = 'ID,Name,Username,Phone,Role,Funds,Credit_Limit,Status\n';
      clients.forEach(c => {
        csv += `${c.id},"${c.name}",${c.username},${c.phone || ''},${c.role},${c.funds},${c.creditLimit},${c.status}\n`;
      });
      this.downloadCSV(csv, 'Clients_Master_Export.csv');
      this.toast('Clients exported to Excel CSV', 'success');
    });
  },

  // ─── MCX Script Matrix Definitions (Matching admin.theindicator.in) ───
  mcxScripts: [
    { symbol: 'GOLD', name: 'GOLD Standard' },
    { symbol: 'SILVER', name: 'SILVER Standard' },
    { symbol: 'CRUDEOIL', name: 'CRUDEOIL' },
    { symbol: 'NATURALGAS', name: 'NATURALGAS' },
    { symbol: 'COPPER', name: 'COPPER' },
    { symbol: 'NICKEL', name: 'NICKEL' },
    { symbol: 'ZINC', name: 'ZINC' },
    { symbol: 'LEAD', name: 'LEAD' },
    { symbol: 'ALUMINIUM', name: 'ALUMINIUM' },
    { symbol: 'BULLDEX', name: 'BULLDEX' },
    { symbol: 'GOLD-MINI', name: 'GOLD MINI' },
    { symbol: 'SILVER-MINI', name: 'SILVER MINI' },
    { symbol: 'SILVERMIC', name: 'SILVER MIC' },
  ],

  switchClientTab(tabName, btn) {
    document.querySelectorAll('.client-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.client-tab-pane').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const pane = document.getElementById(`clientTab-${tabName}`);
    if (pane) pane.classList.add('active');
  },

  renderMcxScriptMatrix(brokMap = {}, intraMap = {}, holdMap = {}) {
    const tbody = document.getElementById('mcxScriptMatrixBody');
    if (!tbody) return;
    tbody.innerHTML = this.mcxScripts.map(s => {
      const sym = s.symbol;
      const brok = brokMap[sym] !== undefined ? brokMap[sym] : 200;
      const intra = intraMap[sym] !== undefined ? intraMap[sym] : 5;
      const hold = holdMap[sym] !== undefined ? holdMap[sym] : 2;
      return `<tr>
        <td><strong>${sym}</strong> <span class="text-muted" style="font-size:11px">(${s.name})</span></td>
        <td class="text-right">
          <input type="number" class="matrix-input" id="matBrok_${sym}" value="${brok}">
        </td>
        <td class="text-right">
          <input type="number" class="matrix-input" id="matIntra_${sym}" value="${intra}">
        </td>
        <td class="text-right">
          <input type="number" class="matrix-input" id="matHold_${sym}" value="${hold}">
        </td>
      </tr>`;
    }).join('');
  },

  showAddClient() {
    document.getElementById('clientModalTitle').textContent = 'Create Trading Client';
    const sub = document.getElementById('clientModalSubtitle');
    if (sub) sub.textContent = 'Configure new client credentials, credit limits, RMS parameters, brokerage & lot matrix';
    document.getElementById('clientModalId').value = '';

    // Reset Personal Details
    document.getElementById('clientName').value = '';
    document.getElementById('clientMobile').value = '';
    document.getElementById('clientUsername').value = '';
    document.getElementById('clientPassword').value = '123456';
    document.getElementById('clientCity').value = '';
    document.getElementById('clientTradeBlockTime').value = '0';
    document.getElementById('clientRole').value = 'client';
    document.getElementById('clientCreditLimit').value = '500000';
    document.getElementById('clientFunds').value = '200000';
    document.getElementById('clientDemo').value = '0';
    document.getElementById('clientStatus').value = 'active';

    // Reset RMS Config
    document.getElementById('clientAobhl').checked = true;
    document.getElementById('clientToahl').checked = true;
    document.getElementById('clientTradeEquityUnits').checked = true;
    document.getElementById('clientAutoSquareCloseAt').value = '90';
    document.getElementById('clientAutoSquareNotifyAt').value = '70';

    // Reset MCX Futures
    document.getElementById('clientCommodity').checked = true;
    document.getElementById('clientMcxBrokerageType').value = 'per_crore';
    document.getElementById('clientCommodityBrokerage').value = '2000';
    document.getElementById('clientExposureMcxType').value = 'per_turnover';
    document.getElementById('clientExposureMcx').value = '200';
    document.getElementById('clientHoldingExposureMcx').value = '20';
    document.getElementById('clientMinSizeTradeCommodity').value = '0';
    document.getElementById('clientMaxSizeTradeCommodity').value = '2';
    document.getElementById('clientMaxSizeScriptCommodity').value = '5';
    document.getElementById('clientMaxSizeAllCommodity').value = '20';

    // Reset Equity Futures
    document.getElementById('clientEquity').checked = true;
    document.getElementById('clientEquityBrokerageType').value = 'per_crore';
    document.getElementById('clientEquityBrokerage').value = '4000';
    document.getElementById('clientExposureEquity').value = '200';
    document.getElementById('clientHoldingExposureEquity').value = '20';
    document.getElementById('clientMinSizeTradeEquity').value = '0';
    document.getElementById('clientMaxSizeTradeEquity').value = '2';
    document.getElementById('clientMinSizeTradeIndex').value = '0';
    document.getElementById('clientMaxSizeTradeIndex').value = '5';
    document.getElementById('clientMaxSizeScriptEquity').value = '5';
    document.getElementById('clientMaxSizeScriptIndex').value = '10';
    document.getElementById('clientMaxSizeAllEquity').value = '20';
    document.getElementById('clientMaxSizeAllIndex').value = '20';

    // Reset Other
    document.getElementById('clientTxPassword').value = '';
    document.getElementById('clientNotes').value = '';

    // Render Matrix with defaults
    this.renderMcxScriptMatrix();

    // Activate First Tab
    const firstTabBtn = document.querySelector('.client-tab-btn');
    this.switchClientTab('personal', firstTabBtn);

    document.getElementById('clientModal').classList.add('active');
  },

  async editClient(id) {
    try {
      const c = await this.api(`/api/clients/${id}`);
      if (!c) return;

      document.getElementById('clientModalTitle').textContent = `Update Trading Client: ${c.name} (${c.username})`;
      const sub = document.getElementById('clientModalSubtitle');
      if (sub) sub.textContent = `Edit trading parameters, leverage multipliers & script brokerage overrides for Client #${c.id}`;
      document.getElementById('clientModalId').value = c.id;

      // Personal Details
      document.getElementById('clientName').value = c.name || '';
      document.getElementById('clientMobile').value = c.mobile || c.phone || '';
      document.getElementById('clientUsername').value = c.username || '';
      document.getElementById('clientPassword').value = '';
      document.getElementById('clientCity').value = c.city || '';
      document.getElementById('clientTradeBlockTime').value = c.trade_block_time !== undefined ? c.trade_block_time : 0;
      document.getElementById('clientRole').value = c.role || 'client';
      document.getElementById('clientCreditLimit').value = c.creditLimit !== undefined ? c.creditLimit : 500000;
      document.getElementById('clientFunds').value = c.funds !== undefined ? c.funds : 200000;
      document.getElementById('clientDemo').value = c.demo ? '1' : (c.isDemo ? '1' : '0');
      document.getElementById('clientStatus').value = c.status || 'active';

      // RMS Config
      document.getElementById('clientAobhl').checked = c.aobhl !== undefined ? !!c.aobhl : true;
      document.getElementById('clientToahl').checked = c.toahl !== undefined ? !!c.toahl : true;
      document.getElementById('clientTradeEquityUnits').checked = c.trade_equity_as_units !== undefined ? !!c.trade_equity_as_units : true;
      document.getElementById('clientAutoSquareCloseAt').value = c.auto_square_close_at || 90;
      document.getElementById('clientAutoSquareNotifyAt').value = c.auto_square_notify_at || 70;

      // MCX Futures
      document.getElementById('clientCommodity').checked = c.commodity !== undefined ? !!c.commodity : true;
      document.getElementById('clientMcxBrokerageType').value = c.mcx_brokerage_type || 'per_crore';
      document.getElementById('clientCommodityBrokerage').value = c.commodity_brokerage !== undefined ? c.commodity_brokerage : 2000;
      document.getElementById('clientExposureMcxType').value = c.exposure_mcx_type || 'per_turnover';
      document.getElementById('clientExposureMcx').value = c.exposure_mcx !== undefined ? c.exposure_mcx : 200;
      document.getElementById('clientHoldingExposureMcx').value = c.holding_exposure_mcx !== undefined ? c.holding_exposure_mcx : 20;
      document.getElementById('clientMinSizeTradeCommodity').value = c.min_size_trade_commodity !== undefined ? c.min_size_trade_commodity : 0;
      document.getElementById('clientMaxSizeTradeCommodity').value = c.max_size_trade_commodity !== undefined ? c.max_size_trade_commodity : 2;
      document.getElementById('clientMaxSizeScriptCommodity').value = c.max_size_script_commodity !== undefined ? c.max_size_script_commodity : 5;
      document.getElementById('clientMaxSizeAllCommodity').value = c.max_size_all_commodity !== undefined ? c.max_size_all_commodity : 20;

      // Equity Futures
      document.getElementById('clientEquity').checked = c.equity !== undefined ? !!c.equity : true;
      document.getElementById('clientEquityBrokerageType').value = c.equity_brokerage_type || 'per_crore';
      document.getElementById('clientEquityBrokerage').value = c.equity_brokerage !== undefined ? c.equity_brokerage : 4000;
      document.getElementById('clientExposureEquity').value = c.exposure_equity !== undefined ? c.exposure_equity : 200;
      document.getElementById('clientHoldingExposureEquity').value = c.holding_exposure_equity !== undefined ? c.holding_exposure_equity : 20;
      document.getElementById('clientMinSizeTradeEquity').value = c.min_size_trade_equity !== undefined ? c.min_size_trade_equity : 0;
      document.getElementById('clientMaxSizeTradeEquity').value = c.max_size_trade_equity !== undefined ? c.max_size_trade_equity : 2;
      document.getElementById('clientMinSizeTradeIndex').value = c.min_size_trade_index !== undefined ? c.min_size_trade_index : 0;
      document.getElementById('clientMaxSizeTradeIndex').value = c.max_size_trade_index !== undefined ? c.max_size_trade_index : 5;
      document.getElementById('clientMaxSizeScriptEquity').value = c.max_size_script_equity !== undefined ? c.max_size_script_equity : 5;
      document.getElementById('clientMaxSizeScriptIndex').value = c.max_size_script_index !== undefined ? c.max_size_script_index : 10;
      document.getElementById('clientMaxSizeAllEquity').value = c.max_size_all_equity !== undefined ? c.max_size_all_equity : 20;
      document.getElementById('clientMaxSizeAllIndex').value = c.max_size_all_index !== undefined ? c.max_size_all_index : 20;

      // Other & Security
      document.getElementById('clientTxPassword').value = c.transaction_password || '';
      document.getElementById('clientNotes').value = c.notes || '';

      // Render Script Matrix
      this.renderMcxScriptMatrix(c.brokerage_mcx, c.exposure_mcx_lot, c.holding_exposure_mcx_lot);

      // Activate First Tab
      const firstTabBtn = document.querySelector('.client-tab-btn');
      this.switchClientTab('personal', firstTabBtn);

      document.getElementById('clientModal').classList.add('active');
    } catch (e) { this.toast(e.message, 'error'); }
  },

  closeClientModal() { document.getElementById('clientModal').classList.remove('active'); },

  async saveClient() {
    const id = document.getElementById('clientModalId').value;
    const name = document.getElementById('clientName').value.trim();
    const username = document.getElementById('clientUsername').value.trim();

    if (!name || !username) {
      this.switchClientTab('personal', document.querySelector('.client-tab-btn'));
      return this.toast('Name & Username/Client Code are required', 'error');
    }

    // Collect matrix inputs
    const brokerage_mcx = {};
    const exposure_mcx_lot = {};
    const holding_exposure_mcx_lot = {};
    this.mcxScripts.forEach(s => {
      const sym = s.symbol;
      const bEl = document.getElementById(`matBrok_${sym}`);
      const iEl = document.getElementById(`matIntra_${sym}`);
      const hEl = document.getElementById(`matHold_${sym}`);
      if (bEl) brokerage_mcx[sym] = parseFloat(bEl.value) || 200;
      if (iEl) exposure_mcx_lot[sym] = parseInt(iEl.value) || 5;
      if (hEl) holding_exposure_mcx_lot[sym] = parseInt(hEl.value) || 2;
    });

    const body = {
      // Personal
      name,
      username,
      mobile: document.getElementById('clientMobile').value.trim(),
      phone: document.getElementById('clientMobile').value.trim() || document.getElementById('clientUsername').value.trim(),
      password: document.getElementById('clientPassword').value,
      city: document.getElementById('clientCity').value.trim(),
      trade_block_time: parseInt(document.getElementById('clientTradeBlockTime').value) || 0,
      role: document.getElementById('clientRole').value,
      credits: parseFloat(document.getElementById('clientCreditLimit').value) || 0,
      creditLimit: parseFloat(document.getElementById('clientCreditLimit').value) || 0,
      funds: parseFloat(document.getElementById('clientFunds').value) || 0,
      demo: document.getElementById('clientDemo').value === '1',
      status: document.getElementById('clientStatus').value,

      // RMS
      aobhl: document.getElementById('clientAobhl').checked,
      toahl: document.getElementById('clientToahl').checked,
      trade_equity_as_units: document.getElementById('clientTradeEquityUnits').checked,
      auto_square_close_at: parseFloat(document.getElementById('clientAutoSquareCloseAt').value) || 90,
      auto_square_notify_at: parseFloat(document.getElementById('clientAutoSquareNotifyAt').value) || 70,

      // MCX
      commodity: document.getElementById('clientCommodity').checked,
      mcx_brokerage_type: document.getElementById('clientMcxBrokerageType').value,
      commodity_brokerage: parseFloat(document.getElementById('clientCommodityBrokerage').value) || 2000,
      exposure_mcx_type: document.getElementById('clientExposureMcxType').value,
      exposure_mcx: parseFloat(document.getElementById('clientExposureMcx').value) || 200,
      holding_exposure_mcx: parseFloat(document.getElementById('clientHoldingExposureMcx').value) || 20,
      min_size_trade_commodity: parseFloat(document.getElementById('clientMinSizeTradeCommodity').value) || 0,
      max_size_trade_commodity: parseFloat(document.getElementById('clientMaxSizeTradeCommodity').value) || 2,
      max_size_script_commodity: parseFloat(document.getElementById('clientMaxSizeScriptCommodity').value) || 5,
      max_size_all_commodity: parseFloat(document.getElementById('clientMaxSizeAllCommodity').value) || 20,
      brokerage_mcx,
      exposure_mcx_lot,
      holding_exposure_mcx_lot,

      // Equity
      equity: document.getElementById('clientEquity').checked,
      equity_brokerage_type: document.getElementById('clientEquityBrokerageType').value,
      equity_brokerage: parseFloat(document.getElementById('clientEquityBrokerage').value) || 4000,
      exposure_equity: parseFloat(document.getElementById('clientExposureEquity').value) || 200,
      holding_exposure_equity: parseFloat(document.getElementById('clientHoldingExposureEquity').value) || 20,
      min_size_trade_equity: parseFloat(document.getElementById('clientMinSizeTradeEquity').value) || 0,
      max_size_trade_equity: parseFloat(document.getElementById('clientMaxSizeTradeEquity').value) || 2,
      min_size_trade_index: parseFloat(document.getElementById('clientMinSizeTradeIndex').value) || 0,
      max_size_trade_index: parseFloat(document.getElementById('clientMaxSizeTradeIndex').value) || 5,
      max_size_script_equity: parseFloat(document.getElementById('clientMaxSizeScriptEquity').value) || 5,
      max_size_script_index: parseFloat(document.getElementById('clientMaxSizeScriptIndex').value) || 10,
      max_size_all_equity: parseFloat(document.getElementById('clientMaxSizeAllEquity').value) || 20,
      max_size_all_index: parseFloat(document.getElementById('clientMaxSizeAllIndex').value) || 20,

      // Other & Security
      transaction_password: document.getElementById('clientTxPassword').value,
      notes: document.getElementById('clientNotes').value.trim()
    };

    try {
      if (id) {
        await this.api(`/api/clients/${id}`, { method: 'PUT', body });
        this.toast('Trading Client configuration updated successfully', 'success');
      } else {
        await this.api('/api/clients', { method: 'POST', body });
        const mob = body.mobile ? ` (+91 ${body.mobile})` : '';
        this.toast(`Client "${name}" created! Credentials & margin details sent to WhatsApp${mob}`, 'success');
      }
      this.closeClientModal();
      if (window.SoundEngine) SoundEngine.playSuccess();
      this.loadClients();
    } catch (e) { this.toast(e.message, 'error'); }
  },

  async toggleClient(id) {
    try {
      const res = await this.api(`/api/clients/${id}/toggle`, { method: 'PATCH' });
      this.toast(`Client status updated: ${res.status}`, 'info');
      this.loadClients();
    } catch (e) { this.toast(e.message, 'error'); }
  },

  // ═══════════════════════════════════════════════════════
  // TRADER FUNDS LEDGER (Matching /funds-wd/index)
  // ═══════════════════════════════════════════════════════
  async loadFunds() {
    try {
      const f = await this.api('/api/funds');
      document.getElementById('fundBalance').textContent = this.inr(f.balance);
      document.getElementById('fundMarginUsed').textContent = this.inr(f.marginUsed);
      document.getElementById('fundAvailable').textContent = this.inr(f.available);

      const txns = await this.api('/api/funds-wd');
      document.getElementById('fundTxBody').innerHTML = txns.length === 0
        ? '<tr><td colspan="7" class="text-center text-muted" style="padding:40px">No ledger transactions</td></tr>'
        : txns.map(t => `<tr>
          <td class="text">#${t.id}</td>
          <td class="text fw-600">${t.username}</td>
          <td class="text">${t.name}</td>
          <td class="${t.type === 'deposit' ? 'green' : 'red'} fw-700">${t.type.toUpperCase()}</td>
          <td class="text-right ${t.type === 'deposit' ? 'green' : 'red'} fw-700">${t.type === 'deposit' ? '+' : '-'}${this.inr(t.amount)}</td>
          <td class="text text-muted">${t.notes || '-'}</td>
          <td class="text">${new Date(t.createdAt).toLocaleString('en-IN')}</td>
        </tr>`).join('');
    } catch (e) {}
  },

  exportFundsExcel() {
    this.api('/api/funds-wd').then(txns => {
      let csv = 'ID,Username,Name,Type,Amount,Notes,Created_At\n';
      txns.forEach(t => {
        csv += `${t.id},${t.username},"${t.name}",${t.type},${t.amount},"${t.notes || ''}",${new Date(t.createdAt).toLocaleString('en-IN')}\n`;
      });
      this.downloadCSV(csv, 'Trader_Funds_WD_Export.csv');
      this.toast('Funds ledger exported to Excel CSV', 'success');
    });
  },

  async showFundModal(type = 'deposit') {
    await this.loadUsersForDropdowns();
    document.getElementById('fundModalTitle').textContent = type === 'deposit' ? 'Create Funds Wd (Deposit)' : 'Create Funds Wd (Withdrawal)';
    const typeSelect = document.getElementById('fundModalType');
    if (typeSelect) typeSelect.value = type;
    document.getElementById('fundAmount').value = '';
    document.getElementById('fundNotes').value = '';
    const txP = document.getElementById('fundTxPass');
    if (txP) txP.value = '';
    document.getElementById('fundModal').classList.add('active');
  },
  closeFundModal() { document.getElementById('fundModal').classList.remove('active'); },

  async submitFund() {
    const userId = document.getElementById('fundUserId')?.value;
    const type = document.getElementById('fundModalType')?.value || 'deposit';
    const amount = parseFloat(document.getElementById('fundAmount').value);
    const notes = document.getElementById('fundNotes').value.trim();
    if (!amount || amount <= 0) return this.toast('Enter valid amount', 'error');
    try {
      const res = await this.api('/api/funds-wd', {
        method: 'POST',
        body: { userId, amount, type, notes }
      });
      this.closeFundModal();
      this.toast(res.message || `${type === 'deposit' ? 'Deposited' : 'Withdrawn'} ${this.inr(amount)}`, 'success');
      if (window.SoundEngine) SoundEngine.playSuccess();
      this.loadFunds();
      this.renderDashboard();
    } catch (e) { this.toast(e.message, 'error'); }
  },

  // ═══════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════
  async loadNotifications() {
    try {
      const notifs = await this.api('/api/notifications');
      document.getElementById('notifContent').innerHTML = notifs.length === 0
        ? `<div class="card" style="text-align:center;padding:50px 20px;color:var(--text-muted)">
            <div style="margin-bottom:12px;opacity:0.5">${Icons.notifications(42)}</div>
            <h3>No Announcements</h3>
            <p style="font-size:12px;margin-top:4px">No active broadcasts or exchange updates</p>
           </div>`
        : notifs.map(n => `
          <div class="card mb-16">
            <div class="flex-between">
              <span class="fw-700" style="display:flex;align-items:center;gap:8px">
                ${Icons.notifications(15, 'text-blue')} ${n.title}
              </span>
              <span class="text-muted" style="font-size:11px">${new Date(n.timestamp).toLocaleString('en-IN')}</span>
            </div>
            <p class="mt-8 text-muted" style="font-size:13px">${n.message}</p>
          </div>`).join('');
    } catch (e) {}
  },

  showNotifModal() { document.getElementById('notifModal').classList.add('active'); },
  closeNotifModal() { document.getElementById('notifModal').classList.remove('active'); },

  async sendNotif() {
    const title = document.getElementById('notifTitle').value;
    const message = document.getElementById('notifMessage').value;
    if (!title || !message) return this.toast('Fill all fields', 'error');
    try {
      await this.api('/api/notifications', { method: 'POST', body: { title, message } });
      this.closeNotifModal();
      this.toast('Broadcast published', 'success');
      this.loadNotifications();
    } catch (e) { this.toast(e.message, 'error'); }
  },

  // ═══════════════════════════════════════════════════════
  // REPORTS
  // ═══════════════════════════════════════════════════════
  async loadReports() {
    try {
      const d = await this.api('/api/dashboard');
      document.getElementById('rptTrades').textContent = d.totalTrades;
      const pl = document.getElementById('rptNetPL');
      pl.textContent = this.inr(d.closedPL);
      pl.className = 'stat-value text-mono ' + (d.closedPL >= 0 ? 'text-green' : 'text-red');
      document.getElementById('rptBrokerage').textContent = this.inr(d.totalBrokerage);
      document.getElementById('rptWinRate').textContent = d.winRate + '%';
      document.getElementById('rptWins').textContent = d.wins;
      document.getElementById('rptLosses').textContent = d.losses;
    } catch (e) {}
  },

  // ─── Utilities ───────────────────────────────────────
  inr(n) {
    if (n == null) return '₹0.00';
    const neg = n < 0;
    const abs = Math.abs(n);
    const parts = abs.toFixed(2).split('.');
    let int = parts[0], dec = parts[1];
    if (int.length > 3) {
      const last3 = int.slice(-3);
      let rest = int.slice(0, -3);
      const g = [];
      while (rest.length > 2) { g.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
      if (rest.length > 0) g.unshift(rest);
      int = g.join(',') + ',' + last3;
    }
    return (neg ? '-₹' : '₹') + int + '.' + dec;
  },

  downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  toast(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    const icons = {
      success: Icons.checkCircle(16, 'text-green'),
      error: Icons.crossCircle(16, 'text-red'),
      info: Icons.shield(16, 'text-blue'),
      warning: Icons.activity(16, 'text-yellow')
    };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }, 3500);
  },

  // ═══════════════════════════════════════════════════════
  // WHATSAPP NOTIFICATIONS (OPEN-WA)
  // ═══════════════════════════════════════════════════════
  openWhatsAppModal() {
    const modal = document.getElementById('whatsappModal');
    if (!modal) return;
    modal.classList.add('active');
    this.fetchWAStatus();
  },

  closeWhatsAppModal() {
    document.getElementById('whatsappModal')?.classList.remove('active');
  },

  async fetchWAStatus() {
    try {
      const data = await this.api('/api/whatsapp/status');
      this.handleWAStatus(data);
    } catch (err) {
      console.error('Failed to fetch WhatsApp status:', err);
    }
  },

  handleWAStatus(data) {
    if (!data) return;
    const statusText = document.getElementById('waStatusText');
    const statusDot = document.getElementById('waStatusDot');
    const qrArea = document.getElementById('waQRArea');
    const qrImg = document.getElementById('waQRImg');
    const connInfo = document.getElementById('waConnectedInfo');
    const btnToggle = document.getElementById('btnToggleWA');
    const btnStart = document.getElementById('btnRestartWA');
    const navBadge = document.getElementById('waNavBadge');

    if (statusText) {
      if (data.status === 'CONNECTED') {
        statusText.textContent = 'Connected (Live Bot Active)';
        statusText.style.color = 'var(--green)';
        if (statusDot) statusDot.className = 'conn-dot connected';
        if (qrArea) qrArea.style.display = 'none';
        if (connInfo) connInfo.style.display = 'block';
        if (navBadge) {
          navBadge.textContent = 'ONLINE';
          navBadge.style.background = 'rgba(0,230,118,0.2)';
          navBadge.style.color = 'var(--green)';
        }
        if (btnStart) btnStart.textContent = 'Restart';
      } else if (data.status === 'SCAN_QR') {
        statusText.textContent = 'Scan QR Code with Phone';
        statusText.style.color = 'var(--yellow)';
        if (statusDot) {
          statusDot.className = 'conn-dot';
          statusDot.style.background = 'var(--yellow)';
        }
        if (qrArea) qrArea.style.display = 'block';
        if (qrImg && data.qrCode) qrImg.src = data.qrCode;
        if (connInfo) connInfo.style.display = 'none';
        if (navBadge) {
          navBadge.textContent = 'SCAN QR';
          navBadge.style.background = 'rgba(251,191,36,0.2)';
          navBadge.style.color = 'var(--yellow)';
        }
      } else if (data.status === 'STARTING') {
        statusText.textContent = 'Launching Open-WA Engine...';
        statusText.style.color = 'var(--blue)';
        if (statusDot) {
          statusDot.className = 'conn-dot';
          statusDot.style.background = 'var(--blue)';
        }
        if (qrArea) qrArea.style.display = 'none';
        if (connInfo) connInfo.style.display = 'none';
        if (navBadge) {
          navBadge.textContent = 'STARTING';
          navBadge.style.background = 'rgba(59,130,246,0.2)';
          navBadge.style.color = 'var(--blue)';
        }
      } else {
        statusText.textContent = data.error ? `Error: ${data.error.substring(0, 45)}...` : 'Ready to Connect';
        statusText.style.color = data.error ? 'var(--red)' : 'var(--text-muted)';
        if (statusDot) statusDot.className = 'conn-dot disconnected';
        if (qrArea) qrArea.style.display = 'none';
        if (connInfo) connInfo.style.display = 'none';
        if (navBadge) {
          navBadge.textContent = 'WA';
          navBadge.style.background = 'rgba(255,255,255,0.08)';
          navBadge.style.color = 'var(--text-muted)';
        }
        if (btnStart) btnStart.textContent = 'Start / Scan QR';
      }
    }

    if (btnToggle) {
      btnToggle.textContent = data.enabled ? 'Alerts: ON' : 'Alerts: OFF';
      btnToggle.style.color = data.enabled ? 'var(--green)' : 'var(--red)';
      btnToggle.style.borderColor = data.enabled ? 'var(--green-border)' : 'var(--red-border)';
    }

    // ── Update Dedicated WhatsApp Page Elements (#page-whatsapp) ──
    const pageStatusText = document.getElementById('waPageStatusText');
    const pageStatusDot = document.getElementById('waPageStatusDot');
    const pageSubStatus = document.getElementById('waPageSubStatus');
    const pageAlertsStatus = document.getElementById('waPageAlertsStatus');
    const pageBtnToggle = document.getElementById('btnToggleWAPage');
    const pageBtnRestart = document.getElementById('btnRestartWAPage');
    const pageQRArea = document.getElementById('waPageQRArea');
    const pageQRImg = document.getElementById('waPageQRImg');
    const pageConnectedCard = document.getElementById('waPageConnectedCard');
    const pageReadyCard = document.getElementById('waPageReadyCard');

    if (pageStatusText) {
      if (data.status === 'CONNECTED') {
        pageStatusText.textContent = 'Active (Linked)';
        pageStatusText.style.color = 'var(--green)';
        if (pageStatusDot) pageStatusDot.className = 'conn-dot connected';
        if (pageSubStatus) pageSubStatus.textContent = 'Bot connected & streaming';
        if (pageQRArea) pageQRArea.style.display = 'none';
        if (pageConnectedCard) pageConnectedCard.style.display = 'block';
        if (pageReadyCard) pageReadyCard.style.display = 'none';
        if (pageBtnRestart) pageBtnRestart.textContent = '🔄 Reconnect';
      } else if (data.status === 'SCAN_QR') {
        pageStatusText.textContent = 'Waiting for QR Scan';
        pageStatusText.style.color = 'var(--yellow)';
        if (pageStatusDot) {
          pageStatusDot.className = 'conn-dot';
          pageStatusDot.style.background = 'var(--yellow)';
        }
        if (pageSubStatus) pageSubStatus.textContent = 'Scan QR code with WhatsApp';
        if (pageQRArea) pageQRArea.style.display = 'block';
        if (pageQRImg && data.qrCode) pageQRImg.src = data.qrCode;
        if (pageConnectedCard) pageConnectedCard.style.display = 'none';
        if (pageReadyCard) pageReadyCard.style.display = 'none';
      } else if (data.status === 'STARTING') {
        pageStatusText.textContent = 'Starting Engine...';
        pageStatusText.style.color = 'var(--blue)';
        if (pageStatusDot) {
          pageStatusDot.className = 'conn-dot';
          pageStatusDot.style.background = 'var(--blue)';
        }
        if (pageSubStatus) pageSubStatus.textContent = 'Launching browser session... Generating QR code';
        if (pageQRArea) pageQRArea.style.display = 'none';
        if (pageConnectedCard) pageConnectedCard.style.display = 'none';
        if (pageReadyCard) pageReadyCard.style.display = 'block';
        if (pageBtnRestart) pageBtnRestart.textContent = '⏳ Starting...';
        const startBtn = document.querySelector('#waPageReadyCard button');
        if (startBtn) {
          startBtn.textContent = '⏳ Launching Session... Please wait';
          startBtn.disabled = true;
          startBtn.style.opacity = '0.7';
        }
      } else {
        pageStatusText.textContent = data.error ? 'Engine Error' : 'Offline';
        pageStatusText.style.color = data.error ? 'var(--red)' : 'var(--text-muted)';
        if (pageStatusDot) pageStatusDot.className = 'conn-dot disconnected';
        if (pageSubStatus) pageSubStatus.textContent = data.error ? data.error.substring(0, 35) + '...' : 'Ready to start session';
        if (pageQRArea) pageQRArea.style.display = 'none';
        if (pageConnectedCard) pageConnectedCard.style.display = 'none';
        if (pageReadyCard) pageReadyCard.style.display = 'block';
        if (pageBtnRestart) pageBtnRestart.textContent = '🚀 Start / Scan QR';
        const startBtn = document.querySelector('#waPageReadyCard button');
        if (startBtn) {
          startBtn.textContent = '🚀 Start WhatsApp Session & Generate QR';
          startBtn.disabled = false;
          startBtn.style.opacity = '1';
        }
      }
    }

    if (pageAlertsStatus) {
      pageAlertsStatus.textContent = data.enabled ? 'ACTIVE' : 'PAUSED';
      pageAlertsStatus.style.color = data.enabled ? 'var(--green)' : 'var(--red)';
    }

    if (pageBtnToggle) {
      pageBtnToggle.textContent = data.enabled ? 'Alerts: ON' : 'Alerts: OFF';
      pageBtnToggle.style.color = data.enabled ? 'var(--green)' : 'var(--red)';
      pageBtnToggle.style.borderColor = data.enabled ? 'var(--green-border)' : 'var(--red-border)';
    }

    if (data.recentLogs) {
      this.renderWALogs(data.recentLogs);
      this.renderWAPageLogs(data.recentLogs);
    }
  },

  renderWhatsAppPage() {
    this.fetchWAStatus();
  },

  renderWAPageLogs(logs) {
    const tbody = document.getElementById('waPageLogBody');
    if (!tbody) return;
    if (!logs || !logs.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 24px;">No WhatsApp notifications dispatched yet</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => {
      const time = new Date(l.timestamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });
      const isOk = l.status === 'DELIVERED' || l.status === 'SENT';
      const isSim = l.status === 'SIMULATED_NOT_CONNECTED';
      const statusBadge = isOk
        ? '<span class="client-status active">✔ Delivered</span>'
        : (isSim ? '<span class="client-status" style="background: rgba(59,130,246,0.12); color: var(--blue); border: 1px solid var(--blue-border);">Simulated</span>' : '<span class="client-status inactive">Failed</span>');

      return `<tr>
        <td style="font-weight: 700; color: var(--text-heading); font-family: 'JetBrains Mono', monospace;">${l.type}</td>
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--text-primary);">${l.recipient}</td>
        <td style="font-size: 11.5px; color: var(--text-secondary); max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${l.preview}</td>
        <td style="text-align: center;">${statusBadge}</td>
        <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted);">${time}</td>
      </tr>`;
    }).join('');
  },

  renderWALogs(logs) {
    const container = document.getElementById('waDeliveryLogs');
    if (!container) return;
    if (!logs || !logs.length) {
      container.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding: 12px;">No delivery logs yet</div>';
      return;
    }

    container.innerHTML = logs.map(l => {
      const time = new Date(l.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const isOk = l.status === 'DELIVERED' || l.status === 'SENT';
      const isSim = l.status === 'SIMULATED_NOT_CONNECTED';
      const statusBadge = isOk
        ? '<span style="color: var(--green); font-weight: 700;">✔ Sent</span>'
        : (isSim ? '<span style="color: var(--blue); font-weight: 700;">Simulated</span>' : '<span style="color: var(--red); font-weight: 700;">Failed</span>');

      return `<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px solid var(--border-primary); font-size: 11px; font-family: 'JetBrains Mono', monospace;">
        <div>
          <span style="font-weight: 700; color: var(--text-heading);">${l.type}</span> &gt;
          <span style="color: var(--text-secondary);">${l.recipient}</span>
          <div style="font-size: 10px; color: var(--text-muted);">${l.preview}</div>
        </div>
        <div style="text-align: right;">
          <div>${statusBadge}</div>
          <div style="font-size: 9.5px; color: var(--text-muted);">${time}</div>
        </div>
      </div>`;
    }).join('');
  },

  appendWALog(entry) {
    this.toast(`WhatsApp: ${entry.type} to ${entry.recipient} (${entry.status})`, 'info');
    this.fetchWAStatus();
  },

  async startWhatsAppSession() {
    this.toast('Initiating WhatsApp automation engine... Please wait a few seconds', 'info');
    try {
      const res = await this.api('/api/whatsapp/start', { method: 'POST' });
      if (res.success) {
        this.toast(res.message || 'Starting session...', 'success');
        this.fetchWAStatus();
      } else {
        this.toast(res.error || 'Failed to start session', 'error');
      }
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async toggleWhatsApp() {
    try {
      const res = await this.api('/api/whatsapp/toggle', { method: 'POST' });
      this.toast(res.message, res.enabled ? 'success' : 'info');
      this.fetchWAStatus();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async sendWATestAlert() {
    const input = document.getElementById('waTestPhone');
    const phone = input?.value.trim();
    if (!phone) {
      this.toast('Please enter a 10-digit mobile number', 'warning');
      return;
    }

    this.toast(`Sending test alert to ${phone}...`, 'info');
    try {
      const res = await this.api('/api/whatsapp/test', {
        method: 'POST',
        body: { phone }
      });
      if (res.success) {
        this.toast(`Test alert sent for ${phone}!`, 'success');
        this.fetchWAStatus();
      } else {
        this.toast(res.reason || res.error || 'Failed to send test alert', 'error');
      }
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async sendWAPageTestAlert() {
    const input = document.getElementById('waPageTestPhone');
    const phone = input?.value.trim();
    if (!phone) {
      this.toast('Please enter a 10-digit mobile number', 'warning');
      return;
    }

    this.toast(`Sending test alert to ${phone}...`, 'info');
    try {
      const res = await this.api('/api/whatsapp/test', {
        method: 'POST',
        body: { phone }
      });
      if (res.success) {
        this.toast(`Test alert sent for ${phone}!`, 'success');
        this.fetchWAStatus();
      } else {
        this.toast(res.reason || res.error || 'Failed to send test alert', 'error');
      }
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  // ═══════════════════════════════════════════════════════
  // ZERODHA KITE CONNECT v3 INTEGRATION
  // ═══════════════════════════════════════════════════════
  openKiteModal() {
    const modal = document.getElementById('kiteModal');
    if (!modal) return;
    modal.classList.add('active');
    this.fetchKiteStatus();
  },

  closeKiteModal() {
    document.getElementById('kiteModal')?.classList.remove('active');
  },

  async fetchKiteStatus() {
    try {
      const data = await this.api('/api/kite/status');
      this.handleKiteStatus(data);
    } catch (err) {
      console.warn('Failed to fetch Kite status:', err);
    }
  },

  handleKiteStatus(data) {
    if (!data) return;
    this.kiteStatus = data;

    // Header badge
    const headerPill = document.getElementById('kiteHeaderBadge');
    const headerText = document.getElementById('kiteHeaderText');
    const headerDot = document.getElementById('kiteDot');
    const navBadge = document.getElementById('kiteNavBadge');

    // Modal elements
    const statusText = document.getElementById('kiteStatusText');
    const statusDot = document.getElementById('kiteStatusDot');
    const traderName = document.getElementById('kiteTraderName');
    const tokensCount = document.getElementById('kiteTokensCount');
    const btnConnect = document.getElementById('btnKiteConnect');
    const btnDisconnect = document.getElementById('btnKiteDisconnect');

    const isLive = data.connected;

    if (headerText) {
      headerText.textContent = isLive ? 'Kite: Live ⚡' : 'Kite: Sim';
      headerText.style.color = isLive ? '#10b981' : '#38bdf8';
    }
    if (headerDot) {
      headerDot.style.background = isLive ? '#10b981' : '#38bdf8';
      headerDot.className = isLive ? 'conn-dot connected' : 'conn-dot';
    }
    if (headerPill) {
      headerPill.style.borderColor = isLive ? 'rgba(16,185,129,0.4)' : 'rgba(56,189,248,0.3)';
      headerPill.style.background = isLive ? 'rgba(16,185,129,0.1)' : 'rgba(56,189,248,0.1)';
    }

    if (navBadge) {
      navBadge.textContent = isLive ? 'LIVE' : 'SIM';
      navBadge.style.background = isLive ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.15)';
      navBadge.style.color = isLive ? '#10b981' : '#38bdf8';
    }

    if (statusText) {
      statusText.textContent = isLive ? 'Connected (Live Zerodha Stream)' : (data.configured ? 'Configured (Session Required)' : 'Simulation Mode (Unconfigured)');
      statusText.style.color = isLive ? '#10b981' : (data.configured ? '#f59e0b' : '#94a3b8');
    }
    if (statusDot) {
      statusDot.className = isLive ? 'conn-dot connected' : 'conn-dot';
      statusDot.style.background = isLive ? '#10b981' : (data.configured ? '#f59e0b' : '#64748b');
    }

    if (traderName) {
      traderName.textContent = data.user || 'None (Simulation)';
    }
    if (tokensCount) {
      tokensCount.textContent = isLive ? `${data.subscribedCount || 0} Instruments Subscribed` : '40 Simulated Instruments';
    }

    if (btnConnect) {
      btnConnect.style.display = isLive ? 'none' : 'inline-flex';
    }
    if (btnDisconnect) {
      btnDisconnect.style.display = isLive ? 'inline-flex' : 'none';
    }
  },

  connectKite() {
    window.location.href = '/api/kite/login';
  },

  async disconnectKite() {
    try {
      const res = await this.api('/api/kite/disconnect', { method: 'POST' });
      if (res && res.success) {
        this.toast('Disconnected from Kite. High-fidelity simulation active.', 'info');
        this.fetchKiteStatus();
      }
    } catch (e) {
      this.toast('Failed to disconnect Kite: ' + e.message, 'error');
    }
  },

  async saveKiteConfig() {
    const apiKey = document.getElementById('inputKiteApiKey')?.value.trim();
    const apiSecret = document.getElementById('inputKiteApiSecret')?.value.trim();

    if (!apiKey || !apiSecret) {
      this.toast('Please enter both Kite API Key and API Secret', 'warning');
      return;
    }

    try {
      const res = await this.api('/api/kite/config', { method: 'POST', body: { apiKey, apiSecret } });
      if (res && res.success) {
        this.toast('Kite credentials saved! Click "Connect Zerodha Kite" to authenticate.', 'success');
        this.fetchKiteStatus();
      }
    } catch (e) {
      this.toast('Error saving Kite credentials: ' + e.message, 'error');
    }
  },

  // ═══════════════════════════════════════════════════════
  // INDIAN STOCK EXCHANGE API2 (RapidAPI: linuz) CONTROLS
  // ═══════════════════════════════════════════════════════
  openIndianApiModal() {
    const modal = document.getElementById('indianApiModal');
    if (!modal) return;
    modal.classList.add('active');
    this.fetchIndianApiStatus();
    this.loadMoversCategory('trending');
    this.loadMarketNews();
  },

  closeIndianApiModal() {
    document.getElementById('indianApiModal')?.classList.remove('active');
  },

  switchIndianApiTab(tabName) {
    const tabs = ['config', 'explorer', 'movers', 'news'];
    tabs.forEach(t => {
      const el = document.getElementById(`indianApiTab-${t}`);
      const btn = document.getElementById(`tabBtnIndian${t.charAt(0).toUpperCase() + t.slice(1)}`);
      if (el) el.style.display = (t === tabName) ? 'block' : 'none';
      if (btn) {
        if (t === tabName) {
          btn.classList.add('active');
          btn.style.color = '#c084fc';
          btn.style.borderBottom = '2px solid #c084fc';
          btn.style.fontWeight = '700';
        } else {
          btn.classList.remove('active');
          btn.style.color = '#94a3b8';
          btn.style.borderBottom = '2px solid transparent';
          btn.style.fontWeight = '600';
        }
      }
    });

    if (tabName === 'explorer' && !this.hasInspectedDefault) {
      this.hasInspectedDefault = true;
      this.inspectStockDetails();
    }
  },

  async fetchIndianApiStatus() {
    try {
      const data = await this.api('/api/indian-api/status');
      this.handleIndianApiStatus(data);
    } catch (err) {
      console.warn('Failed to fetch Indian Stock API status:', err);
    }
  },

  handleIndianApiStatus(data) {
    if (!data) return;
    this.indianApiStatus = data;

    // Header badge
    const headerPill = document.getElementById('indianApiHeaderBadge');
    const headerText = document.getElementById('indianApiHeaderText');
    const headerDot = document.getElementById('indianApiDot');
    const navBadge = document.getElementById('indianApiNavBadge');

    // Modal elements
    const statusText = document.getElementById('indianApiStatusText');
    const statusDot = document.getElementById('indianApiStatusDot');
    const statusSub = document.getElementById('indianApiStatusSub');
    const keyPreview = document.getElementById('indianApiKeyPreview');
    const lastSync = document.getElementById('indianApiLastSync');
    const totalReqs = document.getElementById('indianApiTotalReqs');
    const cacheEntries = document.getElementById('indianApiCacheEntries');
    const checkAutoSync = document.getElementById('checkIndianAutoSync');
    const selectSyncInterval = document.getElementById('selectIndianSyncInterval');
    const inputKey = document.getElementById('inputRapidApiKey');
    const inputHost = document.getElementById('inputRapidApiHost');

    const isLive = data.active && data.configured;

    if (headerText) {
      headerText.textContent = isLive ? 'Indian API: Live ⚡' : 'Indian API: Sim';
      headerText.style.color = isLive ? '#c084fc' : '#94a3b8';
    }
    if (headerDot) {
      headerDot.style.background = isLive ? '#c084fc' : '#64748b';
      headerDot.className = isLive ? 'conn-dot connected' : 'conn-dot';
    }
    if (headerPill) {
      headerPill.style.borderColor = isLive ? 'rgba(168,85,247,0.45)' : 'rgba(255,255,255,0.1)';
      headerPill.style.background = isLive ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)';
    }
    if (navBadge) {
      navBadge.textContent = isLive ? 'LIVE' : 'SIM';
      navBadge.style.background = isLive ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.08)';
      navBadge.style.color = isLive ? '#c084fc' : '#94a3b8';
    }

    if (statusText) {
      statusText.textContent = isLive ? 'Connected & Live (RapidAPI)' : 'Standby / Simulation Mode';
      statusText.style.color = isLive ? '#c084fc' : '#94a3b8';
    }
    if (statusDot) {
      statusDot.style.background = isLive ? '#c084fc' : '#64748b';
    }
    if (statusSub) {
      statusSub.textContent = isLive
        ? `Connected to ${data.apiHost || 'indian-stock-exchange-api2.p.rapidapi.com'}. Quotes flowing into TradeNova engine.`
        : 'RapidAPI key not set. High-fidelity simulation mode active (Zero downtime).';
    }

    if (keyPreview) keyPreview.textContent = data.keyPreview || 'None';
    if (lastSync) lastSync.textContent = data.lastSyncTime || 'Never';
    if (totalReqs) totalReqs.textContent = data.totalRequests || '0';
    if (cacheEntries) cacheEntries.textContent = `${data.cacheEntries || 0} Items`;

    if (checkAutoSync && checkAutoSync !== document.activeElement) {
      checkAutoSync.checked = !!data.autoSyncEnabled;
    }
    if (selectSyncInterval && selectSyncInterval !== document.activeElement) {
      selectSyncInterval.value = String(data.syncIntervalSeconds || 60);
    }
    if (inputHost && !inputHost.value) {
      inputHost.value = data.apiHost || 'indian-stock-exchange-api2.p.rapidapi.com';
    }
  },

  async saveIndianApiConfig() {
    const apiKey = document.getElementById('inputRapidApiKey')?.value.trim();
    const apiHost = document.getElementById('inputRapidApiHost')?.value.trim() || 'indian-stock-exchange-api2.p.rapidapi.com';
    const autoSyncEnabled = document.getElementById('checkIndianAutoSync')?.checked;
    const syncIntervalSeconds = parseInt(document.getElementById('selectIndianSyncInterval')?.value || '60', 10);

    try {
      const res = await this.api('/api/indian-api/config', {
        method: 'POST',
        body: { apiKey, apiHost, autoSyncEnabled, syncIntervalSeconds }
      });
      if (res && res.success) {
        this.toast('Indian Stock Exchange API settings saved successfully!', 'success');
        this.fetchIndianApiStatus();
      }
    } catch (e) {
      this.toast('Failed to save API config: ' + e.message, 'error');
    }
  },

  async testIndianApiConnection() {
    const apiKey = document.getElementById('inputRapidApiKey')?.value.trim();
    this.toast('Testing connection to Indian Stock Exchange API2...', 'info');

    try {
      const res = await this.api('/api/indian-api/test', {
        method: 'POST',
        body: { apiKey }
      });

      if (res && res.success) {
        this.toast(`✔ ${res.message} (${res.latencyMs}ms)`, 'success');
        if (res.sample) {
          this.toast(`Sample Quote: ${res.sample.companyName} ₹${res.sample.price}`, 'info');
        }
        this.fetchIndianApiStatus();
      } else {
        this.toast(`✖ ${res?.message || 'Connection test failed'}`, 'error');
      }
    } catch (e) {
      this.toast('Connection test error: ' + e.message, 'error');
    }
  },

  async syncIndianApiNow() {
    const btn = document.getElementById('btnSyncIndianNow');
    if (btn) btn.textContent = '⏳ Syncing...';

    try {
      const res = await this.api('/api/indian-api/sync-now', { method: 'POST' });
      if (res && res.success) {
        this.toast(`✔ Live sync completed! ${res.result?.updatedCount || 0} Indian stocks refreshed.`, 'success');
        this.fetchIndianApiStatus();
      }
    } catch (e) {
      this.toast('Sync failed: ' + e.message, 'error');
    } finally {
      if (btn) btn.textContent = '🔄 Sync Quotes Now';
    }
  },

  async inspectStockDetails(forcedSymbol) {
    const symInput = document.getElementById('inputStockSearchSymbol');
    const symbol = (forcedSymbol || symInput?.value || 'TATAMOTORS').trim().toUpperCase();
    const container = document.getElementById('stockInspectResult');
    if (!container) return;

    container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 25px 0;">⏳ Ingesting live quote & financials for ${symbol}...</div>`;

    try {
      const data = await this.api(`/api/market/stock/${encodeURIComponent(symbol)}`);
      if (!data) throw new Error('No data received');

      const isUp = (data.change >= 0);
      const color = isUp ? '#10b981' : '#ef4444';
      const arrow = isUp ? '▲' : '▼';

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px; font-weight: 800; color: #fff;">${data.symbol}</span>
              <span style="font-size: 11px; font-weight: 700; background: rgba(59,130,246,0.2); color: #60a5fa; padding: 2px 8px; border-radius: 4px;">${data.exchange || 'NSE'}</span>
              <span style="font-size: 11px; color: #94a3b8;">${data.industry || 'Equities'}</span>
            </div>
            <div style="font-size: 13px; color: #cbd5e1; margin-top: 3px;">${data.companyName}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 800; color: #fff; font-family: monospace;">₹ ${data.price.toFixed(2)}</div>
            <div style="font-size: 13px; font-weight: 700; color: ${color}; margin-top: 2px;">
              ${arrow} ${Math.abs(data.change).toFixed(2)} (${isUp ? '+' : ''}${data.changePct.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;">
          <div style="background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 10.5px; color: #94a3b8;">Day Range</div>
            <div style="font-size: 12.5px; font-weight: 700; color: #e2e8f0; margin-top: 3px;">₹ ${data.low} - ₹ ${data.high}</div>
          </div>
          <div style="background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 10.5px; color: #94a3b8;">52-Week Range</div>
            <div style="font-size: 12.5px; font-weight: 700; color: #c084fc; margin-top: 3px;">₹ ${data.week52Low} - ₹ ${data.week52High}</div>
          </div>
          <div style="background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 10.5px; color: #94a3b8;">Total Volume</div>
            <div style="font-size: 12.5px; font-weight: 700; color: #38bdf8; margin-top: 3px;">${(data.volume || 0).toLocaleString('en-IN')}</div>
          </div>
          <div style="background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 10.5px; color: #94a3b8;">Market Cap & P/E</div>
            <div style="font-size: 12.5px; font-weight: 700; color: #4ade80; margin-top: 3px;">${data.marketCap} (P/E: ${data.pe})</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
          <div style="font-size: 11px; color: #94a3b8;">
            Source: <strong style="color: #c084fc;">Indian Stock Exchange API2</strong> | Updated: ${new Date(data.updatedAt || Date.now()).toLocaleTimeString()}
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-sm" onclick="App.openOrderModal('${data.symbol}', 'buy')" style="background: #10b981; color: #fff; font-weight: 700; border: none; padding: 7px 16px; border-radius: 6px; cursor: pointer;">
              BUY ${data.symbol}
            </button>
            <button type="button" class="btn btn-sm" onclick="App.openOrderModal('${data.symbol}', 'sell')" style="background: #ef4444; color: #fff; font-weight: 700; border: none; padding: 7px 16px; border-radius: 6px; cursor: pointer;">
              SELL ${data.symbol}
            </button>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 20px 0;">Error fetching stock details: ${err.message}</div>`;
    }
  },

  async loadMoversCategory(category) {
    this.currentMoversCategory = category;
    const btns = {
      'trending': 'btnFilterTrending',
      'shockers': 'btnFilterShockers',
      'active_nse': 'btnFilterNSEActive',
      'active_bse': 'btnFilterBSEActive'
    };

    Object.entries(btns).forEach(([cat, id]) => {
      const el = document.getElementById(id);
      if (el) {
        if (cat === category) {
          el.style.background = '#9333ea';
          el.style.color = '#fff';
          el.style.borderColor = 'transparent';
        } else {
          el.style.background = 'rgba(255,255,255,0.05)';
          el.style.color = '#94a3b8';
          el.style.borderColor = 'rgba(255,255,255,0.1)';
        }
      }
    });

    const container = document.getElementById('moversTableContainer');
    if (!container) return;
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 25px 0;">Loading data from Indian Stock Exchange API2...</div>';

    let url = '/api/market/trending';
    if (category === 'shockers') url = '/api/market/shockers';
    if (category === 'active_nse') url = '/api/market/active/NSE';
    if (category === 'active_bse') url = '/api/market/active/BSE';

    try {
      const list = await this.api(url);
      if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px 0;">No items found.</div>';
        return;
      }

      let html = `
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px 8px;">Instrument</th>
              <th style="padding: 10px 8px;">Exchange</th>
              <th style="padding: 10px 8px; text-align: right;">Price (₹)</th>
              <th style="padding: 10px 8px; text-align: right;">Change</th>
              <th style="padding: 10px 8px; text-align: right;">Volume</th>
              <th style="padding: 10px 8px; text-align: center;">Action</th>
            </tr>
          </thead>
          <tbody>
      `;

      list.forEach(item => {
        const isUp = (item.change >= 0);
        const color = isUp ? '#10b981' : '#ef4444';
        const changeSign = isUp ? '+' : '';

        html += `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 10px 8px;" onclick="App.inspectStockDetails('${item.symbol}')">
              <div style="font-weight: 700; color: #fff;">${item.symbol}</div>
              <div style="font-size: 10.5px; color: #94a3b8;">${item.companyName || ''}</div>
            </td>
            <td style="padding: 10px 8px;">
              <span style="font-size: 10px; font-weight: 700; background: rgba(59,130,246,0.15); color: #60a5fa; padding: 2px 6px; border-radius: 4px;">${item.exchange || 'NSE'}</span>
            </td>
            <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #fff; font-family: monospace;">
              ₹ ${(item.price || item.ltp || 0).toFixed(2)}
            </td>
            <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: ${color};">
              ${changeSign}${(item.change || 0).toFixed(2)} (${changeSign}${(item.changePct || 0).toFixed(2)}%)
            </td>
            <td style="padding: 10px 8px; text-align: right; color: #cbd5e1; font-size: 11px;">
              ${(item.volume || 0).toLocaleString('en-IN')}
            </td>
            <td style="padding: 10px 8px; text-align: center;">
              <button type="button" class="btn btn-sm" onclick="App.openOrderModal('${item.symbol}', 'buy')" style="background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); padding: 4px 10px; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 11px;">
                Trade
              </button>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 20px 0;">Error: ${err.message}</div>`;
    }
  },

  refreshMoversList() {
    this.loadMoversCategory(this.currentMoversCategory || 'trending');
  },

  async loadMarketNews() {
    const container = document.getElementById('newsCardsContainer');
    if (!container) return;
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 25px 0;">Fetching headlines from Indian Stock Exchange API2...</div>';

    try {
      const newsList = await this.api('/api/market/news');
      if (!Array.isArray(newsList) || newsList.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px 0;">No current headlines.</div>';
        return;
      }

      let html = '';
      newsList.forEach(news => {
        html += `
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 10.5px; font-weight: 700; background: rgba(168,85,247,0.15); color: #c084fc; padding: 2px 7px; border-radius: 4px;">${news.category || 'Market Flash'}</span>
              <span style="font-size: 11px; color: #94a3b8;">${news.time || ''} • <strong style="color: #cbd5e1;">${news.source || 'NSE'}</strong></span>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; line-height: 1.4;">${news.title}</div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">${news.summary}</div>
          </div>
        `;
      });

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 20px 0;">Failed to load news: ${err.message}</div>`;
    }
  },

  togglePasswordVisibility(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.type = (el.type === 'password') ? 'text' : 'password';
  },

  // ═══════════════════════════════════════════════════════
  // PWA & NATIVE MOBILE APP CONTROLS (Android & iOS)
  // ═══════════════════════════════════════════════════════
  initPWA() {
    this.deferredPrompt = null;
    const banner = document.getElementById('mobileInstallBanner');

    // Check if already launched in standalone PWA / Native mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      console.log('[PWA] Running in native standalone mode.');
      return;
    }

    // Android / Chromium beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const dismissed = localStorage.getItem('tradenova_pwa_dismissed');
      // If not dismissed within last 2 days, show banner on mobile screens (< 900px)
      if (!dismissed || Date.now() - parseInt(dismissed) > 2 * 24 * 60 * 60 * 1000) {
        if (window.innerWidth <= 900 && banner) {
          banner.style.display = 'flex';
        }
      }
    });

    // iOS Safari detection (no beforeinstallprompt event)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !isStandalone) {
      const dismissed = localStorage.getItem('tradenova_pwa_dismissed');
      if (!dismissed || Date.now() - parseInt(dismissed) > 3 * 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          if (banner) banner.style.display = 'flex';
        }, 3000);
      }
    }
  },

  installPwa() {
    this.vibrate(40);
    const banner = document.getElementById('mobileInstallBanner');
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('[PWA] User accepted installation');
          if (banner) banner.style.display = 'none';
        }
        this.deferredPrompt = null;
      });
    } else {
      // iOS or browser without prompt support -> show guided modal
      document.getElementById('iosInstallModal')?.classList.add('active');
      if (banner) banner.style.display = 'none';
    }
  },

  dismissInstallBanner() {
    this.vibrate(30);
    const banner = document.getElementById('mobileInstallBanner');
    if (banner) banner.style.display = 'none';
    localStorage.setItem('tradenova_pwa_dismissed', String(Date.now()));
  },

  vibrate(ms = 40) {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  },

  // ═══════════════════════════════════════════════════════
  // LOGO & BRANDING SETUP (ADMIN PANEL)
  // ═══════════════════════════════════════════════════════
  brandingConfig: null,
  newLogoBase64: null,

  openBrandingModal() {
    const modal = document.getElementById('brandingModal');
    if (!modal) return;
    modal.classList.add('active');
    this.newLogoBase64 = null;
    this.fetchBranding();

    const dropzone = document.getElementById('brandingDropzone');
    if (dropzone && !dropzone._hasDropListener) {
      dropzone._hasDropListener = true;
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = '#00c087';
          dropzone.style.background = 'rgba(0,192,135,0.08)';
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = 'rgba(212,175,55,0.4)';
          dropzone.style.background = 'var(--bg-secondary)';
        });
      });
      dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0) {
          this.handleBrandingFileSelect({ target: { files } });
        }
      });
    }
  },

  // ─── Hash Routing (Direct Links like /#branding, #settings) ─────
  initHashRouting() {
    window.addEventListener('hashchange', () => {
      const hash = (window.location.hash || '').replace('#', '').toLowerCase();
      if (!this.user) return;
      if (['branding', 'settings', 'logo'].includes(hash)) {
        if (['admin', 'broker'].includes(this.user.role)) {
          this.nav('branding');
        }
      } else if (hash && document.getElementById('page-' + hash)) {
        this.nav(hash);
      }
    });
  },

  openBrandingModal() {
    const modal = document.getElementById('brandingModal');
    if (!modal) {
      this.nav('branding');
      return;
    }
    modal.classList.add('active');
    this.newLogoBase64 = null;
    this.fetchBranding();
  },

  closeBrandingModal() {
    document.getElementById('brandingModal')?.classList.remove('active');
  },

  renderBrandingPage() {
    this.fetchBranding();
    const dropzone = document.getElementById('pageBrandingDropzone');
    if (dropzone && !dropzone._hasDropListener) {
      dropzone._hasDropListener = true;
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = '#00c087';
          dropzone.style.background = 'rgba(0,192,135,0.08)';
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = 'rgba(212,175,55,0.45)';
          dropzone.style.background = 'var(--bg-secondary)';
        });
      });
      dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0) {
          this.handleBrandingFileSelect({ target: { files } });
        }
      });
    }
  },

  async fetchBranding() {
    try {
      const data = await this.api('/api/branding');
      if (data) {
        this.brandingConfig = data;
        this.applyBranding(data);
        this.populateBrandingModal(data);
      }
    } catch (err) {
      console.warn('Failed to load branding:', err);
    }
  },

  populateBrandingModal(data) {
    if (!data) return;
    const ids = [
      ['brandingAppName', 'pageBrandingAppName', data.appName || 'TradeNova SN'],
      ['brandingShortName', 'pageBrandingShortName', data.shortName || 'TradeNova'],
      ['brandingTagline', 'pageBrandingTagline', data.tagline || 'Institutional Paper Trading Terminal'],
      ['brandingColor', 'pageBrandingColor', data.primaryColor || '#d4af37'],
    ];

    ids.forEach(([mId, pId, val]) => {
      const mEl = document.getElementById(mId);
      const pEl = document.getElementById(pId);
      if (mEl) mEl.value = val;
      if (pEl) pEl.value = val;
    });

    const col = data.primaryColor || '#d4af37';
    ['brandingColorHex', 'pageBrandingColorHex'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = col;
    });

    const activeLogo = data.logoUrl || '/icons/icon-192.png';
    ['brandingUploadPreview', 'pageBrandingUploadPreview'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.src = activeLogo;
    });

    ['brandingFileName', 'pageBrandingFileName'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = 'Active logo: ' + (data.logoUrl || 'icon-192.png');
    });

    const kpiName = document.getElementById('kpiBrandAppName');
    const kpiShort = document.getElementById('kpiBrandShortName');
    const kpiLogo = document.getElementById('kpiBrandLogoImg');
    if (kpiName) kpiName.textContent = data.appName || 'TradeNova SN';
    if (kpiShort) kpiShort.textContent = 'Short: ' + (data.shortName || 'TradeNova');
    if (kpiLogo) kpiLogo.src = activeLogo;

    this.syncBrandingPreview();
  },

  handleBrandingFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast('Please select an image file (PNG, JPG, SVG, WebP)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawBase64 = e.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 512;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          this.newLogoBase64 = canvas.toDataURL('image/png', 0.95);
        } catch (canvasErr) {
          this.newLogoBase64 = rawBase64;
        }

        ['brandingUploadPreview', 'pageBrandingUploadPreview'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.src = this.newLogoBase64;
        });
        ['brandingFileName', 'pageBrandingFileName'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = `Selected: ${file.name} (Optimized for Web & Mobile)`;
        });
        const kpiLogo = document.getElementById('kpiBrandLogoImg');
        if (kpiLogo) kpiLogo.src = this.newLogoBase64;

        this.syncBrandingPreview();
        this.toast('New logo loaded & optimized! Click "Save & Apply Everywhere" to broadcast.', 'info');
      };
      img.onerror = () => {
        this.newLogoBase64 = rawBase64;
        this.syncBrandingPreview();
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  },

  syncBrandingPreview() {
    const appName = document.getElementById('pageBrandingAppName')?.value || document.getElementById('brandingAppName')?.value || 'TradeNova SN';
    const shortName = document.getElementById('pageBrandingShortName')?.value || document.getElementById('brandingShortName')?.value || 'TradeNova';
    const activeLogo = this.newLogoBase64 || (this.brandingConfig && this.brandingConfig.logoUrl) || '/icons/icon-192.png';

    // 1. Browser Tab Previews
    ['brandingPreviewTabTitle', 'pagePreviewTabTitle'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = appName;
    });
    ['brandingPreviewTabIcon', 'pagePreviewTabIcon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.src = activeLogo;
    });

    // 2. Header & Sidebar Previews
    ['brandingPreviewBrandText', 'pagePreviewBrandText'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = shortName;
    });
    ['brandingPreviewHeaderIcon', 'pagePreviewHeaderIcon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.src = activeLogo;
    });

    // 3. Mobile Previews
    ['brandingPreviewShortName', 'pagePreviewShortName'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = shortName;
    });
    ['brandingPreviewMobileIcon', 'pagePreviewMobileIcon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.src = activeLogo;
    });

    // 4. KPI cards
    const kpiName = document.getElementById('kpiBrandAppName');
    const kpiShort = document.getElementById('kpiBrandShortName');
    if (kpiName) kpiName.textContent = appName;
    if (kpiShort) kpiShort.textContent = 'Short: ' + shortName;
  },

  async saveBranding() {
    const appName = (document.getElementById('pageBrandingAppName')?.value || document.getElementById('brandingAppName')?.value || '').trim();
    const shortName = (document.getElementById('pageBrandingShortName')?.value || document.getElementById('brandingShortName')?.value || '').trim();
    const tagline = (document.getElementById('pageBrandingTagline')?.value || document.getElementById('brandingTagline')?.value || '').trim();
    const primaryColor = document.getElementById('pageBrandingColor')?.value || document.getElementById('brandingColor')?.value || '#d4af37';

    if (!appName) {
      this.toast('Platform Name cannot be empty', 'warning');
      return;
    }

    const payload = {
      appName,
      shortName: shortName || appName,
      tagline,
      primaryColor,
      logoBase64: this.newLogoBase64 || undefined
    };

    const buttons = [
      document.getElementById('btnSaveBranding'),
      document.getElementById('btnPageSaveBranding'),
      document.getElementById('btnPageSaveBrandingBottom')
    ].filter(Boolean);

    buttons.forEach(btn => {
      btn.disabled = true;
      btn.dataset.origText = btn.textContent;
      btn.textContent = '⏳ Saving & Broadcasting...';
    });

    try {
      const res = await this.api('/api/admin/branding', { method: 'POST', body: payload });
      if (res && res.success) {
        this.brandingConfig = res.branding;
        this.newLogoBase64 = null;
        this.applyBranding(res.branding);
        this.toast('Platform logo & branding updated everywhere!', 'success');
        this.closeBrandingModal();
      } else {
        this.toast(res?.error || 'Failed to update branding', 'error');
      }
    } catch (e) {
      this.toast('Error saving branding: ' + e.message, 'error');
    } finally {
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.textContent = btn.dataset.origText || '✔ Save & Apply Everywhere';
      });
    }
  },

  applyBranding(cfg) {
    if (!cfg) return;
    this.brandingConfig = cfg;

    // 1. Update Document Title
    if (cfg.appName) {
      document.title = `${cfg.appName} — Institutional Trading Portal`;
    }

    // 2. Update Browser Favicons with cache-busting timestamp
    const v = cfg.updatedAt || Date.now();
    const favicon = document.querySelector("link[rel='icon']");
    const shortcutIcon = document.querySelector("link[rel='shortcut icon']");
    const appleIcon = document.querySelector("link[rel='apple-touch-icon']");

    if (favicon) favicon.href = `/favicon.png?v=${v}`;
    if (shortcutIcon) shortcutIcon.href = `/favicon.png?v=${v}`;
    if (appleIcon) appleIcon.href = `/apple-touch-icon.png?v=${v}`;

    // 3. Update all Logo Images in the DOM
    document.querySelectorAll('.brand-logo-img, #loginLogoIcon img, #sidebarLogo img, #mobileLogo img').forEach(img => {
      img.src = `/icons/icon-192.png?v=${v}`;
    });

    // 4. Update Brand Name Texts
    const sidebarBrand = document.querySelector('.sidebar-header .brand');
    const mobileBrand = document.querySelector('.mobile-brand .brand-text');
    const loginTitle = document.querySelector('.login-logo h1');

    if (sidebarBrand && cfg.shortName) sidebarBrand.textContent = cfg.shortName;
    if (mobileBrand && cfg.shortName) mobileBrand.textContent = cfg.shortName;
    if (loginTitle && cfg.appName) loginTitle.textContent = cfg.appName;
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
