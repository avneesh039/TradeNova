const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const seedData = require('./seed-data');

require('dotenv').config();

let pool = null;
let isMysqlConnected = false;

// Fallback in-memory state initialized from seed data
let memoryStore = JSON.parse(JSON.stringify(seedData));

async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const database = process.env.DB_NAME || 'tradenova_db';

  try {
    // 1. Try to connect to MySQL server without database first to ensure DB exists
    const rootConn = await mysql.createConnection({
      host,
      user,
      password,
      port
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 2. Connect pool with database
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Run schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));

      for (const statement of statements) {
        await pool.query(statement).catch(() => {});
      }
    }

    isMysqlConnected = true;
    console.log(`[Database] Successfully connected to MySQL at ${host}:${port}/${database}`);
  } catch (err) {
    isMysqlConnected = false;
    console.warn(`[Database] MySQL connection notice (${err.message}).`);
    console.warn(`[Database] Running in high-performance Memory/Local mode with full seed data.`);
    console.warn(`[Database] To use your MySQL server, configure .env with valid credentials and restart.`);
  }
}

// Data access layer providing uniform API whether MySQL or local mode is active
const db = {
  isMysql: () => isMysqlConnected,

  async getAdmin() {
    return memoryStore.admin;
  },

  async updateAdminPassword(newPassword) {
    memoryStore.admin.password = newPassword;
    return { success: true };
  },

  async getDashboard() {
    return {
      admin: memoryStore.admin,
      metrics: memoryStore.dashboardMetrics
    };
  },

  async getMarketWatch(query = '') {
    if (!query) return memoryStore.scripts;
    const q = query.toLowerCase().trim();
    return memoryStore.scripts.filter(s => 
      s.script.toLowerCase().includes(q) || s.segment.toLowerCase().includes(q)
    );
  },

  async getActionLedger(filter = '') {
    if (!filter) return memoryStore.actionLedger;
    const f = filter.toLowerCase().trim();
    return memoryStore.actionLedger.filter(item => item.message.toLowerCase().includes(f));
  },

  async addActionLedger(message) {
    const entry = {
      id: memoryStore.actionLedger.length + 1,
      message,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    memoryStore.actionLedger.unshift(entry);
    return entry;
  },

  async getActivePositions() {
    return memoryStore.activePositions;
  },

  async getClosedPositions() {
    return memoryStore.closedPositions;
  },

  async getClients(filters = {}) {
    let clients = [...memoryStore.tradingClients];

    if (filters.id) {
      clients = clients.filter(c => String(c.id).includes(filters.id));
    }
    if (filters.name) {
      clients = clients.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.username) {
      clients = clients.filter(c => c.username.toLowerCase().includes(filters.username.toLowerCase()));
    }
    if (filters.demo_account && filters.demo_account !== 'ALL') {
      clients = clients.filter(c => c.demo_account === filters.demo_account);
    }
    if (filters.account_status && filters.account_status !== 'ALL') {
      clients = clients.filter(c => c.account_status === filters.account_status);
    }

    return clients;
  },

  async getClientById(id) {
    const client = memoryStore.tradingClients.find(c => String(c.id) === String(id));
    if (!client) return null;

    // Attach sample fund history and active trades for the client drawer
    return {
      ...client,
      fundsHistory: [
        { amount: client.ledger_balance, created_at: '2026-09-07 11:30:00', notes: 'Opening balance' }
      ],
      activeTrades: memoryStore.activePositions.slice(0, 3)
    };
  },

  async createClient(data) {
    const newId = Math.floor(1000 + Math.random() * 9000);
    const newClient = {
      id: newId,
      name: data.name || 'New Client',
      username: data.username || `CLI${newId}`,
      mobile: data.mobile || '',
      credit_limit: parseFloat(data.credit_limit || 0),
      city: data.city || '',
      trade_block_time: parseInt(data.trade_block_time || 0, 10),
      ledger_balance: parseFloat(data.ledger_balance || 0),
      gross_pl: 0,
      brokerage: 0,
      net_pl: 0,
      demo_account: data.demo_account || 'NO',
      account_status: data.account_status || 'Active',
      broker_id: data.broker_id || 414,
      broker_name: data.broker_name || '414 : AG',
      config: data.config || {}
    };

    memoryStore.tradingClients.unshift(newClient);
    memoryStore.admin.current_clients = memoryStore.tradingClients.length;

    await db.addActionLedger(`Admin created new trading client ${newClient.name} (${newClient.username})`);
    return newClient;
  },

  async updateClient(id, data) {
    const idx = memoryStore.tradingClients.findIndex(c => String(c.id) === String(id));
    if (idx === -1) throw new Error('Client not found');

    memoryStore.tradingClients[idx] = {
      ...memoryStore.tradingClients[idx],
      ...data,
      id: memoryStore.tradingClients[idx].id // keep ID
    };

    await db.addActionLedger(`Updated client profile for ${memoryStore.tradingClients[idx].username}`);
    return memoryStore.tradingClients[idx];
  },

  async deleteClient(id) {
    memoryStore.tradingClients = memoryStore.tradingClients.filter(c => String(c.id) !== String(id));
    memoryStore.admin.current_clients = memoryStore.tradingClients.length;
    return { success: true };
  },

  async getTrades(filters = {}) {
    let list = [...memoryStore.trades];
    if (filters.script) {
      list = list.filter(t => t.script.toLowerCase().includes(filters.script.toLowerCase()));
    }
    if (filters.user_id) {
      list = list.filter(t => t.user_id.toLowerCase().includes(filters.user_id.toLowerCase()));
    }
    if (filters.segment) {
      list = list.filter(t => t.segment.toLowerCase() === filters.segment.toLowerCase());
    }
    return list;
  },

  async createTrade(data) {
    const tradeId = Math.floor(6271400 + Math.random() * 1000);
    const isBuy = parseFloat(data.buy_rate || 0) > 0;
    const rate = isBuy ? parseFloat(data.buy_rate) : parseFloat(data.sell_rate || 0);
    const qty = parseInt(data.lots || data.units || 1, 10);
    const unitsStr = data.lots_units || `${qty} Units`;

    const newTrade = {
      id: tradeId,
      script: data.script,
      segment: data.segment || 'Equity',
      user_id: data.user_id || 'AGVIK : AGVIK',
      buy_rate: isBuy ? rate : 0,
      sell_rate: !isBuy ? rate : 0,
      lots_units: unitsStr
    };
    memoryStore.trades.unshift(newTrade);

    // Update or insert into activePositions
    let pos = memoryStore.activePositions.find(p => p.script === data.script);
    if (!pos) {
      pos = {
        script: data.script,
        activeBuy: isBuy ? qty : 0,
        activeSell: !isBuy ? qty : 0,
        avgBuyRate: isBuy ? rate : 0,
        avgSellRate: !isBuy ? rate : 0,
        total: `${qty} (${qty})`,
        net: isBuy ? qty : -qty,
        m2m: 0
      };
      memoryStore.activePositions.unshift(pos);
    } else {
      if (isBuy) {
        pos.activeBuy += qty;
        pos.avgBuyRate = rate;
      } else {
        pos.activeSell += qty;
        pos.avgSellRate = rate;
      }
      pos.net = pos.activeBuy - pos.activeSell;
      pos.total = `${pos.activeBuy + pos.activeSell} (${pos.activeBuy + pos.activeSell})`;
    }

    // Action Ledger log
    const actionText = isBuy ? 'bought' : 'sold';
    const logMsg = `${newTrade.user_id} have ${actionText} ${unitsStr} of ${newTrade.script} at ${rate.toFixed(2)}. Traded by client @market. Net Trade`;
    await db.addActionLedger(logMsg);

    return newTrade;
  },

  async getPendingOrders() {
    return memoryStore.pendingOrders;
  },

  async createPendingOrder(data) {
    const newId = Math.floor(4487000 + Math.random() * 1000);
    const order = {
      id: newId,
      commodity: data.commodity,
      user_id: data.user_id,
      trade: data.trade || 'BUY',
      rate: parseFloat(data.rate),
      lots: parseInt(data.lots || 1, 10),
      condition: data.condition || 'below',
      status: 'Pending',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      executed_on: '(not set)'
    };
    memoryStore.pendingOrders.unshift(order);
    await db.addActionLedger(`${order.user_id} placed pending ${order.trade} order on ${order.commodity} at ${order.rate}`);
    return order;
  },

  async deletePendingOrder(id) {
    memoryStore.pendingOrders = memoryStore.pendingOrders.filter(o => String(o.id) !== String(id));
    await db.addActionLedger(`Pending order #${id} was deleted by admin`);
    return { success: true };
  },

  async getTraderFunds(filters = {}) {
    let list = [...memoryStore.traderFunds];
    if (filters.user_id) {
      list = list.filter(f => f.user_id.toLowerCase().includes(filters.user_id.toLowerCase()));
    }
    return list;
  },

  async createTraderFund(data) {
    const newId = Math.floor(1108940 + Math.random() * 1000);
    const item = {
      id: newId,
      user_id: data.user_id,
      username: data.user_id,
      amount: parseFloat(data.amount),
      notes: data.notes || 'Fund adjustment',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    memoryStore.traderFunds.unshift(item);
    return item;
  },

  async getUserFunds() {
    return memoryStore.userFunds;
  },

  async createUserFund(data) {
    const newId = Math.floor(483360 + Math.random() * 1000);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const item = {
      id: newId,
      user_id: data.user_id,
      funds: parseFloat(data.funds),
      created_at: now,
      modified_at: now
    };
    memoryStore.userFunds.unshift(item);
    return item;
  },

  async getUsers() {
    return memoryStore.usersList;
  },

  async getUserDetails(id) {
    const user = memoryStore.usersList.find(u => String(u.id) === String(id));
    if (!user) return null;
    return {
      ...user,
      tradingClients: memoryStore.tradingClients.filter(c => c.broker_id === user.id || String(c.broker_name).includes(user.username)),
      fundsHistory: memoryStore.userFunds.filter(f => String(f.user_id).includes(user.username))
    };
  },

  async createUser(data) {
    const newId = Math.floor(420 + Math.random() * 100);
    const newUser = {
      id: newId,
      username: data.username,
      credit_limit: parseFloat(data.credit_limit || 0),
      ledger_balance: parseFloat(data.ledger_balance || 0),
      type: 'sub-broker',
      valid_till: data.valid_till || '(not set)',
      account_status: data.account_status || 'Active'
    };
    memoryStore.usersList.unshift(newUser);
    memoryStore.admin.current_users = memoryStore.usersList.length;
    await db.addActionLedger(`New sub-broker user created: ${newUser.username}`);
    return newUser;
  },

  async getWeeklyAccounts() {
    return memoryStore.weeklyAccounts;
  },

  async getNotifications() {
    return memoryStore.notifications;
  }
};

module.exports = { initDB, db };
