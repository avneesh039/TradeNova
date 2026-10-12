/**
 * TradeNova Pro Administration Frontend Application
 * Institutional Dark Trading Terminal & Free TradingView Charting Engine
 */

const API_BASE = '/api';

// Current active page
let currentPage = 'dashboard';

// App state cache
let state = {
  admin: null,
  marketWatchData: [],
  actionLedgerData: [],
  clientsData: [],
  tradesData: [],
  pendingOrdersData: [],
  traderFundsData: [],
  userFundsData: [],
  usersData: []
};

// TradingView & Terminal Global State
let soundEnabled = true;
let audioCtx = null;
let activeTvSymbol = 'NSE:NIFTY';
let activeTvScriptName = 'NIFTY 50';
let activeTvInterval = '15';
let activeSplitSymbol = 'NSE:NIFTY';
let activeSplitScriptName = 'NIFTY 50';
let activeSplitInterval = '15';
let mwViewMode = 'table';
let currentTvLots = 1;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupProfileMenu();
  handleRoute();
  window.addEventListener('hashchange', handleRoute);

  // Live IST Market Clock
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // Live market price ticker simulation with glowing tick flashes
  setInterval(simulateMarketTicks, 2200);

  // Global Keyboard Shortcuts (Ctrl+K or '/' to focus search)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault();
      const searchInput = document.getElementById('market-watch-search');
      if (searchInput) {
        if (currentPage !== 'market-watch') {
          window.location.hash = '#market-watch';
        }
        searchInput.focus();
        searchInput.select();
      }
    }
    if (e.key === 'Escape') {
      closeModal('tradingview-modal');
      closeModal('order-pad-modal');
    }
  });
});

// ---------------- Navigation & Routing ----------------

function setupNavigation() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const closeBtn = document.getElementById('sidebar-close');
  const overlay = document.getElementById('sidebar-overlay');
  const drawer = document.getElementById('sidebar-drawer');

  function openSidebar() {
    drawer.classList.add('open');
    overlay.classList.add('active');
  }

  function closeSidebar() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
  }

  toggleBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Nav item click
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
      link.closest('li').classList.add('active');
      closeSidebar();
    });
  });
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  currentPage = hash;

  // Page title mapping to match exact video headings
  const pageTitles = {
    'dashboard': 'ADMIN - DASHBOARD',
    'market-watch': 'MarketWatch',
    'notifications': 'FCM Notifications',
    'action-ledger': 'Action Ledger',
    'active-positions': 'Active Trades Scriptwise',
    'closed-positions': 'Closed Trades Scriptwise',
    'trading-clients': 'Trading Clients',
    'trades': 'Trades',
    'pending-orders': 'Pending Orders',
    'trader-funds': 'Funds Wds',
    'user-funds': 'Funds',
    'users': 'Users',
    'weekly-accounts': 'Weekly Accounts'
  };

  const titleElem = document.getElementById('page-header-title');
  if (titleElem) {
    titleElem.textContent = pageTitles[hash] || 'ADMIN - DASHBOARD';
  }

  // Toggle active view
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${hash}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Highlight menu link
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const parentLi = link.closest('li');
    if (link.getAttribute('data-page') === hash) {
      parentLi.classList.add('active');
    } else {
      parentLi.classList.remove('active');
    }
  });

  // Load specific page data
  switch (hash) {
    case 'dashboard': loadDashboard(); break;
    case 'market-watch': loadMarketWatch(); break;
    case 'notifications': loadNotifications(); break;
    case 'action-ledger': loadActionLedger(); break;
    case 'active-positions': loadActivePositions(); break;
    case 'closed-positions': loadClosedPositions(); break;
    case 'trading-clients': loadTradingClients(); break;
    case 'trades': loadTrades(); break;
    case 'pending-orders': loadPendingOrders(); break;
    case 'trader-funds': loadTraderFunds(); break;
    case 'user-funds': loadUserFunds(); break;
    case 'users': loadUsers(); break;
    case 'weekly-accounts': loadWeeklyAccounts(); break;
  }
}

// ---------------- Profile Dropdown ----------------

function setupProfileMenu() {
  const profileBtn = document.getElementById('user-profile-btn');
  const profileCard = document.getElementById('profile-card');

  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileCard.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!profileCard.contains(e.target) && e.target !== profileBtn) {
      profileCard.classList.remove('show');
    }
  });
}

function logoutSession() {
  alert('You have logged out of TradeNova Admin.');
  window.location.hash = '#dashboard';
}

// ---------------- 1. DASHBOARD ----------------

async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    const data = await res.json();
    state.admin = data.admin;

    // Header info strip
    document.getElementById('admin-renewal-date').textContent = data.admin.renewal_date;
    document.getElementById('admin-clients-count').textContent = `${data.admin.current_clients}/${data.admin.max_clients}`;
    document.getElementById('admin-users-count').textContent = `${data.admin.current_users}/${data.admin.max_users}`;
    document.getElementById('admin-username-label').textContent = data.admin.username;
    document.getElementById('profile-ledger-bal').textContent = data.admin.ledger_balance.toLocaleString();
    document.getElementById('m2m-admin-name').textContent = data.admin.username;

    // M2M table
    const m2mBody = document.getElementById('dashboard-m2m-body');
    m2mBody.innerHTML = '';
    data.metrics.m2mOverview.forEach(row => {
      const tr = document.createElement('tr');
      const plClass = row.profitLoss < 0 ? 'val-red' : (row.profitLoss > 0 ? 'val-green' : '');
      tr.innerHTML = `
        <td><span class="script-pill">${row.id}</span></td>
        <td class="${plClass}">${row.profitLoss.toLocaleString()}</td>
        <td>${row.activeTrades}</td>
        <td>${row.marginUsed.toLocaleString()}</td>
      `;
      m2mBody.appendChild(tr);
    });

    // Turnover cards
    document.getElementById('stat-buy-max').textContent = data.metrics.buyTurnover.max;
    document.getElementById('stat-buy-equity').textContent = data.metrics.buyTurnover.equity;

    document.getElementById('stat-sell-max').textContent = data.metrics.sellTurnover.max;
    document.getElementById('stat-sell-equity').textContent = data.metrics.sellTurnover.equity;

    document.getElementById('stat-total-max').textContent = data.metrics.totalTurnover.max;
    document.getElementById('stat-total-equity').textContent = data.metrics.totalTurnover.equity;

    document.getElementById('stat-users-max').textContent = data.metrics.activeUsers.max;
    document.getElementById('stat-users-equity').textContent = data.metrics.activeUsers.equity;

    document.getElementById('stat-pl-max').textContent = data.metrics.profitLoss.max;
    document.getElementById('stat-pl-equity').textContent = data.metrics.profitLoss.equity;

    document.getElementById('stat-brok-max').textContent = data.metrics.brokerage.max;
    document.getElementById('stat-brok-equity').textContent = data.metrics.brokerage.equity;

    document.getElementById('stat-buycount-max').textContent = data.metrics.activeBuy.max;
    document.getElementById('stat-buycount-equity').textContent = data.metrics.activeBuy.equity;

    document.getElementById('stat-sellcount-max').textContent = data.metrics.activeSell.max;
    document.getElementById('stat-sellcount-equity').textContent = data.metrics.activeSell.equity;
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

// ---------------- 2. MARKET WATCH ----------------

// Active segment filter
let currentSegment = 'ALL';

async function loadMarketWatch() {
  try {
    const res = await fetch(`${API_BASE}/market-watch`);
    const data = await res.json();
    state.marketWatchData = data;
    renderMarketWatchTable(data);
  } catch (err) {
    console.error('Error loading market watch:', err);
  }
}

function setMarketWatchSegment(seg, btn) {
  currentSegment = seg;
  document.querySelectorAll('.seg-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  filterMarketWatch();
}

function renderMarketWatchTable(list) {
  const body = document.getElementById('market-watch-body');
  body.innerHTML = '';
  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.id = `mw-row-${item.script.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const changeClass = item.change >= 0 ? 'val-green' : 'val-red';
    
    // Segment badge color
    let segColor = '#3b82f6';
    if (item.segment === 'MCX') segColor = '#f59e0b';
    if (item.segment === 'Indices') segColor = '#10b981';
    if (item.segment === 'F&O') segColor = '#8b5cf6';

    tr.innerHTML = `
      <td><strong>${item.script}</strong></td>
      <td><span class="badge-tag" style="background:${segColor}22; color:${segColor};">${item.segment}</span></td>
      <td class="mw-bid">${item.bid.toFixed(2)}</td>
      <td class="mw-ask">${item.ask.toFixed(2)}</td>
      <td class="mw-ltp" style="font-weight:700;">${item.ltp.toFixed(2)}</td>
      <td class="${changeClass} mw-change">${item.change > 0 ? '+' : ''}${item.change.toFixed(2)}</td>
      <td>${item.high.toFixed(2)}</td>
      <td>${item.low.toFixed(2)}</td>
      <td style="text-align: center;">
        <div style="display:inline-flex; gap:6px;">
          <button class="btn-buy-quick" onclick="openOrderPadModal('${item.script}', 'BUY')">BUY</button>
          <button class="btn-sell-quick" onclick="openOrderPadModal('${item.script}', 'SELL')">SELL</button>
        </div>
      </td>
    `;
    body.appendChild(tr);
  });
}

// TradingView Symbol Registry
const TV_SYMBOL_MAP = {
  'NIFTY 50': 'NSE:NIFTY',
  'NIFTY_FUT': 'NSE:NIFTY',
  'NIFTY 25100 CE': 'NSE:NIFTY',
  'NIFTY 25100 PE': 'NSE:NIFTY',
  'NIFTY 25200 CE': 'NSE:NIFTY',
  'NIFTY 25000 PE': 'NSE:NIFTY',
  'BANKNIFTY': 'NSE:BANKNIFTY',
  'BANKNIFTY_FUT': 'NSE:BANKNIFTY',
  'BANKNIFTY 51500 CE': 'NSE:BANKNIFTY',
  'BANKNIFTY 51500 PE': 'NSE:BANKNIFTY',
  'FINNIFTY': 'NSE:CNXFINANCE',
  'MIDCPNIFTY': 'NSE:NIFTY',
  'SENSEX': 'BSE:SENSEX',
  'RELIANCE': 'NSE:RELIANCE',
  'HDFCBANK': 'NSE:HDFCBANK',
  'TCS': 'NSE:TCS',
  'INFY': 'NSE:INFY',
  'ICICIBANK': 'NSE:ICICIBANK',
  'SBIN': 'NSE:SBIN',
  'BHARTIARTL': 'NSE:BHARTIARTL',
  'ITC': 'NSE:ITC',
  'LT': 'NSE:LT',
  'GOLD': 'TVC:GOLD',
  'SILVER': 'TVC:SILVER',
  'CRUDEOIL': 'TVC:USOIL',
  'NATURALGAS': 'NYMEX:NG1!'
};

function getTvSymbol(script) {
  if (TV_SYMBOL_MAP[script]) return TV_SYMBOL_MAP[script];
  const clean = script.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.includes('NIFTY')) return 'NSE:NIFTY';
  if (clean.includes('BANK')) return 'NSE:BANKNIFTY';
  return `NSE:${clean}`;
}

function renderMarketWatchTable(list) {
  const body = document.getElementById('market-watch-body');
  if (!body) return;
  body.innerHTML = '';

  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.id = `mw-row-${item.script.replace(/[^a-zA-Z0-9]/g, '_')}`;
    tr.style.cursor = 'pointer';
    tr.onclick = (e) => {
      // If clicking button, don't trigger row selection
      if (e.target.closest('button')) return;
      if (mwViewMode === 'split') {
        loadSplitTradingViewChart(item.script);
      }
    };

    const changeClass = item.change >= 0 ? 'val-green' : 'val-red';
    
    // Segment badge color
    let segColor = '#3b82f6';
    if (item.segment === 'MCX') segColor = '#f59e0b';
    if (item.segment === 'Indices') segColor = '#10b981';
    if (item.segment === 'F&O') segColor = '#8b5cf6';

    tr.innerHTML = `
      <td><strong>${item.script}</strong></td>
      <td><span class="badge-tag" style="background:${segColor}22; color:${segColor};">${item.segment}</span></td>
      <td class="mw-bid">${item.bid.toFixed(2)}</td>
      <td class="mw-ask">${item.ask.toFixed(2)}</td>
      <td class="mw-ltp" style="font-weight:700;">${item.ltp.toFixed(2)}</td>
      <td class="${changeClass} mw-change">${item.change > 0 ? '+' : ''}${item.change.toFixed(2)}</td>
      <td>${item.high.toFixed(2)}</td>
      <td>${item.low.toFixed(2)}</td>
      <td style="text-align: center;">
        <div style="display:inline-flex; gap:5px; align-items:center;">
          <button class="btn-buy-quick" onclick="openOrderPadModal('${item.script}', 'BUY')">BUY</button>
          <button class="btn-sell-quick" onclick="openOrderPadModal('${item.script}', 'SELL')">SELL</button>
          <button class="btn-chart-quick" onclick="openTradingViewModal('${item.script}')" title="Open TradingView Candlestick Chart">
            <i class="fa-solid fa-chart-candlestick"></i> CHART
          </button>
        </div>
      </td>
    `;
    body.appendChild(tr);
  });
}

function filterMarketWatch() {
  const q = (document.getElementById('market-watch-search')?.value || '').toLowerCase().trim();
  let filtered = state.marketWatchData;

  if (currentSegment !== 'ALL') {
    filtered = filtered.filter(s => s.segment === currentSegment);
  }

  if (q) {
    filtered = filtered.filter(s => 
      s.script.toLowerCase().includes(q) || s.segment.toLowerCase().includes(q)
    );
  }

  renderMarketWatchTable(filtered);
}

// ---------------- TRADINGVIEW PRO CHART LOGIC ----------------

function renderTvChart(containerId, tvSymbol, interval = '15') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (typeof TradingView !== 'undefined' && TradingView.widget) {
    new TradingView.widget({
      "autosize": true,
      "symbol": tvSymbol,
      "interval": interval,
      "timezone": "Asia/Kolkata",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#09101e",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "container_id": containerId,
      "hide_side_toolbar": false,
      "withdateranges": true,
      "save_image": true,
      "studies": [
        "RSI@tv-basicstudies",
        "MASimple@tv-basicstudies",
        "Volume@tv-basicstudies"
      ]
    });
  } else {
    // Fallback if external tv.js is loading: render TradingView embed iframe
    container.innerHTML = `
      <iframe src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(tvSymbol)}&interval=${interval}&theme=dark&style=1&timezone=Asia%2FKolkata&studies=%5B%22RSI%40tv-basicstudies%22%2C%22MASimple%40tv-basicstudies%22%5D" 
              style="width:100%; height:100%; border:none;" 
              allowtransparency="true" 
              scrolling="no">
      </iframe>
    `;
  }
}

function renderTvTechnicalAnalysis(containerId, tvSymbol) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <iframe src="https://s.tradingview.com/embed-widget/technical-analysis/?locale=en#%7B%22interval%22%3A%2215m%22%2C%22width%22%3A%22100%25%22%2C%22isTransparent%22%3Atrue%2C%22height%22%3A%22100%25%22%2C%22symbol%22%3A%22${encodeURIComponent(tvSymbol)}%22%2C%22showIntervalTabs%22%3Atrue%2C%22displayMode%22%3A%22single%22%2C%22colorTheme%22%3A%22dark%22%7D"
            style="width:100%; height:100%; border:none;"
            allowtransparency="true"
            scrolling="no">
    </iframe>
  `;
}

function openTradingViewModal(scriptSymbol, scriptName) {
  let tvSymbol = scriptSymbol;
  let displayName = scriptName || scriptSymbol;

  // Check if it's already a TradingView ticker or a script name from Market Watch
  if (!scriptSymbol.includes(':')) {
    tvSymbol = getTvSymbol(scriptSymbol);
    displayName = scriptSymbol;
  }

  activeTvSymbol = tvSymbol;
  activeTvScriptName = displayName;

  // Set selector dropdown value
  const select = document.getElementById('tv-modal-symbol-select');
  if (select) {
    let found = false;
    for (let opt of select.options) {
      if (opt.value === tvSymbol) {
        select.value = tvSymbol;
        found = true;
        break;
      }
    }
    if (!found) {
      const newOpt = document.createElement('option');
      newOpt.value = tvSymbol;
      newOpt.textContent = displayName;
      select.appendChild(newOpt);
      select.value = tvSymbol;
    }
  }

  // Update LTP badge
  const scriptObj = (state.marketWatchData || []).find(s => s.script === displayName);
  const ltpBadge = document.getElementById('tv-modal-ltp-badge');
  if (ltpBadge) {
    if (scriptObj) {
      const changeClass = scriptObj.change >= 0 ? 'val-green' : 'val-red';
      ltpBadge.className = `mw-chart-ltp-badge ${changeClass}`;
      ltpBadge.textContent = `₹${scriptObj.ltp.toFixed(2)} (${scriptObj.change > 0 ? '+' : ''}${scriptObj.change.toFixed(2)})`;
    } else {
      ltpBadge.className = 'mw-chart-ltp-badge val-green';
      ltpBadge.textContent = displayName;
    }
  }

  openModal('tradingview-modal');

  // Render chart inside modal
  setTimeout(() => {
    renderTvChart('tv-modal-chart-container', activeTvSymbol, activeTvInterval);
    renderTvTechnicalAnalysis('tv-tech-analysis-container', activeTvSymbol);
  }, 100);
}

function onTvModalSymbolSelectChange(newSymbol) {
  activeTvSymbol = newSymbol;
  const select = document.getElementById('tv-modal-symbol-select');
  activeTvScriptName = select ? select.options[select.selectedIndex].text : newSymbol;

  renderTvChart('tv-modal-chart-container', activeTvSymbol, activeTvInterval);
  renderTvTechnicalAnalysis('tv-tech-analysis-container', activeTvSymbol);
}

function changeTvModalTimeframe(interval) {
  activeTvInterval = interval;
  document.querySelectorAll('#tradingview-modal .btn-tf').forEach(b => {
    b.classList.remove('active');
    if (b.textContent.trim().toLowerCase() === (interval === '60' ? '1h' : (interval === 'D' ? '1d' : (interval === 'W' ? '1w' : `${interval}m`)))) {
      b.classList.add('active');
    }
  });
  renderTvChart('tv-modal-chart-container', activeTvSymbol, activeTvInterval);
}

function orderFromTvModal(action) {
  const scriptSymbol = activeTvScriptName.split(' ')[0] || 'NIFTY 50';
  openOrderPadModal(scriptSymbol, action);
}

function setTvQuickLots(lots) {
  currentTvLots = lots;
  const label = document.getElementById('tv-quick-lots-label');
  if (label) {
    label.textContent = `${lots} Lot${lots > 1 ? 's' : ''} (${lots * 25} Qty)`;
  }
}

// Split View Mode Management
function setMwViewMode(mode) {
  mwViewMode = mode;
  const splitWrapper = document.getElementById('mw-split-wrapper');
  const chartCard = document.getElementById('mw-split-chart-card');
  const btnTable = document.getElementById('btn-mode-table');
  const btnSplit = document.getElementById('btn-mode-split');

  if (mode === 'split') {
    splitWrapper?.classList.add('split-mode');
    if (chartCard) chartCard.style.display = 'flex';
    btnTable?.classList.remove('active');
    btnSplit?.classList.add('active');

    loadSplitTradingViewChart(activeSplitScriptName);
  } else {
    splitWrapper?.classList.remove('split-mode');
    if (chartCard) chartCard.style.display = 'none';
    btnTable?.classList.add('active');
    btnSplit?.classList.remove('active');
  }
}

function loadSplitTradingViewChart(scriptName) {
  activeSplitScriptName = scriptName;
  activeSplitSymbol = getTvSymbol(scriptName);

  const titleElem = document.getElementById('mw-active-symbol-title');
  if (titleElem) titleElem.textContent = scriptName;

  const scriptObj = (state.marketWatchData || []).find(s => s.script === scriptName);
  const badgeElem = document.getElementById('mw-active-ltp-badge');
  if (badgeElem && scriptObj) {
    const changeClass = scriptObj.change >= 0 ? 'val-green' : 'val-red';
    badgeElem.className = `mw-chart-ltp-badge ${changeClass}`;
    badgeElem.textContent = `₹${scriptObj.ltp.toFixed(2)} (${scriptObj.change > 0 ? '+' : ''}${scriptObj.change.toFixed(2)})`;
  }

  renderTvChart('mw-split-chart-container', activeSplitSymbol, activeSplitInterval);
}

function changeSplitTimeframe(interval) {
  activeSplitInterval = interval;
  document.querySelectorAll('#mw-split-chart-card .btn-tf').forEach(b => {
    b.classList.remove('active');
    if (b.textContent.trim().toLowerCase() === (interval === '60' ? '1h' : (interval === 'D' ? '1d' : `${interval}m`))) {
      b.classList.add('active');
    }
  });
  renderTvChart('mw-split-chart-container', activeSplitSymbol, activeSplitInterval);
}

function quickTradeActiveSymbol(action) {
  openOrderPadModal(activeSplitScriptName, action);
}

function maximizeCurrentChart() {
  openTradingViewModal(activeSplitSymbol, activeSplitScriptName);
}

// ---------------- 1-CLICK ORDER PAD SYSTEM ----------------

function openOrderPadModal(scriptSymbol, action = 'BUY') {
  const scriptObj = (state.marketWatchData || []).find(s => s.script === scriptSymbol) || {
    script: scriptSymbol,
    segment: 'Equity',
    ltp: 25142.50,
    change: 84.30,
    lot_size: 25
  };

  const isBuy = action === 'BUY';
  const headerElem = document.getElementById('order-pad-header');
  headerElem.className = `order-pad-header ${isBuy ? 'buy' : 'sell'}`;

  document.getElementById('op-action').value = action;
  document.getElementById('op-script').value = scriptObj.script;
  document.getElementById('op-segment').value = scriptObj.segment;
  document.getElementById('op-lotsize').value = scriptObj.lot_size || 1;

  document.getElementById('op-script-title').textContent = `${action} ${scriptObj.script}`;
  document.getElementById('op-exchange-info').innerHTML = `${scriptObj.segment} · ₹${scriptObj.ltp.toFixed(2)} · <span id="op-change-info" class="${scriptObj.change >= 0 ? 'val-green' : 'val-red'}">${scriptObj.change > 0 ? '+' : ''}${scriptObj.change.toFixed(2)}</span>`;

  document.getElementById('op-price-input').value = scriptObj.ltp.toFixed(2);

  // Default lot size
  const lotSize = scriptObj.lot_size || 1;
  document.getElementById('op-qty-input').value = lotSize;
  document.getElementById('op-lot-hint').textContent = `1 Lot = ${lotSize} Qty`;

  // Submit button
  const submitBtn = document.getElementById('op-submit-btn');
  submitBtn.textContent = `${action} ${scriptObj.script}`;
  submitBtn.style.background = isBuy ? '#2563eb' : '#e11d48';

  updateMarginCalc();
  openModal('order-pad-modal');
}

function adjustOpLots(multiplier) {
  const lotSize = parseInt(document.getElementById('op-lotsize').value || 1, 10);
  const qtyInput = document.getElementById('op-qty-input');
  qtyInput.value = lotSize * multiplier;
  updateMarginCalc();
}

function toggleOrderVariety() {
  const variety = document.querySelector('input[name="order_variety"]:checked')?.value || 'MARKET';
  const priceInput = document.getElementById('op-price-input');
  priceInput.disabled = (variety === 'MARKET');
}

function updateMarginCalc() {
  const qty = parseFloat(document.getElementById('op-qty-input')?.value || 1);
  const price = parseFloat(document.getElementById('op-price-input')?.value || 0);
  const prodType = document.querySelector('input[name="product_type"]:checked')?.value || 'MIS';

  // Leverage: Intraday MIS requires ~20% margin (5x), CNC/Overnight ~100%
  const leverageRatio = prodType === 'MIS' ? 0.20 : 1.0;
  const margin = (qty * price * leverageRatio);

  const marginElem = document.getElementById('op-margin-req');
  if (marginElem) {
    marginElem.textContent = `₹${margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

async function handleOrderPadSubmit(e) {
  e.preventDefault();
  const action = document.getElementById('op-action').value;
  const script = document.getElementById('op-script').value;
  const segment = document.getElementById('op-segment').value;
  const qty = parseInt(document.getElementById('op-qty-input').value, 10);
  const price = parseFloat(document.getElementById('op-price-input').value);
  const client = document.getElementById('op-client-select').value;
  const isBuy = action === 'BUY';

  const payload = {
    script: script,
    segment: segment,
    user_id: client,
    buy_rate: isBuy ? price : 0,
    sell_rate: !isBuy ? price : 0,
    lots_units: `${qty} Units`,
    units: qty
  };

  try {
    const res = await fetch(`${API_BASE}/trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('order-pad-modal');
      closeModal('tradingview-modal');
      playTradeChime(action);
      showToast(`Order Executed! ${action} ${qty} Qty of ${script} @ ₹${price.toFixed(2)}`, action);

      // Refresh screens
      if (currentPage === 'trades') loadTrades();
      if (currentPage === 'active-positions') loadActivePositions();
      if (currentPage === 'action-ledger') loadActionLedger();
      if (currentPage === 'dashboard') loadDashboard();
    } else {
      const err = await res.json();
      alert(`Order Failed: ${err.error}`);
    }
  } catch (err) {
    console.error('Error executing trade from order pad:', err);
  }
}

function showToast(msg) {
  const toast = document.getElementById('trade-toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

// ---------------- REAL INDIAN MARKET TICK SIMULATION ----------------

function simulateMarketTicks() {
  if (currentPage !== 'market-watch' && currentPage !== 'dashboard' && currentPage !== 'active-positions') return;
  if (!state.marketWatchData || state.marketWatchData.length === 0) return;

  // Pick 2 random scripts and fluctuate with real market tick sizes
  for (let i = 0; i < 2; i++) {
    const randomIdx = Math.floor(Math.random() * state.marketWatchData.length);
    const script = state.marketWatchData[randomIdx];
    
    // Scale tick based on asset price (e.g. Nifty = 0.5 - 2.5 pts, Stock = 0.05 - 0.50 pts)
    const tickMultiplier = script.ltp > 20000 ? 1.5 : (script.ltp > 1000 ? 0.4 : 0.1);
    const delta = (Math.random() * 2 - 1) * tickMultiplier;
    
    script.ltp = parseFloat(Math.max(1, script.ltp + delta).toFixed(2));
    script.bid = parseFloat((script.ltp - 0.1).toFixed(2));
    script.ask = parseFloat((script.ltp + 0.1).toFixed(2));

    const safeId = `mw-row-${script.script.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const row = document.getElementById(safeId);
    if (row) {
      const bidElem = row.querySelector('.mw-bid');
      const askElem = row.querySelector('.mw-ask');
      const ltpElem = row.querySelector('.mw-ltp');
      if (bidElem) bidElem.textContent = script.bid.toFixed(2);
      if (askElem) askElem.textContent = script.ask.toFixed(2);
      if (ltpElem) {
        ltpElem.textContent = script.ltp.toFixed(2);
        ltpElem.style.color = delta >= 0 ? '#4ade80' : '#f87171';
        setTimeout(() => { ltpElem.style.color = ''; }, 600);
      }
    }
  }
}

// ---------------- 3. NOTIFICATIONS ----------------

async function loadNotifications() {
  try {
    const res = await fetch(`${API_BASE}/notifications`);
    const data = await res.json();
    const body = document.getElementById('notifications-body');
    if (!data || data.length === 0) {
      body.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #94a3b8; padding: 20px;">No results found</td></tr>`;
      return;
    }
    body.innerHTML = '';
    data.forEach(n => {
      body.innerHTML += `
        <tr>
          <td>${n.message}</td>
          <td>${n.delivered_at}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
}

// ---------------- 4. ACTION LEDGER ----------------

async function loadActionLedger(search = '') {
  try {
    const url = search ? `${API_BASE}/action-ledger?search=${encodeURIComponent(search)}` : `${API_BASE}/action-ledger`;
    const res = await fetch(url);
    const data = await res.json();
    state.actionLedgerData = data.items;

    document.getElementById('action-ledger-counter').textContent = data.showing;
    const body = document.getElementById('action-ledger-body');
    body.innerHTML = '';

    data.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: #93c5fd; font-family: monospace; font-size: 11px;">${item.message}</td>
        <td style="color: #94a3b8; font-size: 11px;">${item.created_at}</td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading action ledger:', err);
  }
}

function filterActionLedger() {
  const val = document.getElementById('action-ledger-search-input').value;
  loadActionLedger(val);
}

function resetActionLedger() {
  document.getElementById('action-ledger-search-input').value = '';
  loadActionLedger('');
}

// ---------------- 5. ACTIVE POSITIONS ----------------

async function loadActivePositions() {
  try {
    const res = await fetch(`${API_BASE}/active-positions`);
    const data = await res.json();
    const body = document.getElementById('active-positions-body');
    body.innerHTML = '';

    data.forEach(item => {
      const tr = document.createElement('tr');
      const m2mClass = item.m2m < 0 ? 'val-red' : (item.m2m > 0 ? 'val-green' : '');
      tr.innerHTML = `
        <td><span class="script-pill">${item.script}</span></td>
        <td>${item.activeBuy}</td>
        <td>${item.activeSell}</td>
        <td>${item.avgBuyRate}</td>
        <td>${item.avgSellRate}</td>
        <td>${item.total}</td>
        <td>${item.net}</td>
        <td class="${m2mClass}">${item.m2m.toLocaleString()}</td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading active positions:', err);
  }
}

// ---------------- 6. CLOSED POSITIONS ----------------

async function loadClosedPositions() {
  try {
    const res = await fetch(`${API_BASE}/closed-positions`);
    const data = await res.json();
    const body = document.getElementById('closed-positions-body');
    body.innerHTML = '';

    data.forEach(item => {
      const tr = document.createElement('tr');
      const plClass = item.profitLoss < 0 ? 'val-red' : (item.profitLoss > 0 ? 'val-green' : '');
      const netClass = item.netPl < 0 ? 'val-red' : (item.netPl > 0 ? 'val-green' : '');
      tr.innerHTML = `
        <td><span class="script-pill">${item.script}</span></td>
        <td>${item.lots}</td>
        <td>${item.avgBuyRate}</td>
        <td>${item.avgSellRate}</td>
        <td class="${plClass}">${item.profitLoss.toLocaleString()}</td>
        <td>${item.brokerage.toLocaleString()}</td>
        <td class="${netClass}">${item.netPl.toLocaleString()}</td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading closed positions:', err);
  }
}

// ---------------- 7. TRADING CLIENTS ----------------

async function loadTradingClients(filterParams = {}) {
  try {
    const query = new URLSearchParams(filterParams).toString();
    const res = await fetch(`${API_BASE}/clients?${query}`);
    const data = await res.json();
    state.clientsData = data.items;

    document.getElementById('clients-counter-label').textContent = data.showing;
    const body = document.getElementById('trading-clients-body');
    body.innerHTML = '';

    data.items.forEach((c, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" title="View Details" onclick="viewClientDetails(${c.id})"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon" title="Edit Client" onclick="editClient(${c.id})"><i class="fa-solid fa-pencil"></i></button>
            <button class="btn-icon" title="Add Funds" onclick="openClientFundQuickModal(${c.id})"><i class="fa-solid fa-dollar-sign"></i></button>
          </div>
        </td>
        <td>${c.id}</td>
        <td><strong>${c.name}</strong></td>
        <td>${c.username}</td>
        <td>${c.credit_limit}</td>
        <td>${c.ledger_balance.toLocaleString()}</td>
        <td>${c.gross_pl || '(not set)'}</td>
        <td>${c.brokerage || '(not set)'}</td>
        <td>${c.net_pl}</td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading trading clients:', err);
  }
}

function filterClients() {
  const params = {
    id: document.getElementById('client-filter-id').value,
    name: document.getElementById('client-filter-name').value,
    username: document.getElementById('client-filter-user').value,
    demo_account: document.getElementById('client-filter-demo').value,
    account_status: document.getElementById('client-filter-status').value
  };
  loadTradingClients(params);
}

function resetClientFilters() {
  document.getElementById('client-filter-id').value = '';
  document.getElementById('client-filter-name').value = '';
  document.getElementById('client-filter-user').value = '';
  document.getElementById('client-filter-demo').value = 'ALL';
  document.getElementById('client-filter-status').value = 'ALL';
  loadTradingClients();
}

// Client Detail Drawer
async function viewClientDetails(id) {
  try {
    const res = await fetch(`${API_BASE}/clients/${id}`);
    const client = await res.json();

    document.getElementById('client-detail-title').textContent = `Trader - ${client.username}`;
    document.getElementById('client-detail-edit-btn').onclick = () => {
      closeModal('client-details-modal');
      editClient(client.id);
    };

    // Funds history
    const fundsBody = document.getElementById('client-funds-history-body');
    fundsBody.innerHTML = '';
    (client.fundsHistory || []).forEach(f => {
      fundsBody.innerHTML += `
        <tr>
          <td>${f.amount.toLocaleString()}</td>
          <td>${f.created_at}</td>
          <td>${f.notes}</td>
        </tr>
      `;
    });

    // Active trades
    const tradesBody = document.getElementById('client-active-trades-body');
    tradesBody.innerHTML = '';
    (client.activeTrades || []).forEach(t => {
      tradesBody.innerHTML += `
        <tr>
          <td><span class="script-pill">${t.script}</span></td>
          <td>${t.activeBuy}</td>
          <td>${t.activeSell}</td>
          <td>${t.avgBuyRate}</td>
          <td>${t.avgSellRate}</td>
          <td>${t.net}</td>
          <td>${t.m2m}</td>
        </tr>
      `;
    });

    openModal('client-details-modal');
  } catch (err) {
    console.error('Error viewing client details:', err);
  }
}

function openCreateClientModal() {
  document.getElementById('client-form-modal-title').textContent = 'CREATE TRADING CLIENT';
  document.getElementById('trading-client-form').reset();
  document.getElementById('form-client-id').value = '';
  openModal('client-form-modal');
}

async function editClient(id) {
  const client = state.clientsData.find(c => c.id === id);
  if (!client) return;

  document.getElementById('client-form-modal-title').textContent = `UPDATE TRADING CLIENT: ${client.username} (${client.id})`;
  document.getElementById('form-client-id').value = client.id;
  document.getElementById('form-client-name').value = client.name;
  document.getElementById('form-client-mobile').value = client.mobile || '';
  document.getElementById('form-client-username').value = client.username;
  document.getElementById('form-client-credit-limit').value = client.credit_limit;
  document.getElementById('form-client-city').value = client.city || '';
  document.getElementById('form-client-block-time').value = client.trade_block_time || 0;
  document.getElementById('form-client-ledger-bal').value = client.ledger_balance;
  document.getElementById('form-client-account-status').value = client.account_status;

  if (client.config) {
    document.getElementById('cfg-demo').checked = !!client.config.demoAccount;
    document.getElementById('cfg-autoclose-limit').checked = !!client.config.autoCloseTradesExceedConfigured;
    document.getElementById('cfg-autoclose-overnight').checked = !!client.config.autoCloseInsufficientOvernight;
    document.getElementById('cfg-equity-units').checked = !!client.config.tradeEquityUnitsInsteadLots;
    document.getElementById('cfg-autoclose-pct').value = client.config.autoClosePercent || 90;
    document.getElementById('cfg-notify-pct').value = client.config.notifyLossPercent || 70;
  }

  openModal('client-form-modal');
}

async function handleClientFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('form-client-id').value;

  const payload = {
    name: document.getElementById('form-client-name').value,
    mobile: document.getElementById('form-client-mobile').value,
    username: document.getElementById('form-client-username').value,
    credit_limit: parseFloat(document.getElementById('form-client-credit-limit').value || 0),
    city: document.getElementById('form-client-city').value,
    trade_block_time: parseInt(document.getElementById('form-client-block-time').value || 0, 10),
    ledger_balance: parseFloat(document.getElementById('form-client-ledger-bal').value || 0),
    account_status: document.getElementById('form-client-account-status').value,
    broker_id: parseInt(document.getElementById('form-client-broker-id').value, 10),
    config: {
      demoAccount: document.getElementById('cfg-demo').checked,
      autoCloseTradesExceedConfigured: document.getElementById('cfg-autoclose-limit').checked,
      autoCloseInsufficientOvernight: document.getElementById('cfg-autoclose-overnight').checked,
      tradeEquityUnitsInsteadLots: document.getElementById('cfg-equity-units').checked,
      autoClosePercent: parseInt(document.getElementById('cfg-autoclose-pct').value || 90, 10),
      notifyLossPercent: parseInt(document.getElementById('cfg-notify-pct').value || 70, 10)
    }
  };

  try {
    const url = id ? `${API_BASE}/clients/${id}` : `${API_BASE}/clients`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('client-form-modal');
      loadTradingClients();
      loadDashboard();
      alert(`Client ${id ? 'updated' : 'created'} successfully!`);
    } else {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
  } catch (err) {
    console.error('Error submitting client form:', err);
  }
}

function openClientFundQuickModal(id) {
  const client = state.clientsData.find(c => c.id === id);
  if (!client) return;
  document.getElementById('fund-user-id').value = client.username;
  document.getElementById('fund-amount').value = '';
  document.getElementById('fund-notes').value = 'Deposit';
  openModal('create-trader-fund-modal');
}

// ---------------- 8. TRADES ----------------

async function loadTrades(filterParams = {}) {
  try {
    const query = new URLSearchParams(filterParams).toString();
    const res = await fetch(`${API_BASE}/trades?${query}`);
    const data = await res.json();
    state.tradesData = data.items;

    document.getElementById('trades-counter-label').textContent = data.showing;
    const body = document.getElementById('trades-body');
    body.innerHTML = '';

    data.items.forEach((t, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" title="View"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon" title="Edit"><i class="fa-solid fa-pencil"></i></button>
          </div>
        </td>
        <td>${t.id}</td>
        <td><span class="script-pill">${t.script}</span></td>
        <td>${t.segment}</td>
        <td>${t.user_id}</td>
        <td>${t.buy_rate}</td>
        <td>${t.sell_rate}</td>
        <td>${t.lots_units}</td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading trades:', err);
  }
}

function filterTrades() {
  const params = {
    id: document.getElementById('trade-filter-id').value,
    script: document.getElementById('trade-filter-script').value,
    segment: document.getElementById('trade-filter-segment').value,
    user_id: document.getElementById('trade-filter-user').value
  };
  loadTrades(params);
}

function resetTrades() {
  document.getElementById('trade-filter-id').value = '';
  document.getElementById('trade-filter-script').value = '';
  document.getElementById('trade-filter-segment').value = '';
  document.getElementById('trade-filter-user').value = '';
  loadTrades();
}

async function handleCreateTradeSubmit(e) {
  e.preventDefault();
  const payload = {
    script: document.getElementById('trade-script-input').value,
    segment: document.getElementById('trade-segment-input').value,
    user_id: document.getElementById('trade-user-input').value,
    buy_rate: parseFloat(document.getElementById('trade-buy-rate').value || 0),
    sell_rate: parseFloat(document.getElementById('trade-sell-rate').value || 0),
    lots_units: document.getElementById('trade-lots-input').value
  };

  try {
    const res = await fetch(`${API_BASE}/trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('create-trade-modal');
      loadTrades();
      alert('Trade executed successfully!');
    }
  } catch (err) {
    console.error('Error executing trade:', err);
  }
}

// ---------------- 9. PENDING ORDERS ----------------

async function loadPendingOrders() {
  try {
    const res = await fetch(`${API_BASE}/pending-orders`);
    const data = await res.json();
    state.pendingOrdersData = data.items;

    document.getElementById('pending-counter-label').textContent = data.showing;
    const body = document.getElementById('pending-orders-body');
    body.innerHTML = '';

    data.items.forEach((o, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>
          <div class="row-actions">
            <button class="btn-icon delete" title="Delete Order" onclick="openDeleteOrderModal(${o.id})"><i class="fa-solid fa-trash"></i></button>
            <button class="btn-icon" title="View Order" onclick="openDeleteOrderModal(${o.id})"><i class="fa-solid fa-eye"></i></button>
          </div>
        </td>
        <td>${o.id}</td>
        <td><span class="script-pill">${o.commodity}</span></td>
        <td>${o.user_id}</td>
        <td class="${o.trade === 'BUY' ? 'val-green' : 'val-red'}"><strong>${o.trade}</strong></td>
        <td>${o.rate}</td>
        <td>${o.lots}</td>
        <td>${o.condition}</td>
        <td><span class="badge-tag badge-active">${o.status}</span></td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading pending orders:', err);
  }
}

function openDeleteOrderModal(id) {
  const order = state.pendingOrdersData.find(o => o.id === id);
  if (!order) return;

  const body = document.getElementById('delete-order-details-body');
  body.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; font-size:13px;">
      <div><strong>Order ID:</strong> ${order.id}</div>
      <div><strong>Commodity:</strong> ${order.commodity}</div>
      <div><strong>User:</strong> ${order.user_id}</div>
      <div><strong>Action:</strong> ${order.trade}</div>
      <div><strong>Rate:</strong> ${order.rate}</div>
      <div><strong>Lots:</strong> ${order.lots}</div>
      <div><strong>Condition:</strong> ${order.condition}</div>
      <div><strong>Status:</strong> ${order.status}</div>
      <div><strong>Created At:</strong> ${order.created_at}</div>
    </div>
  `;

  document.getElementById('confirm-delete-order-btn').onclick = async () => {
    try {
      const res = await fetch(`${API_BASE}/pending-orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        closeModal('delete-order-modal');
        loadPendingOrders();
        alert('Order deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  openModal('delete-order-modal');
}

async function handleCreatePendingSubmit(e) {
  e.preventDefault();
  const payload = {
    commodity: document.getElementById('pending-commodity').value,
    user_id: document.getElementById('pending-user').value,
    trade: document.getElementById('pending-trade-type').value,
    rate: parseFloat(document.getElementById('pending-rate').value),
    lots: parseInt(document.getElementById('pending-lots').value || 1, 10),
    condition: document.getElementById('pending-condition').value
  };

  try {
    const res = await fetch(`${API_BASE}/pending-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('create-pending-modal');
      loadPendingOrders();
      alert('Pending order placed successfully!');
    }
  } catch (err) {
    console.error('Error creating pending order:', err);
  }
}

// ---------------- 10. TRADER FUNDS ----------------

async function loadTraderFunds(filterParams = {}) {
  try {
    const query = new URLSearchParams(filterParams).toString();
    const res = await fetch(`${API_BASE}/trader-funds?${query}`);
    const data = await res.json();
    state.traderFundsData = data.items;

    document.getElementById('trader-funds-counter').textContent = data.showing;
    const body = document.getElementById('trader-funds-body');
    body.innerHTML = '';

    data.items.forEach((f, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${f.id}</td>
        <td><strong>${f.username}</strong></td>
        <td>${f.username}</td>
        <td class="val-green">${f.amount.toLocaleString()}</td>
        <td>${f.notes}</td>
        <td>${f.created_at}</td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading trader funds:', err);
  }
}

function filterTraderFunds() {
  const params = {
    user_id: document.getElementById('trader-fund-user').value
  };
  loadTraderFunds(params);
}

function resetTraderFunds() {
  document.getElementById('trader-fund-user').value = '';
  document.getElementById('trader-fund-amt').value = '';
  loadTraderFunds();
}

async function handleTraderFundSubmit(e) {
  e.preventDefault();
  const payload = {
    user_id: document.getElementById('fund-user-id').value,
    amount: parseFloat(document.getElementById('fund-amount').value),
    notes: document.getElementById('fund-notes').value
  };

  try {
    const res = await fetch(`${API_BASE}/trader-funds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('create-trader-fund-modal');
      loadTraderFunds();
      alert('Trader fund recorded successfully!');
    }
  } catch (err) {
    console.error('Error creating trader fund:', err);
  }
}

// ---------------- 11. USER FUNDS ----------------

async function loadUserFunds() {
  try {
    const res = await fetch(`${API_BASE}/user-funds`);
    const data = await res.json();
    state.userFundsData = data.items;

    const body = document.getElementById('user-funds-body');
    body.innerHTML = '';

    data.items.forEach((u, idx) => {
      const tr = document.createElement('tr');
      const valClass = u.funds < 0 ? 'val-red' : 'val-green';
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${u.id}</td>
        <td>${u.user_id}</td>
        <td class="${valClass}">${u.funds.toLocaleString()}</td>
        <td>${u.created_at}</td>
        <td>${u.modified_at}</td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading user funds:', err);
  }
}

async function handleUserFundSubmit(e) {
  e.preventDefault();
  const payload = {
    user_id: document.getElementById('userfund-user-id').value,
    funds: parseFloat(document.getElementById('userfund-amount').value)
  };

  try {
    const res = await fetch(`${API_BASE}/user-funds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('create-user-fund-modal');
      loadUserFunds();
      alert('User fund adjustment saved!');
    }
  } catch (err) {
    console.error('Error saving user fund:', err);
  }
}

// ---------------- 12. USERS (SUB-BROKERS) ----------------

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    state.usersData = data.items;

    const body = document.getElementById('users-body');
    body.innerHTML = '';

    data.items.forEach((u, idx) => {
      const tr = document.createElement('tr');
      const statusClass = u.account_status === 'Active' ? 'badge-active' : 'badge-inactive';
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" title="View"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon" title="Funds"><i class="fa-solid fa-dollar-sign"></i></button>
            <button class="btn-icon" title="Edit"><i class="fa-solid fa-pencil"></i></button>
          </div>
        </td>
        <td>${u.id}</td>
        <td><strong>${u.username}</strong></td>
        <td>${u.credit_limit}</td>
        <td>${u.ledger_balance.toLocaleString()}</td>
        <td>${u.type}</td>
        <td>${u.valid_till}</td>
        <td><span class="badge-tag ${statusClass}">${u.account_status}</span></td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

async function handleCreateUserSubmit(e) {
  e.preventDefault();
  const payload = {
    username: document.getElementById('new-user-username').value,
    credit_limit: parseFloat(document.getElementById('new-user-credit').value || 0),
    ledger_balance: parseFloat(document.getElementById('new-user-ledger').value || 0),
    account_status: document.getElementById('new-user-status').value
  };

  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('create-user-modal');
      loadUsers();
      loadDashboard();
      alert('Sub-broker user created successfully!');
    }
  } catch (err) {
    console.error('Error creating user:', err);
  }
}

// ---------------- 13. WEEKLY ACCOUNTS ----------------

async function loadWeeklyAccounts() {
  try {
    const res = await fetch(`${API_BASE}/weekly-accounts`);
    const data = await res.json();

    const body = document.getElementById('weekly-accounts-body');
    body.innerHTML = '';

    data.forEach(item => {
      const tr = document.createElement('tr');
      const recvClass = item.receivable_type.includes('Receive') ? 'val-green' : 'val-red';
      tr.innerHTML = `
        <td class="${recvClass}"><strong>Rs. ${item.amount.toLocaleString()}</strong><br><small style="color:#94a3b8;">${item.receivable_type}</small></td>
        <td><strong>${item.broker_code}</strong> : ${item.broker_name}</td>
        <td>${item.sum_client_pl.toLocaleString()}</td>
        <td>${item.sum_client_brokerage.toLocaleString()}</td>
        <td>${item.sum_client_net.toLocaleString()}</td>
        <td>${item.pl_share}</td>
        <td>${item.brokerage_share.toLocaleString()}</td>
        <td class="${recvClass}"><strong>${item.net_share.toLocaleString()}</strong></td>
      `;
      body.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading weekly accounts:', err);
  }
}

// ---------------- Change Password & Export ----------------

async function handleChangePasswordSubmit(e) {
  e.preventDefault();
  const newPassword = document.getElementById('new-pwd-input').value;
  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    });
    if (res.ok) {
      closeModal('change-pwd-modal');
      alert('Password updated successfully!');
    }
  } catch (err) {
    console.error('Error changing password:', err);
  }
}

function exportData(type) {
  window.location.href = `${API_BASE}/export/${type}`;
}

// ---------------- Modal Helpers ----------------

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('show');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
}

// ---------------- LIVE SIMULATOR & AUDIO SYNTHESIZER ----------------

function simulateMarketTicks() {
  if (!state.marketWatchData || state.marketWatchData.length === 0) return;

  // Pick 3 to 6 random symbols to tick
  const count = Math.min(state.marketWatchData.length, 5);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * state.marketWatchData.length);
    const item = state.marketWatchData[idx];

    // Micro fluctuation: between -0.15% and +0.18%
    const pctChange = (Math.random() * 0.33 - 0.15) / 100;
    const priceDelta = item.ltp * pctChange;
    const isUp = priceDelta >= 0;

    item.ltp = Math.max(0.05, item.ltp + priceDelta);
    item.bid = Math.max(0.05, item.ltp - (item.ltp * 0.0002));
    item.ask = Math.max(0.05, item.ltp + (item.ltp * 0.0002));
    item.change += priceDelta;
    if (item.ltp > item.high) item.high = item.ltp;
    if (item.ltp < item.low) item.low = item.ltp;

    // Update the DOM row if visible
    const rowId = `mw-row-${item.script.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const tr = document.getElementById(rowId);
    if (tr) {
      const bidTd = tr.querySelector('.mw-bid');
      const askTd = tr.querySelector('.mw-ask');
      const ltpTd = tr.querySelector('.mw-ltp');
      const changeTd = tr.querySelector('.mw-change');

      if (bidTd) bidTd.textContent = item.bid.toFixed(2);
      if (askTd) askTd.textContent = item.ask.toFixed(2);
      if (ltpTd) {
        ltpTd.textContent = item.ltp.toFixed(2);
        // Apply glowing tick flash
        ltpTd.classList.remove('tick-up', 'tick-down');
        void ltpTd.offsetWidth; // Trigger reflow
        ltpTd.classList.add(isUp ? 'tick-up' : 'tick-down');
      }
      if (changeTd) {
        const changeClass = item.change >= 0 ? 'val-green' : 'val-red';
        changeTd.className = `${changeClass} mw-change`;
        changeTd.textContent = `${item.change > 0 ? '+' : ''}${item.change.toFixed(2)}`;
      }
    }

    // Also update split header badge if active
    if (item.script === activeSplitScriptName) {
      const splitBadge = document.getElementById('mw-active-ltp-badge');
      if (splitBadge) {
        const changeClass = item.change >= 0 ? 'val-green' : 'val-red';
        splitBadge.className = `mw-chart-ltp-badge ${changeClass}`;
        splitBadge.textContent = `₹${item.ltp.toFixed(2)} (${item.change > 0 ? '+' : ''}${item.change.toFixed(2)})`;
      }
    }
  }
}

// Institutional Audio Chime (Zero External Dependencies, Pure Web Audio API)
function playTradeChime(type = 'BUY') {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'BUY') {
      // Crisp 2-tone melodic upward chime (D5 -> A5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.start(now);
      osc.stop(now + 0.38);
    } else {
      // Warm downward tone (A4 -> E4)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440.00, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.14);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.start(now);
      osc.stop(now + 0.38);
    }
  } catch (err) {
    console.warn('Web Audio synthesis not allowed yet by user gesture:', err);
  }
}

function toggleAudio() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('audio-toggle-btn');
  if (btn) {
    btn.innerHTML = soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark" style="color:#ef4444;"></i>';
    btn.title = soundEnabled ? 'Sound FX Enabled' : 'Sound FX Muted';
  }
  showToast(soundEnabled ? 'Terminal Audio Alerts: Enabled' : 'Terminal Audio Alerts: Muted');
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

function updateLiveClock() {
  const clockElem = document.getElementById('market-clock-time');
  if (!clockElem) return;
  const now = new Date();
  clockElem.textContent = now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
}

function showToast(message, action = 'INFO') {
  const toast = document.getElementById('trade-toast');
  const msgElem = document.getElementById('toast-message');
  if (!toast || !msgElem) return;

  msgElem.textContent = message;
  toast.className = 'toast-notification show';
  
  if (action === 'BUY') {
    toast.style.borderLeftColor = '#10b981';
  } else if (action === 'SELL') {
    toast.style.borderLeftColor = '#f43f5e';
  } else {
    toast.style.borderLeftColor = '#38bdf8';
  }

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}
