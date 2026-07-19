import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  ScrollView, 
  Alert, 
  Platform, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function OnboardingModal() {
  const { 
    user, 
    onboardingCompleted, 
    completeOnboarding 
  } = useKnowAround();

  // Wizard Step: 1 = Name, 2 = Mandatory Location & Address, 3 = Notifications, 4 = Success
  const [step, setStep] = useState(1);

  // Step 1 State
  const [name, setName] = useState(user?.name || '');

  // Step 2 State (Address & GPS)
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number>(11.9340);
  const [longitude, setLongitude] = useState<number>(79.8300);

  const [isLocating, setIsLocating] = useState(false);
  const [autoFilledBadge, setAutoFilledBadge] = useState<string | null>(null);

  // Step 3 State (Notifications)
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (onboardingCompleted) return null;

  // Auto-fetch location & reverse geocode
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setAutoFilledBadge(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission was denied. Please enter your address details manually.');
        setIsLocating(false);
        return;
      }

      let pos: Location.LocationObject | null = null;
      try {
        pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      } catch (e) {
        pos = await Location.getLastKnownPositionAsync();
      }

      if (pos) {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);

        const geocoded = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });

        if (geocoded && geocoded.length > 0) {
          const addr = geocoded[0];
          const autoStreet = [addr.streetNumber, addr.street || addr.name].filter(Boolean).join(' ');
          const autoArea = addr.district || addr.subregion || '';
          const autoLocality = addr.name || addr.street || '';
          const autoCity = addr.city || addr.subregion || addr.district || '';
          const autoState = addr.region || '';
          const autoCountry = addr.country || 'India';
          const autoPin = addr.postalCode || '';

          if (autoStreet) setStreet(autoStreet);
          if (autoArea) setArea(autoArea);
          if (autoLocality) setLocality(autoLocality);
          if (autoCity) setCity(autoCity);
          if (autoState) setState(autoState);
          if (autoCountry) setCountry(autoCountry);
          if (autoPin) setPostalCode(autoPin);

          setAutoFilledBadge('✨ Location & Address auto-filled via GPS!');
        }
      }
    } catch (err) {
      console.warn('GPS detection notice:', err);
      Alert.alert('Notice', 'Could not detect exact GPS position. Please enter your address manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleStep1Submit = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name so neighbors can recognize you.');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = () => {
    if (!street.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      Alert.alert('Address Mandatory', 'Street address, city, state, and postal code are mandatory to explore your neighborhood feed.');
      return;
    }
    if (postalCode.trim().length < 6) {
      Alert.alert('Invalid Postal Code', 'Please enter a valid 6-digit postal code.');
      return;
    }
    setStep(3);
  };

  const handleStep3Finish = async (enableNotifications: boolean) => {
    setIsSubmitting(true);
    setNotificationEnabled(enableNotifications);

    try {
      await completeOnboarding({
        name: name.trim(),
        street: street.trim(),
        area: area.trim(),
        locality: locality.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
        latitude,
        longitude,
        notificationEnabled: enableNotifications
      });
      setStep(4);
    } catch (e) {
      console.error('Onboarding completion error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.fullscreenOverlay}>
      <View style={styles.container}>
        
        {/* Step Indicator Bar */}
        {step <= 3 && (
          <View style={styles.progressRow}>
            {[1, 2, 3].map((s) => (
              <View 
                key={s} 
                style={[
                  styles.progressSegment, 
                  step >= s && styles.progressSegmentActive
                ]} 
              />
            ))}
          </View>
        )}

        {/* STEP 1: Name */}
        {step === 1 && (
          <View style={styles.stepBox}>
            <View style={styles.headerIconWrapper}>
              <Ionicons name="person-circle" size={48} color="#1C873C" />
            </View>
            <Text style={styles.stepTitle}>What should we call you?</Text>
            <Text style={styles.stepSubtitle}>Enter your full name so your neighbors and local services can recognize you.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Victor Simonel"
                placeholderTextColor="#A0A4AC"
                style={styles.input}
                autoFocus
              />
            </View>

            <Pressable style={styles.primaryBtn} onPress={handleStep1Submit}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 2: Location & Address (Mandatory) */}
        {step === 2 && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.stepBox}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="location" size={40} color="#1C873C" />
              </View>
              <Text style={styles.stepTitle}>Where do you live?</Text>
              <Text style={styles.stepSubtitle}>Set your primary address location to unlock nearby neighborhood news, alerts & groups.</Text>

              {/* Action Buttons: Auto GPS vs Manual */}
              <View style={styles.locationActionRow}>
                <Pressable style={styles.gpsBtn} onPress={handleUseCurrentLocation} disabled={isLocating}>
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="navigate" size={16} color="#ffffff" />
                      <Text style={styles.gpsBtnText}>Use Current Location</Text>
                    </>
                  )}
                </Pressable>
              </View>

              {autoFilledBadge && (
                <View style={styles.autoFilledBanner}>
                  <Ionicons name="checkmark-circle" size={16} color="#1C873C" />
                  <Text style={styles.autoFilledText}>{autoFilledBadge}</Text>
                </View>
              )}

              {/* Address Form Inputs */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>House No. & Street Address *</Text>
                <TextInput
                  value={street}
                  onChangeText={setStreet}
                  placeholder="e.g. No. 24, Victor Simonel Street"
                  placeholderTextColor="#A0A4AC"
                  style={styles.input}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Area / Neighborhood</Text>
                  <TextInput
                    value={area}
                    onChangeText={setArea}
                    placeholder="e.g. White Town"
                    placeholderTextColor="#A0A4AC"
                    style={styles.input}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Locality</Text>
                  <TextInput
                    value={locality}
                    onChangeText={setLocality}
                    placeholder="e.g. Heritage Zone"
                    placeholderTextColor="#A0A4AC"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="Pondicherry"
                    placeholderTextColor="#A0A4AC"
                    style={styles.input}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>State *</Text>
                  <TextInput
                    value={state}
                    onChangeText={setState}
                    placeholder="Puducherry"
                    placeholderTextColor="#A0A4AC"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Postal Code *</Text>
                  <TextInput
                    value={postalCode}
                    onChangeText={(text) => setPostalCode(text.replace(/[^0-9]/g, ''))}
                    placeholder="605001"
                    placeholderTextColor="#A0A4AC"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={styles.input}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Country</Text>
                  <TextInput
                    value={country}
                    onChangeText={setCountry}
                    placeholder="India"
                    placeholderTextColor="#A0A4AC"
                    style={styles.input}
                  />
                </View>
              </View>

              <Pressable style={styles.primaryBtn} onPress={handleStep2Submit}>
                <Text style={styles.primaryBtnText}>Save Address & Continue</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* STEP 3: Notifications */}
        {step === 3 && (
          <View style={styles.stepBox}>
            <View style={styles.headerIconWrapper}>
              <Ionicons name="notifications" size={40} color="#1C873C" />
            </View>
            <Text style={styles.stepTitle}>Stay Informed</Text>
            <Text style={styles.stepSubtitle}>Get instant popups for critical neighborhood safety alerts, water cuts, and community news.</Text>

            <Pressable 
              style={styles.primaryBtn} 
              onPress={() => handleStep3Finish(true)} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryBtnText}>Allow Notifications</Text>
              )}
            </Pressable>

            <Pressable 
              style={styles.secondaryBtn} 
              onPress={() => handleStep3Finish(false)} 
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryBtnText}>Maybe Later</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 4: Success Animation */}
        {step === 4 && (
          <View style={styles.successBox}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={54} color="#ffffff" />
            </View>
            <Text style={styles.successTitle}>You are all set! 🎉</Text>
            <Text style={styles.successSubtitle}>Welcome to your neighborhood. Opening your live feed now...</Text>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: 99999,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 54 : 28,
    paddingBottom: 24,
    justifyContent: 'flex-start',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 28,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  progressSegmentActive: {
    backgroundColor: '#1C873C',
  },
  scrollContent: {
    flex: 1,
  },
  stepBox: {
    backgroundColor: '#ffffff',
    paddingTop: 8,
  },
  headerIconWrapper: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF6EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
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
    paddingHorizontal: 16,
    height: 52,
    fontSize: 14.5,
    color: '#1A1C1E',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  locationActionRow: {
    marginBottom: 16,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1C873C',
    borderRadius: 24,
    height: 48,
  },
  gpsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  autoFilledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAF6EA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  autoFilledText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C873C',
  },
  primaryBtn: {
    backgroundColor: '#1C873C',
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryBtnText: {
    color: '#60646C',
    fontSize: 14.5,
    fontWeight: '700',
  },
  successBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1C873C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 20,
  },
});
