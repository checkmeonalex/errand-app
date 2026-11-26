import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChoiceCard } from '../../components/ChoiceCard';
import { Icon } from '../../components/Icon';
import { getCategory } from '../../constants/categories';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

// Shown for categories that have subcategories (Academic, Household tasks):
// pick the kind of task, then PostTask asks that kind's own questions.
export function ChooseSubcategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const category = getCategory(route.params?.categoryId);

  if (!category?.subcategories) {
    return (
      <View style={styles.root}>
        <Text style={styles.subtitle}>This category isn't available. Go back and pick another.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.iconBadge}>
        <Icon name={category.icon} size={iconSizes.lg} color={colors.accentText} />
      </View>
      <Text style={styles.title}>{category.label}</Text>
      <Text style={styles.subtitle}>What kind of task is it?</Text>

      {category.subcategories.map((sub) => (
        <ChoiceCard
          key={sub.id}
          title={sub.label}
          subtitle={sub.description}
          icon={sub.icon}
          onPress={() =>
            navigation.navigate('PostTask', { categoryId: category.id, subcategoryId: sub.id })
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.title, color: colors.textPrimary, marginTop: 14 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4, marginBottom: 8 },
});
