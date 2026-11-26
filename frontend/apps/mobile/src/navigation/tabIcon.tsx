import React from 'react';
import { Icon, type IconName } from '../components/Icon';
import { iconSizes } from '../theme/typography';

// For a bottom tab's tabBarIcon option: filled when the tab is active,
// outline when it isn't.
export function tabIcon(active: IconName, inactive: IconName) {
  return ({ focused, color }: { focused: boolean; color: string }) => (
    <Icon name={focused ? active : inactive} size={iconSizes.lg} color={color} />
  );
}
