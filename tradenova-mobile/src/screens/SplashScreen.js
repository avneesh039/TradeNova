import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '0',
    type: 'exchanges',
    exchanges: ['NSE', 'BSE', 'MCX'],
    quotes: [
      { sym: 'NIFTY 50', val: '24,180.50', chg: '▲ +0.45%' },
      { sym: 'BANKNIFTY', val: '51,245.80', chg: '▲ +0.62%' },
      { sym: 'CRUDE OIL', val: '6,215.00', chg: '▲ +1.10%' },
    ],
    title: 'Multi-Market Indian Terminal',
    description:
      'Direct sub-10ms Zerodha Kite tick streaming across NSE Cash, F&O Derivatives, and MCX Commodities.',
    chips: ['🇮🇳 100% Indian Exchanges', '⚡ Sub-10ms Feed', '📊 Live Depth'],
    btnLabel: 'Explore Margin & Desk →',
  },
  {
    id: '1',
    type: 'leverage',
    multiplier: '500x',
    capital: '₹10,00,000',
    title: 'Institutional Margin & Execution',
    description:
      'Trade with maximum margin multiplier, zero slippage fills, and real-time mark-to-market risk tracking.',
    chips: ['💰 ₹10L Balance', '🎯 Zero Slippage', '🛡️ Instant Bracket Orders'],
    btnLabel: 'Get Instant Access →',
  },
  {
    id: '2',
    type: 'whatsapp',
    title: 'Instant Access in 10 Seconds',
    description:
      'Zero KYC paperwork. Verify via automated WhatsApp OTP and start trading immediately with 24/7 desk support.',
    chips: ['📲 10s OTP Verify', '💬 24/7 Desk Help', '🔒 256-Bit SSL'],
    btnLabel: 'Get Started →',
  },
];

export default function SplashScreen({ navigation }) {
  const { checkSession } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const onboarded = await AsyncStorage.getItem('@tradenova_onboarded');
        const user = await checkSession();
        if (user && onboarded === 'true') {
          navigation.replace('Main');
        }
      } catch (e) {}
    })();
  }, []);

  const handleFinishOnboarding = async (targetScreen = 'Auth') => {
    try {
      await AsyncStorage.setItem('@tradenova_onboarded', 'true');
    } catch (e) {}

    const user = await checkSession();
    if (user) {
      navigation.replace('Main');
    } else {
      navigation.replace(targetScreen);
    }
  };

  const handleNextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIdx = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setCurrentIndex(nextIdx);
    } else {
      handleFinishOnboarding('Auth');
    }
  };

  const onScrollMomentum = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / SCREEN_WIDTH);
    if (idx !== currentIndex && idx >= 0 && idx < SLIDES.length) {
      setCurrentIndex(idx);
    }
  };

  const renderSlide = ({ item }) => {
    return (
      <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
        {/* Clean Graphic Card */}
        <View style={styles.visualCard}>
          {item.type === 'exchanges' && (
            <View style={styles.fullWidth}>
              <View style={styles.cleanExchangesRow}>
                <View style={[styles.exchBadge, { borderColor: '#38bdf855', backgroundColor: '#38bdf818' }]}>
                  <Text style={[styles.exchBadgeText, { color: '#38bdf8' }]}>NSE</Text>
                </View>
                <View style={[styles.exchBadge, { borderColor: `${COLORS.gold}55`, backgroundColor: `${COLORS.gold}18` }]}>
                  <Text style={[styles.exchBadgeText, { color: COLORS.gold }]}>BSE</Text>
                </View>
                <View style={[styles.exchBadge, { borderColor: '#22c55e55', backgroundColor: '#22c55e18' }]}>
                  <Text style={[styles.exchBadgeText, { color: '#22c55e' }]}>MCX</Text>
                </View>
              </View>

              <View style={styles.cleanQuotesColumn}>
                {item.quotes.map((q, qIdx) => (
                  <View key={qIdx} style={styles.cleanQuoteRow}>
                    <Text style={styles.cqSym}>{q.sym}</Text>
                    <Text style={styles.cqVal}>{q.val}</Text>
                    <Text style={styles.cqChg}>{q.chg}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {item.type === 'leverage' && (
            <View style={styles.leverageCenter}>
              <View style={styles.propTag}>
                <Text style={styles.propTagText}>INSTITUTIONAL MARGIN</Text>
              </View>
              <Text style={styles.multiplierNumber}>{item.multiplier}</Text>
              <View style={styles.fundBadge}>
                <Text style={styles.fundLabel}>Starting Margin: </Text>
                <Text style={styles.fundValue}>{item.capital}</Text>
              </View>
            </View>
          )}

          {item.type === 'whatsapp' && (
            <View style={styles.waCenter}>
              <View style={styles.waShield}>
                <Text style={{ fontSize: 26 }}>💬</Text>
              </View>
              <Text style={styles.waTitle}>Official Broker Desk</Text>
              <Text style={styles.waSub}>+91 • 10-Second Activation</Text>
            </View>
          )}
        </View>

        {/* Clean Slide Typography */}
        <View style={styles.slideTextBox}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDesc}>{item.description}</Text>

          {/* Clean Metric Pills */}
          <View style={styles.cleanChipsRow}>
            {item.chips.map((chip, cIdx) => (
              <View key={cIdx} style={styles.cleanChip}>
                <Text style={styles.cleanChipText}>{chip}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#080b13" />

      {/* Top Bar with Brand and Skip button */}
      <View style={styles.topBar}>
        <View style={styles.brandChip}>
          <Text style={styles.brandIcon}>⚡</Text>
          <Text style={styles.brandTitle}>
            TradeNova <Text style={{ color: COLORS.gold }}>SN</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.skipBtn}
          activeOpacity={0.7}
          onPress={() => handleFinishOnboarding('Auth')}
        >
          <Text style={styles.skipBtnText}>Skip ›</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        onMomentumScrollEnd={onScrollMomentum}
        bounces={false}
        style={styles.flatList}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, dotIdx) => (
            <TouchableOpacity
              key={dotIdx}
              activeOpacity={0.8}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: dotIdx, animated: true });
                setCurrentIndex(dotIdx);
              }}
              style={[
                styles.dot,
                dotIdx === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.85}
          onPress={handleNextSlide}
        >
          <Text style={styles.actionBtnText}>
            {currentIndex === 2 ? 'Get Started →' : SLIDES[currentIndex].btnLabel}
          </Text>
        </TouchableOpacity>

        {/* Direct Sign-In Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => handleFinishOnboarding('Auth')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080b13',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
    zIndex: 10,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  brandIcon: {
    fontSize: 14,
    color: COLORS.gold,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  visualCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(245, 190, 56, 0.28)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 18,
  },
  fullWidth: {
    width: '100%',
  },
  cleanExchangesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },
  exchBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  exchBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cleanQuotesColumn: {
    width: '100%',
    gap: 6,
  },
  cleanQuoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cqSym: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  cqVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#f8fafc',
    fontFamily: 'Courier',
  },
  cqChg: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22c55e',
    fontFamily: 'Courier',
  },
  leverageCenter: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  propTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },
  propTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1.1,
  },
  multiplierNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: COLORS.gold,
    letterSpacing: 1,
    lineHeight: 58,
  },
  fundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 190, 56, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 190, 56, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 6,
  },
  fundLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  fundValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.gold,
    fontFamily: 'Courier',
  },
  waCenter: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  waShield: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  waTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  waSub: {
    fontSize: 12,
    color: '#25d366',
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'Courier',
  },
  slideTextBox: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  slideDesc: {
    fontSize: 12.5,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  cleanChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  cleanChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cleanChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#cbd5e1',
    letterSpacing: 0.2,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    width: 26,
    backgroundColor: COLORS.gold,
  },
  actionBtn: {
    width: '100%',
    maxWidth: 350,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f5be38',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 12,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#080b13',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.gold,
  },
});
