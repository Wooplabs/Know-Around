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

export default function AuthScreen() {
  const { login, register, googleLogin } = useKnowAround();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('archudhanajay369@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus States
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null);

  // Validation Errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;

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

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#E2E8F0', desc: 'Enter password' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: '#D32F2F', desc: 'Must be at least 6 characters' };
    
    const hasNumber = /\d/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    
    if (pass.length >= 8 && hasNumber && (hasUpper || hasSpecial)) {
      return { score: 3, label: 'Strong', color: '#1C873C', desc: 'Perfect security!' };
    }
    return { score: 2, label: 'Medium', color: '#ED8936', desc: 'Add capital letters or numbers' };
  };

  const strength = getPasswordStrength(password);

  const toggleMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSignUp(!isSignUp);
    setNameError('');
    setEmailError('');
    setPasswordError('');
  };

  const validate = (): boolean => {
    let isValid = true;
    
    // Clear errors
    setNameError('');
    setEmailError('');
    setPasswordError('');

    if (isSignUp && !name.trim()) {
      setNameError('Full Name is required.');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    if (!isValid) {
      triggerShake();
    }
    return isValid;
  };

  // OTP States
  const [showOtpSheet, setShowOtpSheet] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef<Array<any>>([]);

  // Resend countdown
  useEffect(() => {
    let interval: any;
    if (showOtpSheet && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpSheet, resendTimer]);

  const generateAndSendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(code);
    setOtpInput(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    setShowOtpSheet(true);

    // Development alert simulation for developer convenience
    Alert.alert(
      '📧 Verification Code Sent',
      `We sent a 6-digit OTP to ${email}.\n\nFor testing, your OTP is: ${code}`,
      [{ text: 'OK' }]
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    generateAndSendOtp();
  };

  const handleVerifyOtp = async () => {
    const codeString = otpInput.join('');
    if (codeString.length < 6) {
      setOtpError('Please enter the full 6-digit code');
      triggerShake();
      return;
    }

    if (codeString !== otpCode) {
      setOtpError('Invalid code. Please check and try again.');
      triggerShake();
      return;
    }

    // Code matches, close sheet and perform login/registration!
    setShowOtpSheet(false);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const success = await register(name, email, password);
        if (!success) {
          triggerShake();
        }
      } else {
        const success = await login(email, password);
        if (!success) {
          triggerShake();
          setPasswordError('Incorrect password');
        }
      }
    } catch (err: any) {
      triggerShake();
      const errorCode = err.code || '';
      const errorMessage = err.message || '';
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        setPasswordError('Incorrect password');
      } else if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-email') {
        setEmailError('Incorrect email address');
      } else if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('email-already-in-use')) {
        setEmailError('Email already exists. Sign In');
      } else {
        setPasswordError(err.message || 'Authentication failed');
      }
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
          {/* Form Content */}
          <Animated.View style={[styles.formContainer, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Join your local neighborhood network' 
                : 'Sign in to see what is happening around you'}
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
                <Text style={styles.label}>Email Address</Text>
                {!!emailError && <Text style={styles.errorTextInline}>{emailError}</Text>}
              </View>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. rahul@gmail.com"
                placeholderTextColor="#A0A4AC"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input,
                  focusedField === 'email' && styles.inputFocused,
                  !!emailError && styles.inputError
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                {!!passwordError && <Text style={styles.errorTextInline}>{passwordError}</Text>}
              </View>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Min. 6 characters"
                placeholderTextColor="#A0A4AC"
                secureTextEntry
                style={[
                  styles.input,
                  focusedField === 'password' && styles.inputFocused,
                  !!passwordError && styles.inputError
                ]}
              />

              {/* Password Strength Indicator */}
              {isSignUp && password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthRow}>
                    <Text style={styles.strengthLabel}>
                      Strength: <Text style={{ color: strength.color, fontWeight: '800' }}>{strength.label}</Text>
                    </Text>
                    <Text style={styles.strengthDesc}>{strength.desc}</Text>
                  </View>
                  <View style={styles.meterContainer}>
                    <View style={[styles.meterSegment, { backgroundColor: strength.score >= 1 ? strength.color : '#E2E8F0' }]} />
                    <View style={[styles.meterSegment, { backgroundColor: strength.score >= 2 ? strength.color : '#E2E8F0' }]} />
                    <View style={[styles.meterSegment, { backgroundColor: strength.score >= 3 ? strength.color : '#E2E8F0' }]} />
                  </View>
                </View>
              )}
            </View>

            <Pressable style={styles.btn} onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.btnText}>{isSignUp ? 'Continue' : 'Sign In'}</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Email OTP Verification Bottom Sheet */}
      <BottomSheet visible={showOtpSheet} onClose={() => setShowOtpSheet(false)}>
        <View style={styles.otpSheetContent}>
          <Text style={styles.otpTitle}>Verify Your Email</Text>
          <Text style={styles.otpSubtitle}>Enter the 6-digit code we sent to your email address.</Text>
          
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

                  // Auto focus next input
                  if (cleanedText && idx < 5) {
                    otpRefs.current[idx + 1]?.focus();
                  }
                }}
                onKeyPress={(e) => {
                  if (e.nativeEvent.key === 'Backspace' && !otpInput[idx] && idx > 0) {
                    otpRefs.current[idx - 1]?.focus();
                  }
                }}
                maxLength={1}
                keyboardType="number-pad"
                style={[
                  styles.otpInputBox,
                  !!otpError && styles.otpInputBoxError
                ]}
              />
            ))}
          </View>

          {!!otpError && <Text style={styles.otpErrorText}>{otpError}</Text>}

          <Pressable style={styles.otpVerifyBtn} onPress={handleVerifyOtp}>
            <Text style={styles.otpVerifyBtnText}>Verify & Login</Text>
          </Pressable>

          <View style={styles.otpResendRow}>
            <Text style={styles.otpResendLabel}>Didn't receive code? </Text>
            {resendTimer > 0 ? (
              <Text style={styles.otpTimerText}>Resend in {resendTimer}s</Text>
            ) : (
              <Pressable onPress={generateAndSendOtp}>
                <Text style={styles.otpResendLink}>Resend Code</Text>
              </Pressable>
            )}
          </View>
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
    transitionProperty: 'border-color',
    transitionDuration: '0.2s',
  },
  inputFocused: {
    borderColor: '#1C873C',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  strengthContainer: {
    marginTop: 10,
    paddingHorizontal: 2,
  },
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strengthLabel: {
    fontSize: 11,
    color: '#60646C',
  },
  strengthDesc: {
    fontSize: 11,
    color: '#A0A4AC',
    fontWeight: '500',
  },
  meterContainer: {
    flexDirection: 'row',
    height: 5,
    gap: 4,
  },
  meterSegment: {
    flex: 1,
    borderRadius: 2,
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
  otpSheetContent: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 13,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
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
  otpVerifyBtn: {
    backgroundColor: '#1C873C',
    borderRadius: 24,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpVerifyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  otpResendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});
