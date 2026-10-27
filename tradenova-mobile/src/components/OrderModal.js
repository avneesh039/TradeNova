import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../theme';
import { useMarket } from '../context/MarketContext';

export default function OrderModal({ visible, onClose, symbolData, initialSide = 'buy' }) {
  const { placeOrder } = useMarket();
  const [side, setSide] = useState(initialSide); // 'buy' | 'sell'
  const [orderType, setOrderType] = useState('MARKET'); // 'MARKET' | 'LIMIT'
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState(String(symbolData?.ltp || ''));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!qty || Number(qty) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    setLoading(true);
    try {
      await placeOrder({
        symbol: symbolData?.symbol,
        side,
        qty: Number(qty),
        orderType,
        price: orderType === 'LIMIT' ? Number(price) : 0,
      });
      Alert.alert('Order Placed', `${side.toUpperCase()} ${qty}x ${symbolData?.symbol} successful!`);
      onClose();
    } catch (err) {
      Alert.alert('Order Failed', err.message || 'Execution error.');
    } finally {
      setLoading(false);
    }
  };

  if (!symbolData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.symTitle}>{symbolData.symbol}</Text>
              <Text style={styles.symSegment}>{symbolData.segment || 'NSE'} • ₹{symbolData.ltp?.toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Buy / Sell Toggle Buttons */}
          <View style={styles.sideToggleRow}>
            <TouchableOpacity
              style={[styles.sideBtn, styles.buyBtn, side === 'buy' && styles.sideBtnActiveBuy]}
              onPress={() => setSide('buy')}
            >
              <Text style={[styles.sideBtnText, side === 'buy' && styles.sideBtnTextActive]}>BUY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sideBtn, styles.sellBtn, side === 'sell' && styles.sideBtnActiveSell]}
              onPress={() => setSide('sell')}
            >
              <Text style={[styles.sideBtnText, side === 'sell' && styles.sideBtnTextActive]}>SELL</Text>
            </TouchableOpacity>
          </View>

          {/* Order Type Chips */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeChip, orderType === 'MARKET' && styles.typeChipActive]}
              onPress={() => setOrderType('MARKET')}
            >
              <Text style={[styles.typeChipText, orderType === 'MARKET' && styles.typeChipTextActive]}>MARKET</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeChip, orderType === 'LIMIT' && styles.typeChipActive]}
              onPress={() => setOrderType('LIMIT')}
            >
              <Text style={[styles.typeChipText, orderType === 'LIMIT' && styles.typeChipTextActive]}>LIMIT</Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.fieldsRow}>
            <View style={styles.fieldBox}>
              <Text style={styles.fieldLabel}>Quantity (Lots)</Text>
              <TextInput
                style={styles.fieldInput}
                keyboardType="numeric"
                value={qty}
                onChangeText={setQty}
              />
            </View>

            {orderType === 'LIMIT' && (
              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>Limit Price (₹)</Text>
                <TextInput
                  style={styles.fieldInput}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            )}
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: side === 'buy' ? COLORS.green : COLORS.red },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                EXECUTE {side.toUpperCase()} ORDER
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderColor: COLORS.borderPrimary,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.borderSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  symTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  symSegment: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  sideToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  sideBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  buyBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  sellBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  sideBtnActiveBuy: {
    backgroundColor: COLORS.green,
  },
  sideBtnActiveSell: {
    backgroundColor: COLORS.red,
  },
  sideBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sideBtnTextActive: {
    color: '#080b13',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.bgTertiary,
  },
  typeChipActive: {
    backgroundColor: COLORS.gold,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  typeChipTextActive: {
    color: '#080b13',
  },
  fieldsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  fieldBox: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
    fontWeight: '700',
  },
  fieldInput: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
});
