import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { USE_NATIVE_DRIVER } from '../utils/animation';
import { tapFeedback } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESSED_SCALE = 0.97;

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  // Light haptic tick on press (default on). Turn off for quiet taps like Back.
  haptic?: boolean;
};

// The app's one tap effect: springs down slightly while held and bounces
// back on release, with an optional haptic tick. Use it for anything tappable
// so every press feels the same.
export function PressableScale({
  style,
  haptic = true,
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function springTo(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: USE_NATIVE_DRIVER,
      speed: 40,
      bounciness: value === 1 ? 8 : 0,
    }).start();
  }

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      style={[style, { transform: [{ scale }] }]}
      onPressIn={(event: GestureResponderEvent) => {
        springTo(PRESSED_SCALE);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        springTo(1);
        onPressOut?.(event);
      }}
      onPress={(event: GestureResponderEvent) => {
        if (haptic) tapFeedback();
        onPress?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
