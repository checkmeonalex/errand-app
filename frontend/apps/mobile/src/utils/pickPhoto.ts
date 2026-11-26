import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export type PhotoSource = 'camera' | 'library';

export type PickPhotoResult =
  | { status: 'picked'; uri: string }
  | { status: 'cancelled' }
  | { status: 'denied' }
  | { status: 'error' };

type PickPhotoOptions = {
  // Crop to a square while picking (profile photos).
  square: boolean;
  // Longest side after shrinking, in pixels.
  maxSize: number;
};

const PHOTO_QUALITY = 0.6;

// Take or choose a photo, then shrink and compress it (small on data and
// storage). Returns image data (data: URI), which survives reloads on phones
// and web until the backend stores files.
export async function pickPhoto(source: PhotoSource, options: PickPhotoOptions): Promise<PickPhotoResult> {
  try {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: options.square,
      aspect: options.square ? [1, 1] : undefined,
      quality: 1,
    };
    const picked =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);
    const asset = picked.canceled ? undefined : picked.assets[0];
    if (!asset) return { status: 'cancelled' };

    // Shrink the longest side only, keeping the shape.
    const resize =
      (asset.width ?? 0) >= (asset.height ?? 0) ? { width: options.maxSize } : { height: options.maxSize };
    const small = await manipulateAsync(asset.uri, [{ resize }], {
      compress: PHOTO_QUALITY,
      format: SaveFormat.JPEG,
      base64: true,
    });
    if (!small.base64) return { status: 'error' };
    return { status: 'picked', uri: `data:image/jpeg;base64,${small.base64}` };
  } catch {
    return { status: 'error' };
  }
}

// What to tell the user for each result that isn't a photo.
export const PHOTO_ERROR_MESSAGES: Record<'denied' | 'error', string> = {
  denied: 'Taskly needs permission to use your camera or photos. You can allow it in your phone settings.',
  error: 'Something went wrong with that photo. Please try another one.',
};
