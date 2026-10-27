import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useMarket } from '../context/MarketContext';
import { COLORS } from '../theme';

export default function OrdersScreen() {
  const { orders, refresh } = useMarket();
  const [filter, setFilter] = useState('ALL');

  const filteredOrders = (orders || []).filter(o => {
    if (filter === 'ALL') return true;
    if (filter === 'EXECUTED') return (o.status || '').toLowerCase() === 'executed';
    if (filter === 'PENDING') return (o.status || '').toLowerCase() === 'pending';
    return true;
  });

  const renderItem = ({ item }) => {
    const isExecuted = (item.status || '').toLowerCase() === 'executed';
    const isBuy = (item.side || '').toLowerCase() === 'buy';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.symText}>{item.symbol}</Text>
            <Text style={styles.timeText}>{item.time || item.createdAt || 'Today'}</Text>
          </View>
          <View style={[styles.statusBadge, isExecuted ? styles.statusExecuted : styles.statusPending]}>
            <Text style={[styles.statusText, isExecuted ? styles.textExecuted : styles.textPending]}>
              {item.status || 'EXECUTED'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Type</Text>
            <View style={[styles.sidePill, isBuy ? styles.pillBuy : styles.pillSell]}>
              <Text style={styles.sidePillText}>{item.side?.toUpperCase()} • {item.orderType || 'MARKET'}</Text>
            </View>
          </View>

          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Qty</Text>
            <Text style={styles.detailVal}>{item.qty} Lots</Text>
          </View>

          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailVal}>₹{item.price ? Number(item.price).toFixed(2) : 'MKT'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {['ALL', 'EXECUTED', 'PENDING'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filter === f && styles.tabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onRefresh={refresh}
        refreshing={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptyDesc}>New trades executed on the terminal will appear here.</Text>
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
  tabsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.bgTertiary,
  },
  tabActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#080b13',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  symText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusExecuted: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 190, 56, 0.12)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textExecuted: {
    color: COLORS.green,
  },
  textPending: {
    color: COLORS.gold,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: COLORS.borderPrimary,
    paddingTop: 10,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  sidePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillBuy: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pillSell: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  sidePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 36,
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
    marginTop: 4,
  },
});
