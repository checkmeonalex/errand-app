import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// The fallback initial is sized relative to the circle so it fits any size.
const INITIAL_SCALE = 0.42;

type AvatarProps = {
  // Profile photo; when missing, the first letter of `name` shows instead.
  uri?: string | null;
  name?: string | null;
  size?: number;
};

// A round profile picture, used everywhere a person appears (profile, runner
// card, chats, leaderboards) so photos show up in all of them at once.
export function Avatar({ uri, name, size = 44 }: AvatarProps) {
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.photo, shape]} accessibilityIgnoresInvertColors />;
  }

  return (
    <View style={[styles.fallback, shape]}>
      <Text style={[styles.initial, { fontSize: size * INITIAL_SCALE }]}>
        {(name?.trim().charAt(0) || '?').toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { backgroundColor: colors.accentLight },
  fallback: { backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  initial: { ...typography.heading, color: colors.white },
});
