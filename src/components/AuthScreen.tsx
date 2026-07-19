import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Platform, 
  ActivityIndicator, 
  SafeAreaView, 
  KeyboardAvoidingView,
  Animated,
  StatusBar,
  Dimensions,
  ScrollView
} from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function AuthScreen() {
  const { authenticatePhone } = useKnowAround();
  
  // Auth steps: 'phone' -> 'otp'
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // OTP input states
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const otpRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Resend OTP countdown
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSendOTP = () => {
    const rawDigits = phone.replace(/[^0-9]/g, '');
    if (rawDigits.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      triggerShake();
      return;
    }
    setPhoneError('');
    setStep('otp');
    setResendTimer(30);
    setOtpInput(['', '', '', '', '', '']);
    setOtpError('');
    // Auto-focus first OTP input after step transition
    setTimeout(() => {
      if (otpRefs.current[0]) {
        otpRefs.current[0]?.focus();
      }
    }, 150);
  };

  const handleOtpChange = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    const newOtp = [...otpInput];

    if (sanitized.length > 1) {
      // Handle pasted code (e.g. 6 digits)
      const digits = sanitized.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtpInput(newOtp);
      if (digits.length === 6) {
        verifyOtpCode(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = sanitized;
    setOtpInput(newOtp);

    if (sanitized && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    if (newOtp.join('').length === 6) {
      verifyOtpCode(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpInput[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtpCode = async (codeStr?: string) => {
    const fullCode = codeStr || otpInput.join('');
    if (fullCode.length < 4) {
      setOtpError('Please enter the verification code');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setOtpError('');
    const fullPhone = `+91${phone.replace(/[^0-9]/g, '')}`;

    try {
      await authenticatePhone(fullPhone);
    } catch (err: any) {
      triggerShake();
      setOtpError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Hero */}
          <View style={styles.heroSection}>
            <View style={styles.logoBadge}>
              <Ionicons name="location" size={32} color="#208AEF" />
            </View>
            <Text style={styles.brandTitle}>Know Around</Text>
            <Text style={styles.brandSubtitle}>
              Connect with your neighborhood and discover everything local—from trusted professionals and businesses to news, alerts, events, and community updates.
            </Text>
          </View>

          {/* Animated Card Body */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            {step === 'phone' ? (
              <View>
                <Text style={styles.cardHeaderTitle}>Enter Mobile Number</Text>
                <Text style={styles.cardHeaderDesc}>
                  We'll send an OTP to verify your account and keep your neighborhood safe.
                </Text>

                <View style={[styles.phoneInputRow, phoneError ? styles.inputErrorBorder : null]}>
                  <View style={styles.countryPrefix}>
                    <Text style={styles.flagIcon}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <View style={styles.prefixDivider} />
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#A0A4AC"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(val) => {
                      setPhone(val.replace(/[^0-9]/g, ''));
                      if (phoneError) setPhoneError('');
                    }}
                    onSubmitEditing={handleSendOTP}
                    autoFocus={true}
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                <Pressable 
                  style={styles.primaryBtn}
                  onPress={handleSendOTP}
                >
                  <Text style={styles.primaryBtnText}>Get OTP</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </Pressable>

                <Text style={styles.termsText}>
                  By continuing, you agree to our Terms of Service & Privacy Policy.
                </Text>
              </View>
            ) : (
              <View>
                <View style={styles.otpHeaderRow}>
                  <Pressable 
                    onPress={() => setStep('phone')} 
                    style={styles.backBtn}
                  >
                    <Ionicons name="arrow-back" size={20} color="#1A1C1E" />
                  </Pressable>
                  <Text style={styles.cardHeaderTitle}>Verify Mobile</Text>
                </View>

                <Text style={styles.cardHeaderDesc}>
                  Enter the 6-digit OTP sent to <Text style={styles.highlightPhone}>+91 {phone}</Text>
                </Text>

                {/* 6 Digit OTP Inputs */}
                <View style={styles.otpContainer}>
                  {otpInput.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      style={[
                        styles.otpBox,
                        digit ? styles.otpBoxFilled : null,
                        otpError ? styles.inputErrorBorder : null
                      ]}
                      keyboardType="number-pad"
                      maxLength={index === 0 ? 6 : 1}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      selectTextOnFocus={true}
                    />
                  ))}
                </View>
                {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

                <Pressable 
                  style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
                  onPress={() => verifyOtpCode()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                      <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                    </>
                  )}
                </Pressable>

                {/* Resend Timer */}
                <View style={styles.resendRow}>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendTimerText}>
                      Resend OTP in <Text style={styles.timerBold}>{resendTimer}s</Text>
                    </Text>
                  ) : (
                    <Pressable onPress={() => handleSendOTP()}>
                      <Text style={styles.resendActiveText}>Resend OTP Code</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 30,
    justifyContent: 'center',
    minHeight: '100%',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardHeaderDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  countryPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagIcon: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  prefixDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 12,
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: '#208AEF',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  termsText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 16,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
  },
  highlightPhone: {
    fontWeight: '700',
    color: '#208AEF',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 12,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  otpBoxFilled: {
    borderColor: '#208AEF',
    backgroundColor: '#F0F7FF',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 18,
  },
  resendTimerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  timerBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  resendActiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#208AEF',
  },
});
