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
  searchRadius?: number; // in km
  darkMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (markerId: string) => void;
}

const Map = forwardRef<MapRef, MapProps>(({ markers, userLocation, searchRadius, darkMode, onMapClick, onMarkerClick }, ref) => {
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

  // Synchronize user location & search radius to WebView when ready
  useEffect(() => {
    if (webViewRef.current && userLocation && isReady) {
      const message = {
        type: 'SET_USER_LOCATION',
        payload: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          accuracy: userLocation.accuracy,
          searchRadius: searchRadius
        }
      };
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }, [userLocation, searchRadius, isReady]);

  // Synchronize dark mode theme to WebView
  useEffect(() => {
    if (webViewRef.current && isReady) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'SET_DARK_MODE',
        payload: { darkMode: !!darkMode }
      }));
    }
  }, [darkMode, isReady]);

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
            border-radius: 8px;
            box-shadow: 0 3px 14px rgba(0,0,0,0.2);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Default map center (White Town)
          var map = L.map('map', { zoomControl: false }).setView([11.9340, 79.8300], 14);
          
          var tileLayer = null;
          function setMapStyle(isDark) {
            if (tileLayer) {
              map.removeLayer(tileLayer);
            }
            var url = isDark 
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
            
            tileLayer = L.tileLayer(url, {
              maxZoom: 20
            }).addTo(map);
          }
          
          // Initialize map style
          setMapStyle(false);

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

          // Receive messages from React Native
          window.addEventListener('message', function(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'SET_MARKERS') {
                updateMarkers(data.payload);
              } else if (data.type === 'SET_USER_LOCATION') {
                updateUserLocation(data.payload.lat, data.payload.lng, data.payload.accuracy, data.payload.searchRadius);
              } else if (data.type === 'PAN_TO') {
                map.setView([data.payload.lat, data.payload.lng], data.payload.zoom || map.getZoom(), { animate: true });
              } else if (data.type === 'SET_DARK_MODE') {
                setMapStyle(data.payload.darkMode);
              }
            } catch (err) {
              console.error(err);
            }
          });

          function updateUserLocation(lat, lng, accuracy, searchRadius) {
            if (userLocationMarker) map.removeLayer(userLocationMarker);
            if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);
            if (searchRadiusCircle) map.removeLayer(searchRadiusCircle);

            // 1. Draw subtle blue accuracy circle
            if (accuracy) {
              userAccuracyCircle = L.circle([lat, lng], {
                radius: accuracy,
                color: '#1a73e8',
                weight: 1,
                opacity: 0.2,
                fillColor: '#1a73e8',
                fillOpacity: 0.12
              }).addTo(map);
            }

            // 2. Draw subtle translucent green search radius boundary
            if (searchRadius) {
              searchRadiusCircle = L.circle([lat, lng], {
                radius: searchRadius * 1000, // convert km to meters
                color: '#1C873C',
                weight: 1.5,
                opacity: 0.4,
                dashArray: '4, 4',
                fillColor: '#1C873C',
                fillOpacity: 0.03
              }).addTo(map);
            }

            // 3. Render Google Maps style blue pulsing dot
            var userIcon = L.divIcon({
              className: 'custom-leaflet-marker',
              html: '<div style="display:flex; justify-content:center; align-items:center; width:20px; height:20px; border-radius:10px; background-color:#1a73e8; border:3px solid white; box-shadow: 0 0 8px rgba(26,115,232,0.6);">' +
                    '<div style="width:6px; height:6px; border-radius:3px; background-color:#1a73e8;"></div>' +
                    '</div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            userLocationMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);

            // 4. Centering map on user coordinates exactly once during startup
            if (!hasCentered) {
              map.setView([lat, lng], 14);
              hasCentered = true;
            }
          }

          function updateMarkers(markers) {
            markersLayer.clearLayers();
            
            markers.forEach(function(marker) {
              if (marker.type === 'user') return;

              var markerColor = '#4caf50'; // Default Green
              var iconHtml = '<i class="fa fa-user" style="color: white; font-size: 14px;"></i>';

              if (marker.type === 'alerts') {
                markerColor = '#e53935'; // Red Alert
                iconHtml = '<i class="fa fa-exclamation-triangle" style="color: white; font-size: 13px;"></i>';
              } else if (marker.type === 'jobs') {
                markerColor = '#ff9800';
                iconHtml = '<i class="fa fa-briefcase" style="color: white; font-size: 13px;"></i>';
              } else if (marker.type === 'professionals') {
                if (marker.title.toLowerCase().indexOf('plumb') !== -1) {
                  markerColor = '#2196f3';
                  iconHtml = '<i class="fa fa-tint" style="color: white; font-size: 14px;"></i>';
                } else if (marker.title.toLowerCase().indexOf('carp') !== -1) {
                  markerColor = '#795548';
                  iconHtml = '<i class="fa fa-hammer" style="color: white; font-size: 13px;"></i>';
                } else {
                  markerColor = '#4caf50';
                  iconHtml = '<i class="fa fa-bolt" style="color: white; font-size: 14px;"></i>';
                }
              }

              var customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: '<div style="display:flex; justify-content:center; align-items:center; width:32px; height:32px; border-radius:16px; background-color:' + markerColor + '; border:2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">' + iconHtml + '</div>',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              });

              var lMarker = L.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(markersLayer);
              
              if (marker.title) {
                lMarker.bindPopup('<strong style="font-size:14px;color:#333;">' + marker.title + '</strong>' + (marker.details ? '<p style="margin:4px 0 0;font-size:12px;color:#666;">' + marker.details + '</p>' : ''));
              }

              lMarker.on('click', function() {
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
