import React, { createContext, useState, useEffect, useContext } from 'react';
import { Socket } from '../services/socket';
import { API } from '../services/api';
import { useAuth } from './AuthContext';

const MarketContext = createContext();

const INITIAL_SYMBOLS = [
  { symbol: 'NIFTY 50', segment: 'NSE', ltp: 24350.25, change: 125.40, changePct: 0.52, high: 24410, low: 24280 },
  { symbol: 'BANKNIFTY', segment: 'NSE', ltp: 51840.10, change: -180.20, changePct: -0.35, high: 52100, low: 51720 },
  { symbol: 'RELIANCE', segment: 'NSE', ltp: 2950.45, change: 18.30, changePct: 0.62, high: 2965, low: 2930 },
  { symbol: 'HDFCBANK', segment: 'NSE', ltp: 1680.15, change: -4.50, changePct: -0.27, high: 1692, low: 1675 },
  { symbol: 'CRUDEOIL 19NOV FUT', segment: 'MCX', ltp: 6045.00, change: 48.00, changePct: 0.80, high: 6090, low: 5980 },
  { symbol: 'GOLD 05DEC FUT', segment: 'MCX', ltp: 78450.00, change: 280.00, changePct: 0.36, high: 78600, low: 78200 },
  { symbol: 'SILVER 05DEC FUT', segment: 'MCX', ltp: 94800.00, change: -450.00, changePct: -0.47, high: 95400, low: 94500 },
  { symbol: 'NATURALGAS 26NOV FUT', segment: 'MCX', ltp: 242.60, change: 3.40, changePct: 1.42, high: 245.5, low: 238.0 },
];

export const MarketProvider = ({ children }) => {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState(() => {
    const map = {};
    INITIAL_SYMBOLS.forEach(s => { map[s.symbol] = s; });
    return map;
  });
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY 50');
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [funds, setFunds] = useState({
    balance: 1000000,
    usedMargin: 185000,
    availableMargin: 815000,
    m2m: 14250,
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchInitialData();

    const unsubStatus = Socket.on('status', ({ connected }) => {
      setConnected(connected);
    });

    const unsubMarket = Socket.on('marketData', (incoming) => {
      setMarketData(prev => ({ ...prev, ...incoming }));
    });

    const unsubOrder = Socket.on('orderExecuted', (order) => {
      setOrders(prev => [order, ...prev]);
      fetchPositions();
    });

    return () => {
      unsubStatus();
      unsubMarket();
      unsubOrder();
    };
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [posRes, ordRes, fundsRes] = await Promise.allSettled([
        API.get('/api/positions'),
        API.get('/api/orders'),
        API.get('/api/funds'),
      ]);

      if (posRes.status === 'fulfilled' && Array.isArray(posRes.value)) {
        setPositions(posRes.value);
      }
      if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value)) {
        setOrders(ordRes.value);
      }
      if (fundsRes.status === 'fulfilled' && fundsRes.value) {
        setFunds(prev => ({ ...prev, ...fundsRes.value }));
      }
    } catch (e) {
      console.warn('Initial data load error:', e);
    }
  };

  const fetchPositions = async () => {
    try {
      const data = await API.get('/api/positions');
      if (Array.isArray(data)) setPositions(data);
    } catch (e) {}
  };

  const placeOrder = async ({ symbol, side, qty, orderType = 'MARKET', price = 0 }) => {
    const res = await API.post('/api/orders', {
      symbol,
      side,
      qty: Number(qty),
      orderType,
      price: Number(price),
    });
    fetchInitialData();
    return res;
  };

  const squareOffPosition = async (positionId) => {
    const res = await API.post(`/api/positions/${positionId}/square-off`);
    fetchInitialData();
    return res;
  };

  return (
    <MarketContext.Provider
      value={{
        marketData,
        selectedSymbol,
        setSelectedSymbol,
        positions,
        orders,
        funds,
        connected,
        placeOrder,
        squareOffPosition,
        refresh: fetchInitialData,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
