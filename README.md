# TradeNova

> **TradeNova** is a comprehensive trading platform and brokerage administration system engineered for brokerages, sub-brokers, and financial administrators. Built with **Node.js**, **Express**, and **MySQL**, TradeNova provides real-time client risk controls, ledger balances, P&L analytics, client governance, and trade management.

---

## 🚀 Key Features

- **Multi-Tenant Brokerage & Sub-Broker Hierarchy**: Manage administrators, sub-brokers, and clients with granular role-based permissions and credit limits.
- **Client Risk Management & Governance**:
  - Live ledger balance tracking & credit limits
  - Automated trade blocking and configurable trade timers
  - Demo vs. live account segregation
  - Granular account status controls (Active / Inactive)
- **Real-Time P&L & Analytics**:
  - Gross P&L, brokerage calculation, and net P&L metrics
  - Portfolio performance visibility across clients and sub-brokers
- **Order & Trade Administration**: Monitor executions, manage position limits, and review transaction histories.
- **Modern Responsive Dashboard**: Pixel-perfect trading dashboard with quick search, mobile drawer navigation, modal dialogues, and responsive analytics.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.x with connection pooling (`mysql2`)
- **Frontend**: Vanilla JavaScript (ES6+), Modern CSS3 (Glassmorphism & dark trading aesthetic), HTML5
- **Configuration**: Dotenv (`.env`)

---

## 📂 Project Structure

```
tradenova/
├── database/
│   ├── db.js              # MySQL database connection pool & initialization
│   ├── schema.sql         # Database schema for users, clients, trades & ledgers
│   └── seed-data.js       # Seed scripts for development/demo data
├── public/
│   ├── css/
│   │   └── style.css      # Core UI design tokens and component styles
│   ├── js/
│   │   └── app.js         # Frontend dashboard logic and API client
│   └── index.html         # Main administration dashboard interface
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore definitions
├── package.json           # Application dependencies and scripts
└── server.js              # Express HTTP server and REST API routes
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL](https://www.mysql.com/) (v8.0+)

### 1. Clone the Repository

```bash
git clone https://github.com/avneesh039/TradeNova.git
cd TradeNova
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tradenova_db
DB_PORT=3306
```

### 4. Initialize Database

Execute the schema and seed scripts:

```bash
mysql -u root -p < database/schema.sql
node database/seed-data.js
```

### 5. Run the Server

```bash
# Production mode
npm start

# Development mode (with file watcher)
npm run dev
```

The application will be running at `http://localhost:5000`.

---

## 📄 License

ISC License.
