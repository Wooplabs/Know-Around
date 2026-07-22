import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Platform, 
  ActivityIndicator, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView,
  Animated,
  LayoutAnimation,
  UIManager,
  Alert,
  StatusBar,
  Dimensions
} from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BottomSheet from './BottomSheet';

const { height: screenHeight } = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Curated list of selectable countries with flags and codes
const COUNTRIES = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
];

export default function AuthScreen() {
  const { authenticatePhone } = useKnowAround();
  
  // Auth flow states: 'input' = enter phone number, 'otp' = 4-digit code verification
  const [authState, setAuthState] = useState<'input' | 'otp'>('input');
  
  // Input fields
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // Submission & Loader states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus & Validation states
  const [focusedField, setFocusedField] = useState<'phone' | null>(null);
  const [phoneError, setPhoneError] = useState('');

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  
  const otpRefs = useRef<Array<any>>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Resend OTP timer countdown
  useEffect(() => {
    let interval: any;
    if (authState === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authState, resendTimer]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validateInput = (): boolean => {
    let isValid = true;
    setPhoneError('');

    const rawPhone = phone.replace(/[^0-9]/g, '');
    if (!phone.trim()) {
      setPhoneError('Mobile number is required.');
      isValid = false;
    } else if (rawPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      isValid = false;
    }

    if (!isValid) {
      triggerShake();
    }
    return isValid;
  };

  const generateAndSendOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(code);
    setOtpInput(['', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    setAuthState('otp');

    Alert.alert(
      '💬 SMS OTP Sent',
      `We sent a 4-digit verification code to ${selectedCountry.code} ${phone}.\n\nFor testing, your OTP is: ${code}`,
      [{ text: 'OK' }]
    );
  };

  const handleSendOtpPress = () => {
    if (!validateInput()) return;
    generateAndSendOtp();
  };

  const handleVerifyOtp = async () => {
    const enteredCode = otpInput.join('');
    if (enteredCode.length < 4) {
      setOtpError('Please enter the full 4-digit code');
      triggerShake();
      return;
    }

    if (enteredCode !== otpCode) {
      setOtpError('Invalid verification code. Please try again.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    const rawPhone = phone.replace(/[^0-9]/g, '');
    const fullPhoneNumber = `${selectedCountry.code}${rawPhone}`;

    try {
      await authenticatePhone(fullPhoneNumber);
      router.replace('/');
    } catch (err: any) {
      triggerShake();
      setOtpError(err.message || 'Authentication failed. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Back button functionality
  const handleBackPress = () => {
    if (authState === 'otp') {
      setAuthState('input');
    }
  };

  // Header Title & Description text resolving
  const getHeaderTitle = () => {
    if (authState === 'otp') return 'Verify Mobile';
    return 'Welcome to KnowAround';
  };

  const getHeaderSubtitle = () => {
    if (authState === 'otp') {
      return `Enter the 4-digit code sent to ${selectedCountry.code} ${phone}.`;
    }
    return 'Enter your mobile number to discover everything local around you.';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
        >
          {/* TOP HEADER SECTION */}
          <View style={styles.headerSection}>
            <View style={styles.glowEffect} />
            
            {/* Back Button (Only on OTP verification screen) */}
            {authState === 'otp' && (
              <Pressable style={styles.backBtn} onPress={handleBackPress}>
                <Ionicons name="chevron-back" size={20} color="#ffffff" />
              </Pressable>
            )}

            {/* Title & Tagline inside Dark Section */}
            <Text style={styles.title}>{getHeaderTitle()}</Text>
            <Text style={styles.subtitle}>{getHeaderSubtitle()}</Text>
          </View>

          {/* BOTTOM WHITE CARD */}
          <View style={styles.formCardContainer}>
            <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
              {authState === 'input' ? (
                /* PHASE 1: ENTER PHONE NUMBER */
                <View>
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Mobile Number</Text>
                      {!!phoneError && <Text style={styles.errorTextInline}>{phoneError}</Text>}
                    </View>
                    <View style={styles.phoneInputRow}>
                      <Pressable style={styles.countryCodeSelector} onPress={() => setShowCountryPicker(true)}>
                        <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                        <Text style={styles.codeText}>{selectedCountry.code}</Text>
                        <Ionicons name="chevron-down" size={12} color="#60646C" />
                      </Pressable>
                      
                      <TextInput
                        value={phone}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, '');
                          let formatted = cleaned;
                          if (cleaned.length > 5) {
                            formatted = cleaned.slice(0, 5) + ' ' + cleaned.slice(5, 10);
                          }
                          setPhone(formatted);
                          if (phoneError) setPhoneError('');
                        }}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="98765 43210"
                        placeholderTextColor="#A0A4AC"
                        keyboardType="phone-pad"
                        maxLength={11}
                        style={[
                          styles.phoneInput,
                          focusedField === 'phone' && styles.inputFocused,
                          !!phoneError && styles.inputError
                        ]}
                      />
                    </View>
                  </View>

                  {/* Main Action Button using Brand Green */}
                  {(() => {
                    const isPhoneValid = phone.replace(/[^0-9]/g, '').length === 10;
                    return (
                      <Pressable 
                        style={[styles.btn, (!isPhoneValid || isSubmitting) && styles.btnDisabled]} 
                        onPress={handleSendOtpPress} 
                        disabled={!isPhoneValid || isSubmitting}
                      >
                        <Text style={[styles.btnText, (!isPhoneValid || isSubmitting) && styles.btnTextDisabled]}>Continue</Text>
                      </Pressable>
                    );
                  })()}
                </View>
              ) : (
                /* PHASE 2: SMS OTP VERIFICATION */
                <View>
                  <View style={styles.otpInputRow}>
                    {otpInput.map((digit, idx) => (
                      <TextInput
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        value={digit}
                        onChangeText={(text) => {
                          const cleanedText = text.replace(/[^0-9]/g, '');
                          const newOtp = [...otpInput];
                          newOtp[idx] = cleanedText;
                          setOtpInput(newOtp);

                          // Focus next cell
                          if (cleanedText && idx < 3) {
                            otpRefs.current[idx + 1]?.focus();
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.nativeEvent.key === 'Backspace' && !otpInput[idx] && idx > 0) {
                            const newOtp = [...otpInput];
                            newOtp[idx - 1] = '';
                            setOtpInput(newOtp);
                            otpRefs.current[idx - 1]?.focus();
                          }
                        }}
                        maxLength={1}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        style={[
                          styles.otpInputBox,
                          !!otpError && styles.otpInputBoxError
                        ]}
                      />
                    ))}
                  </View>

                  {!!otpError && <Text style={styles.otpErrorText}>{otpError}</Text>}

                  {/* Verify OTP Button */}
                  {(() => {
                    const isOtpValid = otpInput.join('').length === 4;
                    return (
                      <Pressable 
                        style={[styles.btn, (!isOtpValid || isSubmitting) && styles.btnDisabled]} 
                        onPress={handleVerifyOtp} 
                        disabled={!isOtpValid || isSubmitting}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={[styles.btnText, (!isOtpValid || isSubmitting) && styles.btnTextDisabled]}>Verify & Continue</Text>
                        )}
                      </Pressable>
                    );
                  })()}

                  <View style={styles.otpResendRow}>
                    <Text style={styles.otpResendLabel}>Didn't receive code? </Text>
                    {resendTimer > 0 ? (
                      <Text style={styles.otpTimerText}>Resend in {resendTimer}s</Text>
                    ) : (
                      <Pressable onPress={generateAndSendOtp}>
                        <Text style={styles.otpResendLink}>Resend OTP</Text>
                      </Pressable>
                    )}
                  </View>

                  <Pressable style={styles.changeNumberLink} onPress={() => setAuthState('input')}>
                    <Text style={styles.changeNumberLinkText}>Change Mobile Number</Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selectable Country Picker Bottom Sheet */}
      <BottomSheet visible={showCountryPicker} onClose={() => setShowCountryPicker(false)}>
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>Select Country Code</Text>
          <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
            {COUNTRIES.map((c) => (
              <Pressable 
                key={c.code + c.name} 
                style={styles.pickerItem} 
                onPress={() => {
                  setSelectedCountry(c);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.pickerFlag}>{c.flag}</Text>
                <Text style={styles.pickerName}>{c.name}</Text>
                <Text style={styles.pickerCode}>{c.code}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121417',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 28,
    backgroundColor: '#121417',
    position: 'relative',
    overflow: 'hidden',
    minHeight: screenHeight * 0.38,
    justifyContent: 'flex-end',
  },
  glowEffect: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#1C873C',
    opacity: 0.15,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 24,
    left: 24,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14.5,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
    paddingRight: 32,
  },
  formCardContainer: {
    backgroundColor: '#ffffff',
    flex: 1,
    minHeight: screenHeight * 0.62,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  errorTextInline: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 14.5,
    color: '#1A1C1E',
  },
  inputFocused: {
    borderColor: '#1C873C',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFF5F5',
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 4,
    height: 52,
  },
  flagText: {
    fontSize: 20,
  },
  codeText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 14.5,
    color: '#1A1C1E',
  },
  btn: {
    backgroundColor: '#1C873C', // Brand Green
    borderRadius: 27,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnTextDisabled: {
    color: '#94A3B8',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  toggleLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleLinkNormalText: {
    fontSize: 14,
    color: '#60646C',
    fontWeight: '600',
  },
  toggleLinkActiveText: {
    color: '#1C873C',
    fontWeight: '700',
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 24,
  },
  otpInputBox: {
    width: 52,
    height: 58,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  otpInputBoxError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFF5F5',
  },
  otpErrorText: {
    color: '#D32F2F',
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpResendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  otpResendLabel: {
    fontSize: 13.5,
    color: '#60646C',
  },
  otpTimerText: {
    fontSize: 13.5,
    color: '#A0A4AC',
    fontWeight: '600',
  },
  otpResendLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1C873C',
  },
  changeNumberLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  changeNumberLinkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#60646C',
    textDecorationLine: 'underline',
  },
  pickerContent: {
    paddingVertical: 10,
    width: '100%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerList: {
    maxHeight: 280,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  pickerFlag: {
    fontSize: 24,
    marginRight: 14,
  },
  pickerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1C1E',
    flex: 1,
  },
  pickerCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C873C',
  },
});
