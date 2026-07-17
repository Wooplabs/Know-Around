import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingModal() {
  const { 
    onboardingCompleted, 
    setOnboardingCompleted, 
    userRole, 
    setUserRole, 
    activeLocation, 
    setActiveLocation,
    setUserAddress,
    registerBusiness
  } = useKnowAround();

  // Wizard Steps: 
  // 1 = Persona Selector (Personal vs Business)
  // 2 = Address Form Details
  // 3 = Manual Location Map Plotter
  // 4 = Confirmation Summary
  // 5 = Success Auto-Closing Screen (4 seconds)
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

  // Manual Map coordinate offsets (representing Pondicherry/White Town coordinates)
  const [pinCoords, setPinCoords] = useState({ x: 120, y: 100 });

  const professions = ['Electrician', 'Plumber', 'Carpenter', 'AC Technician', 'Driver', 'Gig Worker', 'Other'];

  // Handle map tapping/positioning
  const handleMapPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    // Keep pin within canvas bounds safely
    const x = Math.max(10, Math.min(270, locationX));
    const y = Math.max(10, Math.min(200, locationY));
    setPinCoords({ x, y });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedRole) {
        Alert.alert('Selection Required', 'Please select your profile type.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate common fields
      if (!phone.trim() || !street.trim() || !place.trim() || !city.trim() || !state.trim() || !pin.trim()) {
        Alert.alert('Required Fields', 'Please fill in all contact and address details.');
        return;
      }

      if (phone.length < 10) {
        Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
        return;
      }

      if (selectedRole === 'professional' && !businessName.trim()) {
        Alert.alert('Required Fields', 'Please enter your Business or Professional Name.');
        return;
      }

      setStep(3); // Go to interactive map plotter
    } else if (step === 3) {
      setStep(4); // Go to summary confirmation
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinishOnboarding = () => {
    // Navigate to Success screen, which will run the 4-second auto-close flow
    setStep(5);
  };

  // Step 5 timer trigger: closes onboarding after exactly 4 seconds
  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => {
        // Save details globally
        const address = { street, place, city, state, pin, phone };
        setUserAddress(address);
        setUserRole(selectedRole);
        
        const formattedLocation = `${place}, PY`;
        setActiveLocation(formattedLocation);

        if (selectedRole === 'professional') {
          registerBusiness({
            name: businessName,
            profession,
            phone,
            street: `${street}, ${place}`,
            place: formattedLocation
          });
        }

        // Close onboarding
        setOnboardingCompleted(true);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  if (onboardingCompleted) return null;

  return (
    <Modal visible={!onboardingCompleted} animationType="slide" transparent={false}>
      <SafeAreaContainer>
        {step < 5 ? (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
            {/* Top Progress Bar */}
            <View style={styles.progressHeader}>
              {[1, 2, 3, 4].map((s) => (
                <View 
                  key={s} 
                  style={[
                    styles.progressBarSegment, 
                    step >= s && styles.progressBarActiveSegment
                  ]} 
                />
              ))}
            </View>

            {/* Back Button */}
            {step > 1 && (
              <Pressable style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color="#60646C" />
                <Text style={styles.backBtnText}>Back</Text>
              </Pressable>
            )}

            {/* STEP 1: Persona Choice */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.welcomeTitle}>Welcome to Know Around</Text>
                <Text style={styles.welcomeSubtitle}>Setup Your Neighborhood Profile</Text>
                <Text style={styles.welcomeDescription}>
                  Let's customize your experience. Select the type of account you want to build.
                </Text>

                <View style={styles.roleContainer}>
                  <Pressable
                    style={[
                      styles.roleCard,
                      selectedRole === 'user' && styles.selectedRoleCard,
                    ]}
                    onPress={() => setSelectedRole('user')}
                  >
                    <Ionicons name="person-outline" size={36} color={selectedRole === 'user' ? '#1C873C' : '#60646C'} />
                    <Text style={[styles.roleCardTitle, selectedRole === 'user' && styles.selectedRoleText]}>
                      Personal Account
                    </Text>
                    <Text style={styles.roleCardDesc}>
                      For individuals and families. Connect with your neighbors, receive local updates, report issues, and hire services.
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.roleCard,
                      selectedRole === 'professional' && styles.selectedRoleCard,
                    ]}
                    onPress={() => setSelectedRole('professional')}
                  >
                    <Ionicons name="briefcase-outline" size={36} color={selectedRole === 'professional' ? '#1C873C' : '#60646C'} />
                    <Text style={[styles.roleCardTitle, selectedRole === 'professional' && styles.selectedRoleText]}>
                      Business Account
                    </Text>
                    <Text style={styles.roleCardDesc}>
                      For local stores, professionals, and service providers. Pin your business location and offer hyperlocal services to neighbors.
                    </Text>
                  </Pressable>
                </View>

                <Pressable style={styles.primaryBtn} onPress={handleNextStep}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 2: Address & Details Form */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.formTitle}>
                  {selectedRole === 'professional' ? 'Business Profile Setup' : 'Neighborhood Address Setup'}
                </Text>
                <Text style={styles.welcomeDescription}>
                  Local features require a verified location. Please provide your contact and address details below.
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
                  </View>
                )}

                {/* Common Details (Mobile & Address) */}
                <Text style={styles.label}>Mobile Number (For Contact)</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="10-digit number"
                  placeholderTextColor="#A0A4AC"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                />

                <Text style={styles.sectionDivider}>Detailed Address</Text>

                <Text style={styles.label}>Flat, Building, Street Address</Text>
                <TextInput
                  value={street}
                  onChangeText={street => setStreet(street)}
                  placeholder="e.g. Flat 3B, Victor Simonel Street"
                  placeholderTextColor="#A0A4AC"
                  style={styles.input}
                />

                <View style={styles.row}>
                  <View style={styles.flexItem}>
                    <Text style={styles.label}>Locality / Place</Text>
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
                      placeholder="6-digit PIN"
                      placeholderTextColor="#A0A4AC"
                      keyboardType="number-pad"
                      maxLength={6}
                      style={styles.input}
                    />
                  </View>
                </View>

                <Pressable style={styles.primaryBtn} onPress={handleNextStep}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 3: Manual Location Map Plotter */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.formTitle}>Plot Location on Map</Text>
                <Text style={styles.welcomeDescription}>
                  Tap anywhere on the grid map to pinpoint your exact {selectedRole === 'professional' ? 'business storefront' : 'residence'} location.
                </Text>

                {/* Simulated Interactive Map canvas */}
                <View style={styles.mapContainer}>
                  <Pressable onPress={handleMapPress} style={styles.mapCanvas}>
                    {/* Land Area */}
                    <View style={styles.mapLand} />
                    
                    {/* Ocean Area */}
                    <View style={styles.mapOcean} />

                    {/* Street Grid lines */}
                    <View style={[styles.mapStreet, { top: 40, left: 0, right: 0, height: 10 }]} />
                    <View style={[styles.mapStreet, { top: 110, left: 0, right: 0, height: 10 }]} />
                    <View style={[styles.mapStreet, { top: 170, left: 0, right: 0, height: 10 }]} />
                    
                    <View style={[styles.mapStreet, { left: 45, top: 0, bottom: 0, width: 10 }]} />
                    <View style={[styles.mapStreet, { left: 125, top: 0, bottom: 0, width: 10 }]} />
                    <View style={[styles.mapStreet, { left: 215, top: 0, bottom: 0, width: 10 }]} />

                    {/* Neighborhood building block simulators */}
                    <View style={[styles.mapBlock, { top: 15, left: 15, width: 25, height: 20 }]} />
                    <View style={[styles.mapBlock, { top: 15, left: 70, width: 45, height: 20 }]} />
                    <View style={[styles.mapBlock, { top: 60, left: 70, width: 45, height: 40 }]} />
                    <View style={[styles.mapBlock, { top: 60, left: 15, width: 25, height: 40 }]} />
                    <View style={[styles.mapBlock, { top: 130, left: 70, width: 45, height: 30 }]} />
                    <View style={[styles.mapBlock, { top: 130, left: 145, width: 55, height: 30 }]} />

                    {/* Draggable/Tappable Pin indicator */}
                    <View style={[styles.mapPin, { left: pinCoords.x - 16, top: pinCoords.y - 32 }]}>
                      <Ionicons name="location" size={32} color="#D32F2F" />
                      <View style={styles.pinShadow} />
                    </View>
                  </Pressable>
                </View>

                {/* Plotted GPS Coordinate Card */}
                <View style={styles.coordsCard}>
                  <Text style={styles.coordsLabel}>📍 Live Plotted Coordinates</Text>
                  <View style={styles.coordsRow}>
                    <Text style={styles.coordsValue}>
                      Lat: <Text style={styles.coordsNum}>{(11.9338 + (pinCoords.y - 100) / 10000).toFixed(5)}° N</Text>
                    </Text>
                    <Text style={styles.coordsValue}>
                      Lon: <Text style={styles.coordsNum}>{(79.8300 + (pinCoords.x - 120) / 10000).toFixed(5)}° E</Text>
                    </Text>
                  </View>
                </View>

                <Pressable style={styles.primaryBtn} onPress={handleNextStep}>
                  <Text style={styles.primaryBtnText}>Confirm Location</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 4: Confirmation Summary */}
            {step === 4 && (
              <View style={styles.stepContent}>
                <Ionicons name="shield-checkmark" size={64} color="#1C873C" style={styles.successIcon} />
                <Text style={styles.formTitle}>Verification Summary</Text>
                <Text style={styles.welcomeDescription}>
                  Your neighborhood setup details are complete. Review your account profile summary before entering.
                </Text>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryHeader}>Profile Overview</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Account Persona:</Text>
                    <Text style={styles.summaryValue}>{selectedRole === 'professional' ? 'Business Account' : 'Personal Account'}</Text>
                  </View>

                  {selectedRole === 'professional' && (
                    <>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Business Name:</Text>
                        <Text style={styles.summaryValue}>{businessName}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service Profession:</Text>
                        <Text style={styles.summaryValue}>{profession}</Text>
                      </View>
                    </>
                  )}

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Contact Mobile:</Text>
                    <Text style={styles.summaryValue}>+91 {phone}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Locality / Place:</Text>
                    <Text style={styles.summaryValue}>{place}, {city}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>GPS Plotted:</Text>
                    <Text style={styles.summaryValue}>
                      {(11.9338 + (pinCoords.y - 100) / 10000).toFixed(4)}° N, {(79.8300 + (pinCoords.x - 120) / 10000).toFixed(4)}° E
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Full Address:</Text>
                    <Text style={[styles.summaryValue, styles.summaryValueAddress]}>{street}, {place}, {city}, {state} - {pin}</Text>
                  </View>
                </View>

                <Pressable style={styles.primaryBtn} onPress={handleFinishOnboarding}>
                  <Text style={styles.primaryBtnText}>Submit & Complete Setup</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        ) : (
          /* STEP 5: Success screen (4 seconds animation) */
          <View style={styles.successScreen}>
            <View style={styles.successBox}>
              <View style={styles.pulseContainer}>
                <Ionicons name="checkmark-circle" size={96} color="#1C873C" />
              </View>
              <Text style={styles.successTitle}>You are all set!</Text>
              <Text style={styles.successSubtitle}>Preparing your neighborhood dashboard...</Text>
              <ActivityIndicator color="#1C873C" size="small" style={styles.successLoader} />
            </View>
          </View>
        )}
      </SafeAreaContainer>
    </Modal>
}

// Wrapper for safe area on iOS
function SafeAreaContainer({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 44 : 0 }}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  container: {
    padding: 24,
    paddingBottom: 60,
  },
  progressHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
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
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C873C',
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 13,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  roleContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
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
  businessForm: {
    marginBottom: 16,
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
  successIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  summaryHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4A5568',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60646C',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'right',
  },
  summaryValueAddress: {
    maxWidth: 160,
  },
  mapContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 16,
  },
  mapCanvas: {
    width: '100%',
    height: 220,
    backgroundColor: '#E2F0D9',
    position: 'relative',
  },
  mapOcean: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: '#D0E1FD',
  },
  mapStreet: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  mapBlock: {
    position: 'absolute',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShadow: {
    width: 8,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    marginTop: -2,
  },
  coordsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  coordsLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#60646C',
    marginBottom: 6,
  },
  coordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordsValue: {
    fontSize: 13,
    color: '#60646C',
    fontWeight: '600',
  },
  coordsNum: {
    color: '#1C873C',
    fontWeight: '800',
  },
  successScreen: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 40,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 5,
  },
  pulseContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successLoader: {
    marginTop: 8,
  },
});
