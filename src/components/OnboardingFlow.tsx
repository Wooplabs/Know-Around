import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  SafeAreaView, 
  KeyboardAvoidingView,
  Platform, 
  ScrollView,
  StatusBar
} from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function OnboardingFlow() {
  const { 
    userProfile, 
    onboardingStep, 
    updateOnboardingName, 
    updateOnboardingAddress, 
    updateOnboardingNotifications 
  } = useKnowAround();

  // Step 1 State
  const [fullName, setFullName] = useState(userProfile?.name || '');
  const [nameError, setNameError] = useState('');

  // Step 2 Address States
  const [street, setStreet] = useState(userProfile?.street || '');
  const [area, setArea] = useState(userProfile?.area || userProfile?.locality || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [state, setState] = useState(userProfile?.state || '');
  const [country, setCountry] = useState(userProfile?.country || 'India');
  const [postalCode, setPostalCode] = useState(userProfile?.postalCode || '');
  const [latitude, setLatitude] = useState<number | null>(userProfile?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(userProfile?.longitude || null);
  
  const [isLocating, setIsLocating] = useState(false);
  const [locationVerified, setLocationVerified] = useState(userProfile?.locationVerified || false);
  const [addressError, setAddressError] = useState('');

  // Step 3 Loader State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto detect location function
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setAddressError('');

    try {
      const locationPerm = await Location.requestForegroundPermissionsAsync();
      if (locationPerm.status === 'granted') {
        let pos: Location.LocationObject | null = null;
        try {
          pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        } catch (e) {
          pos = await Location.getLastKnownPositionAsync();
        }

        if (pos) {
          const { latitude: lat, longitude: lng } = pos.coords;
          setLatitude(lat);
          setLongitude(lng);

          const geocoded = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (geocoded && geocoded.length > 0) {
            const item = geocoded[0];
            const autoStreet = [item.streetNumber, item.street || item.name].filter(Boolean).join(' ');
            const autoArea = item.subregion || item.district || item.name || '';
            const autoCity = item.city || item.district || '';
            const autoState = item.region || '';
            const autoCountry = item.country || 'India';
            const autoPin = item.postalCode || '';

            if (autoStreet) setStreet(autoStreet);
            if (autoArea) setArea(autoArea);
            if (autoCity) setCity(autoCity);
            if (autoState) setState(autoState);
            if (autoCountry) setCountry(autoCountry);
            if (autoPin) setPostalCode(autoPin);

            setLocationVerified(true);
          }
        }
      } else {
        setAddressError('Location permission was denied. Please fill in your address below.');
      }
    } catch (err) {
      console.warn('GPS detection notice:', err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveStep1 = () => {
    if (!fullName.trim()) {
      setNameError('Please enter your full name');
      return;
    }
    setNameError('');
    updateOnboardingName(fullName.trim());
  };

  const handleSaveStep2 = () => {
    if (!street.trim() || !city.trim()) {
      setAddressError('House/Street address and City are mandatory to explore nearby feeds.');
      return;
    }
    setAddressError('');
    updateOnboardingAddress({
      street: street.trim(),
      area: area.trim(),
      locality: area.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim() || 'India',
      postalCode: postalCode.trim(),
      latitude,
      longitude,
      locationVerified: locationVerified || true,
    });
  };

  const handleNotificationChoice = (allow: boolean) => {
    setIsSubmitting(true);
    updateOnboardingNotifications(allow);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Top Onboarding Header & Step Indicator */}
      <View style={styles.headerBar}>
        <View style={styles.brandRow}>
          <Ionicons name="location" size={24} color="#208AEF" />
          <Text style={styles.brandName}>Know Around</Text>
        </View>

        {/* Step Indicator Pills */}
        <View style={styles.stepIndicatorRow}>
          <View style={[styles.stepDot, onboardingStep >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, onboardingStep >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, onboardingStep >= 2 && styles.stepDotActive]} />
          <View style={[styles.stepLine, onboardingStep >= 3 && styles.stepLineActive]} />
          <View style={[styles.stepDot, onboardingStep >= 3 && styles.stepDotActive]} />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* STEP 1: Name Entry */}
          {onboardingStep === 1 && (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={28} color="#208AEF" />
              </View>

              <Text style={styles.title}>What should we call you?</Text>
              <Text style={styles.subtitle}>
                Your name will be visible to verified neighbors when you post updates or interact in local groups.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, nameError ? styles.inputError : null]}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor="#A0A4AC"
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (nameError) setNameError('');
                  }}
                  autoFocus={true}
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              <Pressable style={styles.primaryBtn} onPress={handleSaveStep1}>
                <Text style={styles.primaryBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </Pressable>
            </View>
          )}

          {/* STEP 2: Mandatory Address & GPS Location */}
          {onboardingStep === 2 && (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="map-outline" size={28} color="#208AEF" />
              </View>

              <Text style={styles.title}>Set Your Home Location</Text>
              <Text style={styles.subtitle}>
                Your address is mandatory to explore nearby safety alerts, local professionals, and community feeds.
              </Text>

              {/* Location Choice Buttons */}
              <View style={styles.locationActionRow}>
                <Pressable 
                  style={[styles.gpsBtn, isLocating && styles.btnDisabled]} 
                  onPress={handleUseCurrentLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#208AEF" />
                  ) : (
                    <>
                      <Ionicons name="navigate-circle" size={18} color="#208AEF" />
                      <Text style={styles.gpsBtnText}>Use Current Location</Text>
                    </>
                  )}
                </Pressable>
              </View>

              {locationVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#1C873C" />
                  <Text style={styles.verifiedBadgeText}>GPS Location Auto-Detected</Text>
                </View>
              )}

              {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}

              {/* Address Form Inputs */}
              <View style={styles.formScroll}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>House No. / Street Address *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 24, Victor Simonel Street"
                    placeholderTextColor="#A0A4AC"
                    value={street}
                    onChangeText={setStreet}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Area / Locality</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. White Town / MG Road"
                    placeholderTextColor="#A0A4AC"
                    value={area}
                    onChangeText={setArea}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>City *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Puducherry"
                      placeholderTextColor="#A0A4AC"
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>State</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Puducherry"
                      placeholderTextColor="#A0A4AC"
                      value={state}
                      onChangeText={setState}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Country</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="India"
                      placeholderTextColor="#A0A4AC"
                      value={country}
                      onChangeText={setCountry}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Postal Code</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="605001"
                      placeholderTextColor="#A0A4AC"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={postalCode}
                      onChangeText={(val) => setPostalCode(val.replace(/[^0-9]/g, ''))}
                    />
                  </View>
                </View>
              </View>

              <Pressable style={styles.primaryBtn} onPress={handleSaveStep2}>
                <Text style={styles.primaryBtnText}>Save & Set Address</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </Pressable>
            </View>
          )}

          {/* STEP 3: Notification Permission */}
          {onboardingStep === 3 && (
            <View style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="notifications-outline" size={28} color="#D97706" />
              </View>

              <Text style={styles.title}>Enable Local Notifications</Text>
              <Text style={styles.subtitle}>
                Get instant popups for critical local safety alerts, water/power cut notices, and urgent community news.
              </Text>

              <View style={styles.notificationChoiceContainer}>
                <Pressable 
                  style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]} 
                  onPress={() => handleNotificationChoice(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="notifications" size={18} color="#ffffff" />
                      <Text style={styles.primaryBtnText}>Allow Notifications</Text>
                    </>
                  )}
                </Pressable>

                <Pressable 
                  style={styles.secondaryBtn} 
                  onPress={() => handleNotificationChoice(false)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.secondaryBtnText}>Maybe Later</Text>
                </Pressable>
              </View>
            </View>
          )}
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
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
  stepDotActive: {
    backgroundColor: '#208AEF',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E2E8F0',
    maxWidth: 60,
  },
  stepLineActive: {
    backgroundColor: '#208AEF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 4,
    marginBottom: 10,
  },
  locationActionRow: {
    marginBottom: 14,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E6F4FE',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    height: 50,
    borderRadius: 14,
  },
  gpsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#208AEF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2FBF4',
    borderWidth: 1,
    borderColor: '#C6EAD0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  verifiedBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1C873C',
  },
  formScroll: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  notificationChoiceContainer: {
    marginTop: 10,
    gap: 10,
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  secondaryBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#64748B',
  },
});
