import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, SafeAreaView, Platform, Alert, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKnowAround, Professional, DirectoryItem, AlertItem, JobVacancy } from '../context/KnowAroundContext';
import Map, { MapRef } from '../components/Map';
import BottomSheet from '../components/BottomSheet';
import { RoundTickIcon } from '@/components/CustomIcons';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';

export default function SearchScreen() {
  const {
    activeLocation,
    professionals,
    directory,
    alerts,
    jobs,
    addAlert,
    applyJob,
    userLocation,
    setUserLocation,
    distanceFilter,
    setDistanceFilter,
    darkMode
  } = useKnowAround();

  const mapRef = useRef<MapRef>(null);
  const isFocused = useIsFocused();
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState(false);
  const locationSubscription = useRef<any>(null);

  // Premium Map Customization States
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [searchCenter, setSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [mapViewportCenter, setMapViewportCenter] = useState<{ latitude: number; longitude: number } | null>(null);

  // Initialize searchCenter when userLocation becomes available
  useEffect(() => {
    if (userLocation && !searchCenter) {
      setSearchCenter({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
    }
  }, [userLocation]);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayers, setSelectedLayers] = useState<string[]>(['professionals', 'alerts', 'directory']);
  
  // Custom Alert Pin Drop State
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [alertFormVisible, setAlertFormVisible] = useState(false);
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertDesc, setNewAlertDesc] = useState('');
  const [newAlertLevel, setNewAlertLevel] = useState<'warning' | 'danger' | 'info'>('warning');

  // Bottom Sheet Selection State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<'professional' | 'alert' | 'job' | 'directory' | null>(null);

  // Search Tag Suggestions
  const searchSuggestions = ['Plumber', 'Electrician', 'ATM', 'Hospital', 'Supermarket', 'Pharmacy'];

  // Location permission setup, subscription, and target button actions
  useEffect(() => {
    let active = true;

    async function setupLocation() {
      if (!isFocused) return;

      try {
        const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
        if (!active) return;
        setPermissionStatus(currentStatus);

        if (currentStatus === 'undetermined') {
          const { status: reqStatus } = await Location.requestForegroundPermissionsAsync();
          if (!active) return;
          setPermissionStatus(reqStatus);
          if (reqStatus !== 'granted') return;
        } else if (currentStatus !== 'granted') {
          return;
        }

        let currentPos = await Location.getLastKnownPositionAsync({});
        if (!currentPos) {
          currentPos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }
        if (!active) return;

        setUserLocation({
          latitude: currentPos.coords.latitude,
          longitude: currentPos.coords.longitude,
          accuracy: currentPos.coords.accuracy,
        });

        if (!hasCenteredOnUser) {
          mapRef.current?.panTo(currentPos.coords.latitude, currentPos.coords.longitude, 14);
          setHasCenteredOnUser(true);
        }

        if (locationSubscription.current) {
          locationSubscription.current.remove();
          locationSubscription.current = null;
        }

        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (loc) => {
            if (!active) return;
            setUserLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy: loc.coords.accuracy,
            });
          }
        );
      } catch (err) {
        console.warn('Error setting up location services:', err);
      }
    }

    setupLocation();

    return () => {
      active = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [isFocused]);

  const handleEnableLocation = async () => {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status === 'granted') {
        const currentPos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: currentPos.coords.latitude,
          longitude: currentPos.coords.longitude,
          accuracy: currentPos.coords.accuracy,
        });
        mapRef.current?.panTo(currentPos.coords.latitude, currentPos.coords.longitude, 14);
        setHasCenteredOnUser(true);
      } else if (status === 'denied' && !canAskAgain) {
        Alert.alert(
          'Location Access Required',
          'KnowAround needs location permission to display nearby listings. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (err) {
      console.warn('Error enabling location:', err);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRegionChangeComplete = (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => {
    setMapViewportCenter({
      latitude: region.latitude,
      longitude: region.longitude
    });

    if (searchCenter) {
      const dist = getDistance(
        region.latitude,
        region.longitude,
        searchCenter.latitude,
        searchCenter.longitude
      );
      // If panned > 0.4 km, show the button
      if (dist > 0.4) {
        setShowSearchThisArea(true);
      } else {
        setShowSearchThisArea(false);
      }
    }
  };

  const handleSearchThisArea = () => {
    if (mapViewportCenter) {
      setSearchCenter(mapViewportCenter);
      setShowSearchThisArea(false);
    }
  };

  const cycleMapStyle = () => {
    if (mapStyle === 'standard') setMapStyle('satellite');
    else if (mapStyle === 'satellite') setMapStyle('terrain');
    else setMapStyle('standard');
  };

  const handleCenterOnUser = async () => {
    if (permissionStatus !== 'granted') {
      await handleEnableLocation();
      return;
    }

    if (userLocation) {
      mapRef.current?.panTo(userLocation.latitude, userLocation.longitude, 14);
      setSearchCenter({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
      setShowSearchThisArea(false);
    } else {
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy
        });
        setSearchCenter({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        mapRef.current?.panTo(loc.coords.latitude, loc.coords.longitude, 14);
        setShowSearchThisArea(false);
      } catch (err) {
        Alert.alert('Location Error', 'Unable to retrieve your current location.');
      }
    }
  };

  // Handle layer toggling
  const toggleLayer = (layer: string) => {
    if (selectedLayers.includes(layer)) {
      setSelectedLayers(selectedLayers.filter(l => l !== layer));
    } else {
      setSelectedLayers([...selectedLayers, layer]);
    }
  };

  // Compile markers based on layers and search filters
  const getMarkers = () => {
    const list: any[] = [
      {
        id: 'user_loc',
        lat: userLocation ? userLocation.latitude : 11.9340,
        lng: userLocation ? userLocation.longitude : 79.8300,
        title: 'Your Location',
        type: 'user'
      }
    ];

    // Filter by search query
    const matchesSearch = (text: string) => {
      return !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());
    };

    // Professionals
    if (selectedLayers.includes('professionals')) {
      professionals.forEach((p) => {
        if (matchesSearch(p.name) || matchesSearch(p.profession)) {
          list.push({
            id: `professional_${p.id}`,
            lat: p.lat,
            lng: p.lng,
            title: p.name,
            type: 'professionals',
            details: `${p.profession} - Rated ${p.rating} ★`
          });
        }
      });
    }

    // Alerts
    if (selectedLayers.includes('alerts')) {
      alerts.forEach((a) => {
        if (matchesSearch(a.title) || matchesSearch(a.description)) {
          list.push({
            id: `alert_${a.id}`,
            lat: a.lat,
            lng: a.lng,
            title: `[ALERT] ${a.title}`,
            type: 'alerts',
            details: a.description
          });
        }
      });
    }

    // Directory Businesses (mapped to 'jobs' icon color pin)
    if (selectedLayers.includes('directory')) {
      directory.forEach((d) => {
        if (matchesSearch(d.name) || matchesSearch(d.category)) {
          list.push({
            id: `directory_${d.id}`,
            lat: d.lat,
            lng: d.lng,
            title: d.name,
            type: 'jobs',
            details: `${d.category} - Rated ${d.rating} ★`
          });
        }
      });
    }

    return list;
  };

  // Tapping map to drop custom alert pin
  const handleMapClick = (lat: number, lng: number) => {
    setClickCoords({ lat, lng });
    setAlertFormVisible(true);
  };

  const handleSaveAlert = () => {
    if (!newAlertTitle.trim() || !newAlertDesc.trim() || !clickCoords) {
      alert('Please fill in alert details.');
      return;
    }
    addAlert(newAlertTitle, newAlertDesc, newAlertLevel, clickCoords.lat, clickCoords.lng);
    setAlertFormVisible(false);
    setNewAlertTitle('');
    setNewAlertDesc('');
    setClickCoords(null);
  };

  // Tapping a pin highlights it in a sliding Bottom Sheet
  const handleMarkerClick = (markerId: string) => {
    if (markerId === 'user_loc') return;

    const [type, id] = markerId.split('_');

    if (type === 'professional') {
      const match = professionals.find(p => p.id === id);
      if (match) {
        setSelectedItem(match);
        setSelectedItemType('professional');
      }
    } else if (type === 'directory') {
      const match = directory.find(d => d.id === id);
      if (match) {
        setSelectedItem(match);
        setSelectedItemType('directory');
      }
    } else if (type === 'alert') {
      const match = alerts.find(a => a.id === id);
      if (match) {
        setSelectedItem(match);
        setSelectedItemType('alert');
      }
    }
  };

  const handleCall = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to make phone call.'));
  };

  const handleWhatsApp = (num: string) => {
    const url = `https://wa.me/91${num}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open WhatsApp.'));
  };

  const handleDirections = (loc: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc + ', Pondicherry')}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open Google Maps.'));
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
      {/* Map Core Canvas (Covers full screen) */}
      <View style={styles.mapWrapper}>
        <Map
          ref={mapRef}
          markers={getMarkers()}
          userLocation={userLocation}
          searchCenter={searchCenter}
          searchRadius={parseFloat(distanceFilter)}
          darkMode={darkMode}
          mapStyle={mapStyle}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          onRegionChangeComplete={handleRegionChangeComplete}
        />
      </View>

      {/* Floating "Search this area" Button */}
      {showSearchThisArea && (
        <Pressable 
          style={[styles.searchAreaButton, darkMode && styles.searchAreaButtonDark]} 
          onPress={handleSearchThisArea}
        >
          <Ionicons name="refresh" size={14} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.searchAreaButtonText}>Search this area</Text>
        </Pressable>
      )}

      {/* Floating My Location Button */}
      <Pressable style={[styles.myLocationButton, darkMode && styles.myLocationButtonDark]} onPress={handleCenterOnUser}>
        <Ionicons name="locate" size={24} color={permissionStatus === 'granted' ? '#1a73e8' : '#60646C'} />
      </Pressable>

      {/* Floating Map Style Button */}
      <Pressable style={[styles.mapStyleButton, darkMode && styles.mapStyleButtonDark]} onPress={cycleMapStyle}>
        <Ionicons 
          name={mapStyle === 'standard' ? 'map' : mapStyle === 'satellite' ? 'earth' : 'construct'} 
          size={20} 
          color="#60646C" 
        />
      </Pressable>

      {/* Location Access Disabled Card */}
      {permissionStatus === 'denied' && (
        <View style={[styles.permissionDeniedCard, darkMode && styles.permissionDeniedCardDark]}>
          <Text style={[styles.permissionTitle, darkMode && styles.permissionTitleDark]}>Location Access Disabled</Text>
          <Text style={[styles.permissionDesc, darkMode && styles.permissionDescDark]}>
            Enable location to discover nearby professionals, alerts, events, and businesses.
          </Text>
          <Pressable style={styles.permissionBtn} onPress={handleEnableLocation}>
            <Text style={styles.permissionBtnText}>Enable Location</Text>
          </Pressable>
        </View>
      )}

      {/* Floating Header Overlay */}
      <View style={styles.floatingHeader}>
        {/* Locality badge */}
        <View style={[styles.localityBadge, darkMode && styles.localityBadgeDark]}>
          <Ionicons name="location" size={12} color="#1C873C" />
          <Text style={[styles.localityText, darkMode && styles.localityTextDark]}>{activeLocation.split(',')[0]}</Text>
        </View>

        {/* Floating Search Bar */}
        <View style={[styles.searchBarRow, darkMode && styles.searchBarRowDark]}>
          <Ionicons name="search" size={18} color="#60646C" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Plumber, Hospital, ATM..."
            placeholderTextColor={darkMode ? "#A0A4AC" : "#8A9099"}
            style={[styles.searchInput, darkMode && styles.searchInputDark]}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={18} color="#60646C" />
            </Pressable>
          ) : null}
        </View>

        {/* Suggestion tags under search bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          {searchSuggestions.map((tag) => (
            <Pressable
              key={tag}
              style={[styles.tagPill, darkMode && styles.tagPillDark]}
              onPress={() => setSearchQuery(tag)}
            >
              <Text style={[styles.tagText, darkMode && styles.tagTextDark]}>{tag}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Floating Unified Map Controls Group (Layers + Distance Radius) */}
      <View style={styles.bottomControlsContainer}>
        {/* Distance Range Filter Selector */}
        <View style={[styles.controlRow, darkMode && styles.controlRowDark]}>
          <Text style={[styles.controlLabel, darkMode && styles.controlLabelDark]}>Radius</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlScroll}>
            {['1 km', '2 km', '5 km', '10 km', '20 km'].map((dist) => {
              const isActive = distanceFilter === dist;
              return (
                <Pressable
                  key={dist}
                  style={[
                    styles.controlPill, 
                    darkMode && styles.controlPillDark, 
                    isActive && styles.activeControlPill
                  ]}
                  onPress={() => setDistanceFilter(dist)}
                >
                  <Text style={[
                    styles.controlPillText, 
                    darkMode && styles.controlPillTextDark, 
                    isActive && styles.activeControlPillText
                  ]}>
                    {dist}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Categories Layer Toggles */}
        <View style={styles.layersRow}>
          {[
            { id: 'professionals', label: 'Pros', icon: 'flash' },
            { id: 'directory', label: 'Shops', icon: 'basket' },
            { id: 'alerts', label: 'Alerts', icon: 'warning' },
          ].map((layer) => {
            const isActive = selectedLayers.includes(layer.id);
            return (
              <Pressable
                key={layer.id}
                style={[styles.layerBtn, darkMode && styles.layerBtnDark, isActive && styles.activeLayerBtn]}
                onPress={() => toggleLayer(layer.id)}
              >
                <Ionicons name={layer.icon as any} size={14} color={isActive ? '#ffffff' : '#60646C'} />
                <Text style={[styles.layerBtnText, darkMode && styles.layerBtnTextDark, isActive && styles.activeLayerBtnText]}>{layer.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Google Maps-style Marker details Bottom Sheet */}
      <BottomSheet visible={selectedItem !== null} onClose={() => setSelectedItem(null)}>
        {selectedItemType === 'professional' && selectedItem && (
          <View style={styles.detailContainer}>
            {/* Header: Name, Avatar, Availability Status */}
            <View style={styles.detailHeaderBox}>
              <Image 
                source={{ uri: selectedItem.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' }} 
                style={styles.detailAvatar} 
              />
              <View style={styles.detailMetaBox}>
                <View style={styles.nameRow}>
                  <Text style={styles.detailName}>{selectedItem.name}</Text>
                  {selectedItem.verified && <RoundTickIcon color="#1C873C" size={16} />}
                </View>
                <Text style={styles.detailCategory}>{selectedItem.profession} &middot; Rated {selectedItem.rating} ★ ({selectedItem.reviewsCount} reviews)</Text>
                <Text style={styles.detailLocation}>📍 {selectedItem.location} &middot; {selectedItem.distance} km away</Text>
              </View>
              
              <View style={[styles.statusBadge, selectedItem.availability === 'Available' ? styles.statusAvailable : styles.statusBusy]}>
                <Text style={styles.statusText}>{selectedItem.availability}</Text>
              </View>
            </View>

            {/* Google Maps Circular Actions Bar */}
            <View style={styles.mapsActionsBar}>
              <Pressable style={styles.mapsActionItem} onPress={() => handleCall(selectedItem.phone)}>
                <View style={[styles.mapsActionCircle, styles.circleCall]}>
                  <Ionicons name="call" size={18} color="#1C873C" />
                </View>
                <Text style={styles.mapsActionLabel}>Call</Text>
              </Pressable>
              
              <Pressable style={styles.mapsActionItem} onPress={() => handleWhatsApp(selectedItem.whatsapp)}>
                <View style={[styles.mapsActionCircle, styles.circleWhatsApp]}>
                  <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                </View>
                <Text style={styles.mapsActionLabel}>WhatsApp</Text>
              </Pressable>

              <Pressable style={styles.mapsActionItem} onPress={() => handleDirections(selectedItem.location)}>
                <View style={[styles.mapsActionCircle, styles.circleNav]}>
                  <Ionicons name="navigate" size={18} color="#1877F2" />
                </View>
                <Text style={styles.mapsActionLabel}>Directions</Text>
              </Pressable>

              <Pressable style={styles.mapsActionItem} onPress={() => Alert.alert('Share Business', `Sharing ${selectedItem.name}'s contact card with neighbors.`)}>
                <View style={styles.mapsActionCircle}>
                  <Ionicons name="share-social" size={18} color="#60646C" />
                </View>
                <Text style={styles.mapsActionLabel}>Share</Text>
              </Pressable>
            </View>
          </View>
        )}

        {selectedItemType === 'directory' && selectedItem && (
          <View style={styles.detailContainer}>
            {/* Header for Directory Business */}
            <View style={styles.detailHeaderBox}>
              <View style={styles.detailAvatarContainer}>
                <Ionicons name="basket-outline" size={24} color="#1C873C" />
              </View>
              <View style={styles.detailMetaBox}>
                <Text style={styles.detailName}>{selectedItem.name}</Text>
                <Text style={styles.detailCategory}>{selectedItem.category} &middot; Rated {selectedItem.rating} ★</Text>
                <Text style={styles.detailLocation}>📍 {selectedItem.location} &middot; {selectedItem.distance} km away</Text>
              </View>

              <View style={[styles.statusBadge, selectedItem.openStatus === 'Open' ? styles.statusAvailable : styles.statusBusy]}>
                <Text style={styles.statusText}>{selectedItem.openStatus}</Text>
              </View>
            </View>

            {/* Google Maps Actions Bar */}
            <View style={styles.mapsActionsBar}>
              <Pressable style={styles.mapsActionItem} onPress={() => handleCall(selectedItem.phone)}>
                <View style={[styles.mapsActionCircle, styles.circleCall]}>
                  <Ionicons name="call" size={18} color="#1C873C" />
                </View>
                <Text style={styles.mapsActionLabel}>Call</Text>
              </Pressable>

              <Pressable style={styles.mapsActionItem} onPress={() => handleWhatsApp(selectedItem.phone)}>
                <View style={[styles.mapsActionCircle, styles.circleWhatsApp]}>
                  <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                </View>
                <Text style={styles.mapsActionLabel}>WhatsApp</Text>
              </Pressable>

              <Pressable style={styles.mapsActionItem} onPress={() => handleDirections(selectedItem.location)}>
                <View style={[styles.mapsActionCircle, styles.circleNav]}>
                  <Ionicons name="navigate" size={18} color="#1877F2" />
                </View>
                <Text style={styles.mapsActionLabel}>Directions</Text>
              </Pressable>

              <Pressable style={styles.mapsActionItem} onPress={() => Alert.alert('Share Store', `Sharing ${selectedItem.name}'s listing.`)}>
                <View style={styles.mapsActionCircle}>
                  <Ionicons name="share-social" size={18} color="#60646C" />
                </View>
                <Text style={styles.mapsActionLabel}>Share</Text>
              </Pressable>
            </View>
          </View>
        )}

        {selectedItemType === 'alert' && selectedItem && (
          <View style={styles.detailContainer}>
            <View style={[styles.alertHeader, selectedItem.level === 'danger' && styles.dangerAlert]}>
              <Ionicons name="warning" size={16} color="#ffffff" />
              <Text style={styles.alertHeaderTitle}>LOCAL NOTICE ALERT</Text>
            </View>
            <Text style={styles.detailName}>{selectedItem.title}</Text>
            <Text style={styles.alertTime}>{selectedItem.time} ago &middot; {selectedItem.location}</Text>
            <Text style={styles.alertDesc}>{selectedItem.description}</Text>
          </View>
        )}
      </BottomSheet>

      {/* Click-to-drop Alert creation Bottom Sheet */}
      <BottomSheet visible={alertFormVisible} onClose={() => setAlertFormVisible(false)}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Report Local Security Notice</Text>
          <Text style={styles.formLocality}>Coordinates: {clickCoords?.lat.toFixed(4)}, {clickCoords?.lng.toFixed(4)}</Text>

          <Text style={styles.formLabel}>Notice / Alert Title</Text>
          <TextInput
            value={newAlertTitle}
            onChangeText={setNewAlertTitle}
            placeholder="e.g. Broken Water Pipe, Pothole, Flooding"
            placeholderTextColor="#8A9099"
            style={styles.formInput}
          />

          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            value={newAlertDesc}
            onChangeText={setNewAlertDesc}
            placeholder="Share details so neighbors can plan..."
            placeholderTextColor="#8A9099"
            multiline
            style={[styles.formInput, styles.formInputMultiline]}
          />

          <Text style={styles.formLabel}>Severity Level</Text>
          <View style={styles.severityRow}>
            {([
              { id: 'info', label: 'Info', color: '#E3F2FD' },
              { id: 'warning', label: 'Warning', color: '#FFF8E1' },
              { id: 'danger', label: 'Danger', color: '#FFEBEE' },
            ] as const).map((lvl) => {
              const isSelected = newAlertLevel === lvl.id;
              return (
                <Pressable
                  key={lvl.id}
                  style={[styles.severityBtn, isSelected && styles.activeSeverityBtn, { backgroundColor: lvl.color }]}
                  onPress={() => setNewAlertLevel(lvl.id)}
                >
                  <Text style={styles.severityBtnText}>{lvl.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.submitBtn} onPress={handleSaveAlert}>
            <Text style={styles.submitBtnText}>Drop Alert Pin</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeAreaDark: {
    backgroundColor: '#121212',
  },
  myLocationButtonDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
  },
  permissionDeniedCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
  },
  permissionTitleDark: {
    color: '#FFFFFF',
  },
  permissionDescDark: {
    color: '#A0A4AC',
  },
  localityBadgeDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    borderWidth: 1,
  },
  localityTextDark: {
    color: '#4ade80',
  },
  searchBarRowDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    borderWidth: 1,
  },
  searchInputDark: {
    color: '#FFFFFF',
  },
  tagPillDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    borderWidth: 1,
  },
  tagTextDark: {
    color: '#A0A4AC',
  },
  layerBtnDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    borderWidth: 1,
  },
  layerBtnTextDark: {
    color: '#A0A4AC',
  },
  mapWrapper: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EAF0F6',
    zIndex: 20,
  },
  myLocationButtonDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
  },
  mapStyleButton: {
    position: 'absolute',
    bottom: 156,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EAF0F6',
    zIndex: 20,
  },
  mapStyleButtonDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
  },
  searchAreaButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 180 : 160,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C873C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 25,
  },
  searchAreaButtonDark: {
    backgroundColor: '#16652B',
  },
  searchAreaButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 84,
    left: 16,
    right: 76,
    gap: 8,
    zIndex: 10,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  controlRowDark: {
    backgroundColor: '#1E1E1E',
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#60646C',
    marginRight: 8,
    textTransform: 'uppercase',
  },
  controlLabelDark: {
    color: '#A0A4AC',
  },
  controlScroll: {
    flexGrow: 0,
  },
  controlPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F1F3F5',
    marginRight: 6,
  },
  controlPillDark: {
    backgroundColor: '#2D2D2D',
  },
  activeControlPill: {
    backgroundColor: '#1C873C',
  },
  controlPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60646C',
  },
  controlPillTextDark: {
    color: '#A0A4AC',
  },
  activeControlPillText: {
    color: '#ffffff',
  },
  layersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  permissionDeniedCard: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 20,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 6,
  },
  permissionDesc: {
    fontSize: 13,
    color: '#60646C',
    lineHeight: 18,
    marginBottom: 12,
  },
  permissionBtn: {
    backgroundColor: '#1C873C',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  localityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 8,
  },
  localityText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C873C',
    marginLeft: 3,
    textTransform: 'uppercase',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A202C',
    marginLeft: 8,
  },
  tagsContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  tagPill: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60646C',
  },
  layerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 10,
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activeLayerBtn: {
    backgroundColor: '#1C873C',
  },
  layerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60646C',
  },
  activeLayerBtnText: {
    color: '#ffffff',
  },
  detailContainer: {
    width: '100%',
  },
  detailHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#E2E8F0',
  },
  detailAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#EAF6EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailMetaBox: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  statusAvailable: {
    backgroundColor: '#EAF6EA',
  },
  statusBusy: {
    backgroundColor: '#FCE8E6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C873C',
    textTransform: 'uppercase',
  },
  detailCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: '#60646C',
    marginTop: 2,
  },
  detailLocation: {
    fontSize: 12,
    color: '#8A9099',
    marginTop: 4,
  },
  mapsActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: 16,
    marginTop: 8,
  },
  mapsActionItem: {
    alignItems: 'center',
    gap: 6,
  },
  mapsActionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  circleCall: {
    borderColor: '#EAF6EA',
  },
  circleWhatsApp: {
    borderColor: '#EAF6EA',
  },
  circleNav: {
    borderColor: '#EBF4FF',
  },
  mapsActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60646C',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 12,
  },
  dangerAlert: {
    backgroundColor: '#C62828',
  },
  alertHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  alertTime: {
    fontSize: 11,
    color: '#8A9099',
    marginTop: 4,
    marginBottom: 10,
  },
  alertDesc: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 4,
  },
  formLocality: {
    fontSize: 12,
    color: '#8A9099',
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60646C',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A202C',
    marginBottom: 12,
  },
  formInputMultiline: {
    height: 70,
    textAlignVertical: 'top',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeSeverityBtn: {
    borderWidth: 2,
    borderColor: '#1C873C',
  },
  severityBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
  },
  submitBtn: {
    backgroundColor: '#1C873C',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
