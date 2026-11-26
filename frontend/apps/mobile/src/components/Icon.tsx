import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { iconSizes } from '../theme/typography';

// Every icon in the app goes through here, so swapping the icon set later
// is a one-file change. Browse names at https://icons.expo.fyi (Ionicons).
export type IconName = React.ComponentProps<typeof Ionicons>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

export function Icon({ name, size = iconSizes.md, color = colors.navy }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
