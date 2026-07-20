import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';

export interface UserAvatarProps {
  name?: string;
  avatar?: string;
  size?: number;
  fontSize?: number;
  style?: StyleProp<any>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Calculates initials from full name.
 * e.g., "Henry Edwards" -> "HE"
 *       "Victor" -> "V"
 *       "Ajay Kumar Sharma" -> "AK"
 */
export function getUserInitials(name?: string): string {
  if (!name || !name.trim()) return 'KA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 1).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Curated list of rich dark background colors for DP avatars
 */
export const DARK_AVATAR_COLORS = [
  '#1C873C', // Brand Green
  '#1E293B', // Dark Slate
  '#311B92', // Deep Purple
  '#0F4C81', // Classic Navy
  '#701A75', // Fuchsia Dark
  '#881337', // Rose Dark
  '#064E3B', // Emerald Dark
  '#164E63', // Cyan Dark
  '#78350F', // Amber Dark
  '#312E81', // Indigo Deep
  '#854D0E', // Bronze Dark
  '#3B0764', // Violet Dark
];

/**
 * Deterministically generates a dark background color based on name string.
 */
export function getAvatarColor(name?: string): string {
  if (!name) return DARK_AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DARK_AVATAR_COLORS.length;
  return DARK_AVATAR_COLORS[index];
}

export default function UserAvatar({
  name = 'Neighbor',
  avatar,
  size = 40,
  fontSize,
  style,
  textStyle,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const hasValidUri =
    !!avatar &&
    !imgError &&
    (avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('file://') ||
      avatar.startsWith('data:image'));

  if (hasValidUri) {
    return (
      <Image
        source={{ uri: avatar }}
        onError={() => setImgError(true)}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#CBD5E1',
          },
          style,
        ]}
      />
    );
  }

  const initials = getUserInitials(name);
  const bgColor = getAvatarColor(name);
  const calculatedFontSize = fontSize || Math.max(11, Math.round(size * 0.38));

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
        style={[
          {
            color: '#FFFFFF',
            fontWeight: '800',
            fontSize: calculatedFontSize,
            letterSpacing: 0.5,
            textAlign: 'center',
          },
          textStyle,
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}
