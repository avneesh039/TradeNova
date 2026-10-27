import io from 'socket.io-client';
import { API } from './api';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connected = false;
  }

  connect() {
    const url = API.getServerUrl();
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.notify('status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.notify('status', { connected: false });
    });

    this.socket.on('marketData', (data) => {
      this.notify('marketData', data);
    });

    this.socket.on('orderExecuted', (data) => {
      this.notify('orderExecuted', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  notify(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.warn('Socket listener error:', e); }
      });
    }
  }
}

export const Socket = new SocketService();
