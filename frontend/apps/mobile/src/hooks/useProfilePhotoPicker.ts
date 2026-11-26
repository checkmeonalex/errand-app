import { useState } from 'react';
import { PHOTO_ERROR_MESSAGES, pickProfilePhoto, type PhotoSource } from '../utils/pickProfilePhoto';

// Picking a profile photo with a busy flag and a user-facing error, shared by
// the "Add your photo" step and the Profile screen.
export function useProfilePhotoPicker() {
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The new photo, or null if cancelled / failed (error is set on failure).
  async function pick(source: PhotoSource): Promise<string | null> {
    setIsPicking(true);
    setError(null);
    const result = await pickProfilePhoto(source);
    setIsPicking(false);
    if (result.status === 'picked') return result.uri;
    if (result.status !== 'cancelled') setError(PHOTO_ERROR_MESSAGES[result.status]);
    return null;
  }

  return { pick, isPicking, error };
}
