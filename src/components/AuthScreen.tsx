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
  Alert
} from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from './BottomSheet';

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
  { name: 'France', code: '#33', flag: '🇫🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
];

export default function AuthScreen() {
  const { login, register, googleLogin } = useKnowAround();
  
  // Auth flow states
  const [isSignUp, setIsSignUp] = useState(false);
  const [authState, setAuthState] = useState<'input' | 'otp'>('input');
  
  // Input fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // Submission & Loader states
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus & Validation states
  const [focusedField, setFocusedField] = useState<'name' | 'phone' | null>(null);
  const [nameError, setNameError] = useState('');
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

  const toggleMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSignUp(!isSignUp);
    setNameError('');
    setPhoneError('');
  };

  const validateInput = (): boolean => {
    let isValid = true;
    setNameError('');
    setPhoneError('');

    if (isSignUp && !name.trim()) {
      setNameError('Full Name is required.');
      isValid = false;
    }

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

    // Simulate sending real OTP through Alert modal
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
      if (isSignUp) {
        await register(name.trim(), fullPhoneNumber);
      } else {
        await login(fullPhoneNumber);
      }
    } catch (err: any) {
      triggerShake();
      setOtpError(err.message || 'Authentication failed. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoadingGoogle(true);
    setTimeout(() => {
      googleLogin();
      setLoadingGoogle(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>


          {authState === 'input' ? (
            /* PHASE 1: ENTER MOBILE NUMBER FORM */
            <Animated.View style={[styles.formContainer, { transform: [{ translateX: shakeAnim }] }]}>
              <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
              <Text style={styles.subtitle}>
                {isSignUp 
                  ? 'Join your local neighborhood network with mobile authentication' 
                  : 'Enter your phone number to sign in securely'}
              </Text>

              {isSignUp && (
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Full Name</Text>
                    {!!nameError && <Text style={styles.errorTextInline}>{nameError}</Text>}
                  </View>
                  <TextInput
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (nameError) setNameError('');
                    }}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor="#A0A4AC"
                    style={[
                      styles.input,
                      focusedField === 'name' && styles.inputFocused,
                      !!nameError && styles.inputError
                    ]}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Mobile Number</Text>
                  {!!phoneError && <Text style={styles.errorTextInline}>{phoneError}</Text>}
                </View>
                <View style={styles.phoneInputRow}>
                  <Pressable style={styles.countryCodeSelector} onPress={() => setShowCountryPicker(true)}>
                    <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                    <Text style={styles.codeText}>{selectedCountry.code}</Text>
                    <Ionicons name="chevron-down" size={14} color="#60646C" />
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

              <Pressable style={styles.btn} onPress={handleSendOtpPress} disabled={isSubmitting}>
                <Text style={styles.btnText}>Send OTP</Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* OAuth Fallback */}
              <Pressable style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loadingGoogle}>
                {loadingGoogle ? (
                  <ActivityIndicator size="small" color="#60646C" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#EA4335" />
                    <Text style={styles.googleBtnText}>
                      {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable style={styles.toggleLink} onPress={toggleMode}>
                <Text style={styles.toggleLinkText}>
                  {isSignUp 
                    ? 'Already have an account? Sign In' 
                    : "Don't have an account? Create one"}
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            /* PHASE 2: SMS OTP VERIFICATION SCREEN */
            <Animated.View style={[styles.formContainer, { transform: [{ translateX: shakeAnim }] }]}>
              <Text style={styles.title}>Verify Mobile</Text>
              <Text style={styles.subtitle}>
                We sent a 4-digit code to{' '}
                <Text style={{ fontWeight: '700', color: '#1A1C1E' }}>
                  {selectedCountry.flag} {selectedCountry.code} {phone}
                </Text>. Enter it below to complete verification.
              </Text>

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

              <Pressable style={styles.btn} onPress={handleVerifyOtp} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.btnText}>Verify & Login</Text>
                )}
              </Pressable>

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
            </Animated.View>
          )}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1C873C',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0A4AC',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1C1E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#60646C',
    marginBottom: 28,
    lineHeight: 20,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#40444C',
  },
  errorTextInline: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  input: {
    backgroundColor: '#FCFDFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
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
    backgroundColor: '#FCFDFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    gap: 4,
    height: 52,
  },
  flagText: {
    fontSize: 20,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FCFDFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 14,
    color: '#1A1C1E',
  },
  btn: {
    backgroundColor: '#1C873C',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#A0A4AC',
    marginHorizontal: 12,
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 28,
    paddingVertical: 15,
    gap: 10,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
  },
  toggleLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C873C',
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 24,
  },
  otpInputBox: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FCFDFF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  otpInputBoxError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFF5F5',
  },
  otpErrorText: {
    color: '#D32F2F',
    fontSize: 12,
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
    fontSize: 13,
    color: '#60646C',
  },
  otpTimerText: {
    fontSize: 13,
    color: '#A0A4AC',
    fontWeight: '600',
  },
  otpResendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C873C',
  },
  changeNumberLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  changeNumberLinkText: {
    fontSize: 13,
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
