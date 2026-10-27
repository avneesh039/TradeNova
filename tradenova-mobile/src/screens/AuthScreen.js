import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';
import { CONFIG } from '../config';

export default function AuthScreen({ navigation }) {
  const { login, loginAs, sendRegisterOtp, verifyRegisterOtp, rememberedUser } = useAuth();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login State
  const [loginUser, setLoginUser] = useState(rememberedUser || '');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register State - Step 1
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  // Register State - Step 2 (OTP)
  const [regStep, setRegStep] = useState(1); // 1: details, 2: verify
  const [otpInput, setOtpInput] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [devOtp, setDevOtp] = useState('');

  useEffect(() => {
    if (rememberedUser) setLoginUser(rememberedUser);
  }, [rememberedUser]);

  useEffect(() => {
    let interval;
    if (regStep === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [regStep, resendTimer]);

  const handleLogin = async () => {
    if (!loginUser.trim() || !loginPass) {
      setErrorMsg('Please enter both User ID and Password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await login(loginUser.trim(), loginPass, rememberMe);
      navigation.replace('Main');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid User ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginAs('demo', 'demo');
      navigation.replace('Main');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!regName.trim() || !regPhone.trim() || !regUser.trim() || !regPass) {
      setErrorMsg('Full Name, WhatsApp Mobile, User ID, and Password are required.');
      return;
    }
    const cleanPhone = regPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const res = await sendRegisterOtp({
        name: regName.trim(),
        phone: cleanPhone,
        username: regUser.trim(),
        city: regCity.trim(),
        password: regPass,
      });

      if (res.devOtp) setDevOtp(res.devOtp);
      setRegStep(2);
      setResendTimer(60);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit WhatsApp OTP.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const cleanPhone = regPhone.replace(/[^0-9]/g, '');
      await verifyRegisterOtp({ phone: cleanPhone, otp: otpInput.trim() });
      navigation.replace('Main');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppSupport = () => {
    const url = `https://wa.me/${CONFIG.supportWhatsAppNumber}?text=Hello%20TradeNova%20Desk,%20I%20need%20assistance%20with%20my%20trading%20account.`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open WhatsApp.'));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Engine Online</Text>
          </View>
          <TouchableOpacity style={styles.supportBtn} onPress={openWhatsAppSupport}>
            <Text style={styles.supportBtnText}>💬 WhatsApp Desk</Text>
          </TouchableOpacity>
        </View>

        {/* Brand Banner */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>⚡</Text>
          </View>
          <Text style={styles.brandTitle}>TradeNova SN</Text>
          <Text style={styles.brandTagline}>Institutional Multi-Market Trading Portal</Text>
        </View>

        {/* Auth Mode Tabs (Segmented Control) */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'login' && styles.tabBtnActive]}
            onPress={() => { setAuthMode('login'); setErrorMsg(''); }}
          >
            <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>
              🔐 Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'register' && styles.tabBtnActive]}
            onPress={() => { setAuthMode('register'); setErrorMsg(''); }}
          >
            <Text style={[styles.tabText, authMode === 'register' && styles.tabTextActive]}>
              ⚡ New Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Banner */}
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* ═══ SIGN IN FORM ═══ */}
        {authMode === 'login' ? (
          <View style={styles.card}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Trader User ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter User ID (e.g. AG, admin, demo)"
                placeholderTextColor={COLORS.textDim}
                value={loginUser}
                onChangeText={setLoginUser}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={openWhatsAppSupport}>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, paddingRight: 40 }]}
                  placeholder="Enter Password"
                  placeholderTextColor={COLORS.textDim}
                  secureTextEntry={!showLoginPass}
                  value={loginPass}
                  onChangeText={setLoginPass}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowLoginPass(!showLoginPass)}
                >
                  <Text style={styles.eyeIcon}>{showLoginPass ? '👁' : '🔒'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember User ID on this device</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#080b13" />
              ) : (
                <Text style={styles.btnPrimaryText}>Sign In to Terminal →</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.btnDemo}
              onPress={handleDemoLogin}
              disabled={loading}
            >
              <Text style={styles.btnDemoText}>⚡ Try 1-Tap Demo Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ═══ REGISTRATION FORM ═══ */
          <View style={styles.card}>
            {regStep === 1 ? (
              <>
                <View style={styles.infoNotice}>
                  <Text style={styles.infoNoticeText}>
                    📲 Instant WhatsApp Activation. Verification OTP code will be sent to your number.
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor={COLORS.textDim}
                    value={regName}
                    onChangeText={setRegName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>WhatsApp Mobile Number</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.prefixBadge}>
                      <Text style={styles.prefixText}>+91</Text>
                    </View>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="10-digit mobile number"
                      placeholderTextColor={COLORS.textDim}
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={regPhone}
                      onChangeText={setRegPhone}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Desired Trader User ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. RS001, rahul_trader"
                    placeholderTextColor={COLORS.textDim}
                    value={regUser}
                    onChangeText={setRegUser}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>City / Location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Mumbai, Surat, Delhi"
                    placeholderTextColor={COLORS.textDim}
                    value={regCity}
                    onChangeText={setRegCity}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Account Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, { flex: 1, paddingRight: 40 }]}
                      placeholder="Create secure password"
                      placeholderTextColor={COLORS.textDim}
                      secureTextEntry={!showRegPass}
                      value={regPass}
                      onChangeText={setRegPass}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowRegPass(!showRegPass)}
                    >
                      <Text style={styles.eyeIcon}>{showRegPass ? '👁' : '🔒'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#080b13" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>📲 Send WhatsApp Verification Code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              /* Step 2: Verify WhatsApp OTP */
              <View style={styles.otpSection}>
                <View style={styles.otpShield}>
                  <Text style={{ fontSize: 28 }}>🛡️</Text>
                </View>
                <Text style={styles.otpTitle}>Verify WhatsApp OTP</Text>
                <Text style={styles.otpSubtitle}>
                  We dispatched a 6-digit verification code to:{'\n'}
                  <Text style={{ color: COLORS.textPrimary, fontWeight: 'bold' }}>
                    +91 {regPhone}
                  </Text>
                </Text>

                {devOtp ? (
                  <View style={styles.devOtpBox}>
                    <Text style={styles.devOtpText}>
                      🔑 Test Mode OTP: <Text style={{ fontWeight: 'bold' }}>{devOtp}</Text>
                    </Text>
                  </View>
                ) : null}

                <View style={styles.formGroup}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="● ● ● ● ● ●"
                    placeholderTextColor={COLORS.textDim}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpInput}
                    onChangeText={setOtpInput}
                    textAlign="center"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btnPrimary, { backgroundColor: COLORS.green }]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#080b13" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>✅ Verify & Activate Account</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.otpActionRow}>
                  <TouchableOpacity onPress={() => setRegStep(1)}>
                    <Text style={styles.backLink}>← Edit Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={resendTimer > 0}
                    onPress={handleSendOtp}
                  >
                    <Text
                      style={[
                        styles.resendLink,
                        resendTimer > 0 && { color: COLORS.textMuted },
                      ]}
                    >
                      {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.green,
  },
  supportBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.3)',
  },
  supportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.whatsapp,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoBadgeText: {
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgTertiary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#080b13',
  },
  errorBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
  },
  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    borderRadius: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
  },
  eyeIcon: {
    fontSize: 16,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.borderSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  checkMark: {
    fontSize: 11,
    fontWeight: '900',
    color: '#080b13',
  },
  rememberText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  btnPrimary: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#080b13',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderPrimary,
    marginVertical: 16,
  },
  btnDemo: {
    backgroundColor: COLORS.bgTertiary,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDemoText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  infoNotice: {
    backgroundColor: 'rgba(37, 211, 102, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.25)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  infoNoticeText: {
    fontSize: 11.5,
    color: COLORS.whatsapp,
    lineHeight: 16,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefixBadge: {
    backgroundColor: COLORS.bgTertiary,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  otpSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  otpShield: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  otpSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 16,
  },
  devOtpBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 8,
    padding: 8,
    marginBottom: 14,
  },
  devOtpText: {
    fontSize: 12,
    color: COLORS.blue,
  },
  otpInput: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    borderRadius: 10,
    color: COLORS.textPrimary,
    fontSize: 22,
    letterSpacing: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: 220,
  },
  otpActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
  },
  backLink: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
  resendLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
  },
});
