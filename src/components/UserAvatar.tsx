import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: number;
  fontSize?: number;
  style?: any;
}

// Curated palette of vibrant, dark-toned background colors for user initial DP circles
const AVATAR_COLORS = [
  '#E53935', // Coral Red (Matches screenshot AB DP)
  '#3F51B5', // Indigo
  '#00897B', // Emerald Teal
  '#8E24AA', // Deep Purple
  '#F4511E', // Deep Orange
  '#1E88E5', // Royal Blue
  '#D81B60', // Rose Pink
  '#43A047', // Forest Green
  '#FB8C00', // Dark Amber
  '#546E7A', // Slate Blue
];

/**
 * Extract 1 or 2 letter initials from a full name string.
 * Example: "Henry Edwards" => "HE", "Alex" => "AL", "John Paul Smith" => "JS"
 */
export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}

/**
 * Hash string to pick a consistent background color for a given name.
 */
export function getAvatarColor(name?: string): string {
  if (!name || !name.trim()) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function UserAvatar({
  name = 'User',
  avatarUrl,
  size = 40,
  fontSize,
  style,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const calculatedFontSize = fontSize || Math.max(11, Math.round(size * 0.38));

  // Render uploaded image if URL exists AND is not a default mock/unsplash photo
  if (
    avatarUrl &&
    typeof avatarUrl === 'string' &&
    avatarUrl.trim().length > 0 &&
    !avatarUrl.includes('unsplash.com') &&
    !avatarUrl.includes('images.unsplash.com')
  ) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      />
    );
  }

  // Fallback Initials Avatar Circle
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: '#ffffff',
          fontWeight: '800',
          fontSize: calculatedFontSize,
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
