import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useMarket } from '../context/MarketContext';
import { COLORS } from '../theme';
import OrderModal from '../components/OrderModal';

const { width } = Dimensions.get('window');

export default function TerminalScreen() {
  const { marketData, selectedSymbol, setSelectedSymbol } = useMarket();
  const [interval, setInterval] = useState('5m');
  const [modalSide, setModalSide] = useState(null);

  const symData = marketData[selectedSymbol] || {
    symbol: selectedSymbol || 'NIFTY 50',
    ltp: 24350.25,
    change: 125.40,
    changePct: 0.52,
    high: 24410,
    low: 24280,
  };

  const isUp = symData.change >= 0;

  // Mock 5-level market depth based on current LTP
  const ltp = symData.ltp || 1000;
  const depthBids = [
    { qty: 1500, orders: 12, price: ltp - 0.25 },
    { qty: 2400, orders: 18, price: ltp - 0.50 },
    { qty: 3800, orders: 25, price: ltp - 0.75 },
    { qty: 1200, orders: 8, price: ltp - 1.00 },
    { qty: 4500, orders: 30, price: ltp - 1.25 },
  ];
  const depthAsks = [
    { qty: 1800, orders: 14, price: ltp + 0.25 },
    { qty: 2200, orders: 16, price: ltp + 0.50 },
    { qty: 3100, orders: 22, price: ltp + 0.75 },
    { qty: 1900, orders: 11, price: ltp + 1.00 },
    { qty: 5200, orders: 34, price: ltp + 1.25 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Symbol Header */}
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.symTitle}>{symData.symbol}</Text>
            <Text style={styles.symSegment}>{symData.segment || 'NSE'} • Equity Derivatives</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.ltpVal}>₹{symData.ltp?.toFixed(2)}</Text>
            <Text style={[styles.changeVal, { color: isUp ? COLORS.green : COLORS.red }]}>
              {isUp ? '+' : ''}{symData.change?.toFixed(2)} ({isUp ? '+' : ''}{symData.changePct?.toFixed(2)}%)
            </Text>
          </View>
        </View>

        {/* Interval Selector */}
        <View style={styles.intervalRow}>
          {['1m', '3m', '5m', '15m', '1h', '1D'].map(it => (
            <TouchableOpacity
              key={it}
              style={[styles.intChip, interval === it && styles.intChipActive]}
              onPress={() => setInterval(it)}
            >
              <Text style={[styles.intText, interval === it && styles.intTextActive]}>{it}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Interactive Candlestick Chart Placeholder */}
        <View style={styles.chartCanvas}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>📊 Live Candlestick Feed ({interval})</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>STREAMING</Text>
            </View>
          </View>

          {/* Candle bars simulation */}
          <View style={styles.candleBarsRow}>
            {[45, 60, 52, 75, 68, 85, 92, 78, 88, 95, 82, 90, 100].map((h, i) => {
              const greenCandle = i % 3 !== 0;
              return (
                <View key={i} style={styles.candleCol}>
                  <View style={[styles.candleWick, { height: h + 15, backgroundColor: greenCandle ? COLORS.green : COLORS.red }]} />
                  <View
                    style={[
                      styles.candleBody,
                      {
                        height: h,
                        backgroundColor: greenCandle ? COLORS.green : COLORS.red,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.chartStatsRow}>
            <Text style={styles.statMini}>H: ₹{symData.high}</Text>
            <Text style={styles.statMini}>L: ₹{symData.low}</Text>
            <Text style={styles.statMini}>Vol: 4.8M</Text>
          </View>
        </View>

        {/* Level 2 Market Depth */}
        <View style={styles.depthCard}>
          <Text style={styles.depthTitle}>Market Depth (5 Best Bids / Asks)</Text>
          <View style={styles.depthColumns}>
            {/* Bid Side */}
            <View style={styles.depthSide}>
              <View style={styles.depthHeadRow}>
                <Text style={styles.depthHeadText}>Orders</Text>
                <Text style={styles.depthHeadText}>Qty</Text>
                <Text style={[styles.depthHeadText, { color: COLORS.green }]}>Bid</Text>
              </View>
              {depthBids.map((b, idx) => (
                <View key={idx} style={styles.depthDataRow}>
                  <Text style={styles.depthCell}>{b.orders}</Text>
                  <Text style={styles.depthCell}>{b.qty}</Text>
                  <Text style={[styles.depthCell, { color: COLORS.green, fontWeight: '700' }]}>
                    {b.price.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Ask Side */}
            <View style={styles.depthSide}>
              <View style={styles.depthHeadRow}>
                <Text style={[styles.depthHeadText, { color: COLORS.red }]}>Ask</Text>
                <Text style={styles.depthHeadText}>Qty</Text>
                <Text style={styles.depthHeadText}>Orders</Text>
              </View>
              {depthAsks.map((a, idx) => (
                <View key={idx} style={styles.depthDataRow}>
                  <Text style={[styles.depthCell, { color: COLORS.red, fontWeight: '700' }]}>
                    {a.price.toFixed(2)}
                  </Text>
                  <Text style={styles.depthCell}>{a.qty}</Text>
                  <Text style={styles.depthCell}>{a.orders}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Quick Buy / Sell Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          style={[styles.bigBtn, styles.bigBuyBtn]}
          onPress={() => setModalSide('buy')}
        >
          <Text style={styles.bigBtnText}>BUY (₹{symData.ltp?.toFixed(2)})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bigBtn, styles.bigSellBtn]}
          onPress={() => setModalSide('sell')}
        >
          <Text style={styles.bigBtnText}>SELL (₹{symData.ltp?.toFixed(2)})</Text>
        </TouchableOpacity>
      </View>

      {modalSide && (
        <OrderModal
          visible={!!modalSide}
          symbolData={symData}
          initialSide={modalSide}
          onClose={() => setModalSide(null)}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  symTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  symSegment: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  ltpVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  changeVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'Courier',
  },
  intervalRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  intChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.bgTertiary,
  },
  intChipActive: {
    backgroundColor: COLORS.gold,
  },
  intText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  intTextActive: {
    color: '#080b13',
  },
  chartCanvas: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 16,
    padding: 16,
    height: 240,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.green,
  },
  candleBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingHorizontal: 8,
  },
  candleCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 14,
    height: '100%',
  },
  candleWick: {
    position: 'absolute',
    width: 1.5,
    bottom: 0,
    opacity: 0.6,
  },
  candleBody: {
    width: 10,
    borderRadius: 2,
  },
  chartStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: COLORS.borderPrimary,
    paddingTop: 8,
  },
  statMini: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'Courier',
  },
  depthCard: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  depthTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  depthColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  depthSide: {
    flex: 1,
  },
  depthHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderColor: COLORS.borderPrimary,
    paddingBottom: 4,
  },
  depthHeadText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  depthDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  depthCell: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'Courier',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgSecondary,
    borderTopWidth: 1,
    borderColor: COLORS.borderPrimary,
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  bigBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigBuyBtn: {
    backgroundColor: COLORS.green,
  },
  bigSellBtn: {
    backgroundColor: COLORS.red,
  },
  bigBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
