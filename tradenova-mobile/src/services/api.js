import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_API_URL } from '../config';

class ApiService {
  constructor() {
    this.baseUrl = DEFAULT_API_URL;
    this.init();
  }

  async init() {
    const savedUrl = await AsyncStorage.getItem('tradenova_server_url');
    if (savedUrl) this.baseUrl = savedUrl;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
  }

  async setServerUrl(url) {
    this.baseUrl = url.trim().replace(/\/$/, '');
    await AsyncStorage.setItem('tradenova_server_url', this.baseUrl);
    this.client.defaults.baseURL = this.baseUrl;
  }

  getServerUrl() {
    return this.baseUrl;
  }

  async get(url, params = {}) {
    if (!this.client) await this.init();
    return this.client.get(url, { params }).then(res => res.data);
  }

  async post(url, data = {}) {
    if (!this.client) await this.init();
    return this.client.post(url, data).then(res => res.data);
  }

  async put(url, data = {}) {
    if (!this.client) await this.init();
    return this.client.put(url, data).then(res => res.data);
  }

  async delete(url) {
    if (!this.client) await this.init();
    return this.client.delete(url).then(res => res.data);
  }

  // ── Indian Stock Exchange API2 (RapidAPI: linuz) ──
  async getIndianStockQuote(symbol) {
    return this.get(`/api/market/stock/${encodeURIComponent(symbol)}`);
  }

  async getTrendingStocks() {
    return this.get('/api/market/trending');
  }

  async getPriceShockers() {
    return this.get('/api/market/shockers');
  }

  async getMostActive(exchange = 'NSE') {
    return this.get(`/api/market/active/${exchange}`);
  }

  async getIndianMarketNews() {
    return this.get('/api/market/news');
  }
}

export const API = new ApiService();
