import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export interface MapRef {
  panTo: (lat: number, lng: number, zoom?: number) => void;
}

interface MapProps {
  markers: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    type: 'professionals' | 'alerts' | 'jobs' | 'user';
    color?: string;
    details?: string;
  }>;
  userLocation?: { latitude: number; longitude: number; accuracy: number | null } | null;
  userAvatar?: string;
  userLabel?: string;
  searchCenter?: { latitude: number; longitude: number } | null;
  searchRadius?: number; // in km
  darkMode?: boolean;
  mapStyle?: 'standard' | 'satellite' | 'terrain';
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (markerId: string) => void;
  onRegionChangeComplete?: (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => void;
}

const Map = forwardRef<MapRef, MapProps>(({ 
  markers, 
  userLocation, 
  userAvatar,
  userLabel,
  searchCenter,
  searchRadius, 
  darkMode, 
  mapStyle = 'standard',
  onMapClick, 
  onMarkerClick,
  onRegionChangeComplete 
}, ref) => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);

  // Expose panTo function to parent screens
  useImperativeHandle(ref, () => ({
    panTo: (lat: number, lng: number, zoom?: number) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'PAN_TO',
          payload: { lat, lng, zoom }
        }));
      }
    }
  }));

  // Synchronize markers to WebView when ready
  useEffect(() => {
    if (webViewRef.current && isReady) {
      const message = {
        type: 'SET_MARKERS',
        payload: markers
      };
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }, [markers, isReady]);

  // Synchronize user location, search center, search radius to WebView when ready
  useEffect(() => {
    if (webViewRef.current && isReady) {
      const message = {
        type: 'SET_MAP_METRICS',
        payload: {
          userLat: userLocation?.latitude || null,
          userLng: userLocation?.longitude || null,
          accuracy: userLocation?.accuracy || null,
          userAvatar: userAvatar || null,
          userLabel: userLabel || null,
          searchLat: searchCenter?.latitude || userLocation?.latitude || null,
          searchLng: searchCenter?.longitude || userLocation?.longitude || null,
          searchRadius: searchRadius || null
        }
      };
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }, [userLocation, userAvatar, userLabel, searchCenter, searchRadius, isReady]);

  // Synchronize style configurations to WebView
  useEffect(() => {
    if (webViewRef.current && isReady) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'UPDATE_STYLE',
        payload: { darkMode: !!darkMode, mapStyle }
      }));
    }
  }, [darkMode, mapStyle, isReady]);

  // Static HTML Content to prevent WebView from constantly reloading when coordinate variables change
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <!-- FontAwesome for Icons inside Webview -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style>
          html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: #EDEFF2;
          }
          .custom-leaflet-marker {
            background: none !important;
            border: none !important;
          }
          /* Custom Popup Styling */
          .leaflet-popup-content-wrapper {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 4px;
          }
          .leaflet-popup-tip {
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          }
          /* Custom Droplet Shaped Map Pins */
          .marker-pin {
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            position: absolute;
            transform: rotate(-45deg);
            left: 50%;
            top: 50%;
            margin: -16px 0 0 -16px;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
          }
          .marker-pin i {
            transform: rotate(45deg);
            color: white;
            font-size: 13px;
          }
          .marker-active .marker-pin {
            transform: rotate(-45deg) scale(1.2);
            box-shadow: 0 6px 16px rgba(0,0,0,0.35);
            border-color: #ffffff;
          }
          /* "My House" Teardrop Custom Pin */
          .my-house-pin-wrapper {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          .my-house-teardrop {
            width: 48px;
            height: 48px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            background: #16A34A;
            border: 3px solid #ffffff;
            box-shadow: 0 6px 18px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: transform 0.2s ease-out;
          }
          .my-house-avatar-box {
            width: 38px;
            height: 38px;
            border-radius: 19px;
            transform: rotate(45deg);
            background-size: cover;
            background-position: center;
            border: 2px solid #ffffff;
            overflow: hidden;
            background-color: #E2E8F0;
          }
          .my-house-badge {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 17px;
            height: 17px;
            border-radius: 9px;
            background-color: #ffffff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(45deg);
            z-index: 10;
          }
          .my-house-badge i {
            color: #334155;
            font-size: 9.5px;
          }
          .my-house-label {
            margin-top: 8px;
            background: #ffffff;
            padding: 5px 14px;
            border-radius: 20px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.18);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #1E293B;
            white-space: nowrap;
            border: 1px solid #F1F5F9;
          }
          /* Pulsing Ring for User Location */
          .user-puck-container {
            position: relative;
            width: 24px;
            height: 24px;
          }
          .user-puck-dot {
            width: 14px;
            height: 14px;
            border-radius: 7px;
            background-color: #1a73e8;
            border: 2.5px solid white;
            box-shadow: 0 2px 6px rgba(26,115,232,0.8);
            position: absolute;
            top: 5px;
            left: 5px;
            z-index: 10;
          }
          .user-puck-pulse {
            width: 24px;
            height: 24px;
            border-radius: 12px;
            background-color: rgba(26,115,232,0.35);
            position: absolute;
            top: 0;
            left: 0;
            animation: puckpulse 2s infinite ease-out;
            z-index: 5;
          }
          @keyframes puckpulse {
            0% {
              transform: scale(0.5);
              opacity: 0.8;
            }
            100% {
              transform: scale(2.2);
              opacity: 0;
            }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Default map center (White Town)
          var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([11.9340, 79.8300], 14);
          
          var tileLayer = null;
          var currentDarkMode = false;
          var currentMapStyle = 'standard';

          function updateMapStyle(isDark, styleType) {
            if (isDark !== undefined) currentDarkMode = isDark;
            if (styleType !== undefined) currentMapStyle = styleType;

            if (tileLayer) {
              map.removeLayer(tileLayer);
            }

            var url = '';
            if (currentMapStyle === 'satellite') {
              url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            } else if (currentMapStyle === 'terrain') {
              url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
            } else {
              url = currentDarkMode 
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
            }
            
            tileLayer = L.tileLayer(url, {
              maxZoom: currentMapStyle === 'satellite' ? 18 : 20,
            }).addTo(map);
          }
          
          // Initialize map style
          updateMapStyle(false, 'standard');

          var markersLayer = L.layerGroup().addTo(map);

          // User Location overlay elements
          var userLocationMarker = null;
          var userAccuracyCircle = null;
          var searchRadiusCircle = null;
          var hasCentered = false;

          // Listen to map clicks
          map.on('click', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_CLICK',
              payload: { lat: e.latlng.lat, lng: e.latlng.lng }
            }));
          });

          // Listen to map movements (panning / zooming)
          map.on('moveend', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_MOVE_END',
              payload: {
                center: map.getCenter(),
                bounds: map.getBounds(),
                zoom: map.getZoom()
              }
            }));
          });

          // Receive messages from React Native
          window.addEventListener('message', function(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'SET_MARKERS') {
                updateMarkers(data.payload);
              } else if (data.type === 'SET_MAP_METRICS') {
                updateMapMetrics(data.payload);
              } else if (data.type === 'PAN_TO') {
                map.setView([data.payload.lat, data.payload.lng], data.payload.zoom || map.getZoom(), { animate: true });
              } else if (data.type === 'UPDATE_STYLE') {
                updateMapStyle(data.payload.darkMode, data.payload.mapStyle);
              }
            } catch (err) {
              console.error(err);
            }
          });

          function updateMapMetrics(payload) {
            if (userLocationMarker) map.removeLayer(userLocationMarker);
            if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);
            if (searchRadiusCircle) map.removeLayer(searchRadiusCircle);

            // 1. Draw subtle blue accuracy circle
            if (payload.userLat && payload.userLng && payload.accuracy) {
              userAccuracyCircle = L.circle([payload.userLat, payload.userLng], {
                radius: payload.accuracy,
                color: '#1a73e8',
                weight: 1,
                opacity: 0.15,
                fillColor: '#1a73e8',
                fillOpacity: 0.06
              }).addTo(map);
            }

            // 2. Draw user "My House" Teardrop pin
            if (payload.userLat && payload.userLng) {
              var avatarUrl = payload.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
              var labelText = payload.userLabel || 'My House';

              var myHouseIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: '<div class="my-house-pin-wrapper">' +
                        '<div class="my-house-teardrop">' +
                          '<div class="my-house-avatar-box" style="background-image: url(\'' + avatarUrl + '\');"></div>' +
                          '<div class="my-house-badge"><i class="fa fa-home"></i></div>' +
                        '</div>' +
                        '<div class="my-house-label">' + labelText + '</div>' +
                      '</div>',
                iconSize: [120, 95],
                iconAnchor: [60, 48]
              });
              userLocationMarker = L.marker([payload.userLat, payload.userLng], { icon: myHouseIcon }).addTo(map);
            }

            // 3. Draw dashed green search radius boundary centered on searchLat/searchLng
            if (payload.searchLat && payload.searchLng && payload.searchRadius) {
              searchRadiusCircle = L.circle([payload.searchLat, payload.searchLng], {
                radius: payload.searchRadius * 1000, // convert km to meters
                color: '#1C873C',
                weight: 1.5,
                opacity: 0.35,
                dashArray: '5, 5',
                fillColor: '#1C873C',
                fillOpacity: 0.02
              }).addTo(map);
            }

            // 4. Centering map on user coordinates exactly once during startup
            if (!hasCentered && payload.userLat && payload.userLng) {
              map.setView([payload.userLat, payload.userLng], 14);
              hasCentered = true;
            }
          }

          var activeMarker = null;

          function updateMarkers(markers) {
            markersLayer.clearLayers();
            activeMarker = null;
            
            markers.forEach(function(marker) {
              if (marker.type === 'user') return;

              var markerColor = '#1C873C'; // Brand Green
              var iconHtml = '<i class="fa fa-user" style="color: white;"></i>';

              if (marker.type === 'alerts') {
                markerColor = '#D32F2F'; // Brand Red
                iconHtml = '<i class="fa fa-triangle-exclamation"></i>';
              } else if (marker.type === 'jobs') {
                markerColor = '#ED8936'; // Orange
                iconHtml = '<i class="fa fa-briefcase"></i>';
              } else if (marker.type === 'professionals') {
                var titleLower = marker.title.toLowerCase();
                if (titleLower.indexOf('plumb') !== -1) {
                  markerColor = '#3182CE'; // Blue
                  iconHtml = '<i class="fa fa-faucet"></i>';
                } else if (titleLower.indexOf('carp') !== -1) {
                  markerColor = '#8B5A2B'; // Wood Brown
                  iconHtml = '<i class="fa fa-hammer"></i>';
                } else if (titleLower.indexOf('elect') !== -1) {
                  markerColor = '#D69E2E'; // Yellow Gold
                  iconHtml = '<i class="fa fa-bolt"></i>';
                } else if (titleLower.indexOf('paint') !== -1) {
                  markerColor = '#E53E3E'; // Light Red
                  iconHtml = '<i class="fa fa-paint-roller"></i>';
                } else {
                  markerColor = '#1C873C'; // Default Brand Green
                  iconHtml = '<i class="fa fa-screwdriver-wrench"></i>';
                }
              }

              // Custom Droplet shaped DivIcon pointing to coordinates
              var customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: '<div class="marker-pin" style="background-color:' + markerColor + ';">' + iconHtml + '</div>',
                iconSize: [32, 32],
                iconAnchor: [16, 32] // Anchor tip is bottom center of rotated container
              });

              var lMarker = L.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(markersLayer);
              
              if (marker.title) {
                lMarker.bindPopup('<strong style="font-size:14px;color:#1A1C1E;font-family:sans-serif;">' + marker.title + '</strong>' + 
                                  (marker.details ? '<p style="margin:6px 0 0;font-size:12px;color:#60646C;line-height:16px;font-family:sans-serif;">' + marker.details + '</p>' : ''));
              }

              lMarker.on('click', function() {
                var activeElements = document.getElementsByClassName('marker-active');
                for (var i = 0; i < activeElements.length; i++) {
                  activeElements[i].classList.remove('marker-active');
                }
                
                if (lMarker._icon) {
                  lMarker._icon.classList.add('marker-active');
                }

                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'MARKER_CLICK',
                  payload: { id: marker.id }
                }));
              });
            });
          }

          // Notify React Native that the map is fully loaded and ready to receive messaging data
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setIsReady(true);
      } else if (data.type === 'MAP_CLICK' && onMapClick) {
        onMapClick(data.payload.lat, data.payload.lng);
      } else if (data.type === 'MARKER_CLICK' && onMarkerClick) {
        onMarkerClick(data.payload.id);
      } else if (data.type === 'MAP_MOVE_END' && onRegionChangeComplete) {
        onRegionChangeComplete({
          latitude: data.payload.center.lat,
          longitude: data.payload.center.lng,
          latitudeDelta: data.payload.bounds._northEast.lat - data.payload.bounds._southWest.lat,
          longitudeDelta: data.payload.bounds._northEast.lng - data.payload.bounds._southWest.lng,
        });
      }
    } catch (e) {
      console.warn('Map webview message error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#1C873C" />
          </View>
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEFF2',
  },
});

export default Map;
