import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

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
}

declare global {
  interface Window {
    L: any;
  }
}

export default function Map({ markers, onMapClick, onMarkerClick }: MapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersGroupRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

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

    const jsScript = document.createElement('script');
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    jsScript.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(jsScript);

    return () => {
      // Clean up scripts if needed
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !containerRef.current) return;
    const L = window.L;

    // Use a clean dark/light voyager tile scheme matching the mockup
    const map = L.map(containerRef.current).setView([11.9340, 79.8300], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    // Create markers layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

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

  // Update Markers when markers prop changes
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !markersGroupRef.current) return;
    const L = window.L;
    const markersGroup = markersGroupRef.current;

    // Clear existing markers
    markersGroup.clearLayers();

    markers.forEach((marker) => {
      // Determine color and icon details based on marker type
      let markerColor = '#4caf50'; // Default Green
      let iconHtml = `<i class="fa fa-user" style="color: white; font-size: 14px;"></i>`;

      if (marker.type === 'user') {
        markerColor = '#2196f3'; // User current location
        iconHtml = `<div style="width: 12px; height: 12px; border-radius: 6px; background-color: white;"></div>`;
      } else if (marker.type === 'alerts') {
        markerColor = '#9c27b0'; // Purple
        iconHtml = `<i class="fa fa-exclamation-triangle" style="color: white; font-size: 13px;"></i>`;
      } else if (marker.type === 'jobs') {
        markerColor = '#ff9800'; // Orange
        iconHtml = `<i class="fa fa-briefcase" style="color: white; font-size: 13px;"></i>`;
      } else if (marker.type === 'professionals') {
        if (marker.title.toLowerCase().includes('plumb')) {
          markerColor = '#2196f3'; // Plumber blue
          iconHtml = `<i class="fa fa-tint" style="color: white; font-size: 14px;"></i>`;
        } else if (marker.title.toLowerCase().includes('carp')) {
          markerColor = '#795548'; // Carpenter brown
          iconHtml = `<i class="fa fa-hammer" style="color: white; font-size: 13px;"></i>`;
        } else {
          markerColor = '#4caf50'; // Electrician green
          iconHtml = `<i class="fa fa-bolt" style="color: white; font-size: 14px;"></i>`;
        }
      }

      // Create a gorgeous custom HTML marker matching the mockup style (circular indicator/pin)
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            width: 32px;
            height: 32px;
            border-radius: 16px;
            background-color: ${markerColor};
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1.0)'">
            ${iconHtml}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
        .addTo(markersGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="font-size: 14px; color: #333;">${marker.title}</strong>
            ${marker.details ? `<p style="margin: 4px 0 0; font-size: 12px; color: #666;">${marker.details}</p>` : ''}
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
        <ActivityIndicator size="large" color="#3AA832" />
        <Text style={styles.loadingText}>Loading Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', outline: 'none' }} />
    </View>
  );
}

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
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
});
