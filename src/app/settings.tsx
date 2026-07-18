import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView, 
  SafeAreaView, 
  Platform, 
  Switch, 
  Alert, 
  Image,
  KeyboardAvoidingView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKnowAround } from '../context/KnowAroundContext';
import { router } from 'expo-router';
import Map from '../components/Map';

export default function SettingsScreen() {
  const { 
    user, 
    currentUser, 
    userAddress, 
    setUserAddress, 
    updateProfileDetails, 
    userRole, 
    setUserRole,
    darkMode, 
    setDarkMode, 
    logout,
    userLocation
  } = useKnowAround();

  // Profile fields
  const [name, setName] = useState(user?.name || currentUser.name);
  const [email, setEmail] = useState(user?.email || '');

  // Address fields
  const [street, setStreet] = useState(userAddress?.street || '');
  const [place, setPlace] = useState(userAddress?.place || '');
  const [city, setCity] = useState(userAddress?.city || '');
  const [state, setState] = useState(userAddress?.state || '');
  const [pin, setPin] = useState(userAddress?.pin || '');
  const [phone, setPhone] = useState(userAddress?.phone || '');

  // Map coordinates
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(
    userAddress ? { latitude: userLocation?.latitude || 11.9344, longitude: userLocation?.longitude || 79.8302 } : null
  );

  // App Toggles
  const [notifications, setNotifications] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ latitude: lat, longitude: lng });
  };

  const mapMarkers = selectedCoords ? [{
    id: 'settings_user_pin',
    lat: selectedCoords.latitude,
    lng: selectedCoords.longitude,
    title: 'Your Address Location',
    type: 'professionals' as const
  }] : [];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    // Save profile details
    updateProfileDetails(name.trim(), email.trim());

    // Save address details
    setUserAddress({
      street: street.trim(),
      place: place.trim(),
      city: city.trim(),
      state: state.trim(),
      pin: pin.trim(),
      phone: phone.trim()
    });

    Alert.alert('Success 🎉', 'Account settings saved successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          } 
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
      {/* Header */}
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? '#ffffff' : '#1A1C1E'} />
        </Pressable>
        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>Account Settings</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* User Photo & Account Role Banner */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
              <Pressable style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </Pressable>
            </View>
            <Text style={[styles.profileName, darkMode && styles.profileNameDark]}>{name || 'Neighbor'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {userRole === 'professional' ? 'Business Profile' : 'Personal Profile'}
              </Text>
            </View>
          </View>

          {/* Section: Profile Info */}
          <Text style={styles.sectionHeader}>Profile Info</Text>
          <View style={[styles.card, darkMode && styles.cardDark]}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#A0A4AC"
              style={[styles.input, darkMode && styles.inputDark]}
            />

            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor="#A0A4AC"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, darkMode && styles.inputDark]}
            />
          </View>

          {/* Section: Address Details */}
          <Text style={styles.sectionHeader}>Address & Map Location</Text>
          <View style={[styles.card, darkMode && styles.cardDark]}>
            <Text style={styles.fieldLabel}>Street Address / House No.</Text>
            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholder="e.g. No. 24, Victor Simonel Street"
              placeholderTextColor="#A0A4AC"
              style={[styles.input, darkMode && styles.inputDark]}
            />

            <View style={styles.row}>
              <View style={styles.flexItem}>
                <Text style={styles.fieldLabel}>Locality</Text>
                <TextInput
                  value={place}
                  onChangeText={setPlace}
                  placeholder="White Town"
                  placeholderTextColor="#A0A4AC"
                  style={[styles.input, darkMode && styles.inputDark]}
                />
              </View>
              <View style={styles.flexItem}>
                <Text style={styles.fieldLabel}>City</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Pondicherry"
                  placeholderTextColor="#A0A4AC"
                  style={[styles.input, darkMode && styles.inputDark]}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flexItem}>
                <Text style={styles.fieldLabel}>State</Text>
                <TextInput
                  value={state}
                  onChangeText={setState}
                  placeholder="Puducherry"
                  placeholderTextColor="#A0A4AC"
                  style={[styles.input, darkMode && styles.inputDark]}
                />
              </View>
              <View style={styles.flexItem}>
                <Text style={styles.fieldLabel}>Pincode</Text>
                <TextInput
                  value={pin}
                  onChangeText={setPin}
                  placeholder="605001"
                  placeholderTextColor="#A0A4AC"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[styles.input, darkMode && styles.inputDark]}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Mobile / WhatsApp Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="WhatsApp mobile number"
              placeholderTextColor="#A0A4AC"
              keyboardType="phone-pad"
              style={[styles.input, darkMode && styles.inputDark]}
            />

            <Text style={styles.fieldLabel}>Interactive Pinpoint Map</Text>
            <Text style={styles.mapHelpText}>Tap to set your exact house marker on the map.</Text>
            <View style={styles.mapWrapper}>
              <Map 
                markers={mapMarkers}
                userLocation={userLocation || (selectedCoords ? { latitude: selectedCoords.latitude, longitude: selectedCoords.longitude, accuracy: null } : null)}
                onMapClick={handleMapClick}
              />
            </View>
          </View>

          {/* Section: Application Toggles */}
          <Text style={styles.sectionHeader}>Preferences & Preferences</Text>
          <View style={[styles.card, darkMode && styles.cardDark]}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleTitle, darkMode && styles.toggleTitleDark]}>Dark Mode Appearance</Text>
                <Text style={styles.toggleDesc}>Switch between light and dark theme elements</Text>
              </View>
              <Switch 
                value={darkMode} 
                onValueChange={setDarkMode}
                trackColor={{ false: '#E2E8F0', true: '#C2E7C9' }}
                thumbColor={darkMode ? '#1C873C' : '#94A3B8'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.toggleTitle, darkMode && styles.toggleTitleDark]}>Push Notifications</Text>
                <Text style={styles.toggleDesc}>Receive daily neighborhood news & event updates</Text>
              </View>
              <Switch 
                value={notifications} 
                onValueChange={setNotifications}
                trackColor={{ false: '#E2E8F0', true: '#C2E7C9' }}
                thumbColor={notifications ? '#1C873C' : '#94A3B8'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.toggleTitle, darkMode && styles.toggleTitleDark]}>High Priority Alerts</Text>
                <Text style={styles.toggleDesc}>Get instant popups for critical local safety alerts</Text>
              </View>
              <Switch 
                value={safetyAlerts} 
                onValueChange={setSafetyAlerts}
                trackColor={{ false: '#E2E8F0', true: '#C2E7C9' }}
                thumbColor={safetyAlerts ? '#1C873C' : '#94A3B8'}
              />
            </View>
          </View>

          {/* Section: Danger Zone & Destructive Actions */}
          <Text style={[styles.sectionHeader, styles.destructiveText]}>Danger Zone</Text>
          <View style={[styles.card, darkMode && styles.cardDark]}>
            <Pressable onPress={handleLogout} style={styles.dangerActionBtn}>
              <Ionicons name="log-out-outline" size={20} color="#E53935" />
              <Text style={styles.dangerActionText}>Log Out Account</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable onPress={handleDeleteAccount} style={styles.dangerActionBtn}>
              <Ionicons name="trash-outline" size={20} color="#E53935" />
              <Text style={styles.dangerActionText}>Delete Account Permanently</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  safeAreaDark: {
    backgroundColor: '#121212',
  },
  header: {
    height: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#2D2D2D',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1C1E',
  },
  headerTitleDark: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: '#1C873C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  avatarSectionDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#2D2D2D',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C873C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  profileNameDark: {
    color: '#ffffff',
  },
  roleBadge: {
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C873C',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60646C',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
    shadowColor: 'transparent',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60646C',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FCFDFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A202C',
    marginBottom: 10,
  },
  inputDark: {
    backgroundColor: '#2D2D2D',
    borderColor: '#3D3D3D',
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexItem: {
    flex: 1,
  },
  mapHelpText: {
    fontSize: 11,
    color: '#8A9099',
    marginBottom: 8,
  },
  mapWrapper: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  toggleTitleDark: {
    color: '#ffffff',
  },
  toggleDesc: {
    fontSize: 11,
    color: '#60646C',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 12,
  },
  dangerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  dangerActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  destructiveText: {
    color: '#E53935',
  },
});
