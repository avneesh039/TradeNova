// ═══════════════════════════════════════════════════════════════
// TradeNova SN — MySQL Database Engine
// mysql2/promise Connection Pool & Schema Manager
// ═══════════════════════════════════════════════════════════════

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT) || 3306,
  user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'tradenova_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;

async function initMySQL() {
  try {
    // 1. Connect without DB first to ensure tradenova_db exists
    const rootConn = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 2. Create the main connection pool
    pool = mysql.createPool(DB_CONFIG);
    console.log(`\x1b[32m✔ Connected to MySQL Database [${DB_CONFIG.database}] on ${DB_CONFIG.host}:${DB_CONFIG.port}\x1b[0m`);

    // 3. Create Tables
    await createTables();

    // 4. Seed initial data if tables are empty
    await seedFromJSON();

    return pool;
  } catch (err) {
    console.error('\x1b[31m✖ MySQL Initialization Error:\x1b[0m', err.message);
    throw err;
  }
}

async function createTables() {
  const conn = await pool.getConnection();
  try {
    // Users / Clients Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        mobile VARCHAR(50),
        city VARCHAR(100) DEFAULT '',
        role ENUM('admin', 'broker', 'client') DEFAULT 'client',
        broker VARCHAR(100) DEFAULT 'AG',
        funds DECIMAL(15,2) DEFAULT 100000.00,
        credits DECIMAL(15,2) DEFAULT 500000.00,
        credit_limit DECIMAL(15,2) DEFAULT 500000.00,
        opening_balance DECIMAL(15,2) DEFAULT 100000.00,
        trade_block_time INT DEFAULT 0,
        demo TINYINT(1) DEFAULT 0,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        aobhl TINYINT(1) DEFAULT 1,
        toahl TINYINT(1) DEFAULT 1,
        trade_equity_as_units TINYINT(1) DEFAULT 1,
        auto_square_close_at DECIMAL(5,2) DEFAULT 90.00,
        auto_square_notify_at DECIMAL(5,2) DEFAULT 70.00,
        commodity TINYINT(1) DEFAULT 1,
        min_size_trade_commodity DECIMAL(10,2) DEFAULT 0.00,
        max_size_trade_commodity DECIMAL(10,2) DEFAULT 2.00,
        max_size_script_commodity DECIMAL(10,2) DEFAULT 5.00,
        max_size_all_commodity DECIMAL(10,2) DEFAULT 20.00,
        mcx_brokerage_type VARCHAR(50) DEFAULT 'per_crore',
        commodity_brokerage DECIMAL(10,2) DEFAULT 2000.00,
        exposure_mcx_type VARCHAR(50) DEFAULT 'per_turnover',
        exposure_mcx DECIMAL(10,2) DEFAULT 200.00,
        holding_exposure_mcx DECIMAL(10,2) DEFAULT 20.00,
        brokerage_mcx JSON,
        exposure_mcx_lot JSON,
        holding_exposure_mcx_lot JSON,
        equity TINYINT(1) DEFAULT 1,
        equity_brokerage_type VARCHAR(50) DEFAULT 'per_crore',
        equity_brokerage DECIMAL(10,2) DEFAULT 4000.00,
        min_size_trade_equity DECIMAL(10,2) DEFAULT 0.00,
        max_size_trade_equity DECIMAL(10,2) DEFAULT 2.00,
        min_size_trade_index DECIMAL(10,2) DEFAULT 0.00,
        max_size_trade_index DECIMAL(10,2) DEFAULT 5.00,
        max_size_script_equity DECIMAL(10,2) DEFAULT 5.00,
        max_size_script_index DECIMAL(10,2) DEFAULT 10.00,
        max_size_all_equity DECIMAL(10,2) DEFAULT 20.00,
        max_size_all_index DECIMAL(10,2) DEFAULT 20.00,
        exposure_equity DECIMAL(10,2) DEFAULT 200.00,
        holding_exposure_equity DECIMAL(10,2) DEFAULT 20.00,
        notes TEXT,
        transaction_password VARCHAR(255) DEFAULT '',
        created_at BIGINT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Orders Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        name VARCHAR(150),
        exchange VARCHAR(20) NOT NULL,
        side ENUM('buy', 'sell') NOT NULL,
        qty INT NOT NULL,
        lots INT NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        order_type VARCHAR(20) DEFAULT 'market',
        condition_type VARCHAR(50) DEFAULT 'LTP <= Rate',
        status ENUM('executed', 'pending', 'cancelled') DEFAULT 'executed',
        executed_price DECIMAL(12,2),
        executed_at BIGINT,
        brokerage DECIMAL(10,2) DEFAULT 0.00,
        margin DECIMAL(15,2) DEFAULT 0.00,
        user_id INT NOT NULL,
        timestamp BIGINT NOT NULL,
        INDEX idx_user (user_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Positions Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        name VARCHAR(150),
        exchange VARCHAR(20) NOT NULL,
        side ENUM('buy', 'sell') NOT NULL,
        qty INT NOT NULL,
        lots INT NOT NULL,
        entry_price DECIMAL(12,2) NOT NULL,
        margin DECIMAL(15,2) DEFAULT 0.00,
        user_id INT NOT NULL,
        timestamp BIGINT NOT NULL,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Closed Trades Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS closed_trades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        name VARCHAR(150),
        exchange VARCHAR(20) NOT NULL,
        side ENUM('buy', 'sell') NOT NULL,
        qty INT NOT NULL,
        lots INT NOT NULL,
        entry_price DECIMAL(12,2) NOT NULL,
        exit_price DECIMAL(12,2) NOT NULL,
        pnl DECIMAL(15,2) NOT NULL,
        brokerage DECIMAL(10,2) DEFAULT 0.00,
        net_pnl DECIMAL(15,2) NOT NULL,
        user_id INT NOT NULL,
        timestamp BIGINT NOT NULL,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Fund Transactions Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS fund_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('deposit', 'withdraw') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        notes TEXT,
        user_id INT NOT NULL,
        timestamp BIGINT NOT NULL,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Notifications Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        from_user_id INT NOT NULL,
        timestamp BIGINT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✔ MySQL schema initialized successfully (users, orders, positions, closed_trades, fund_transactions, notifications)');
  } finally {
    conn.release();
  }
}

async function seedFromJSON() {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (rows[0].count > 0) return; // Already seeded

  console.log('Migrating initial records from data/db.json into MySQL...');
  const dbFile = path.join(__dirname, 'data', 'db.json');
  if (!fs.existsSync(dbFile)) return;

  const raw = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

  // Seed Users
  if (raw.users && raw.users.length) {
    for (const u of raw.users) {
      await pool.query(`
        INSERT INTO users (
          id, name, username, password, phone, mobile, city, role, broker,
          funds, credits, credit_limit, opening_balance, trade_block_time, demo, status,
          aobhl, toahl, trade_equity_as_units, auto_square_close_at, auto_square_notify_at,
          commodity, min_size_trade_commodity, max_size_trade_commodity, max_size_script_commodity, max_size_all_commodity,
          mcx_brokerage_type, commodity_brokerage, exposure_mcx_type, exposure_mcx, holding_exposure_mcx,
          brokerage_mcx, exposure_mcx_lot, holding_exposure_mcx_lot,
          equity, equity_brokerage_type, equity_brokerage,
          min_size_trade_equity, max_size_trade_equity, min_size_trade_index, max_size_trade_index,
          max_size_script_equity, max_size_script_index, max_size_all_equity, max_size_all_index,
          exposure_equity, holding_exposure_equity, notes, transaction_password, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `, [
        u.id, u.name, u.username, u.password, u.phone || '', u.mobile || u.phone || '', u.city || '', u.role || 'client', u.broker || 'AG',
        u.funds || 100000, u.credits || 500000, u.creditLimit || 500000, u.openingBalance || 100000, u.trade_block_time || 0, u.demo ? 1 : 0, u.status || 'active',
        u.aobhl !== undefined ? (u.aobhl ? 1 : 0) : 1, u.toahl !== undefined ? (u.toahl ? 1 : 0) : 1, u.trade_equity_as_units !== undefined ? (u.trade_equity_as_units ? 1 : 0) : 1,
        u.auto_square_close_at || 90, u.auto_square_notify_at || 70,
        u.commodity !== undefined ? (u.commodity ? 1 : 0) : 1, u.min_size_trade_commodity || 0, u.max_size_trade_commodity || 2, u.max_size_script_commodity || 5, u.max_size_all_commodity || 20,
        u.mcx_brokerage_type || 'per_crore', u.commodity_brokerage || 2000, u.exposure_mcx_type || 'per_turnover', u.exposure_mcx || 200, u.holding_exposure_mcx || 20,
        JSON.stringify(u.brokerage_mcx || {}), JSON.stringify(u.exposure_mcx_lot || {}), JSON.stringify(u.holding_exposure_mcx_lot || {}),
        u.equity !== undefined ? (u.equity ? 1 : 0) : 1, u.equity_brokerage_type || 'per_crore', u.equity_brokerage || 4000,
        u.min_size_trade_equity || 0, u.max_size_trade_equity || 2, u.min_size_trade_index || 0, u.max_size_trade_index || 5,
        u.max_size_script_equity || 5, u.max_size_script_index || 10, u.max_size_all_equity || 20, u.max_size_all_index || 20,
        u.exposure_equity || 200, u.holding_exposure_equity || 20, u.notes || '', u.transaction_password || '', u.createdAt || Date.now()
      ]);
    }
  }

  // Seed Orders
  if (raw.orders && raw.orders.length) {
    for (const o of raw.orders) {
      await pool.query(`
        INSERT INTO orders (id, symbol, name, exchange, side, qty, lots, price, order_type, condition_type, status, executed_price, executed_at, brokerage, margin, user_id, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [o.id, o.symbol, o.name, o.exchange, o.side, o.qty, o.lots || o.qty, o.price, o.orderType || 'limit', o.condition || 'LTP <= Rate', o.status || 'executed', o.executedPrice, o.executedAt, o.brokerage || 0, o.margin || 0, o.userId, o.timestamp || o.createdAt || Date.now()]);
    }
  }

  // Seed Positions
  if (raw.positions && raw.positions.length) {
    for (const p of raw.positions) {
      await pool.query(`
        INSERT INTO positions (id, symbol, name, exchange, side, qty, lots, entry_price, margin, user_id, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [p.id, p.symbol, p.name, p.exchange, p.side, p.qty, p.lots || p.qty, p.entryPrice, p.margin || 0, p.userId, p.timestamp || p.createdAt || Date.now()]);
    }
  }

  // Seed Closed Trades
  if (raw.closedTrades && raw.closedTrades.length) {
    for (const t of raw.closedTrades) {
      await pool.query(`
        INSERT INTO closed_trades (id, symbol, name, exchange, side, qty, lots, entry_price, exit_price, pnl, brokerage, net_pnl, user_id, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [t.id, t.symbol, t.name, t.exchange, t.side, t.qty, t.lots || t.qty, t.entryPrice, t.exitPrice, t.pnl, t.brokerage || 0, t.netPnl || (t.pnl - (t.brokerage || 0)), t.userId, t.timestamp || t.closedAt || t.exitTime || Date.now()]);
    }
  }

  // Seed Fund Transactions
  if (raw.fundTransactions && raw.fundTransactions.length) {
    for (const f of raw.fundTransactions) {
      await pool.query(`
        INSERT INTO fund_transactions (id, type, amount, notes, user_id, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [f.id, f.type, f.amount, f.notes || '', f.userId, f.timestamp || f.createdAt || Date.now()]);
    }
  }

  console.log(`✔ Successfully migrated data from db.json into MySQL!`);
}

async function loadStateFromMySQL() {
  if (!pool) await initMySQL();

  const [usersRows] = await pool.query('SELECT * FROM users');
  const [ordersRows] = await pool.query('SELECT * FROM orders');
  const [posRows] = await pool.query('SELECT * FROM positions');
  const [closedRows] = await pool.query('SELECT * FROM closed_trades');
  const [fundsRows] = await pool.query('SELECT * FROM fund_transactions');
  const [notifRows] = await pool.query('SELECT * FROM notifications');

  const users = usersRows.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    password: u.password,
    phone: u.phone,
    mobile: u.mobile,
    city: u.city,
    role: u.role,
    broker: u.broker,
    funds: parseFloat(u.funds),
    credits: parseFloat(u.credits),
    creditLimit: parseFloat(u.credit_limit),
    openingBalance: parseFloat(u.opening_balance),
    trade_block_time: u.trade_block_time,
    demo: u.demo ? 1 : 0,
    isDemo: !!u.demo,
    status: u.status,
    aobhl: u.aobhl,
    toahl: u.toahl,
    trade_equity_as_units: u.trade_equity_as_units,
    auto_square_close_at: parseFloat(u.auto_square_close_at),
    auto_square_notify_at: parseFloat(u.auto_square_notify_at),
    commodity: u.commodity,
    min_size_trade_commodity: parseFloat(u.min_size_trade_commodity),
    max_size_trade_commodity: parseFloat(u.max_size_trade_commodity),
    max_size_script_commodity: parseFloat(u.max_size_script_commodity),
    max_size_all_commodity: parseFloat(u.max_size_all_commodity),
    mcx_brokerage_type: u.mcx_brokerage_type,
    commodity_brokerage: parseFloat(u.commodity_brokerage),
    exposure_mcx_type: u.exposure_mcx_type,
    exposure_mcx: parseFloat(u.exposure_mcx),
    holding_exposure_mcx: parseFloat(u.holding_exposure_mcx),
    brokerage_mcx: typeof u.brokerage_mcx === 'string' ? JSON.parse(u.brokerage_mcx) : (u.brokerage_mcx || {}),
    exposure_mcx_lot: typeof u.exposure_mcx_lot === 'string' ? JSON.parse(u.exposure_mcx_lot) : (u.exposure_mcx_lot || {}),
    holding_exposure_mcx_lot: typeof u.holding_exposure_mcx_lot === 'string' ? JSON.parse(u.holding_exposure_mcx_lot) : (u.holding_exposure_mcx_lot || {}),
    equity: u.equity,
    equity_brokerage_type: u.equity_brokerage_type,
    equity_brokerage: parseFloat(u.equity_brokerage),
    min_size_trade_equity: parseFloat(u.min_size_trade_equity),
    max_size_trade_equity: parseFloat(u.max_size_trade_equity),
    min_size_trade_index: parseFloat(u.min_size_trade_index),
    max_size_trade_index: parseFloat(u.max_size_trade_index),
    max_size_script_equity: parseFloat(u.max_size_script_equity),
    max_size_script_index: parseFloat(u.max_size_script_index),
    max_size_all_equity: parseFloat(u.max_size_all_equity),
    max_size_all_index: parseFloat(u.max_size_all_index),
    exposure_equity: parseFloat(u.exposure_equity),
    holding_exposure_equity: parseFloat(u.holding_exposure_equity),
    notes: u.notes,
    transaction_password: u.transaction_password,
    createdAt: Number(u.created_at)
  }));

  const orders = ordersRows.map(o => ({
    id: o.id,
    symbol: o.symbol,
    name: o.name,
    exchange: o.exchange,
    side: o.side,
    qty: o.qty,
    lots: o.lots,
    price: parseFloat(o.price),
    orderType: o.order_type,
    condition: o.condition_type,
    status: o.status,
    executedPrice: o.executed_price ? parseFloat(o.executed_price) : null,
    executedAt: o.executed_at ? Number(o.executed_at) : null,
    brokerage: parseFloat(o.brokerage),
    margin: parseFloat(o.margin),
    userId: o.user_id,
    timestamp: Number(o.timestamp)
  }));

  const positions = posRows.map(p => ({
    id: p.id,
    symbol: p.symbol,
    name: p.name,
    exchange: p.exchange,
    side: p.side,
    qty: p.qty,
    lots: p.lots,
    entryPrice: parseFloat(p.entry_price),
    margin: parseFloat(p.margin),
    userId: p.user_id,
    timestamp: Number(p.timestamp)
  }));

  const closedTrades = closedRows.map(t => ({
    id: t.id,
    symbol: t.symbol,
    name: t.name,
    exchange: t.exchange,
    side: t.side,
    qty: t.qty,
    lots: t.lots,
    entryPrice: parseFloat(t.entry_price),
    exitPrice: parseFloat(t.exit_price),
    pnl: parseFloat(t.pnl),
    brokerage: parseFloat(t.brokerage),
    netPnl: parseFloat(t.net_pnl),
    userId: t.user_id,
    timestamp: Number(t.timestamp)
  }));

  const fundTransactions = fundsRows.map(f => ({
    id: f.id,
    type: f.type,
    amount: parseFloat(f.amount),
    notes: f.notes,
    userId: f.user_id,
    timestamp: Number(f.timestamp)
  }));

  const notifications = notifRows.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    from: n.from_user_id,
    timestamp: Number(n.timestamp)
  }));

  let maxId = 100;
  [users, orders, positions, closedTrades, fundTransactions, notifications].forEach(arr => {
    arr.forEach(item => {
      if (item.id && item.id > maxId) maxId = item.id;
    });
  });

  return {
    users,
    orders,
    positions,
    closedTrades,
    fundTransactions,
    notifications,
    nextId: maxId + 1
  };
}

async function saveUserToMySQL(u) {
  if (!pool) return;
  try {
    await pool.query(`
      INSERT INTO users (
        id, name, username, password, phone, mobile, city, role, broker,
        funds, credits, credit_limit, opening_balance, trade_block_time, demo, status,
        aobhl, toahl, trade_equity_as_units, auto_square_close_at, auto_square_notify_at,
        commodity, min_size_trade_commodity, max_size_trade_commodity, max_size_script_commodity, max_size_all_commodity,
        mcx_brokerage_type, commodity_brokerage, exposure_mcx_type, exposure_mcx, holding_exposure_mcx,
        brokerage_mcx, exposure_mcx_lot, holding_exposure_mcx_lot,
        equity, equity_brokerage_type, equity_brokerage,
        min_size_trade_equity, max_size_trade_equity, min_size_trade_index, max_size_trade_index,
        max_size_script_equity, max_size_script_index, max_size_all_equity, max_size_all_index,
        exposure_equity, holding_exposure_equity, notes, transaction_password, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone = VALUES(phone),
        mobile = VALUES(mobile),
        city = VALUES(city),
        password = VALUES(password),
        role = VALUES(role),
        broker = VALUES(broker),
        funds = VALUES(funds),
        credits = VALUES(credits),
        credit_limit = VALUES(credit_limit),
        status = VALUES(status),
        aobhl = VALUES(aobhl),
        toahl = VALUES(toahl),
        trade_equity_as_units = VALUES(trade_equity_as_units),
        auto_square_close_at = VALUES(auto_square_close_at),
        auto_square_notify_at = VALUES(auto_square_notify_at),
        commodity = VALUES(commodity),
        min_size_trade_commodity = VALUES(min_size_trade_commodity),
        max_size_trade_commodity = VALUES(max_size_trade_commodity),
        max_size_script_commodity = VALUES(max_size_script_commodity),
        max_size_all_commodity = VALUES(max_size_all_commodity),
        mcx_brokerage_type = VALUES(mcx_brokerage_type),
        commodity_brokerage = VALUES(commodity_brokerage),
        exposure_mcx_type = VALUES(exposure_mcx_type),
        exposure_mcx = VALUES(exposure_mcx),
        holding_exposure_mcx = VALUES(holding_exposure_mcx),
        brokerage_mcx = VALUES(brokerage_mcx),
        exposure_mcx_lot = VALUES(exposure_mcx_lot),
        holding_exposure_mcx_lot = VALUES(holding_exposure_mcx_lot),
        equity = VALUES(equity),
        equity_brokerage_type = VALUES(equity_brokerage_type),
        equity_brokerage = VALUES(equity_brokerage),
        min_size_trade_equity = VALUES(min_size_trade_equity),
        max_size_trade_equity = VALUES(max_size_trade_equity),
        min_size_trade_index = VALUES(min_size_trade_index),
        max_size_trade_index = VALUES(max_size_trade_index),
        max_size_script_equity = VALUES(max_size_script_equity),
        max_size_script_index = VALUES(max_size_script_index),
        max_size_all_equity = VALUES(max_size_all_equity),
        max_size_all_index = VALUES(max_size_all_index),
        exposure_equity = VALUES(exposure_equity),
        holding_exposure_equity = VALUES(holding_exposure_equity),
        notes = VALUES(notes),
        transaction_password = VALUES(transaction_password)
    `, [
      u.id, u.name, u.username, u.password, u.phone || '', u.mobile || u.phone || '', u.city || '', u.role || 'client', u.broker || 'AG',
      u.funds || 100000, u.credits || 500000, u.creditLimit || 500000, u.openingBalance || 100000, u.trade_block_time || 0, u.demo ? 1 : 0, u.status || 'active',
      u.aobhl !== undefined ? (u.aobhl ? 1 : 0) : 1, u.toahl !== undefined ? (u.toahl ? 1 : 0) : 1, u.trade_equity_as_units !== undefined ? (u.trade_equity_as_units ? 1 : 0) : 1,
      u.auto_square_close_at || 90, u.auto_square_notify_at || 70,
      u.commodity !== undefined ? (u.commodity ? 1 : 0) : 1, u.min_size_trade_commodity || 0, u.max_size_trade_commodity || 2, u.max_size_script_commodity || 5, u.max_size_all_commodity || 20,
      u.mcx_brokerage_type || 'per_crore', u.commodity_brokerage || 2000, u.exposure_mcx_type || 'per_turnover', u.exposure_mcx || 200, u.holding_exposure_mcx || 20,
      JSON.stringify(u.brokerage_mcx || {}), JSON.stringify(u.exposure_mcx_lot || {}), JSON.stringify(u.holding_exposure_mcx_lot || {}),
      u.equity !== undefined ? (u.equity ? 1 : 0) : 1, u.equity_brokerage_type || 'per_crore', u.equity_brokerage || 4000,
      u.min_size_trade_equity || 0, u.max_size_trade_equity || 2, u.min_size_trade_index || 0, u.max_size_trade_index || 5,
      u.max_size_script_equity || 5, u.max_size_script_index || 10, u.max_size_all_equity || 20, u.max_size_all_index || 20,
      u.exposure_equity || 200, u.holding_exposure_equity || 20, u.notes || '', u.transaction_password || '', u.createdAt || Date.now()
    ]);
  } catch (e) { console.error('saveUserToMySQL error:', e.message); }
}

async function saveOrderToMySQL(o) {
  if (!pool) return;
  try {
    await pool.query(`
      INSERT INTO orders (id, symbol, name, exchange, side, qty, lots, price, order_type, condition_type, status, executed_price, executed_at, brokerage, margin, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        executed_price = VALUES(executed_price),
        executed_at = VALUES(executed_at),
        brokerage = VALUES(brokerage),
        margin = VALUES(margin)
    `, [o.id, o.symbol, o.name, o.exchange, o.side, o.qty, o.lots || o.qty, o.price, o.orderType || 'limit', o.condition || 'LTP <= Rate', o.status || 'pending', o.executedPrice, o.executedAt, o.brokerage || 0, o.margin || 0, o.userId, o.timestamp]);
  } catch (e) { console.error('saveOrderToMySQL error:', e.message); }
}

async function savePositionToMySQL(p) {
  if (!pool) return;
  try {
    await pool.query(`
      INSERT INTO positions (id, symbol, name, exchange, side, qty, lots, entry_price, margin, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        qty = VALUES(qty),
        lots = VALUES(lots),
        entry_price = VALUES(entry_price),
        margin = VALUES(margin)
    `, [p.id, p.symbol, p.name, p.exchange, p.side, p.qty, p.lots || p.qty, p.entryPrice, p.margin || 0, p.userId, p.timestamp]);
  } catch (e) { console.error('savePositionToMySQL error:', e.message); }
}

async function deletePositionFromMySQL(posId) {
  if (!pool) return;
  try {
    await pool.query('DELETE FROM positions WHERE id = ?', [posId]);
  } catch (e) { console.error('deletePositionFromMySQL error:', e.message); }
}

async function saveClosedTradeToMySQL(t) {
  if (!pool) return;
  try {
    await pool.query(`
      INSERT INTO closed_trades (id, symbol, name, exchange, side, qty, lots, entry_price, exit_price, pnl, brokerage, net_pnl, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [t.id, t.symbol, t.name, t.exchange, t.side, t.qty, t.lots || t.qty, t.entryPrice, t.exitPrice, t.pnl, t.brokerage || 0, t.netPnl || (t.pnl - (t.brokerage || 0)), t.userId, t.timestamp || Date.now()]);
  } catch (e) { console.error('saveClosedTradeToMySQL error:', e.message); }
}

async function saveFundTxToMySQL(f) {
  if (!pool) return;
  try {
    await pool.query(`
      INSERT INTO fund_transactions (id, type, amount, notes, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [f.id, f.type, f.amount, f.notes || '', f.userId, f.timestamp || Date.now()]);
  } catch (e) { console.error('saveFundTxToMySQL error:', e.message); }
}

async function saveNotificationToMySQL(n) {
  if (!pool) return;
  try {
    await pool.query(`
      INSERT INTO notifications (id, title, message, from_user_id, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `, [n.id, n.title, n.message, n.from || n.from_user_id || 1, n.timestamp || Date.now()]);
  } catch (e) { console.error('saveNotificationToMySQL error:', e.message); }
}

async function deleteUserFromMySQL(id) {
  if (!pool) return;
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  } catch (e) { console.error('deleteUserFromMySQL error:', e.message); }
}

module.exports = {
  initMySQL,
  getPool: () => pool,
  loadStateFromMySQL,
  saveUserToMySQL,
  deleteUserFromMySQL,
  saveOrderToMySQL,
  savePositionToMySQL,
  deletePositionFromMySQL,
  saveClosedTradeToMySQL,
  saveFundTxToMySQL,
  saveNotificationToMySQL
};
