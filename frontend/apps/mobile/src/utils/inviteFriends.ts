import { Share } from 'react-native';
import { INVITE_LINK } from '../constants/supportInfo';

// Opens the phone's share sheet (WhatsApp, SMS…) with an invite to Taskly.
// The store link is added once the app is published (INVITE_LINK).
// TODO: referral rewards need the backend (overview §9 "Later").
export async function inviteFriends(): Promise<void> {
  const message =
    'I use Taskly to get small tasks done on campus (printing, laundry, notes and more) by verified students. ' +
    (INVITE_LINK ? `Join me: ${INVITE_LINK}` : 'Look out for it on the app stores!');
  try {
    await Share.share({ message });
  } catch {
    // Closing the share sheet or a share error needs no action.
  }
}
