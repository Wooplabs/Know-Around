import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  SafeAreaView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useKnowAround } from '../context/KnowAroundContext';
import Map from '../components/Map';

export default function EditLocationScreen() {
  const { 
    savedHouseLocation, 
    userLocation,
    updateUserLocationCoordinates,
    darkMode 
  } = useKnowAround();

  // Initial map center coordinates
  const initialLat = savedHouseLocation?.latitude || userLocation?.latitude || 11.9340;
  const initialLng = savedHouseLocation?.longitude || userLocation?.longitude || 79.8300;

  // Track map center as user pans
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number }>({
    latitude: initialLat,
    longitude: initialLng
  });
  const [saving, setSaving] = useState(false);

  const handleRegionChangeComplete = (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => {
    setMapCenter({
      latitude: region.latitude,
      longitude: region.longitude
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserLocationCoordinates(mapCenter.latitude, mapCenter.longitude);
      Alert.alert('Success 🎉', 'Your home location has been updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to update location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? '#ffffff' : '#1A1C1E'} />
        </Pressable>
        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]} numberOfLines={1}>
          Edit House Location
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        <Map
          markers={[]}
          userLocation={userLocation}
          houseLocation={savedHouseLocation}
          onRegionChangeComplete={handleRegionChangeComplete}
          darkMode={darkMode}
        />

        {/* Fixed Center Pin Overlay */}
        <View style={styles.pinOverlay} pointerEvents="none">
          <View style={styles.pinWrapper}>
            <View style={styles.pinTeardrop}>
              <View style={styles.pinAvatarReplacement}>
                <Ionicons name="home" size={20} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.pinLabel}>
              <Text style={styles.pinLabelText}>Drag map under pin</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Controls Card */}
      <View style={[styles.bottomCard, darkMode && styles.bottomCardDark]}>
        <Text style={[styles.cardTitle, darkMode && styles.cardTitleDark]}>Adjust House Pin</Text>
        <Text style={styles.cardSubtitle}>
          Move the map underneath the pin to set your exact home location.
        </Text>

        {/* Coordinates Box */}
        <View style={[styles.coordsBox, darkMode && styles.coordsBoxDark]}>
          <View style={styles.coordRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={[styles.coordText, darkMode && styles.coordTextDark]}>
              Lat: {mapCenter.latitude.toFixed(6)}, Lng: {mapCenter.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <Pressable 
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
            saving && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Confirm & Save Location</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#2D2D2D',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1C1E',
    textAlign: 'center',
    flex: 1,
  },
  headerTitleDark: {
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  pinOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    // offset center pin so pointer points exactly at map center
    transform: [{ translateY: -28 }],
  },
  pinTeardrop: {
    width: 48,
    height: 48,
    borderRadius: 50,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '-45deg' }],
    backgroundColor: '#1C873C',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinAvatarReplacement: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  pinLabel: {
    marginTop: 12,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pinLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomCard: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomCardDark: {
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardTitleDark: {
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  coordsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  coordsBoxDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 6,
  },
  coordTextDark: {
    color: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#1C873C',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
