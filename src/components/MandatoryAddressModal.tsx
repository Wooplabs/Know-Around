import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert
} from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';

export default function MandatoryAddressModal() {
  const { 
    user, 
    justRegistered, 
    setJustRegistered, 
    setUserAddress 
  } = useKnowAround();

  const [visible, setVisible] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pin, setPin] = useState('');
  // Pre-fill phone from signup registration
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [focusedField, setFocusedField] = useState<'street' | 'city' | 'state' | 'pin' | null>(null);

  // Custom alert dialog state to replace native system Alert popups
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
    onClose?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showCustomDialog = (title: string, message: string, type: 'success' | 'error', onClose?: () => void) => {
    setDialogConfig({
      visible: true,
      title,
      message,
      type,
      onClose
    });
  };

  // Trigger modal after exactly 1 second of landing on home screen after registration
  useEffect(() => {
    if (user && justRegistered) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [user, justRegistered]);

  // Keep dialog accessible even if visible is false, so we handle it gracefully inside wrapper
  if (!visible && !dialogConfig.visible) return null;

  const handleSave = () => {
    if (!street.trim() || !city.trim() || !state.trim() || !pin.trim()) {
      showCustomDialog('Required Fields', 'Please fill in all address details to set your location.', 'error');
      return;
    }

    if (pin.replace(/[^0-9]/g, '').length < 6) {
      showCustomDialog('Invalid Pincode', 'Please enter a valid 6-digit pin code.', 'error');
      return;
    }

    setIsSubmitting(true);

    // Simulate saving
    setTimeout(() => {
      setUserAddress({
        street: street.trim(),
        place: '',
        city: city.trim(),
        state: state.trim(),
        pin: pin.trim(),
        phone: user?.phone || phone.trim() || ''
      });
      
      setIsSubmitting(false);
      setVisible(false);
      showCustomDialog(
        'Location Configured 🎉',
        'Your home location has been set successfully!',
        'success',
        () => {
          setJustRegistered(false);
        }
      );
    }, 800);
  };

  return (
    <>
      {visible && (
        <Modal
          visible={visible}
          transparent={true}
          animationType="slide"
          statusBarTranslucent={true}
          onRequestClose={() => {}} // Empty to block Android back button close
        >
          <View style={styles.backdrop}>
            <KeyboardAvoidingView
              behavior={focusedField ? 'padding' : undefined}
              style={styles.keyboardView}
            >
              <View style={styles.card}>
                {/* Grab Handle Decoration */}
                <View style={styles.handle} />

                <Text style={styles.title}>Set House Location</Text>
                <Text style={styles.subtitle}>
                  Please configure your primary residential address location to explore nearby neighborhood feeds and groups.
                </Text>

                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  style={styles.formScroll}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Street Address */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Street Address / House No.</Text>
                    <TextInput
                      value={street}
                      onChangeText={setStreet}
                      onFocus={() => setFocusedField('street')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g. 24, Victor Simonel Street"
                      placeholderTextColor="#A0A4AC"
                      style={[
                        styles.input,
                        focusedField === 'street' && styles.inputFocused
                      ]}
                    />
                  </View>

                  {/* City */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                      value={city}
                      onChangeText={setCity}
                      onFocus={() => setFocusedField('city')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g. Pondicherry"
                      placeholderTextColor="#A0A4AC"
                      style={[
                        styles.input,
                        focusedField === 'city' && styles.inputFocused
                      ]}
                    />
                  </View>

                  {/* State & Pincode Row */}
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1.2 }]}>
                      <Text style={styles.label}>State</Text>
                      <TextInput
                        value={state}
                        onChangeText={setState}
                        onFocus={() => setFocusedField('state')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. Puducherry"
                        placeholderTextColor="#A0A4AC"
                        style={[
                          styles.input,
                          focusedField === 'state' && styles.inputFocused
                        ]}
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Pincode</Text>
                      <TextInput
                        value={pin}
                        onChangeText={(text) => setPin(text.replace(/[^0-9]/g, ''))}
                        onFocus={() => setFocusedField('pin')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="605001"
                        placeholderTextColor="#A0A4AC"
                        keyboardType="number-pad"
                        maxLength={6}
                        style={[
                          styles.input,
                          focusedField === 'pin' && styles.inputFocused
                        ]}
                      />
                    </View>
                  </View>
                </ScrollView>

                <Pressable style={styles.btn} onPress={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.btnText}>Save & Set Location</Text>
                  )}
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}

      {/* Themed Success/Error Custom Dialog Alert */}
      <Modal
        visible={dialogConfig.visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => {
          if (dialogConfig.type === 'error') {
            setDialogConfig(prev => ({ ...prev, visible: false }));
          }
        }}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogCard}>
            <View style={[
              styles.dialogIconContainer,
              dialogConfig.type === 'success' ? styles.dialogIconSuccess : styles.dialogIconError
            ]}>
              <Ionicons 
                name={dialogConfig.type === 'success' ? 'checkmark' : 'alert-circle-outline'} 
                size={36} 
                color={dialogConfig.type === 'success' ? '#1C873C' : '#D32F2F'} 
              />
            </View>

            <Text style={styles.dialogTitle}>{dialogConfig.title}</Text>
            <Text style={styles.dialogMessage}>{dialogConfig.message}</Text>

            <Pressable 
              style={styles.dialogBtn} 
              onPress={() => {
                setDialogConfig(prev => ({ ...prev, visible: false }));
                if (dialogConfig.onClose) {
                  dialogConfig.onClose();
                }
              }}
            >
              <Text style={styles.dialogBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 24,
    maxHeight: '90%',
  },
  handle: {
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  formScroll: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: 320,
    marginBottom: 12,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1C1E',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#60646C',
    opacity: 0.5,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 14.5,
    color: '#1A1C1E',
  },
  inputFocused: {
    borderColor: '#1C873C',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    backgroundColor: '#1C873C',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    width: '85%',
    maxWidth: 320,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dialogIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogIconSuccess: {
    backgroundColor: '#E8F5E9',
  },
  dialogIconError: {
    backgroundColor: '#FFEBEE',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 13.5,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 19,
    opacity: 0.8,
    marginBottom: 24,
  },
  dialogBtn: {
    backgroundColor: '#1C873C',
    borderRadius: 24,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  dialogBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
