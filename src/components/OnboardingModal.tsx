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
  Modal,
  StatusBar,
  Image
} from 'react-native';
import { useKnowAround } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Map from './Map';

export interface AddressSuggestion {
  id: string;
  title: string;
  subtitle: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export default function OnboardingModal() {
  const { 
    user, 
    onboardingCompleted, 
    completeOnboarding,
    logout
  } = useKnowAround();

  // Wizard Step: 1 = Name, 2 = Address, 3 = Confirm Location on Map, 4 = Notifications, 5 = Guidelines, 6 = Success
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

  // Step 3 State (Confirm Location on Map)
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number }>({ latitude: 11.9340, longitude: 79.8300 });
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);

  // Real-time Address Suggestions State
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<'street' | 'area' | null>(null);
  const searchTimerRef = React.useRef<any>(null);

  // Fetch live address suggestions from OSM Nominatim API
  const fetchAddressSuggestions = (queryStr: string, field: 'street' | 'area') => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!queryStr || queryStr.trim().length < 3) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      setActiveSearchField(null);
      return;
    }

    setActiveSearchField(field);
    setIsSearchingSuggestions(true);

    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr.trim())}&addressdetails=1&limit=5`,
          {
            headers: {
              'User-Agent': 'KnowAroundApp/1.0'
            }
          }
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const parsed: AddressSuggestion[] = data.map((item: any, idx: number) => {
            const addr = item.address || {};
            const streetName = [addr.house_number, addr.road || addr.pedestrian || addr.footway].filter(Boolean).join(' ') || item.display_name.split(',')[0];
            const areaName = addr.suburb || addr.neighbourhood || addr.residential || addr.district || '';
            const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
            const stateName = addr.state || '';
            const countryName = addr.country || 'India';
            const postcode = addr.postcode || '';

            const title = streetName || item.display_name.split(',')[0];
            const subtitleParts = [areaName, cityName, stateName, postcode].filter(Boolean);
            const subtitle = subtitleParts.length > 0 ? subtitleParts.join(', ') : item.display_name;

            return {
              id: `sug_${idx}_${item.place_id}`,
              title,
              subtitle,
              street: streetName,
              area: areaName,
              city: cityName,
              state: stateName,
              country: countryName,
              postalCode: postcode,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon)
            };
          });
          setSuggestions(parsed);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.warn('Address autocomplete fetch error:', err);
        setSuggestions([]);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (sug: AddressSuggestion) => {
    if (sug.street) setStreet(sug.street);
    if (sug.area) setArea(sug.area);
    if (sug.city) setCity(sug.city);
    if (sug.state) setState(sug.state);
    if (sug.country) setCountry(sug.country);
    if (sug.postalCode) setPostalCode(sug.postalCode);
    if (sug.latitude && sug.longitude) {
      setLatitude(sug.latitude);
      setLongitude(sug.longitude);
    }
    setAutoFilledBadge('✨ Address selected!');
    setSuggestions([]);
    setActiveSearchField(null);
  };

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
          setLocationPermissionGranted(true);
        }
      }
    } catch (err) {
      console.warn('GPS detection notice:', err);
      Alert.alert('Notice', 'Could not detect exact GPS position. Please enter your address manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const initConfirmMapLocation = async () => {
    const fullAddr = [street, area, locality, city, state, country, postalCode].filter(Boolean).join(', ');
    setFormattedAddress(fullAddr);

    if (latitude && longitude && (latitude !== 11.9340 || longitude !== 79.8300)) {
      setMapCenter({ latitude, longitude });
    } else {
      setIsGeocoding(true);
      try {
        const queryStr = [street, area, city, state, country, postalCode].filter(Boolean).join(', ');
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&limit=1`,
          { headers: { 'User-Agent': 'KnowAroundApp/1.0' } }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const latVal = parseFloat(data[0].lat);
          const lonVal = parseFloat(data[0].lon);
          if (!isNaN(latVal) && !isNaN(lonVal)) {
            setLatitude(latVal);
            setLongitude(lonVal);
            setMapCenter({ latitude: latVal, longitude: lonVal });
            if (data[0].display_name) {
              setFormattedAddress(data[0].display_name);
            }
          }
        }
      } catch (err) {
        console.warn('Geocoding notice:', err);
      } finally {
        setIsGeocoding(false);
      }
    }
  };

  const handleMapRegionChangeComplete = (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => {
    if (!region.latitude || !region.longitude) return;
    setLatitude(region.latitude);
    setLongitude(region.longitude);
    setMapCenter({ latitude: region.latitude, longitude: region.longitude });

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${region.latitude}&lon=${region.longitude}`,
          { headers: { 'User-Agent': 'KnowAroundApp/1.0' } }
        );
        const data = await res.json();
        if (data && data.display_name) {
          setFormattedAddress(data.display_name);
        } else {
          setFormattedAddress([street, area, city, state, postalCode].filter(Boolean).join(', '));
        }
      } catch (e) {
        setFormattedAddress([street, area, city, state, postalCode].filter(Boolean).join(', '));
      }
    }, 400);
  };

  const handleStep1Submit = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name so neighbors can recognize you.');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = async () => {
    if (!street.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      Alert.alert('Address Mandatory', 'Street address, city, state, and postal code are mandatory to explore your neighborhood feed.');
      return;
    }
    if (postalCode.trim().length < 6) {
      Alert.alert('Invalid Postal Code', 'Please enter a valid 6-digit postal code.');
      return;
    }
    await initConfirmMapLocation();
    setStep(3);
  };

  const handleStep4Finish = (enableNotifications: boolean) => {
    setNotificationEnabled(enableNotifications);
    setStep(5);
  };

  const handleStep5Finish = async () => {
    setIsSubmitting(true);
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
        formattedAddress: formattedAddress || [street, area, city, state, postalCode].filter(Boolean).join(', '),
        latitude,
        longitude,
        locationPermissionGranted,
        locationVerified: true,
        notificationEnabled,
      });
      setStep(6);
    } catch (e) {
      console.error('Onboarding completion error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.fullscreenOverlay}>
      <View style={styles.container}>
        
        {/* Step Indicator Bar with Back Button */}
        {step <= 5 && (
          <View style={styles.topBarRow}>
            <Pressable 
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  logout();
                }
              }} 
              style={styles.backBtnWrapper}
            >
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </Pressable>

            <View style={styles.progressRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <View 
                  key={s} 
                  style={[
                    styles.progressSegment, 
                    step >= s && styles.progressSegmentActive
                  ]} 
                />
              ))}
            </View>
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

            {(() => {
              const isStep1Valid = name.trim().length > 0;
              return (
                <Pressable 
                  style={[styles.primaryBtn, !isStep1Valid && styles.primaryBtnDisabled]} 
                  onPress={handleStep1Submit}
                  disabled={!isStep1Valid}
                >
                  <Text style={[styles.primaryBtnText, !isStep1Valid && styles.primaryBtnTextDisabled]}>Continue</Text>
                </Pressable>
              );
            })()}
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
                  onChangeText={(text) => {
                    setStreet(text);
                    fetchAddressSuggestions(text, 'street');
                  }}
                  onFocus={() => {
                    if (street.trim().length >= 3) fetchAddressSuggestions(street, 'street');
                  }}
                  placeholder="e.g. No. 24, Victor Simonel Street"
                  placeholderTextColor="#A0A4AC"
                  style={styles.input}
                />
              </View>

              {/* Suggestions Dropdown for Street */}
              {activeSearchField === 'street' && (suggestions.length > 0 || isSearchingSuggestions) && (
                <View style={styles.suggestionsBox}>
                  {isSearchingSuggestions ? (
                    <View style={styles.suggestionsLoadingRow}>
                      <ActivityIndicator size="small" color="#1C873C" />
                      <Text style={styles.suggestionsLoadingText}>Searching address suggestions...</Text>
                    </View>
                  ) : (
                    suggestions.map((sug) => (
                      <Pressable key={sug.id} style={styles.suggestionItem} onPress={() => handleSelectSuggestion(sug)}>
                        <Ionicons name="location-outline" size={18} color="#1C873C" style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionTitle} numberOfLines={1}>{sug.title}</Text>
                          <Text style={styles.suggestionSubtitle} numberOfLines={1}>{sug.subtitle}</Text>
                        </View>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Area / Neighborhood</Text>
                <TextInput
                  value={area}
                  onChangeText={(text) => {
                    setArea(text);
                    fetchAddressSuggestions(text, 'area');
                  }}
                  onFocus={() => {
                    if (area.trim().length >= 3) fetchAddressSuggestions(area, 'area');
                  }}
                  placeholder="e.g. White Town"
                  placeholderTextColor="#A0A4AC"
                  style={styles.input}
                />
              </View>

              {/* Suggestions Dropdown for Area */}
              {activeSearchField === 'area' && (suggestions.length > 0 || isSearchingSuggestions) && (
                <View style={styles.suggestionsBox}>
                  {isSearchingSuggestions ? (
                    <View style={styles.suggestionsLoadingRow}>
                      <ActivityIndicator size="small" color="#1C873C" />
                      <Text style={styles.suggestionsLoadingText}>Searching area suggestions...</Text>
                    </View>
                  ) : (
                    suggestions.map((sug) => (
                      <Pressable key={sug.id} style={styles.suggestionItem} onPress={() => handleSelectSuggestion(sug)}>
                        <Ionicons name="location-outline" size={18} color="#1C873C" style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionTitle} numberOfLines={1}>{sug.title}</Text>
                          <Text style={styles.suggestionSubtitle} numberOfLines={1}>{sug.subtitle}</Text>
                        </View>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

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

              {/* Ghost Button: Use Current Location shifted above Save Address */}
              <View style={styles.locationActionRow}>
                <Pressable style={styles.ghostGpsBtn} onPress={handleUseCurrentLocation} disabled={isLocating}>
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#1C873C" />
                  ) : (
                    <>
                      <Ionicons name="locate-outline" size={18} color="#1C873C" />
                      <Text style={styles.ghostGpsBtnText}>At home? Use your current location</Text>
                    </>
                  )}
                </Pressable>
              </View>

              {(() => {
                const isStep2Valid = street.trim().length > 0 && city.trim().length > 0 && state.trim().length > 0 && postalCode.trim().length === 6;
                return (
                  <Pressable 
                    style={[styles.primaryBtn, !isStep2Valid && styles.primaryBtnDisabled]} 
                    onPress={handleStep2Submit}
                    disabled={!isStep2Valid}
                  >
                    <Text style={[styles.primaryBtnText, !isStep2Valid && styles.primaryBtnTextDisabled]}>Save Address & Continue</Text>
                  </Pressable>
                );
              })()}
            </View>
          </ScrollView>
        )}

        {/* STEP 3: Confirm Location on Map */}
        {step === 3 && (
          <View style={styles.confirmMapContainer}>
            <View style={styles.confirmMapHeader}>
              <Text style={styles.confirmMapTitle}>Confirm Location on Map</Text>
              <Text style={styles.confirmMapSubtitle}>
                Move the map underneath the center pin to set your exact home position.
              </Text>
            </View>

            {/* Large Interactive Map Canvas */}
            <View style={styles.mapCanvasWrapper}>
              <Map
                markers={[]}
                userLocation={{ latitude: mapCenter.latitude, longitude: mapCenter.longitude, accuracy: null }}
                userAvatar={user?.avatar}
                userLabel="My House"
                onRegionChangeComplete={handleMapRegionChangeComplete}
              />
              
              {/* Fixed Center Pin Overlay */}
              <View style={styles.fixedCenterPinOverlay} pointerEvents="none">
                <View style={styles.centerPinTeardrop}>
                  <Ionicons name="home" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.centerPinDotShadow} />
              </View>

              {isGeocoding && (
                <View style={styles.mapLoadingOverlay}>
                  <ActivityIndicator size="small" color="#1C873C" />
                  <Text style={styles.mapLoadingText}>Locating address on map...</Text>
                </View>
              )}
            </View>

            {/* Bottom Address Details Card */}
            <View style={styles.locationBottomCard}>
              <View style={styles.bottomCardAddressHeader}>
                <Ionicons name="location" size={22} color="#1C873C" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bottomCardAddressTitle} numberOfLines={2}>
                    {formattedAddress || [street, area, city, state, postalCode].filter(Boolean).join(', ') || 'Selected Location'}
                  </Text>
                  <Text style={styles.bottomCardCoordsText}>
                    Lat: {latitude ? latitude.toFixed(5) : '--'}  •  Lng: {longitude ? longitude.toFixed(5) : '--'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.bottomCardBtnRow}>
                <Pressable style={styles.secondaryBackBtn} onPress={() => setStep(2)}>
                  <Text style={styles.secondaryBackBtnText}>Back</Text>
                </Pressable>

                {(() => {
                  const isValidCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude) && latitude !== 0;
                  return (
                    <Pressable
                      style={[styles.confirmContinueBtn, !isValidCoords && styles.confirmContinueBtnDisabled]}
                      onPress={() => setStep(4)}
                      disabled={!isValidCoords}
                    >
                      <Text style={[styles.confirmContinueBtnText, !isValidCoords && styles.confirmContinueBtnTextDisabled]}>
                        Confirm Location & Continue
                      </Text>
                    </Pressable>
                  );
                })()}
              </View>
            </View>
          </View>
        )}

        {/* STEP 4: Turn on Notifications */}
        {step === 4 && (
          <View style={styles.step3Container}>
            <Text style={styles.step3HeaderTitle}>
              Turn on notifications so you don't miss neighborhood updates!
            </Text>

            {/* Notification Preview Cards Stack */}
            <View style={styles.notifCardsStack}>
              {/* Card 1 */}
              <View style={styles.notifCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }} 
                  style={styles.notifAvatar} 
                />
                <Text style={styles.notifText}>Hey! Are you still going to the community BBQ?</Text>
                <View style={styles.replyBadge}>
                  <Text style={styles.replyBadgeText}>Reply</Text>
                </View>
              </View>

              {/* Card 2 */}
              <View style={styles.notifCard}>
                <View style={styles.alertIconAvatar}>
                  <Ionicons name="warning" size={20} color="#334155" />
                </View>
                <Text style={styles.notifText}>There is an outage reported on 24th St. 306 customers are reported to be affected.</Text>
              </View>

              {/* Card 3 */}
              <View style={styles.notifCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' }} 
                  style={styles.notifAvatar} 
                />
                <Text style={styles.notifText}>I'm selling some furniture for spring cleaning. Any offers?</Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {/* Action Buttons */}
            <Pressable 
              style={styles.primaryBtn} 
              onPress={() => handleStep4Finish(true)} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryBtnText}>Enable notifications</Text>
              )}
            </Pressable>

            <Pressable 
              style={styles.textBtnLink} 
              onPress={() => handleStep4Finish(false)} 
              disabled={isSubmitting}
            >
              <Text style={styles.textBtnLinkText}>Not now</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 5: Community Guidelines */}
        {step === 5 && (
          <View style={styles.step4Container}>
            <Text style={styles.step4HeaderTitle}>
              One last thing! Let's all do our part to keep KnowAround safe and fun.
            </Text>

            <View style={styles.guidelinesList}>
              {/* Item 1 */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineIconBox}>
                  <Ionicons name="heart-outline" size={24} color="#1E293B" />
                </View>
                <View style={styles.guidelineTextContent}>
                  <Text style={styles.guidelineTitle}>Be helpful</Text>
                  <Text style={styles.guidelineBody}>
                    Keep posts and conversations constructive, even when opinions differ.
                  </Text>
                </View>
              </View>

              {/* Item 2 */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineIconBox}>
                  <Ionicons name="megaphone-outline" size={24} color="#1E293B" />
                </View>
                <View style={styles.guidelineTextContent}>
                  <Text style={styles.guidelineTitle}>Lead with respect</Text>
                  <Text style={styles.guidelineBody}>
                    Remember that your KnowAround neighbors are a part of your offline community, too.
                  </Text>
                </View>
              </View>

              {/* Item 3 */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineIconBox}>
                  <Ionicons name="ban-outline" size={24} color="#1E293B" />
                </View>
                <View style={styles.guidelineTextContent}>
                  <Text style={styles.guidelineTitle}>Do no harm</Text>
                  <Text style={styles.guidelineBody}>
                    Don't engage in activity that could hurt a neighbor or put them in danger.
                  </Text>
                </View>
              </View>

              {/* Item 4 */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineIconBox}>
                  <Ionicons name="happy-outline" size={24} color="#1E293B" />
                </View>
                <View style={styles.guidelineTextContent}>
                  <Text style={styles.guidelineTitle}>All are welcome</Text>
                  <Text style={styles.guidelineBody}>
                    Racism, hateful language, and discrimination are expressly prohibited.
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {/* Bottom Button */}
            <Pressable 
              style={styles.primaryBtn} 
              onPress={handleStep5Finish} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryBtnText}>I understand</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* STEP 6: Success Animation */}
        {step === 6 && (
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
    paddingTop: Platform.OS === 'ios' ? 58 : ((StatusBar.currentHeight || 36) + 16),
    paddingBottom: 24,
    justifyContent: 'flex-start',
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backBtnWrapper: {
    padding: 2,
  },
  progressRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
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
    marginTop: 8,
    marginBottom: 4,
  },
  ghostGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F9F4',
    borderWidth: 1.5,
    borderColor: '#1C873C',
    borderRadius: 26,
    height: 50,
  },
  ghostGpsBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1C873C',
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
  primaryBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryBtnTextDisabled: {
    color: '#94A3B8',
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
  suggestionsBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    marginTop: -8,
    marginBottom: 16,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: '#60646C',
    marginTop: 2,
  },
  suggestionsLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  suggestionsLoadingText: {
    fontSize: 13,
    color: '#60646C',
  },
  step3Container: {
    flex: 1,
    paddingTop: 8,
  },
  step3HeaderTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 32,
    marginBottom: 24,
    letterSpacing: -0.4,
  },
  notifCardsStack: {
    gap: 12,
  },
  notifCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  alertIconAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 18,
  },
  replyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  replyBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  textBtnLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  textBtnLinkText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  step4Container: {
    flex: 1,
    paddingTop: 8,
  },
  step4HeaderTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 32,
    marginBottom: 28,
    letterSpacing: -0.4,
  },
  guidelinesList: {
    gap: 22,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  guidelineIconBox: {
    width: 30,
    alignItems: 'center',
    paddingTop: 2,
  },
  guidelineTextContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  guidelineBody: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '400',
  },
  confirmMapContainer: {
    flex: 1,
    paddingTop: 4,
  },
  confirmMapHeader: {
    marginBottom: 10,
  },
  confirmMapTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  confirmMapSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  mapCanvasWrapper: {
    flex: 1,
    minHeight: 260,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fixedCenterPinOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -38,
    marginLeft: -20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  centerPinTeardrop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C873C',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  centerPinDotShadow: {
    width: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: 2,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 100,
  },
  mapLoadingText: {
    fontSize: 12,
    color: '#1C873C',
    fontWeight: '600',
  },
  locationBottomCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 10,
    marginBottom: 6,
  },
  bottomCardAddressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  bottomCardAddressTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19,
  },
  bottomCardCoordsText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  bottomCardBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBackBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBackBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  confirmContinueBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1C873C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmContinueBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  confirmContinueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmContinueBtnTextDisabled: {
    color: '#94A3B8',
  },
});
