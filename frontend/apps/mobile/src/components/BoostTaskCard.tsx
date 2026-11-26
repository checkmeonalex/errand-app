import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Task } from '@errand/types';
import { ActionSheet } from './ActionSheet';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { extendOptions } from '../utils/extendOptions';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type BoostTaskCardProps = {
  task: Pick<Task, 'accept_by' | 'extra_fields'>;
  onRaisePrice: () => void;
  onExtend: (minutes: number) => void;
};

// On a live task nobody has accepted: raise the price or give it more time,
// instead of letting it come down and posting again.
export function BoostTaskCard({ task, onRaisePrice, onExtend }: BoostTaskCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const options = extendOptions(task);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Not accepted yet?</Text>
      <Text style={styles.text}>A higher price or more time usually gets a runner faster.</Text>
      <View style={styles.actions}>
        <ActionButton icon="trending-up-outline" label="Raise price" onPress={onRaisePrice} />
        {options.length ? (
          <ActionButton icon="time-outline" label="Give it more time" onPress={() => setSheetOpen(true)} />
        ) : null}
      </View>

      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Keep it up for…"
        options={[
          ...options.map((window) => ({
            label: `${window.label} from now`,
            onPress: () => {
              setSheetOpen(false);
              onExtend(window.minutes);
            },
          })),
          { label: 'Cancel', tone: 'muted' as const, onPress: () => setSheetOpen(false) },
        ]}
      />
    </View>
  );
}

function ActionButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale accessibilityRole="button" style={styles.button} onPress={onPress}>
      <Icon name={icon} color={colors.navy} />
      <Text style={styles.buttonText}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.accentLight, borderRadius: 14, padding: 16 },
  title: { ...typography.cardTitle, color: colors.textPrimary },
  text: { ...typography.body, color: colors.accentText, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
  },
  buttonText: { ...typography.button, color: colors.navy },
});
