import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useMarket } from '../context/MarketContext';
import { COLORS } from '../theme';

export default function PositionsScreen() {
  const { positions, squareOffPosition, refresh } = useMarket();

  const totalM2M = (positions || []).reduce((acc, p) => acc + (p.pnl || 0), 0);
  const isUp = totalM2M >= 0;

  const handleSquareOff = (pos) => {
    Alert.alert(
      'Square Off Position',
      `Close ${pos.symbol} (${pos.qty} lots)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Square Off',
          style: 'destructive',
          onPress: async () => {
            try {
              await squareOffPosition(pos.id);
              Alert.alert('Squared Off', `${pos.symbol} closed successfully.`);
            } catch (e) {
              Alert.alert('Error', e.message || 'Square off failed.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const posUp = (item.pnl || 0) >= 0;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.symTitle}>{item.symbol}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.sideBadge, item.side === 'buy' ? styles.sideBuy : styles.sideSell]}>
                <Text style={styles.sideText}>{item.side?.toUpperCase()}</Text>
              </View>
              <Text style={styles.qtyText}>Qty: {item.qty}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.pnlText, { color: posUp ? COLORS.green : COLORS.red }]}>
              {posUp ? '+' : ''}₹{item.pnl?.toFixed(2)}
            </Text>
            <Text style={styles.cmpText}>LTP: ₹{item.ltp?.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <Text style={styles.avgText}>Avg: ₹{item.avgPrice?.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.sqBtn}
            onPress={() => handleSquareOff(item)}
          >
            <Text style={styles.sqBtnText}>Square Off</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Total M2M Header */}
      <View style={styles.m2mHeader}>
        <Text style={styles.m2mLabel}>Total Net M2M P&L</Text>
        <Text style={[styles.m2mVal, { color: isUp ? COLORS.green : COLORS.red }]}>
          {isUp ? '+' : ''}₹{totalM2M.toFixed(2)}
        </Text>
        <Text style={styles.m2mSub}>Open Contracts: {positions?.length || 0}</Text>
      </View>

      {/* Positions List */}
      <FlatList
        data={positions}
        keyExtractor={item => String(item.id || item.symbol)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onRefresh={refresh}
        refreshing={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No Open Positions</Text>
            <Text style={styles.emptyDesc}>Place orders from the Market Watch to view active trades here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  m2mHeader: {
    backgroundColor: COLORS.bgSecondary,
    borderBottomWidth: 1,
    borderColor: COLORS.borderPrimary,
    padding: 20,
    alignItems: 'center',
  },
  m2mLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  m2mVal: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'Courier',
    marginVertical: 4,
  },
  m2mSub: {
    fontSize: 11.5,
    color: COLORS.textDim,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sideBuy: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  sideSell: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  sideText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  qtyText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  pnlText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Courier',
  },
  cmpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.borderPrimary,
    marginVertical: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avgText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Courier',
  },
  sqBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sqBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.red,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 240,
    lineHeight: 18,
  },
});
