-- ========================================================
-- TradeNova Admin Panel - Full MySQL Database Schema
-- Matches the production trading administration system
-- ========================================================

CREATE DATABASE IF NOT EXISTS tradenova_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tradenova_db;

-- 1. Admin & Sub-Brokers (Users)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  transaction_password VARCHAR(255) DEFAULT '123456',
  credit_limit DECIMAL(15, 2) DEFAULT 0.00,
  ledger_balance DECIMAL(15, 2) DEFAULT 0.00,
  type ENUM('admin', 'sub-broker') DEFAULT 'sub-broker',
  valid_till DATE NULL,
  account_status ENUM('Active', 'Not-Active') DEFAULT 'Active',
  renewal_date DATE DEFAULT '2026-09-30',
  max_clients INT DEFAULT 175,
  max_users INT DEFAULT 11,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trading Clients
CREATE TABLE IF NOT EXISTS trading_clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  mobile VARCHAR(20) DEFAULT '',
  credit_limit DECIMAL(15, 2) DEFAULT 0.00,
  city VARCHAR(100) DEFAULT '',
  trade_block_time INT DEFAULT 0,
  ledger_balance DECIMAL(15, 2) DEFAULT 0.00,
  gross_pl DECIMAL(15, 2) DEFAULT 0.00,
  brokerage DECIMAL(15, 2) DEFAULT 0.00,
  net_pl DECIMAL(15, 2) DEFAULT 0.00,
  demo_account ENUM('ALL', 'YES', 'NO') DEFAULT 'NO',
  account_status ENUM('Active', 'Inactive') DEFAULT 'Active',
  broker_id INT DEFAULT NULL,
  config JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (broker_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Market Watch Scripts
CREATE TABLE IF NOT EXISTS market_scripts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  script VARCHAR(100) NOT NULL UNIQUE,
  segment ENUM('MCX', 'Equity', 'Currency') DEFAULT 'MCX',
  bid DECIMAL(15, 2) DEFAULT 0.00,
  ask DECIMAL(15, 2) DEFAULT 0.00,
  ltp DECIMAL(15, 2) DEFAULT 0.00,
  change_val DECIMAL(15, 2) DEFAULT 0.00,
  high DECIMAL(15, 2) DEFAULT 0.00,
  low DECIMAL(15, 2) DEFAULT 0.00,
  lot_size INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Trades
CREATE TABLE IF NOT EXISTS trades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trade_ref_id VARCHAR(50) NOT NULL,
  script VARCHAR(100) NOT NULL,
  segment VARCHAR(50) DEFAULT 'Equity',
  user_id VARCHAR(100) NOT NULL,
  client_id INT DEFAULT NULL,
  buy_rate DECIMAL(15, 2) DEFAULT 0.00,
  sell_rate DECIMAL(15, 2) DEFAULT 0.00,
  lots_units VARCHAR(100) DEFAULT '1 Lot',
  lots INT DEFAULT 1,
  units INT DEFAULT 1,
  time_seconds INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Executed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Pending Orders
CREATE TABLE IF NOT EXISTS pending_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_ref_id VARCHAR(50) NOT NULL,
  commodity VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  client_name VARCHAR(150) DEFAULT '',
  trade ENUM('BUY', 'SELL') NOT NULL,
  rate DECIMAL(15, 2) NOT NULL,
  lots INT NOT NULL DEFAULT 1,
  condition_type ENUM('below', 'above') DEFAULT 'below',
  status ENUM('Pending', 'Executed', 'Cancelled') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executed_on TIMESTAMP NULL DEFAULT NULL
);

-- 6. Action Ledger (Trade Logs)
CREATE TABLE IF NOT EXISTS action_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Fund Withdrawals & Deposits (Trader Funds)
CREATE TABLE IF NOT EXISTS funds_withdrawals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type ENUM('Deposit', 'Withdrawal') DEFAULT 'Deposit',
  notes VARCHAR(255) DEFAULT 'Opening balance',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. User Funds (Sub-broker Ledger adjustments)
CREATE TABLE IF NOT EXISTS user_funds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  funds DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 9. Weekly Accounts
CREATE TABLE IF NOT EXISTS weekly_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  week_period VARCHAR(100) NOT NULL,
  receivable_type ENUM('Receive from Parent Admin', 'Pay to Broker', 'Receive from Broker') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  broker_code VARCHAR(100) NOT NULL,
  broker_name VARCHAR(150) NOT NULL,
  sum_client_pl DECIMAL(15, 2) DEFAULT 0.00,
  sum_client_brokerage DECIMAL(15, 2) DEFAULT 0.00,
  sum_client_net DECIMAL(15, 2) DEFAULT 0.00,
  pl_share DECIMAL(15, 2) DEFAULT 0.00,
  brokerage_share DECIMAL(15, 2) DEFAULT 0.00,
  net_share DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT NOT NULL,
  delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
