import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';
import { CONFIG } from '../config';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { funds, marketData } = useMarket();

  const symbolsList = Object.values(marketData || {});
  const gainers = [...symbolsList].sort((a, b) => (b.changePct || 0) - (a.changePct || 0)).slice(0, 3);
  const losers = [...symbolsList].sort((a, b) => (a.changePct || 0) - (b.changePct || 0)).slice(0, 3);

  const openWhatsApp = () => {
    const url = `https://wa.me/${CONFIG.supportWhatsAppNumber}?text=Hello%20TradeNova,%20I%20would%20like%20to%20request%20funds%20deposit/withdrawal.`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeSub}>Welcome back,</Text>
          <Text style={styles.welcomeName}>{user?.name || user?.username || 'Institutional Trader'}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{(user?.role || 'TRADER').toUpperCase()} • LIVE LEDGER</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.depositBtn} onPress={openWhatsApp}>
          <Text style={styles.depositBtnText}>+ Add Funds</Text>
        </TouchableOpacity>
      </View>

      {/* Funds Ledger 2x2 Grid */}
      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Available Margin</Text>
          <Text style={[styles.statVal, { color: COLORS.green }]}>
            ₹{funds?.availableMargin?.toLocaleString('en-IN') || '8,15,000'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Used Margin</Text>
          <Text style={[styles.statVal, { color: COLORS.gold }]}>
            ₹{funds?.usedMargin?.toLocaleString('en-IN') || '1,85,000'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Account Balance</Text>
          <Text style={styles.statVal}>
            ₹{funds?.balance?.toLocaleString('en-IN') || '10,00,000'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Live M2M P&L</Text>
          <Text style={[styles.statVal, { color: (funds?.m2m || 0) >= 0 ? COLORS.green : COLORS.red }]}>
            {(funds?.m2m || 0) >= 0 ? '+' : ''}₹{funds?.m2m?.toLocaleString('en-IN') || '14,250'}
          </Text>
        </View>
      </View>

      {/* Market Movers Section */}
      <View style={styles.moversSection}>
        <Text style={styles.sectionTitle}>🔥 Top Gainers</Text>
        <View style={styles.moversCard}>
          {gainers.map((g, i) => (
            <View key={i} style={styles.moverRow}>
              <Text style={styles.moverSym}>{g.symbol}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.moverLtp}>₹{g.ltp?.toFixed(2)}</Text>
                <Text style={[styles.moverPct, { color: COLORS.green }]}>+{g.changePct?.toFixed(2)}%</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>🔻 Top Losers</Text>
        <View style={styles.moversCard}>
          {losers.map((l, i) => (
            <View key={i} style={styles.moverRow}>
              <Text style={styles.moverSym}>{l.symbol}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.moverLtp}>₹{l.ltp?.toFixed(2)}</Text>
                <Text style={[styles.moverPct, { color: COLORS.red }]}>{l.changePct?.toFixed(2)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
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
    paddingBottom: 30,
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  welcomeSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  rolePill: {
    backgroundColor: 'rgba(245, 190, 56, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.gold,
  },
  depositBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  depositBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#080b13',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 14,
    padding: 14,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 6,
    fontFamily: 'Courier',
  },
  moversSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moversCard: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
  },
  moverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  moverSym: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  moverLtp: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  moverPct: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'Courier',
  },
});
