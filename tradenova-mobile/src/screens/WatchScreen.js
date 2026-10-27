import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
} from 'react-native';
import { useMarket } from '../context/MarketContext';
import { COLORS } from '../theme';
import OrderModal from '../components/OrderModal';

export default function WatchScreen({ navigation }) {
  const { marketData, setSelectedSymbol } = useMarket();
  const [filterSegment, setFilterSegment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSymbol, setModalSymbol] = useState(null);
  const [modalSide, setModalSide] = useState('buy');

  const symbolsList = Object.values(marketData || {});

  const filtered = symbolsList.filter(item => {
    const matchSegment = filterSegment === 'ALL' || item.segment === filterSegment;
    const matchQuery = !searchQuery || item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSegment && matchQuery;
  });

  const openOrder = (item, side) => {
    setModalSymbol(item);
    setModalSide(side);
  };

  const openTerminal = (item) => {
    setSelectedSymbol(item.symbol);
    navigation.navigate('Terminal');
  };

  const renderItem = ({ item }) => {
    const isUp = item.change >= 0;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openTerminal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.symName}>{item.symbol}</Text>
          <View style={styles.segmentBadge}>
            <Text style={styles.segmentText}>{item.segment || 'NSE'}</Text>
          </View>
        </View>

        <View style={styles.cardCenter}>
          <Text style={styles.ltpText}>₹{item.ltp?.toFixed(2)}</Text>
          <Text style={[styles.changeText, { color: isUp ? COLORS.green : COLORS.red }]}>
            {isUp ? '+' : ''}{item.change?.toFixed(2)} ({isUp ? '+' : ''}{item.changePct?.toFixed(2)}%)
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBuy]}
            onPress={() => openOrder(item, 'buy')}
          >
            <Text style={styles.actionBtnText}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionSell]}
            onPress={() => openOrder(item, 'sell')}
          >
            <Text style={styles.actionBtnText}>S</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} />

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search NSE Cash, MCX Futures, Options..."
          placeholderTextColor={COLORS.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Segment Filters */}
      <View style={styles.filtersRow}>
        {['ALL', 'NSE', 'MCX', 'F&O'].map(seg => (
          <TouchableOpacity
            key={seg}
            style={[styles.filterChip, filterSegment === seg && styles.filterChipActive]}
            onPress={() => setFilterSegment(seg)}
          >
            <Text style={[styles.filterText, filterSegment === seg && styles.filterTextActive]}>
              {seg}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.symbol}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Order Ticket Modal */}
      {modalSymbol && (
        <OrderModal
          visible={!!modalSymbol}
          symbolData={modalSymbol}
          initialSide={modalSide}
          onClose={() => setModalSymbol(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.bgTertiary,
  },
  filterChipActive: {
    backgroundColor: COLORS.gold,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: '#080b13',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardLeft: {
    flex: 1,
  },
  symName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  segmentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  segmentText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  cardCenter: {
    alignItems: 'flex-end',
    marginRight: 14,
  },
  ltpText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'Courier',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBuy: {
    backgroundColor: COLORS.green,
  },
  actionSell: {
    backgroundColor: COLORS.red,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
