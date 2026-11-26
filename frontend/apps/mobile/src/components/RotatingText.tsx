import React, { useEffect, useRef, useState } from 'react';
import { Animated, type StyleProp, type TextStyle } from 'react-native';
import { USE_NATIVE_DRIVER } from '../utils/animation';

type RotatingTextProps = {
  items: string[];
  style?: StyleProp<TextStyle>;
  intervalMs?: number;
};

const FADE_MS = 250;
// How far (px) the text drifts up as it leaves / rises as it arrives.
const DRIFT = 6;

// Cycles through `items`: the current line fades out drifting up, the next
// fades in rising from below.
export function RotatingText({ items, style, intervalMs = 3000 }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (items.length < 2) return;

    const animate = (value: Animated.Value, toValue: number) =>
      Animated.timing(value, { toValue, duration: FADE_MS, useNativeDriver: USE_NATIVE_DRIVER });

    const timer = setInterval(() => {
      Animated.parallel([animate(opacity, 0), animate(translateY, -DRIFT)]).start(() => {
        setIndex((current) => (current + 1) % items.length);
        translateY.setValue(DRIFT);
        Animated.parallel([animate(opacity, 1), animate(translateY, 0)]).start();
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [items.length, intervalMs, opacity, translateY]);

  return (
    <Animated.Text style={[style, { opacity, transform: [{ translateY }] }]} numberOfLines={1}>
      {items[index]}
    </Animated.Text>
  );
}
