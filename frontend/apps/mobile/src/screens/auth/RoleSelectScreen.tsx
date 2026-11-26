import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthLayout } from '../../components/AuthLayout';
import { ChoiceCard } from '../../components/ChoiceCard';
import type { IconName } from '../../components/Icon';

// "What brings you here?" The choice only picks which sign-up form comes
// next (the starting mode). The other mode can be added later from Profile.
const CHOICES: { title: string; subtitle: string; icon: IconName; screen: string }[] = [
  {
    title: 'I need something done',
    subtitle: 'Post a task and a verified student gets it done',
    icon: 'clipboard-outline',
    screen: 'Signup',
  },
  {
    title: 'I want to earn',
    subtitle: 'Do tasks for other students and get paid',
    icon: 'wallet-outline',
    screen: 'RunnerSignup',
  },
];

export function RoleSelectScreen() {
  const navigation = useNavigation<any>();

  return (
    <AuthLayout eyebrow="Welcome" title="What brings you here?">
      {CHOICES.map((choice) => (
        <ChoiceCard
          key={choice.screen}
          title={choice.title}
          subtitle={choice.subtitle}
          icon={choice.icon}
          onPress={() => navigation.navigate(choice.screen)}
        />
      ))}
    </AuthLayout>
  );
}
