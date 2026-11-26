import { Linking } from 'react-native';

// A tap handler that opens `url`, or undefined when there's no link yet, so
// settings rows show "Coming soon" instead of a dead tap.
export function linkHandler(url: string | null): (() => void) | undefined {
  if (!url) return undefined;
  return () => {
    Linking.openURL(url).catch(() => {});
  };
}
