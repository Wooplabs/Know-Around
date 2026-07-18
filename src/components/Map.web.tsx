import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

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
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (markerId: string) => void;
  searchRadius?: number;
  userLocation?: { latitude: number; longitude: number; accuracy: number | null } | null;
  darkMode?: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

const Map = forwardRef<MapRef, MapProps>(({ markers, onMapClick, onMarkerClick, searchRadius, userLocation, darkMode }, ref) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersGroupRef = useRef<any>(null);
  const userLocationGroupRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Expose imperative methods to parent search screen
  useImperativeHandle(ref, () => ({
    panTo: (lat: number, lng: number, zoom?: number) => {
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], zoom || mapRef.current.getZoom(), { animate: true });
      }
    },
    zoomIn: () => {
      if (mapRef.current) {
        mapRef.current.zoomIn();
      }
    },
    zoomOut: () => {
      if (mapRef.current) {
        mapRef.current.zoomOut();
      }
    },
    setMapType: (type: 'street' | 'satellite' | 'dark') => {
      if (!mapRef.current) return;
      
      let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      if (type === 'dark') {
        url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      } else if (type === 'satellite') {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }

      // Remove existing tile layer if it exists
      if (mapRef.current._tileLayer) {
        mapRef.current.removeLayer(mapRef.current._tileLayer);
      }

      const L = window.L;
      const newLayer = L.tileLayer(url, {
        attribution: '&copy; CARTO',
        maxZoom: 20
      }).addTo(mapRef.current);
      
      mapRef.current._tileLayer = newLayer;
    }
  }));

  // Load Leaflet CDN script and CSS dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    // FontAwesome for web compatibility
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);

    const jsScript = document.createElement('script');
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    jsScript.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(jsScript);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !containerRef.current) return;
    const L = window.L;

    const map = L.map(containerRef.current, { zoomControl: false }).setView([11.9340, 79.8300], 14);
    
    const initialUrl = darkMode 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const layer = L.tileLayer(initialUrl, {
      attribution: '&copy; CARTO',
      maxZoom: 20
    }).addTo(map);

    map._tileLayer = layer;
    mapRef.current = map;

    // Create markers layer groups
    markersGroupRef.current = L.layerGroup().addTo(map);
    userLocationGroupRef.current = L.layerGroup().addTo(map);

    // Handle Map click
    map.on('click', (e: any) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Update user location overlay
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !userLocationGroupRef.current) return;
    const L = window.L;
    const group = userLocationGroupRef.current;
    group.clearLayers();

    if (userLocation) {
      const lat = userLocation.latitude;
      const lng = userLocation.longitude;

      if (userLocation.accuracy) {
        L.circle([lat, lng], {
          radius: userLocation.accuracy,
          color: '#1a73e8',
          weight: 1,
          opacity: 0.2,
          fillColor: '#1a73e8',
          fillOpacity: 0.1
        }).addTo(group);
      }

      if (searchRadius) {
        L.circle([lat, lng], {
          radius: searchRadius * 1000,
          color: '#1C873C',
          weight: 1.5,
          opacity: 0.4,
          dashArray: '5, 5',
          fillColor: '#1C873C',
          fillOpacity: 0.025
        }).addTo(group);
      }

      // pulsing location dot
      const userIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="display:flex; justify-content:center; align-items:center; width:36px; height:36px; position:relative;">
            <div style="position:absolute; width:36px; height:36px; border-radius:18px; background-color:rgba(26, 115, 232, 0.25); animation: pulseWeb 1.8s infinite ease-in-out;"></div>
            <div style="width:16px; height:16px; border-radius:8px; background-color:#1a73e8; border:2.5px solid white; box-shadow:0 2px 8px rgba(26,115,232,0.5);"></div>
          </div>
          <style>
            @keyframes pulseWeb {
              0% { transform: scale(0.6); opacity: 1; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            @keyframes bouncePinWeb {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          </style>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      L.marker([lat, lng], { icon: userIcon }).addTo(group);
    }
  }, [leafletLoaded, userLocation, searchRadius]);

  // Update Markers when markers prop changes
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !markersGroupRef.current) return;
    const L = window.L;
    const markersGroup = markersGroupRef.current;

    // Clear existing markers
    markersGroup.clearLayers();

    markers.forEach((marker) => {
      // Determine color and icon details based on marker type
      let markerColor = '#1C873C'; // Default Brand Green
      let iconHtml = `<i class="fa fa-map-marker-alt" style="color: white; font-size: 14px;"></i>`;

      if (marker.type === 'alerts') {
        markerColor = '#e53935'; // Red Alert
        iconHtml = `<i class="fa fa-exclamation-triangle" style="color: white; font-size: 12px;"></i>`;
      } else if (marker.type === 'jobs') {
        markerColor = '#ff9800'; // Orange Shop
        iconHtml = `<i class="fa fa-briefcase" style="color: white; font-size: 12px;"></i>`;
      } else if (marker.type === 'professionals') {
        if (marker.title.toLowerCase().includes('plumb')) {
          markerColor = '#1877F2';
          iconHtml = `<i class="fa fa-tint" style="color: white; font-size: 13px;"></i>`;
        } else if (marker.title.toLowerCase().includes('carp')) {
          markerColor = '#8D6E63';
          iconHtml = `<i class="fa fa-hammer" style="color: white; font-size: 12px;"></i>`;
        } else {
          markerColor = '#1C873C';
          iconHtml = `<i class="fa fa-bolt" style="color: white; font-size: 13px;"></i>`;
        }
      }

      // Create a gorgeous custom HTML marker matching the mockup style
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 40px;
            animation: bouncePinWeb 2.2s infinite ease-in-out;
            cursor: pointer;
          ">
            <div style="
              display: flex;
              justify-content: center;
              align-items: center;
              width: 34px;
              height: 34px;
              border-radius: 17px;
              background-color: ${markerColor};
              border: 2px solid white;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            ">
              ${iconHtml}
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 6.5px solid white;
              margin-top: -1.5px;
            "></div>
          </div>
        `,
        iconSize: [34, 40],
        iconAnchor: [17, 40]
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
        .addTo(markersGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="font-size: 13.5px; color: #1A1C1E; font-weight: 800;">${marker.title}</strong>
            ${marker.details ? `<p style="margin: 4px 0 0; font-size: 11.5px; color: #60646C; line-height: 15px; opacity: 0.9;">${marker.details}</p>` : ''}
          </div>
        `);

      leafletMarker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(marker.id);
        }
      });
    });
  }, [leafletLoaded, markers]);

  if (!leafletLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1C873C" />
        <Text style={styles.loadingText}>Loading Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', outline: 'none' }} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEFF2',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#60646C',
  },
});

export default Map;
