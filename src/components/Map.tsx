import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export interface MapRef {
  panTo: (lat: number, lng: number, zoom?: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setMapType: (type: 'street' | 'satellite' | 'dark') => void;
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

  // Expose map controls to parent screens
  useImperativeHandle(ref, () => ({
    panTo: (lat: number, lng: number, zoom?: number) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'PAN_TO',
          payload: { lat, lng, zoom }
        }));
      }
    },
    zoomIn: () => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'ZOOM_IN'
        }));
      }
    },
    zoomOut: () => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'ZOOM_OUT'
        }));
      }
    },
    setMapType: (type: 'street' | 'satellite' | 'dark') => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'SET_MAP_TYPE',
          payload: { type }
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

  // Static HTML Content to prevent WebView from constantly reloading
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
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          /* Pulsing and Bouncing Animations */
          @keyframes radar {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes bouncePin {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .pulse-ring {
            position: absolute;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            background-color: rgba(26, 115, 232, 0.25);
            animation: radar 1.8s infinite ease-in-out;
          }
          .animated-pin {
            animation: bouncePin 2.2s infinite ease-in-out;
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
          var currentStyle = 'street';
          
          function setMapStyle(styleName) {
            currentStyle = styleName;
            if (tileLayer) {
              map.removeLayer(tileLayer);
            }
            
            var url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
            if (styleName === 'dark') {
              url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            } else if (styleName === 'satellite') {
              url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            }
            
            tileLayer = L.tileLayer(url, {
              maxZoom: 20,
              attribution: '&copy; CARTO'
            }).addTo(map);
          }
          
          // Initialize map style
          setMapStyle('street');

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
                setMapStyle(data.payload.darkMode ? 'dark' : 'street');
              } else if (data.type === 'ZOOM_IN') {
                map.zoomIn();
              } else if (data.type === 'ZOOM_OUT') {
                map.zoomOut();
              } else if (data.type === 'SET_MAP_TYPE') {
                setMapStyle(data.payload.type);
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
                fillOpacity: 0.1
              }).addTo(map);
            }

            // 2. Draw subtle translucent green search radius boundary
            if (searchRadius) {
              searchRadiusCircle = L.circle([lat, lng], {
                radius: searchRadius * 1000,
                color: '#1C873C',
                weight: 1.5,
                opacity: 0.4,
                dashArray: '5, 5',
                fillColor: '#1C873C',
                fillOpacity: 0.025
              }).addTo(map);
            }

            // 3. Render pulsing location dot
            var userIcon = L.divIcon({
              className: 'custom-leaflet-marker',
              html: '<div style="display:flex; justify-content:center; align-items:center; width:36px; height:36px;">' +
                    '<div class="pulse-ring"></div>' +
                    '<div style="width:16px; height:16px; border-radius:8px; background-color:#1a73e8; border:2.5px solid white; box-shadow: 0 2px 8px rgba(26,115,232,0.5);"></div>' +
                    '</div>',
              iconSize: [36, 36],
              iconAnchor: [18, 18]
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

              var markerColor = '#1C873C'; // Default Brand Green
              var iconHtml = '<i class="fa fa-map-marker-alt" style="color: white; font-size: 14px;"></i>';

              if (marker.type === 'alerts') {
                markerColor = '#e53935'; // Red Alert
                iconHtml = '<i class="fa fa-exclamation-triangle" style="color: white; font-size: 12px;"></i>';
              } else if (marker.type === 'jobs') {
                markerColor = '#ff9800'; // Orange Shop/Service
                iconHtml = '<i class="fa fa-briefcase" style="color: white; font-size: 12px;"></i>';
              } else if (marker.type === 'professionals') {
                if (marker.title.toLowerCase().indexOf('plumb') !== -1) {
                  markerColor = '#1877F2';
                  iconHtml = '<i class="fa fa-tint" style="color: white; font-size: 13px;"></i>';
                } else if (marker.title.toLowerCase().indexOf('carp') !== -1) {
                  markerColor = '#8D6E63';
                  iconHtml = '<i class="fa fa-hammer" style="color: white; font-size: 12px;"></i>';
                } else {
                  markerColor = '#1C873C';
                  iconHtml = '<i class="fa fa-bolt" style="color: white; font-size: 13px;"></i>';
                }
              }

              // Curved pointed bottom pin design matching premium aesthetics
              var customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: '<div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 34px; height: 40px;" class="animated-pin">' +
                      '<div style="display:flex; justify-content:center; align-items:center; width:34px; height:34px; border-radius:17px; background-color:' + markerColor + '; border:2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">' + iconHtml + '</div>' +
                      '<div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6.5px solid white; margin-top: -1.5px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.15));"></div>' +
                      '</div>',
                iconSize: [34, 40],
                iconAnchor: [17, 40]
              });

              var lMarker = L.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(markersLayer);
              
              if (marker.title) {
                lMarker.bindPopup('<strong style="font-size:13.5px;color:#1A1C1E;font-weight:800;">' + marker.title + '</strong>' + (marker.details ? '<p style="margin:4px 0 0;font-size:11.5px;color:#60646C;line-height:15px;opacity:0.9;">' + marker.details + '</p>' : ''));
              }

              lMarker.on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'MARKER_CLICK',
                  payload: { id: marker.id }
                }));
              });
            });
          }

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
