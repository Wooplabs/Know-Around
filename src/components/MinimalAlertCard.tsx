import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  PanResponder, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlertItem } from '../context/KnowAroundContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MinimalAlertCardProps {
  alert: AlertItem;
  onIgnore: () => void;
  darkMode?: boolean;
}

export default function MinimalAlertCard({ alert, onIgnore, darkMode }: MinimalAlertCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture horizontal right swipes (dx > 8 and minimal vertical movement)
        return gestureState.dx > 8 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100 || gestureState.vx > 0.5) {
          // Swipe right threshold passed: slide offscreen right & dismiss
          Animated.parallel([
            Animated.timing(pan.x, {
              toValue: 400,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            onIgnore();
          });
        } else {
          // Spring back to center
          Animated.spring(pan.x, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.cardContainer}>
      {/* Background Layer Revealed When Swiping Right */}
      <View style={[styles.dismissBackground, darkMode && styles.dismissBackgroundDark]}>
        <Ionicons name="checkmark-circle" size={20} color="#64748B" />
        <Text style={[styles.dismissText, darkMode && styles.dismissTextDark]}>Alert Ignored</Text>
      </View>

      {/* Swipeable Minimal Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.minimalCard,
          darkMode && styles.minimalCardDark,
          {
            transform: [{ translateX: pan.x }],
            opacity: opacity,
          },
        ]}
      >
        <View style={styles.accentBar} />

        <View style={styles.contentBox}>
          <View style={styles.topRow}>
            <View style={[styles.alertBadge, darkMode && styles.alertBadgeDark]}>
              <Ionicons name="shield-half" size={12} color={darkMode ? "#FF85A1" : "#E11D48"} />
              <Text style={[styles.alertBadgeText, darkMode && styles.alertBadgeTextDark]}>CRITICAL ALERT</Text>
            </View>
            <Text style={[styles.timeText, darkMode && styles.timeTextDark]}>{alert.time}</Text>

            <View style={{ flex: 1 }} />

            <View style={styles.swipeHintRow}>
              <Text style={styles.swipeHintText}>Swipe right to ignore</Text>
              <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
            </View>
          </View>

          <Text style={[styles.title, darkMode && styles.titleDark]} numberOfLines={1}>
            {alert.title}
          </Text>

          <Text style={[styles.description, darkMode && styles.descriptionDark]} numberOfLines={2}>
            {alert.description}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  dismissBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    gap: 8,
    borderRadius: 14,
  },
  dismissBackgroundDark: {
    backgroundColor: '#1E293B',
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  dismissTextDark: {
    color: '#94A3B8',
  },
  minimalCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.2,
    borderColor: '#FECDD3',
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  minimalCardDark: {
    backgroundColor: '#1F1215',
    borderColor: '#4C0519',
  },
  accentBar: {
    width: 4,
    backgroundColor: '#E11D48',
  },
  contentBox: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  alertBadgeDark: {
    backgroundColor: '#4C0519',
  },
  alertBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.4,
  },
  alertBadgeTextDark: {
    color: '#FF85A1',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9F1239',
  },
  timeTextDark: {
    color: '#FDA4AF',
  },
  swipeHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  swipeHintText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  title: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#881337',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  titleDark: {
    color: '#FFE4E6',
  },
  description: {
    fontSize: 12.5,
    color: '#4C0519',
    lineHeight: 18,
    fontWeight: '500',
  },
  descriptionDark: {
    color: '#FECDD3',
  },
});
