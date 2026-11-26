import {StyleSheet, useColorScheme} from 'react-native';

const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7',
    textPrimary: '#1C1C1E',
    textMuted: '#8E8E93',
    textDim: '#C7C7CC',
    accent: '#1B3A6B',
    accentTint: '#E8EDF5',
    border: '#E5E5EA',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
  },
  dark: {
    background: '#0D1117',
    surface: '#161B22',
    textPrimary: '#E6EDF3',
    textMuted: '#484F58',
    textDim: '#30363D',
    accent: '#79B8FF',
    accentTint: '#112240',
    border: '#30363D',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FFD60A',
  },
};

export type AppThemeMode = keyof typeof colors;
export type AppThemeColors = (typeof colors)[AppThemeMode];

export function useThemeMode(): AppThemeMode {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useThemeColors() {
  return colors[useThemeMode()];
}

export function createGlobalStyles(theme: AppThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
    },
    contentCenter: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    contentTop: {
      flexGrow: 1,
      padding: 24,
      paddingTop: 42,
    },
    header: {
      marginBottom: 30,
    },
    headerLarge: {
      marginBottom: 32,
    },
    eyebrow: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 8,
    },
    title: {
      color: theme.textPrimary,
      fontSize: 31,
      fontWeight: '800',
      marginBottom: 12,
    },
    titleLarge: {
      color: theme.textPrimary,
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 12,
    },
    subtitle: {
      color: theme.textMuted,
      fontSize: 16,
      lineHeight: 24,
    },
    form: {
      gap: 16,
    },
    formLoose: {
      gap: 18,
    },
    field: {
      gap: 8,
    },
    label: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      color: theme.textPrimary,
      fontSize: 16,
      minHeight: 52,
      paddingHorizontal: 16,
    },
    textArea: {
      minHeight: 92,
      paddingVertical: 14,
      textAlignVertical: 'top',
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.accent,
      borderRadius: 8,
      minHeight: 54,
      justifyContent: 'center',
    },
    primaryButtonSpaced: {
      alignItems: 'center',
      backgroundColor: theme.accent,
      borderRadius: 8,
      minHeight: 54,
      justifyContent: 'center',
      marginTop: 6,
    },
    pressedButton: {
      opacity: 0.9,
    },
    disabledButton: {
      backgroundColor: theme.textDim,
    },
    primaryButtonLabel: {
      color: theme.background,
      fontSize: 16,
      fontWeight: '800',
    },
    textButton: {
      paddingVertical: 4,
    },
    textButtonEnd: {
      alignSelf: 'flex-end',
      paddingVertical: 4,
    },
    textButtonCenter: {
      alignItems: 'center',
      marginTop: 18,
      paddingVertical: 8,
    },
    textButtonLabel: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '700',
    },
    textButtonLabelLarge: {
      color: theme.accent,
      fontSize: 15,
      fontWeight: '800',
    },
    footer: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      justifyContent: 'center',
      marginTop: 28,
    },
    footerText: {
      color: theme.textMuted,
      fontSize: 15,
    },
    footerLink: {
      color: theme.accent,
      fontSize: 15,
      fontWeight: '800',
    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 28,
      paddingVertical: 8,
    },
    backButtonLabel: {
      color: theme.accent,
      fontSize: 15,
      fontWeight: '800',
    },
    errorText: {
      color: theme.error,
      fontSize: 13,
      fontWeight: '600',
    },
    codePreview: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    codeBox: {
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      height: 54,
      justifyContent: 'center',
    },
    codeText: {
      color: theme.textPrimary,
      fontSize: 20,
      fontWeight: '800',
    },
    hiddenInput: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      color: theme.textPrimary,
      fontSize: 16,
      height: 52,
      marginBottom: 18,
      paddingHorizontal: 16,
      textAlign: 'center',
    },
    avatarPlaceholder: {
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: theme.accentTint,
      borderColor: theme.accent,
      borderRadius: 48,
      borderWidth: 1,
      height: 96,
      justifyContent: 'center',
      marginBottom: 26,
      width: 96,
    },
    avatarInitials: {
      color: theme.accent,
      fontSize: 28,
      fontWeight: '900',
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    selectedOptionButton: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    optionLabel: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    selectedOptionLabel: {
      color: theme.background,
    },
  });
}

export default colors;
