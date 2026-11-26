// Single source of truth for the app's palette.
// Never hardcode a hex value in a screen or component — import from here.
// If the brand color changes, it changes in exactly one place.

export const colors = {
  navy: '#0B1E3F',
  navyMuted: '#A9B8D6',

  white: '#FFFFFF',
  background: '#FFFFFF',

  // Light blue tint used for icon badges, pills, accents
  accentLight: '#E6F1FB',
  accentText: '#0C447C',

  // Status / semantic colors
  warning: '#D85A30',
  success: '#1D9E75',

  // Text
  textPrimary: '#0B1E3F',
  textSecondary: '#5F5E5A',
  textMuted: '#888780',

  // Borders / dividers
  border: '#E5E5E5',

  // Effects
  shadow: '#000000',
  // Behind the phone-width app column on wide web screens
  backdrop: '#EEF1F6',
  // Dimmed background behind a bottom sheet or pop-up
  overlay: 'rgba(11,30,63,0.45)',
  // Translucent button on the navy header
  headerButton: 'rgba(255,255,255,0.12)',
} as const;

export type Colors = typeof colors;
