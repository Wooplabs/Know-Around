import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';
import Map from './Map';

export default function OnboardingModal() {
  const { 
    onboardingCompleted, 
    setOnboardingCompleted, 
    userRole, 
    setUserRole, 
    activeLocation, 
    setActiveLocation,
    setUserAddress,
    registerBusiness,
    userLocation
  } = useKnowAround();

  // Wizard Steps: 1 = Persona, 2 = Details Form & Map, 3 = "You are all set!"
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'user' | 'professional' | null>(userRole);

  // Address and Contact details state
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [place, setPlace] = useState(activeLocation.split(',')[0]);
  const [city, setCity] = useState('Pondicherry');
  const [state, setState] = useState('Puducherry');
  const [pin, setPin] = useState('');

  // Business Account specific states
  const [businessName, setBusinessName] = useState('');
  const [profession, setProfession] = useState('Electrician');
  const [workingHours, setWorkingHours] = useState('9:00 AM - 6:00 PM');

  // Interactive map coordinates state
  const [selectedCoords, setSelectedCoords] = useState<{latitude: number; longitude: number} | null>(null);

  const professions = ['Electrician', 'Plumber', 'Carpenter', 'AC Technician', 'Driver', 'Gig Worker', 'Other'];

  // Sync current location if available
  useEffect(() => {
    if (userLocation) {
      setSelectedCoords({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
    } else {
      setSelectedCoords({
        latitude: 11.9340,
        longitude: 79.8300
      });
    }
  }, [userLocation]);

  // Step 3 automatic redirect timer (4 seconds)
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        handleFinishOnboarding();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (onboardingCompleted) return null;

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedRole) {
        Alert.alert('Selection Required', 'Please select your profile type.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate common fields
      if (!street.trim() || !city.trim() || !state.trim() || !pin.trim()) {
        Alert.alert('Required Fields', 'Please fill in all address details.');
        return;
      }

      if (pin.length < 6) {
        Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pin code.');
        return;
      }

      if (selectedRole === 'professional') {
        if (!businessName.trim()) {
          Alert.alert('Required Fields', 'Please enter your Business or Professional Name.');
          return;
        }
        if (!phone.trim()) {
          Alert.alert('Required Fields', 'Please enter a Contact/WhatsApp number.');
          return;
        }
        if (phone.length < 10) {
          Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
          return;
        }
      }

      // Proceed to the "You are all set!" success animation step
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFinishOnboarding = () => {
    // Save address in global state context
    const address = { street, place, city, state, pin, phone, latitude: selectedCoords?.latitude, longitude: selectedCoords?.longitude };
    setUserAddress(address);
    setUserRole(selectedRole);
    
    // Set active location to the input place name
    const formattedLocation = `${place}, PY`;
    setActiveLocation(formattedLocation);

    // If Business Account: dynamically register their business in the professionals list
    if (selectedRole === 'professional') {
      registerBusiness({
        name: businessName,
        profession,
        phone,
        street: `${street}, ${place}`,
        place: formattedLocation,
        lat: selectedCoords?.latitude,
        lng: selectedCoords?.longitude
      });
    }

    setOnboardingCompleted(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ latitude: lat, longitude: lng });
  };

  // Convert current selected coordinates to Leaflet markers
  const mapMarkers = selectedCoords ? [{
    id: 'onboarding_user_pin',
    lat: selectedCoords.latitude,
    lng: selectedCoords.longitude,
    title: selectedRole === 'professional' ? 'Your Business Location' : 'Your House Location',
    type: 'professionals' as const
  }] : [];

  if (onboardingCompleted) return null;

  return (
    <View style={styles.fullscreenOverlay}>
      <SafeAreaContainer>
        {step < 3 ? (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            
            {/* Progress Indicators */}
            <View style={styles.progressHeader}>
              {[1, 2].map((s) => (
                <View 
                  key={s} 
                  style={[
                    styles.progressBarSegment, 
                    step >= s && styles.progressBarActiveSegment
                  ]} 
                />
              ))}
            </View>

            {/* BACK Button */}
            {step > 1 && (
              <Pressable style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color="#60646C" />
                <Text style={styles.backBtnText}>Back</Text>
              </Pressable>
            )}

            {/* STEP 1: Choose Persona (Personal vs Business) */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.welcomeTitle}>Setup Your Profile</Text>
                <Text style={styles.welcomeSubtitle}>Select your account type to proceed</Text>
                
                <View style={styles.roleContainer}>
                  <Pressable
                    style={[
                      styles.roleCard,
                      selectedRole === 'user' && styles.selectedRoleCard,
                    ]}
                    onPress={() => setSelectedRole('user')}
                  >
                    <Ionicons name="person-circle-outline" size={42} color={selectedRole === 'user' ? '#1C873C' : '#60646C'} />
                    <Text style={[styles.roleCardTitle, selectedRole === 'user' && styles.selectedRoleText]}>
                      Personal Account
                    </Text>
                    <Text style={styles.roleCardDesc}>
                      For individuals and families. Connect with neighbors, view feed, ask questions, and hire local services.
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.roleCard,
                      selectedRole === 'professional' && styles.selectedRoleCard,
                    ]}
                    onPress={() => setSelectedRole('professional')}
                  >
                    <Ionicons name="briefcase-outline" size={42} color={selectedRole === 'professional' ? '#1C873C' : '#60646C'} />
                    <Text style={[styles.roleCardTitle, selectedRole === 'professional' && styles.selectedRoleText]}>
                      Business Account
                    </Text>
                    <Text style={styles.roleCardDesc}>
                      For local stores & professionals. Show up on the local directory and map, get inquiries, and offer services.
                    </Text>
                  </Pressable>
                </View>

                <Pressable style={styles.primaryBtn} onPress={handleNextStep}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 2: Address Setup & Map Pinning */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.formTitle}>
                  {selectedRole === 'professional' ? 'Business Profile Setup' : 'Neighborhood Address Setup'}
                </Text>
                <Text style={styles.formSubtitle}>
                  Please fill in your address and pin your exact location on the map.
                </Text>

                {/* Business details if Business Account */}
                {selectedRole === 'professional' && (
                  <View style={styles.businessForm}>
                    <Text style={styles.label}>Business / Professional Name</Text>
                    <TextInput
                      value={businessName}
                      onChangeText={setBusinessName}
                      placeholder="e.g. Ramesh Plumbing Works"
                      placeholderTextColor="#A0A4AC"
                      style={styles.input}
                    />

                    <Text style={styles.label}>Category of Service</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
                      {professions.map((prof) => (
                        <Pressable
                          key={prof}
                          style={[styles.pickerPill, profession === prof && styles.activePickerPill]}
                          onPress={() => setProfession(prof)}
                        >
                          <Text style={[styles.pickerPillText, profession === prof && styles.activePickerPillText]}>
                            {prof}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>

                    <Text style={styles.label}>Working Hours</Text>
                    <TextInput
                      value={workingHours}
                      onChangeText={setWorkingHours}
                      placeholder="e.g. 9:00 AM - 7:00 PM"
                      placeholderTextColor="#A0A4AC"
                      style={styles.input}
                    />

                    <Text style={styles.label}>Mobile / WhatsApp Number</Text>
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="10-digit number"
                      placeholderTextColor="#A0A4AC"
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={styles.input}
                    />
                  </View>
                )}

                <Text style={styles.sectionDivider}>Address Details</Text>

                <Text style={styles.label}>Street Address / House No.</Text>
                <TextInput
                  value={street}
                  onChangeText={setStreet}
                  placeholder="e.g. No. 24, Victor Simonel Street"
                  placeholderTextColor="#A0A4AC"
                  style={styles.input}
                />

                <View style={styles.row}>
                  <View style={styles.flexItem}>
                    <Text style={styles.label}>Locality</Text>
                    <TextInput
                      value={place}
                      onChangeText={setPlace}
                      placeholder="e.g. White Town"
                      placeholderTextColor="#A0A4AC"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.flexItem}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                      value={city}
                      onChangeText={setCity}
                      placeholder="e.g. Pondicherry"
                      placeholderTextColor="#A0A4AC"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.flexItem}>
                    <Text style={styles.label}>State</Text>
                    <TextInput
                      value={state}
                      onChangeText={setState}
                      placeholder="e.g. Puducherry"
                      placeholderTextColor="#A0A4AC"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.flexItem}>
                    <Text style={styles.label}>Pincode</Text>
                    <TextInput
                      value={pin}
                      onChangeText={setPin}
                      placeholder="e.g. 605001"
                      placeholderTextColor="#A0A4AC"
                      keyboardType="number-pad"
                      maxLength={6}
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Map Pin Selector */}
                <Text style={styles.label}>Pin Location on Map</Text>
                <Text style={styles.mapHelpText}>Tap on the map below to place the marker exactly on your location.</Text>
                <View style={styles.mapContainer}>
                  <Map 
                    markers={mapMarkers}
                    userLocation={userLocation || (selectedCoords ? { latitude: selectedCoords.latitude, longitude: selectedCoords.longitude, accuracy: null } : null)}
                    onMapClick={handleMapClick}
                  />
                </View>

                <Pressable style={styles.primaryBtn} onPress={handleNextStep}>
                  <Text style={styles.primaryBtnText}>Complete Setup</Text>
                </Pressable>
              </View>
            )}

          </ScrollView>
        ) : (
          /* STEP 3: "You are all set!" Success Screen */
          <View style={styles.successContainer}>
            <View style={styles.successPulseOuter}>
              <View style={styles.successPulseInner}>
                <Ionicons name="checkmark" size={60} color="#ffffff" />
              </View>
            </View>
            <Text style={styles.successTitle}>You are all set!</Text>
            <Text style={styles.successDescription}>
              Creating your {selectedRole === 'professional' ? 'Business' : 'Personal'} account. Just a moment while we load your neighborhood...
            </Text>
            <View style={styles.loadingBar}>
              <View style={styles.loadingBarProgress} />
            </View>
          </View>
        )}
      </SafeAreaContainer>
    </View>
  );
}

// Wrapper for safe area on iOS
function SafeAreaContainer({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 44 : 0, backgroundColor: '#ffffff' }}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: 99999,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 60,
  },
  progressHeader: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 16,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  progressBarActiveSegment: {
    backgroundColor: '#1C873C',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#60646C',
  },
  stepContent: {
    backgroundColor: '#ffffff',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C873C',
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 20,
  },
  roleCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  selectedRoleCard: {
    borderColor: '#1C873C',
    backgroundColor: '#EAF6EA',
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
    marginTop: 10,
    marginBottom: 6,
  },
  selectedRoleText: {
    color: '#1C873C',
  },
  roleCardDesc: {
    fontSize: 12,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: '#1C873C',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  businessForm: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#40444C',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
  },
  sectionDivider: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A9099',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexItem: {
    flex: 1,
  },
  pickerScroll: {
    gap: 8,
    paddingVertical: 6,
    marginBottom: 12,
  },
  pickerPill: {
    backgroundColor: '#F0F2F5',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  activePickerPill: {
    backgroundColor: '#EAF6EA',
  },
  pickerPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60646C',
  },
  activePickerPillText: {
    color: '#1C873C',
  },
  mapHelpText: {
    fontSize: 12,
    color: '#8A9099',
    marginBottom: 8,
    lineHeight: 16,
  },
  mapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  successPulseOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EAF6EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successPulseInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1C873C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1C873C',
    textAlign: 'center',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 15,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  loadingBar: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F2F5',
    overflow: 'hidden',
  },
  loadingBarProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C873C',
  },
});
