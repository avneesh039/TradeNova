import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { API } from '../services/api';
import { COLORS } from '../theme';
import { CONFIG } from '../config';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { connected } = useMarket();
  const [serverUrl, setServerUrl] = useState(API.getServerUrl());
  const [editingUrl, setEditingUrl] = useState(false);

  const handleSaveUrl = async () => {
    try {
      await API.setServerUrl(serverUrl);
      setEditingUrl(false);
      Alert.alert('Saved', 'Server URL updated successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to update server URL.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out from TradeNova?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  const replaySplash = () => {
    navigation.navigate('Splash');
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/${CONFIG.supportWhatsAppNumber}?text=Hello%20TradeNova%20Broker%20Desk,%20I%20need%20account%20support.`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || user?.username || 'A')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || user?.username || 'Trader'}</Text>
        <Text style={styles.userId}>User ID: @{user?.username || 'user'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{(user?.role || 'TRADER').toUpperCase()}</Text>
        </View>
      </View>

      {/* Connection Status Box */}
      <View style={styles.statusBox}>
        <View style={styles.statusLeft}>
          <View style={[styles.dot, { backgroundColor: connected ? COLORS.online : COLORS.offline }]} />
          <Text style={styles.statusTitle}>HFT Market Feed Connection</Text>
        </View>
        <Text style={[styles.statusState, { color: connected ? COLORS.online : COLORS.offline }]}>
          {connected ? 'Active (Live)' : 'Disconnected'}
        </Text>
      </View>

      {/* Settings Options */}
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={replaySplash}>
          <Text style={styles.menuIcon}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Replay App Splash Screen</Text>
            <Text style={styles.menuSub}>View luxury animated startup sequence</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={openWhatsApp}>
          <Text style={styles.menuIcon}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>WhatsApp Broker Support Desk</Text>
            <Text style={styles.menuSub}>Instant trade limits & deposit support</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setEditingUrl(!editingUrl)}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Server Gateway API</Text>
            <Text style={styles.menuSub}>{API.getServerUrl()}</Text>
          </View>
          <Text style={styles.menuArrow}>{editingUrl ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {editingUrl && (
          <View style={styles.urlEditBox}>
            <TextInput
              style={styles.urlInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://10.0.2.2:3000 or your IP"
              placeholderTextColor={COLORS.textDim}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.saveUrlBtn} onPress={handleSaveUrl}>
              <Text style={styles.saveUrlText}>Save Gateway</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Sign Out / Switch Trader Account</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>TradeNova SN Mobile • v{CONFIG.version} (Native React Native)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#080b13',
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  userId: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: 'Courier',
  },
  roleBadge: {
    backgroundColor: 'rgba(245, 190, 56, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 190, 56, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 10,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  statusBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusState: {
    fontSize: 11,
    fontWeight: '800',
  },
  menuCard: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 18,
    color: COLORS.textDim,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  urlEditBox: {
    paddingVertical: 10,
    gap: 8,
  },
  urlInput: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  saveUrlBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveUrlText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#080b13',
  },
  logoutBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.red,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textDim,
    textAlign: 'center',
  },
});
