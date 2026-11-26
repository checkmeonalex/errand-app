import { pickPhoto, type PhotoSource, type PickPhotoResult } from './pickPhoto';

export { PHOTO_ERROR_MESSAGES } from './pickPhoto';
export type { PhotoSource, PickPhotoResult } from './pickPhoto';

// Profile photos are shown small, so a 400px square is plenty and keeps each
// one around 30–80 KB.
const PROFILE_PHOTO_SIZE = 400;

// TODO: upload to the backend's "avatars" bucket and keep only its URL.
export function pickProfilePhoto(source: PhotoSource): Promise<PickPhotoResult> {
  return pickPhoto(source, { square: true, maxSize: PROFILE_PHOTO_SIZE });
}
