import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { ActionSheet, type ActionSheetOption } from './ActionSheet';
import { Avatar } from './Avatar';
import { PressableScale } from './PressableScale';
import { useAuth } from '../context/AuthContext';
import { useProfilePhotoPicker } from '../hooks/useProfilePhotoPicker';
import { getFirstName } from '../utils/getFirstName';
import type { PhotoSource } from '../utils/pickProfilePhoto';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type ProfilePhotoButtonProps = {
  size: number;
  // Adds a "View profile" option (used on the home screen).
  onViewProfile?: () => void;
};

// The signed-in user's photo, kept plain on purpose. Tapping it opens
// Take a photo / Choose from gallery (and optionally View profile). The photo
// is required, so it can be changed but not removed. Used on home (top
// left) and on Profile, so changing your photo works the same in both.
export function ProfilePhotoButton({ size, onViewProfile }: ProfilePhotoButtonProps) {
  const { user, setAvatar } = useAuth();
  const { pick, isPicking, error } = useProfilePhotoPicker();
  const [sheetOpen, setSheetOpen] = useState(false);

  // If picking failed, reopen the sheet so the reason shows where they tapped.
  useEffect(() => {
    if (error) setSheetOpen(true);
  }, [error]);

  async function changePhoto(source: PhotoSource) {
    setSheetOpen(false);
    const uri = await pick(source);
    if (uri) await setAvatar(uri);
  }

  const options: ActionSheetOption[] = [
    { label: 'Take a photo', icon: 'camera-outline', onPress: () => changePhoto('camera') },
    { label: 'Choose from gallery', icon: 'images-outline', onPress: () => changePhoto('library') },
  ];
  if (onViewProfile) {
    options.push({
      label: 'View profile',
      icon: 'person-outline',
      onPress: () => {
        setSheetOpen(false);
        onViewProfile();
      },
    });
  }
  options.push({ label: 'Cancel', tone: 'muted', onPress: () => setSheetOpen(false) });

  return (
    <>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Profile photo"
        accessibilityHint="Opens options to change your photo"
        disabled={isPicking}
        onPress={() => setSheetOpen(true)}
      >
        <Avatar uri={user?.avatar_url} name={getFirstName(user?.full_name)} size={size} />
      </PressableScale>

      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Profile photo"
        header={error ? <Text style={styles.error}>{error}</Text> : null}
        options={options}
      />
    </>
  );
}

const styles = StyleSheet.create({
  error: { ...typography.hint, color: colors.warning, marginBottom: 4 },
});
