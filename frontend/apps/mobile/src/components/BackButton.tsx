import React from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';

// A soft round arrow in the header of every pushed screen. Same look on
// Android, iOS and web; phone back gestures keep working alongside it.
export function BackButton() {
  const navigation = useNavigation();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={10}
      haptic={false}
      onPress={() => navigation.goBack()}
      style={styles.button}
    >
      <Icon name="arrow-back" />
    </PressableScale>
  );
}

// For a navigator's headerLeft option. Starting screens have nothing to go
// back to, so they get no button.
export function renderBackButton({ canGoBack }: { canGoBack?: boolean }) {
  return canGoBack ? <BackButton /> : null;
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
