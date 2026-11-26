import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextLink } from '../../components/TextLink';
import { useAuth } from '../../context/AuthContext';
import { useProfilePhotoPicker } from '../../hooks/useProfilePhotoPicker';
import { getFirstName } from '../../utils/getFirstName';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const PREVIEW_SIZE = 140;

// Required step after sign-up (and for anyone signed in without a photo):
// posters and runners meet in person, so both need a recognisable photo.
// RootNavigator shows this until the user has one; there's no skip.
export function AddPhotoScreen() {
  const { user, setAvatar } = useAuth();
  const { pick, isPicking, error } = useProfilePhotoPicker();
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function choose(source: 'camera' | 'library') {
    const uri = await pick(source);
    if (uri) setPhoto(uri);
  }

  async function save() {
    if (!photo) return;
    setSaving(true);
    await setAvatar(photo);
    setSaving(false);
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>One last step</Text>
        <Text style={styles.title}>Add your photo</Text>
        <Text style={styles.subtitle}>
          Runners and posters meet in person, so a clear photo of your face helps you recognise each
          other at handover.
        </Text>

        <View style={styles.preview}>
          <Avatar uri={photo} name={getFirstName(user?.full_name)} size={PREVIEW_SIZE} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.actions}>
        {photo ? (
          <>
            <PrimaryButton label="Use this photo" onPress={save} loading={saving} flush />
            <View style={styles.linkRow}>
              <TextLink label="Choose a different one" onPress={() => choose('library')} />
            </View>
          </>
        ) : (
          <>
            <PrimaryButton label="Take a photo" onPress={() => choose('camera')} loading={isPicking} flush />
            <View style={styles.linkRow}>
              <TextLink label="Choose from gallery" onPress={() => choose('library')} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: 24, justifyContent: 'center' },
  eyebrow: { ...typography.eyebrow, color: colors.accentText, textTransform: 'uppercase' },
  title: { ...typography.title, color: colors.textPrimary, marginTop: 6 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 8 },
  preview: { alignItems: 'center', marginTop: 32 },
  error: { ...typography.hint, color: colors.warning, textAlign: 'center', marginTop: 16 },
  actions: { paddingHorizontal: 24, paddingBottom: 24 },
  linkRow: { alignItems: 'center', marginTop: 16 },
});
