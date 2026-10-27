-- ═══════════════════════════════════════════════════════════════
-- TradeNova SN — All-In-One MySQL Setup Script
-- Database: tradenova | User: tradenova | Pass: tradenova123@
-- ═══════════════════════════════════════════════════════════════

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS `tradenova` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Create User & Grant Privileges (Localhost, 127.0.0.1 & Any Host)
CREATE USER IF NOT EXISTS 'tradenova'@'localhost' IDENTIFIED BY 'tradenova123@';
ALTER USER 'tradenova'@'localhost' IDENTIFIED BY 'tradenova123@';
GRANT ALL PRIVILEGES ON `tradenova`.* TO 'tradenova'@'localhost';

CREATE USER IF NOT EXISTS 'tradenova'@'127.0.0.1' IDENTIFIED BY 'tradenova123@';
ALTER USER 'tradenova'@'127.0.0.1' IDENTIFIED BY 'tradenova123@';
GRANT ALL PRIVILEGES ON `tradenova`.* TO 'tradenova'@'127.0.0.1';

CREATE USER IF NOT EXISTS 'tradenova'@'%' IDENTIFIED BY 'tradenova123@';
ALTER USER 'tradenova'@'%' IDENTIFIED BY 'tradenova123@';
GRANT ALL PRIVILEGES ON `tradenova`.* TO 'tradenova'@'%';

FLUSH PRIVILEGES;

-- 3. Switch to Target Database
USE `tradenova`;

-- 4. Create Tables
-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `mobile` VARCHAR(50),
  `city` VARCHAR(100) DEFAULT '',
  `role` ENUM('admin', 'broker', 'client') DEFAULT 'client',
  `broker` VARCHAR(100) DEFAULT 'AG',
  `funds` DECIMAL(15,2) DEFAULT 100000.00,
  `credits` DECIMAL(15,2) DEFAULT 500000.00,
  `credit_limit` DECIMAL(15,2) DEFAULT 500000.00,
  `opening_balance` DECIMAL(15,2) DEFAULT 100000.00,
  `trade_block_time` INT DEFAULT 0,
  `demo` TINYINT(1) DEFAULT 0,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `aobhl` TINYINT(1) DEFAULT 1,
  `toahl` TINYINT(1) DEFAULT 1,
  `trade_equity_as_units` TINYINT(1) DEFAULT 1,
  `auto_square_close_at` DECIMAL(5,2) DEFAULT 90.00,
  `auto_square_notify_at` DECIMAL(5,2) DEFAULT 70.00,
  `commodity` TINYINT(1) DEFAULT 1,
  `min_size_trade_commodity` DECIMAL(10,2) DEFAULT 0.00,
  `max_size_trade_commodity` DECIMAL(10,2) DEFAULT 2.00,
  `max_size_script_commodity` DECIMAL(10,2) DEFAULT 5.00,
  `max_size_all_commodity` DECIMAL(10,2) DEFAULT 20.00,
  `mcx_brokerage_type` VARCHAR(50) DEFAULT 'per_crore',
  `commodity_brokerage` DECIMAL(10,2) DEFAULT 2000.00,
  `exposure_mcx_type` VARCHAR(50) DEFAULT 'per_turnover',
  `exposure_mcx` DECIMAL(10,2) DEFAULT 200.00,
  `holding_exposure_mcx` DECIMAL(10,2) DEFAULT 20.00,
  `brokerage_mcx` JSON,
  `exposure_mcx_lot` JSON,
  `holding_exposure_mcx_lot` JSON,
  `equity` TINYINT(1) DEFAULT 1,
  `equity_brokerage_type` VARCHAR(50) DEFAULT 'per_crore',
  `equity_brokerage` DECIMAL(10,2) DEFAULT 4000.00,
  `min_size_trade_equity` DECIMAL(10,2) DEFAULT 0.00,
  `max_size_trade_equity` DECIMAL(10,2) DEFAULT 2.00,
  `min_size_trade_index` DECIMAL(10,2) DEFAULT 0.00,
  `max_size_trade_index` DECIMAL(10,2) DEFAULT 5.00,
  `max_size_script_equity` DECIMAL(10,2) DEFAULT 5.00,
  `max_size_script_index` DECIMAL(10,2) DEFAULT 10.00,
  `max_size_all_equity` DECIMAL(10,2) DEFAULT 20.00,
  `max_size_all_index` DECIMAL(10,2) DEFAULT 20.00,
  `exposure_equity` DECIMAL(10,2) DEFAULT 200.00,
  `holding_exposure_equity` DECIMAL(10,2) DEFAULT 20.00,
  `notes` TEXT,
  `transaction_password` VARCHAR(255) DEFAULT '',
  `created_at` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `symbol` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150),
  `exchange` VARCHAR(20) NOT NULL,
  `side` ENUM('buy', 'sell') NOT NULL,
  `qty` INT NOT NULL,
  `lots` INT NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `order_type` VARCHAR(20) DEFAULT 'market',
  `condition_type` VARCHAR(50) DEFAULT 'LTP <= Rate',
  `status` ENUM('executed', 'pending', 'cancelled') DEFAULT 'executed',
  `executed_price` DECIMAL(12,2),
  `executed_at` BIGINT,
  `brokerage` DECIMAL(10,2) DEFAULT 0.00,
  `margin` DECIMAL(15,2) DEFAULT 0.00,
  `user_id` INT NOT NULL,
  `timestamp` BIGINT NOT NULL,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: positions
CREATE TABLE IF NOT EXISTS `positions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `symbol` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150),
  `exchange` VARCHAR(20) NOT NULL,
  `side` ENUM('buy', 'sell') NOT NULL,
  `qty` INT NOT NULL,
  `lots` INT NOT NULL,
  `entry_price` DECIMAL(12,2) NOT NULL,
  `margin` DECIMAL(15,2) DEFAULT 0.00,
  `user_id` INT NOT NULL,
  `timestamp` BIGINT NOT NULL,
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: closed_trades
CREATE TABLE IF NOT EXISTS `closed_trades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `symbol` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150),
  `exchange` VARCHAR(20) NOT NULL,
  `side` ENUM('buy', 'sell') NOT NULL,
  `qty` INT NOT NULL,
  `lots` INT NOT NULL,
  `entry_price` DECIMAL(12,2) NOT NULL,
  `exit_price` DECIMAL(12,2) NOT NULL,
  `pnl` DECIMAL(15,2) NOT NULL,
  `brokerage` DECIMAL(10,2) DEFAULT 0.00,
  `net_pnl` DECIMAL(15,2) NOT NULL,
  `user_id` INT NOT NULL,
  `timestamp` BIGINT NOT NULL,
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: fund_transactions
CREATE TABLE IF NOT EXISTS `fund_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('deposit', 'withdraw') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `notes` TEXT,
  `user_id` INT NOT NULL,
  `timestamp` BIGINT NOT NULL,
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `from_user_id` INT NOT NULL,
  `timestamp` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Seed Core Accounts (Super Admin AG, Admin admin, Client demo)
INSERT INTO `users` (
  `id`, `name`, `username`, `password`, `phone`, `mobile`, `city`, `role`, `broker`,
  `funds`, `credits`, `credit_limit`, `opening_balance`, `trade_block_time`, `demo`, `status`,
  `aobhl`, `toahl`, `trade_equity_as_units`, `auto_square_close_at`, `auto_square_notify_at`,
  `commodity`, `min_size_trade_commodity`, `max_size_trade_commodity`, `max_size_script_commodity`, `max_size_all_commodity`,
  `mcx_brokerage_type`, `commodity_brokerage`, `exposure_mcx_type`, `exposure_mcx`, `holding_exposure_mcx`,
  `brokerage_mcx`, `exposure_mcx_lot`, `holding_exposure_mcx_lot`,
  `equity`, `equity_brokerage_type`, `equity_brokerage`,
  `min_size_trade_equity`, `max_size_trade_equity`, `min_size_trade_index`, `max_size_trade_index`,
  `max_size_script_equity`, `max_size_script_index`, `max_size_all_equity`, `max_size_all_index`,
  `exposure_equity`, `holding_exposure_equity`, `notes`, `transaction_password`, `created_at`
) VALUES 
(
  1, 
  'Administrator', 
  'admin', 
  '$2a$10$wK1W0i9tM8zDqMh.mD0Wse7.3K3898H2vQ2uDk47JvW4yG6t2pU7e', -- pass: admin123
  '9999999999', '9999999999', 'Mumbai', 'admin', 'Super Admin',
  1000000.00, 5000000.00, 5000000.00, 1000000.00, 0, 0, 'active',
  1, 1, 1, 90.00, 70.00,
  1, 0.00, 2.00, 5.00, 20.00,
  'per_crore', 2000.00, 'per_turnover', 200.00, 20.00,
  '{}', '{}', '{}',
  1, 'per_crore', 4000.00,
  0.00, 2.00, 0.00, 5.00,
  5.00, 10.00, 20.00, 20.00,
  200.00, 20.00, 'System Administrator Master Broker', '', 1792650000000
),
(
  2, 
  'AG Vikas', 
  'AG', 
  '$2a$10$gMsqjYqjQ43EeqJ35kUGeOV91Z3P.h249cEre.dEvD2e8u1Z2s3zS', -- pass: 123456
  '9876543211', '9876543211', 'Delhi', 'admin', 'Super Admin',
  1307342.89, 500000.00, 5000000.00, 1000000.00, 0, 0, 'active',
  1, 1, 1, 90.00, 70.00,
  1, 0.00, 2.00, 5.00, 20.00,
  'per_crore', 2000.00, 'per_turnover', 200.00, 20.00,
  '{}', '{}', '{}',
  1, 'per_crore', 4000.00,
  0.00, 2.00, 0.00, 5.00,
  5.00, 10.00, 20.00, 20.00,
  200.00, 20.00, 'Super Admin - AG Vikas', '', 1792650000000
),
(
  3, 
  'Demo Trader', 
  'demo', 
  '$2a$10$X87R7O4V6D19X5u6oK72ce.7f40v4f7Jg3rGz648B1N73l9G7e7Zq', -- pass: demo
  '9876543210', '9876543210', '', 'client', 'AG',
  100000.00, 500000.00, 500000.00, 100000.00, 0, 1, 'active',
  1, 1, 1, 90.00, 70.00,
  1, 0.00, 2.00, 5.00, 20.00,
  'per_crore', 2000.00, 'per_turnover', 200.00, 20.00,
  '{}', '{}', '{}',
  1, 'per_crore', 4000.00,
  0.00, 2.00, 0.00, 5.00,
  5.00, 10.00, 20.00, 20.00,
  200.00, 20.00, 'Demo Client Account', '', 1792650000000
)
ON DUPLICATE KEY UPDATE `status` = 'active';
