import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { renderBackButton } from '../components/BackButton';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// Header for screens pushed on top of another: a clean white bar with a
// round back arrow (plus swipe-back on iOS). Each screen draws its own title.
export const pushedScreenOptions: NativeStackNavigationOptions = {
  headerShown: true,
  title: '',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerLeft: renderBackButton,
};

// Starting screen of a stack or tab: no header and no back button, because
// there's no earlier screen to return to.
export const rootScreenOptions: NativeStackNavigationOptions = { headerShown: false };

// Bottom tab bar shared by the poster and runner sides. Each tab sets its
// own icon with tabIcon() from components/Icon.
export const tabBarOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.navy,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: typography.pill,
  tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.background },
};
