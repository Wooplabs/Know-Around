import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Professional } from '../context/KnowAroundContext';
import { RoundTickIcon } from './CustomIcons';

interface ProfessionalCardProps {
  professional: Professional;
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const handleCall = () => {
    const url = `tel:${professional.phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Unable to call', `Call to ${professional.phone} is not supported on this platform.`);
        }
      })
      .catch((err) => console.error('An error occurred calling professional:', err));
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: professional.avatar }} style={styles.avatar} />
      
      <View style={styles.details}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{professional.name}</Text>
          {professional.verified && (
            <RoundTickIcon color="#3AA832" size={15} style={styles.verifiedIcon} />
          )}
        </View>
        
        <View style={styles.ratingRow}>
          <Text style={styles.subtext}>{professional.profession}</Text>
          <Text style={styles.dot}>&middot;</Text>
          <Text style={styles.ratingText}>{professional.rating}</Text>
          <Ionicons name="star" size={12} color="#FFB300" style={styles.starIcon} />
          <Text style={styles.reviewsCount}>({professional.reviewsCount})</Text>
        </View>

        <Text style={styles.distanceText}>
          {professional.distance} km &middot; {professional.location}
        </Text>
      </View>

      <Pressable style={styles.callButton} onPress={handleCall}>
        <Ionicons name="call" size={18} color="#3AA832" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    backgroundColor: '#E0E0E0',
  },
  details: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  subtext: {
    fontSize: 13,
    color: '#60646C',
  },
  dot: {
    marginHorizontal: 6,
    color: '#60646C',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  starIcon: {
    marginLeft: 2,
    marginRight: 2,
  },
  reviewsCount: {
    fontSize: 13,
    color: '#60646C',
  },
  distanceText: {
    fontSize: 12,
    color: '#60646C',
    marginTop: 3,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAF7',
  },
});
