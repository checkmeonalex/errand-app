// Font sizes and weights, defined once so every screen reads the same scale.

export const typography = {
  title: { fontSize: 24, fontWeight: '600' as const },
  eyebrow: { fontSize: 12, fontWeight: '500' as const },
  greeting: { fontSize: 13, fontWeight: '400' as const },
  heading: { fontSize: 18, fontWeight: '500' as const },
  sectionLabel: { fontSize: 13, fontWeight: '500' as const },
  cardTitle: { fontSize: 14, fontWeight: '500' as const },
  cardSubtitle: { fontSize: 12, fontWeight: '400' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  input: { fontSize: 14, fontWeight: '400' as const },
  button: { fontSize: 14, fontWeight: '500' as const },
  hint: { fontSize: 12, fontWeight: '400' as const },
  pill: { fontSize: 11, fontWeight: '500' as const },
  badge: { fontSize: 9, fontWeight: '500' as const },
  icon: { fontSize: 16 },
} as const;

// Sizes for <Icon />.
export const iconSizes = { sm: 16, md: 20, lg: 24 } as const;
