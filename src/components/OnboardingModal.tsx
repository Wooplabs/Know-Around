import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Alert, Platform, Animated, Easing } from 'react-native';
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
    registerBusiness,
    darkMode
  } = useKnowAround();

  // Wizard Steps: 
  // 1 = Account Type Choice (Personal vs. Business)
  // 2 = Form Details & Interactive Map Plotting
  // 3 = "You are all set!" Success Animation Screen (4 sec transition)
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'user' | 'professional' | null>(null);

  // Address inputs
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Pondicherry');
  const [state, setState] = useState('Puducherry');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');

  // Business specific inputs
  const [businessName, setBusinessName] = useState('');
  const [profession, setProfession] = useState('Electrician');
  const [whatsapp, setWhatsapp] = useState('');

  const professions = ['Electrician', 'Plumber', 'Carpenter', 'AC Technician', 'Driver', 'Gig Worker', 'Gardener', 'Restaurant Owner', 'Retail Shop'];

  // Map manual coordinates plotting state
  const [pinX, setPinX] = useState(150); // Default to map center X
  const [pinY, setPinY] = useState(100); // Default to map center Y
  const [hasPlotted, setHasPlotted] = useState(false);

  // Compute mock latitude/longitude based on pin displacement
  const centerLat = 11.9344;
  const centerLng = 79.8302;
  const latitude = (centerLat - (pinY - 100) * 0.00008).toFixed(5);
  const longitude = (centerLng + (pinX - 150) * 0.00008).toFixed(5);

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Handle step 3 (Success Page) countdown & auto-dismiss after 4 seconds
  useEffect(() => {
    if (step === 3) {
      // Start progress track animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3800,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();

      // Start checkmark breathing scale pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          })
        ])
      ).start();

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
        Alert.alert('Selection Required', 'Please choose your profile account type to continue.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate common fields
      if (!street.trim() || !city.trim() || !state.trim() || !pin.trim() || !phone.trim()) {
        Alert.alert('Required Fields', 'Please complete your contact and address details.');
        return;
      }

      if (phone.length < 10) {
        Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit phone number.');
        return;
      }

      if (selectedRole === 'professional') {
        if (!businessName.trim()) {
          Alert.alert('Required Fields', 'Please enter your Business or Professional Name.');
          return;
        }
      }

      if (!hasPlotted) {
        Alert.alert('Map Location Required', 'Please tap on the interactive map to plot your building location exactly.');
        return;
      }

      setStep(3); // Enter animation completion step
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinishOnboarding = () => {
    const formattedAddress = { street, place: city, city, state, pin, phone };
    setUserAddress(formattedAddress);
    setUserRole(selectedRole);

    // Set active location to updated city name
    setActiveLocation(`${city}, Puducherry`);

    // If Business: register custom business dynamic item
    if (selectedRole === 'professional') {
      registerBusiness({
        name: businessName,
        profession,
        phone,
        street: `${street}, ${city}`,
        place: `${city}, Puducherry`
      });
    }

    setOnboardingCompleted(true);
  };

  // Click handler to register custom map coordinates
  const handleMapPress = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    setPinX(locationX);
    setPinY(locationY);
    setHasPlotted(true);
  };

  return (
    <Modal visible={!onboardingCompleted} animationType="slide" transparent={false}>
      <SafeAreaContainer>
        {step < 3 ? (
          <ScrollView style={[styles.scrollView, darkMode && styles.scrollViewDark]} contentContainerStyle={styles.container}>
            {/* Top Indicator */}
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

            {/* Back Arrow */}
            {step > 1 && (
              <Pressable style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color={darkMode ? "#A0A4AC" : "#60646C"} />
                <Text style={[styles.backBtnText, darkMode && styles.textWhite]}>Back</Text>
              </Pressable>
            )}

            {/* STEP 1: Account Type Selection */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={[styles.welcomeTitle, darkMode && styles.textWhite]}>Choose Account Type</Text>
                <Text style={styles.welcomeSubtitle}>Select how you want to use Know Around</Text>

                <View style={styles.roleContainer}>
                  {/* Personal Account Card */}
                  <Pressable
                    style={[
                      styles.roleCard,
                      selectedRole === 'user' && styles.selectedRoleCard,
                      darkMode && styles.roleCardDark,
                      selectedRole === 'user' && darkMode && styles.selectedRoleCardDark
                    ]}
                    onPress={() => setSelectedRole('user')}
                  >
                    <View style={styles.roleIconWrapper}>
                      <Ionicons name="person" size={28} color={selectedRole === 'user' ? '#1C873C' : '#60646C'} />
                    </View>
                    <View style={styles.roleTextContainer}>
                      <Text style={[styles.roleCardTitle, darkMode && styles.textWhite, selectedRole === 'user' && styles.selectedRoleText]}>
                        Personal Account
                      </Text>
                      <Text style={[styles.roleCardDesc, darkMode && styles.textGrey]}>
                        Join local chats, get neighborhood news, share updates with neighbors, and discover local businesses.
                      </Text>
                    </View>
                  </Pressable>

                  {/* Business Account Card */}
                  <Pressable
                    style={[
                      styles.roleCard,
                      selectedRole === 'professional' && styles.selectedRoleCard,
                      darkMode && styles.roleCardDark,
                      selectedRole === 'professional' && darkMode && styles.selectedRoleCardDark
                    ]}
                    onPress={() => setSelectedRole('professional')}
                  >
                    <View style={styles.roleIconWrapper}>
                      <Ionicons name="briefcase" size={28} color={selectedRole === 'professional' ? '#1C873C' : '#60646C'} />
                    </View>
                    <View style={styles.roleTextContainer}>
                      <Text style={[styles.roleCardTitle, darkMode && styles.textWhite, selectedRole === 'professional' && styles.selectedRoleText]}>
                        Business Account
                      </Text>
                      <Text style={[styles.roleCardDesc, darkMode && styles.textGrey]}>
                        Register as a local service, plumber, electrician, or shop. Get verified reviews and get hired by nearby customers.
                      </Text>
                    </View>
                  </Pressable>
                </View>

                <Pressable style={styles.primaryBtn} onPress={handleNextStep}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 2: Address Form & Interactive Map Plotting */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={[styles.welcomeTitle, darkMode && styles.textWhite]}>
                  {selectedRole === 'user' ? 'Setup Your Profile' : 'Setup Your Business'}
                </Text>
                <Text style={styles.welcomeSubtitle}>Provide address details and place your pin on the map</Text>

                {/* Form Input fields */}
                {selectedRole === 'professional' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>Business Name</Text>
                      <TextInput
                        value={businessName}
                        onChangeText={setBusinessName}
                        placeholder="e.g. Pondy Plumbers Ltd."
                        placeholderTextColor="#A0A4AC"
                        style={[styles.input, darkMode && styles.inputDark]}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>Profession / Category</Text>
                      <View style={styles.categoryPillContainer}>
                        {professions.map((prof) => (
                          <Pressable
                            key={prof}
                            style={[
                              styles.categoryPill,
                              profession === prof && styles.activeCategoryPill
                            ]}
                            onPress={() => setProfession(prof)}
                          >
                            <Text style={[
                              styles.categoryPillText,
                              profession === prof && styles.activeCategoryPillText
                            ]}>
                              {prof}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>Street Address</Text>
                  <TextInput
                    value={street}
                    onChangeText={setStreet}
                    placeholder="e.g. 14, Rue Romain Rolland"
                    placeholderTextColor="#A0A4AC"
                    style={[styles.input, darkMode && styles.inputDark]}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.inputGroup, { flex: 1.2, marginRight: 10 }]}>
                    <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>City</Text>
                    <TextInput
                      value={city}
                      onChangeText={setCity}
                      placeholder="e.g. Pondicherry"
                      placeholderTextColor="#A0A4AC"
                      style={[styles.input, darkMode && styles.inputDark]}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>State</Text>
                    <TextInput
                      value={state}
                      onChangeText={setState}
                      placeholder="e.g. Puducherry"
                      placeholderTextColor="#A0A4AC"
                      style={[styles.input, darkMode && styles.inputDark]}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>Pin Code</Text>
                    <TextInput
                      value={pin}
                      onChangeText={setPin}
                      placeholder="e.g. 605001"
                      placeholderTextColor="#A0A4AC"
                      keyboardType="numeric"
                      style={[styles.input, darkMode && styles.inputDark]}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1.2 }]}>
                    <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>Phone Number</Text>
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="10-digit mobile"
                      placeholderTextColor="#A0A4AC"
                      keyboardType="phone-pad"
                      style={[styles.input, darkMode && styles.inputDark]}
                    />
                  </View>
                </View>

                {selectedRole === 'professional' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>WhatsApp Number (Optional)</Text>
                    <TextInput
                      value={whatsapp}
                      onChangeText={setWhatsapp}
                      placeholder="Active WhatsApp mobile"
                      placeholderTextColor="#A0A4AC"
                      keyboardType="phone-pad"
                      style={[styles.input, darkMode && styles.inputDark]}
                    />
                  </View>
                )}

                {/* INTERACTIVE MAP COMPONENT */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>
                    Plot House Location on Map
                  </Text>
                  <Text style={styles.mapHelperText}>
                    Tap on the grid below to mark your exact building location.
                  </Text>

                  <Pressable 
                    onPress={handleMapPress} 
                    style={[styles.mapContainer, darkMode && styles.mapContainerDark]}
                  >
                    {/* Simulated vector grid representing local streets */}
                    <View style={styles.mapRoadH} />
                    <View style={[styles.mapRoadH, { top: 60 }]} />
                    <View style={[styles.mapRoadH, { top: 140 }]} />
                    <View style={styles.mapRoadV} />
                    <View style={[styles.mapRoadV, { left: 90 }]} />
                    <View style={[styles.mapRoadV, { left: 220 }]} />

                    {/* Park blocks */}
                    <View style={styles.mapParkBlock} />
                    <View style={[styles.mapParkBlock, { bottom: 15, right: 20, backgroundColor: '#E2F0D9' }]} />

                    {/* Coordinates Label */}
                    <View style={styles.mapCoordsOverlay}>
                      <Text style={styles.mapCoordsOverlayText}>
                        Center: White Town
                      </Text>
                    </View>

                    {/* Draggable/Movable Red Pointer Icon */}
                    {hasPlotted && (
                      <View style={[styles.pinWrapper, { left: pinX - 14, top: pinY - 26 }]}>
                        <View style={styles.pinPulse} />
                        <Ionicons name="location" size={28} color="#D32F2F" />
                      </View>
                    )}
                  </Pressable>

                  {/* Dynamic plotted output */}
                  {hasPlotted ? (
                    <View style={styles.plottedCoordsContainer}>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#1C873C" />
                      <Text style={styles.plottedCoordsText}>
                        Location Plotted: {latitude}° N, {longitude}° E
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.plottedCoordsContainer, { borderColor: '#E53935', backgroundColor: '#FFF5F5' }]}>
                      <Ionicons name="alert-circle-outline" size={16} color="#E53935" />
                      <Text style={[styles.plottedCoordsText, { color: '#E53935' }]}>
                        Location not plotted yet. Tap the map!
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable style={styles.primaryBtn} onPress={handleNextStep}>
                  <Text style={styles.primaryBtnText}>Finish Account Setup</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        ) : (
          /* STEP 3: "You are all set!" Animation Page */
          <View style={[styles.successContainer, darkMode && styles.successContainerDark]}>
            <View style={styles.successContent}>
              <Animated.View style={[styles.successBadge, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={60} color="#ffffff" />
                </View>
              </Animated.View>

              <Text style={[styles.successTitle, darkMode && styles.textWhite]}>
                You are all set!
              </Text>
              
              <Text style={styles.successSubtitle}>
                Your {selectedRole === 'professional' ? 'business' : 'personal'} neighborhood profile is configured and ready.
              </Text>

              <Text style={[styles.successCountdownText, darkMode && styles.textGrey]}>
                Opening home page in a few seconds...
              </Text>

              {/* Progress track counting down 4 seconds */}
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressIndicator, {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }]} />
              </View>
            </View>
          </View>
        )}
      </SafeAreaContainer>
    </Modal>
  );
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
    backgroundColor: '#F7F9FA',
  },
  scrollViewDark: {
    backgroundColor: '#121212',
  },
  container: {
    padding: 24,
    paddingBottom: 60,
  },
  progressHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
    marginBottom: 16,
    gap: 4,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60646C',
  },
  stepContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0C0D0E',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#60646C',
    marginBottom: 24,
  },
  roleContainer: {
    gap: 16,
    marginBottom: 32,
  },
  roleCard: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  roleCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
  },
  selectedRoleCard: {
    borderColor: '#1C873C',
    backgroundColor: '#F5FCF6',
  },
  selectedRoleCardDark: {
    borderColor: '#1C873C',
    backgroundColor: '#162C18',
  },
  roleIconWrapper: {
    marginRight: 16,
    marginTop: 2,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C0D0E',
    marginBottom: 6,
  },
  selectedRoleText: {
    color: '#1C873C',
  },
  roleCardDesc: {
    fontSize: 13,
    color: '#60646C',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#40444C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1C1E',
  },
  inputDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    color: '#ffffff',
  },
  formRow: {
    flexDirection: 'row',
  },
  categoryPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeCategoryPill: {
    backgroundColor: '#1C873C',
    borderColor: '#1C873C',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  activeCategoryPillText: {
    color: '#ffffff',
  },
  mapHelperText: {
    fontSize: 12,
    color: '#8A9099',
    marginTop: -4,
    marginBottom: 10,
  },
  mapContainer: {
    height: 180,
    borderRadius: 16,
    backgroundColor: '#EBF3F9',
    borderWidth: 1.5,
    borderColor: '#D4E2EE',
    overflow: 'hidden',
    position: 'relative',
  },
  mapContainerDark: {
    backgroundColor: '#1E242B',
    borderColor: '#2C3A47',
  },
  mapRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#ffffff',
    opacity: 0.8,
  },
  mapRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: '#ffffff',
    opacity: 0.8,
    left: 150,
  },
  mapParkBlock: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 60,
    height: 35,
    backgroundColor: '#D1E6C5',
    borderRadius: 6,
  },
  mapCoordsOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mapCoordsOverlayText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(211, 47, 47, 0.25)',
    bottom: 0,
  },
  plottedCoordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#A8DADC',
    backgroundColor: '#F0FAFA',
    marginTop: 10,
    gap: 6,
  },
  plottedCoordsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A5C36',
  },
  primaryBtn: {
    backgroundColor: '#1C873C',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successContainerDark: {
    backgroundColor: '#121212',
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
  },
  successBadge: {
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1C873C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0C0D0E',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  successCountdownText: {
    fontSize: 13,
    color: '#8A9099',
    marginBottom: 12,
  },
  progressTrack: {
    width: '80%',
    height: 6,
    backgroundColor: '#EBF3F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#1C873C',
    borderRadius: 3,
  },
  textWhite: {
    color: '#ffffff',
  },
  textGrey: {
    color: '#8A9099',
  },
});
