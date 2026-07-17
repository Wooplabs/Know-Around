import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Alert, Platform } from 'react-native';
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

  // Wizard Steps: 1 = Persona, 2 = Details Form, 3 = Confirmation
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

  const professions = ['Electrician', 'Plumber', 'Carpenter', 'AC Technician', 'Driver', 'Gig Worker', 'Other'];

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

      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFinishOnboarding = () => {
    // Save address in global state context
    const address = { street, place, city, state, pin, phone };
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
        place: formattedLocation
      });
    }

    setOnboardingCompleted(true);
    Alert.alert('Setup Complete', `Welcome to ${place}! Your account is now active.`);
  };

  return (
    <Modal visible={!onboardingCompleted} animationType="slide" transparent={false}>
      <SafeAreaContainer>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
          
          {/* Top Progress bar indicators */}
          <View style={styles.progressHeader}>
            {[1, 2, 3].map((s) => (
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

          {/* STEP 1: Persona Choice */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.welcomeTitle}>Welcome to Know Around</Text>
              <Text style={styles.welcomeSubtitle}>Setup Your Neighborhood Profile</Text>
              <Text style={styles.welcomeDescription}>
                Let's customize your experience. Select what type of account you want to build.
              </Text>

              <View style={styles.roleContainer}>
                <Pressable
                  style={[
                    styles.roleCard,
                    selectedRole === 'user' && styles.selectedRoleCard,
                  ]}
                  onPress={() => setSelectedRole('user')}
                >
                  <Ionicons name="people" size={32} color={selectedRole === 'user' ? '#3AA832' : '#60646C'} />
                  <Text style={[styles.roleCardTitle, selectedRole === 'user' && styles.selectedRoleText]}>
                    Neighbor Account
                  </Text>
                  <Text style={styles.roleCardDesc}>
                    For individuals and families. Discover alerts, events, local news, and hire local services.
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.roleCard,
                    selectedRole === 'professional' && styles.selectedRoleCard,
                  ]}
                  onPress={() => setSelectedRole('professional')}
                >
                  <Ionicons name="briefcase" size={32} color={selectedRole === 'professional' ? '#3AA832' : '#60646C'} />
                  <Text style={[styles.roleCardTitle, selectedRole === 'professional' && styles.selectedRoleText]}>
                    Business Account
                  </Text>
                  <Text style={styles.roleCardDesc}>
                    For local stores and professionals (Plumbers, Electricians, Shops). Show up on the map and offer services.
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
                Hyperlocal services require verified locations. Please supply your contact and address details.
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
              <Text style={styles.label}>Mobile Number (For Call/WhatsApp)</Text>
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

          {/* STEP 3: Confirmation Summary */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Ionicons name="checkmark-circle" size={64} color="#3AA832" style={styles.successIcon} />
              <Text style={styles.formTitle}>Verification Pending</Text>
              <Text style={styles.welcomeDescription}>
                Your address setup is complete. You can enter the neighborhood immediately. Profile verification will be reviewed.
              </Text>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryHeader}>Account Summary</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Account Type:</Text>
                  <Text style={styles.summaryValue}>{selectedRole === 'professional' ? 'Business Account' : 'Neighbor Account'}</Text>
                </View>

                {selectedRole === 'professional' && (
                  <>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Business Name:</Text>
                      <Text style={styles.summaryValue}>{businessName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Profession:</Text>
                      <Text style={styles.summaryValue}>{profession}</Text>
                    </View>
                  </>
                )}

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Mobile:</Text>
                  <Text style={styles.summaryValue}>+91 {phone}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Locality:</Text>
                  <Text style={styles.summaryValue}>{place}, {city}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Address:</Text>
                  <Text style={[styles.summaryValue, styles.summaryValueAddress]}>{street}, {place}, {city}, {state} - {pin}</Text>
                </View>
              </View>

              <Pressable style={styles.primaryBtn} onPress={handleFinishOnboarding}>
                <Text style={styles.primaryBtnText}>Enter Neighborhood</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
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
    backgroundColor: '#3AA832',
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
    color: '#3AA832',
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
    borderColor: '#3AA832',
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
    color: '#3AA832',
  },
  roleCardDesc: {
    fontSize: 12,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: '#3AA832',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#3AA832',
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
    color: '#3AA832',
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
});
