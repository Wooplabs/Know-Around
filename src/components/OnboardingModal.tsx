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
          <View style={{ flex: 1 }}>
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
                    <View style={styles.roleCardHeader}>
                      <View style={[styles.iconBadge, selectedRole === 'user' && styles.selectedIconBadge]}>
                        <Ionicons name="person" size={20} color={selectedRole === 'user' ? '#ffffff' : '#60646C'} />
                      </View>
                      {selectedRole === 'user' && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark-circle" size={22} color="#1C873C" />
                        </View>
                      )}
                    </View>
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
                    <View style={styles.roleCardHeader}>
                      <View style={[styles.iconBadge, selectedRole === 'professional' && styles.selectedIconBadge]}>
                        <Ionicons name="business" size={20} color={selectedRole === 'professional' ? '#ffffff' : '#60646C'} />
                      </View>
                      {selectedRole === 'professional' && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark-circle" size={22} color="#1C873C" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.roleCardTitle, selectedRole === 'professional' && styles.selectedRoleText]}>
                      Business Account
                    </Text>
                    <Text style={styles.roleCardDesc}>
                      For local stores & professionals. Show up on the local directory and map, get inquiries, and offer services.
                    </Text>
                  </Pressable>
                </View>
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

              </View>
            )}

          </ScrollView>

          <View style={styles.bottomCtaContainer}>
            <Pressable style={styles.primaryBtn} onPress={handleNextStep}>
              <Text style={styles.primaryBtnText}>
                {step === 1 ? 'Continue' : 'Complete Setup'}
              </Text>
            </Pressable>
          </View>
        </View>
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
  bottomCtaContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 120,
  },
  progressHeader: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 18,
  },
  progressBarSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
  },
  progressBarActiveSegment: {
    backgroundColor: '#1C873C',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
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
    fontSize: 28,
    fontWeight: '900',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#60646C',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  roleContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 20,
  },
  roleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  selectedRoleCard: {
    borderColor: '#1C873C',
    backgroundColor: '#F4FAF6',
    shadowColor: '#1C873C',
    shadowOpacity: 0.05,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIconBadge: {
    backgroundColor: '#1C873C',
  },
  checkBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 4,
  },
  selectedRoleText: {
    color: '#1A202C',
  },
  roleCardDesc: {
    fontSize: 12.5,
    color: '#60646C',
    textAlign: 'left',
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: '#1C873C',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  businessForm: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FCFDFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1A202C',
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0F9F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successPulseInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1C873C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    paddingHorizontal: 24,
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
