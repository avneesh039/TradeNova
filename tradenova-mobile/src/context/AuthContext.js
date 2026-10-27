import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../services/api';
import { Socket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rememberedUser, setRememberedUser] = useState('');

  useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('tradenova_remembered_user');
      if (savedUser) setRememberedUser(savedUser);
    } catch (e) {
      console.warn('Error reading saved user:', e);
    }
  };

  const checkSession = async () => {
    try {
      const res = await API.get('/api/me');
      if (res && res.id) {
        setUser(res);
        Socket.connect();
        return res;
      }
      setUser(null);
      return null;
    } catch (e) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, remember = true) => {
    const res = await API.post('/api/login', { username, password });
    if (res && res.user) {
      setUser(res.user);
      Socket.connect();
      if (remember) {
        await AsyncStorage.setItem('tradenova_remembered_user', username);
        setRememberedUser(username);
      } else {
        await AsyncStorage.removeItem('tradenova_remembered_user');
        setRememberedUser('');
      }
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const loginAs = async (username, password) => {
    return login(username, password, false);
  };

  const logout = async () => {
    try {
      await API.post('/api/logout');
    } catch (e) {}
    setUser(null);
    Socket.disconnect();
  };

  const sendRegisterOtp = async ({ name, phone, username, city, password }) => {
    const res = await API.post('/api/register/send-otp', {
      name,
      phone,
      username,
      city,
      password,
    });
    return res;
  };

  const verifyRegisterOtp = async ({ phone, otp }) => {
    const res = await API.post('/api/register/verify-otp', { phone, otp });
    if (res && res.user) {
      setUser(res.user);
      Socket.connect();
      return res.user;
    }
    throw new Error(res.error || 'Verification failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        rememberedUser,
        checkSession,
        login,
        loginAs,
        logout,
        sendRegisterOtp,
        verifyRegisterOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
