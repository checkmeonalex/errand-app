import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import type { TimelineStep } from '../utils/taskTimeline';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type StatusTimelineProps = {
  steps: TimelineStep[];
  // Extra line under the current step, e.g. "{runner} accepted".
  currentNote?: string;
};

// Vertical step tracker: ✓ done, filled dot current, hollow dot upcoming,
// ! where the task stopped (refunded / under review).
export function StatusTimeline({ steps, currentNote }: StatusTimelineProps) {
  return (
    <View>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <View key={step.label} style={styles.row}>
            <View style={styles.rail}>
              <StepMarker state={step.state} />
              {!isLast ? (
                <View style={[styles.line, step.state === 'done' && styles.lineDone]} />
              ) : null}
            </View>
            <View style={styles.text}>
              <Text
                style={[
                  styles.label,
                  step.state === 'upcoming' && styles.labelUpcoming,
                  step.state === 'current' && styles.labelCurrent,
                  step.state === 'stopped' && styles.labelStopped,
                ]}
              >
                {step.label}
              </Text>
              {step.state === 'current' && currentNote ? (
                <Text style={styles.note}>{currentNote}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function StepMarker({ state }: { state: TimelineStep['state'] }) {
  if (state === 'done') {
    return (
      <View style={[styles.marker, styles.markerDone]}>
        <Icon name="checkmark" size={iconSizes.sm} color={colors.white} />
      </View>
    );
  }
  if (state === 'stopped') {
    return (
      <View style={[styles.marker, styles.markerStopped]}>
        <Icon name="alert" size={iconSizes.sm} color={colors.white} />
      </View>
    );
  }
  return (
    <View style={[styles.marker, state === 'current' ? styles.markerCurrent : styles.markerUpcoming]}>
      {state === 'current' ? <View style={styles.currentDot} /> : null}
    </View>
  );
}

const MARKER = 24;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: MARKER },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: { backgroundColor: colors.success },
  markerCurrent: { borderWidth: 2, borderColor: colors.navy, backgroundColor: colors.background },
  markerUpcoming: { borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
  markerStopped: { backgroundColor: colors.warning },
  currentDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.navy },
  line: { width: 2, flex: 1, minHeight: 18, backgroundColor: colors.border, marginVertical: 2 },
  lineDone: { backgroundColor: colors.success },
  text: { flex: 1, paddingBottom: 14, paddingTop: 2 },
  label: { ...typography.body, color: colors.textPrimary },
  labelUpcoming: { color: colors.textMuted },
  labelCurrent: { ...typography.cardTitle, color: colors.navy },
  labelStopped: { ...typography.cardTitle, color: colors.warning },
  note: { ...typography.cardSubtitle, color: colors.textMuted, marginTop: 2 },
});
