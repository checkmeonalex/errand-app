import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FormField } from '../../../components/FormField';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SettingsPage } from '../../../components/SettingsPage';
import { SettingsSection } from '../../../components/SettingsSection';
import { ToggleRow } from '../../../components/ToggleRow';
import { useSettings } from '../../../context/SettingsContext';

// Settings → Preferences: a default meeting spot (pre-fills "Where?" on new
// tasks) and vibration on tap.
export function PreferencesScreen() {
  const { settings, setDefaultMeetingSpot, setHaptics } = useSettings();
  const [spot, setSpot] = useState(settings.defaultMeetingSpot);
  const [saved, setSaved] = useState(false);
  const changed = spot.trim() !== settings.defaultMeetingSpot;

  async function saveSpot() {
    await setDefaultMeetingSpot(spot);
    setSaved(true);
  }

  return (
    <SettingsPage title="Preferences">
      <FormField
        label="Default meeting spot"
        placeholder="e.g. Hostel B, Block 2 entrance"
        value={spot}
        onChangeText={(text) => {
          setSpot(text);
          setSaved(false);
        }}
        hint={saved && !changed ? 'Saved. New tasks will start with this spot.' : 'Fills in "Where?" when you post a task. You can still change it each time.'}
      />
      <View style={styles.saveButton}>
        <PrimaryButton label="Save meeting spot" onPress={saveSpot} disabled={!changed} />
      </View>

      <SettingsSection>
        <ToggleRow
          label="Vibration on tap"
          hint="A light buzz when you tap main buttons."
          value={settings.hapticsEnabled}
          onChange={setHaptics}
        />
      </SettingsSection>
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  saveButton: { marginBottom: 8 },
});
