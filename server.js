const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, db } = require('./database/db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------- REST API ROUTES ----------------

// 1. Dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const data = await db.getDashboard();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Market Watch
app.get('/api/market-watch', async (req, res) => {
  try {
    const data = await db.getMarketWatch(req.query.search);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Action Ledger
app.get('/api/action-ledger', async (req, res) => {
  try {
    const data = await db.getActionLedger(req.query.search);
    res.json({
      total: data.length,
      showing: `Showing 1-${data.length} of ${data.length + 67300} items`,
      items: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Active Positions (Trades Scriptwise)
app.get('/api/active-positions', async (req, res) => {
  try {
    const data = await db.getActivePositions();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Closed Positions (Trades Scriptwise)
app.get('/api/closed-positions', async (req, res) => {
  try {
    const data = await db.getClosedPositions();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Trading Clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.getClients(req.query);
    res.json({
      total: clients.length,
      showing: `Showing 1-${clients.length} of ${clients.length + 160} items`,
      items: clients
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await db.getClientById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const newClient = await db.createClient(req.body);
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const updated = await db.updateClient(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await db.deleteClient(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Trades
app.get('/api/trades', async (req, res) => {
  try {
    const list = await db.getTrades(req.query);
    res.json({
      total: list.length,
      showing: `Showing 1-${list.length} of ${list.length + 480} items`,
      items: list
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trades', async (req, res) => {
  try {
    const newTrade = await db.createTrade(req.body);
    res.status(201).json(newTrade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Pending Orders
app.get('/api/pending-orders', async (req, res) => {
  try {
    const orders = await db.getPendingOrders();
    res.json({
      total: orders.length,
      showing: `Showing 1-${orders.length} of ${orders.length} items`,
      items: orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pending-orders', async (req, res) => {
  try {
    const order = await db.createPendingOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pending-orders/:id', async (req, res) => {
  try {
    await db.deletePendingOrder(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Trader Funds (Funds Wds)
app.get('/api/trader-funds', async (req, res) => {
  try {
    const items = await db.getTraderFunds(req.query);
    res.json({
      total: items.length,
      showing: `Showing 1-${items.length} of ${items.length} items`,
      items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trader-funds', async (req, res) => {
  try {
    const item = await db.createTraderFund(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. User Funds
app.get('/api/user-funds', async (req, res) => {
  try {
    const list = await db.getUserFunds();
    res.json({
      total: list.length,
      showing: `Showing 1-${list.length} of 11,005 items`,
      items: list
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user-funds', async (req, res) => {
  try {
    const item = await db.createUserFund(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Users (Sub-brokers)
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json({
      total: users.length,
      showing: `Showing 1-${users.length} of 11 items`,
      items: users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getUserDetails(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await db.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Weekly Accounts
app.get('/api/weekly-accounts', async (req, res) => {
  try {
    const data = await db.getWeeklyAccounts();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const data = await db.getNotifications();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Export to Excel (CSV format for spreadsheets)
app.get('/api/export/:type', async (req, res) => {
  try {
    const type = req.params.type;
    let csvData = '';
    let filename = `${type}_export.csv`;

    if (type === 'clients') {
      const clients = await db.getClients({});
      csvData = 'ID,Name,Username,Credit Limit,Ledger Balance,Gross PL,Brokerage,Net PL,Status\n';
      clients.forEach(c => {
        csvData += `"${c.id}","${c.name}","${c.username}",${c.credit_limit},${c.ledger_balance},${c.gross_pl},${c.brokerage},${c.net_pl},"${c.account_status}"\n`;
      });
    } else if (type === 'trades') {
      const trades = await db.getTrades({});
      csvData = 'ID,Script,Segment,User ID,Buy Rate,Sell Rate,Lots/Units\n';
      trades.forEach(t => {
        csvData += `"${t.id}","${t.script}","${t.segment}","${t.user_id}",${t.buy_rate},${t.sell_rate},"${t.lots_units}"\n`;
      });
    } else {
      csvData = 'Data\nNo data';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15. User Profile Actions
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    await db.updateAdminPassword(newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Default catch-all routes frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` TradeNova Trading Administration System`);
    console.log(` Server running at: http://localhost:${PORT}`);
    console.log(` Storage Engine: ${db.isMysql() ? 'MySQL Production' : 'Resilient Memory/Local Data Engine'}`);
    console.log(`====================================================`);
  });
}

start();
