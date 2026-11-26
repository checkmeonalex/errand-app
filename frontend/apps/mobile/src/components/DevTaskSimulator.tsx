import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Task } from '@errand/types';
import { PressableScale } from './PressableScale';
import { useTasks } from '../context/TasksContext';
import { nextSimulatedStepLabel } from '../utils/devSimulateTask';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type DevTaskSimulatorProps = {
  task: Task;
};

// DEV ONLY panel on Task detail: plays the runner's side (accept → start →
// handover) so the accepted / in-progress screens can be tested before the
// backend exists. Renders nothing in release builds (__DEV__ is false).
export function DevTaskSimulator({ task }: DevTaskSimulatorProps) {
  const { simulateNextStep } = useTasks();
  const label = nextSimulatedStepLabel(task);
  if (!__DEV__ || !label) return null;

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Developer tools (not in the real app)</Text>
      <PressableScale style={styles.button} onPress={() => simulateNextStep(task.id)}>
        <Text style={styles.buttonText}>{label}</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.warning,
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
  },
  heading: { ...typography.hint, color: colors.warning },
  button: {
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { ...typography.button, color: colors.warning },
});
