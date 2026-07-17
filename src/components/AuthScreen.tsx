import React, { useState, useRef } from 'react';
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
  UIManager
} from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';

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
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useKnowAroundDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useKnowAroundDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useKnowAroundDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useKnowAroundDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useKnowAroundDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useKnowAroundDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useKnowAroundDriver: true }),
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

  const handleSubmit = async () => {
    if (!validate()) return;
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
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        setPasswordError('Incorrect password');
      } else if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-email') {
        setEmailError('Incorrect email address');
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
});
