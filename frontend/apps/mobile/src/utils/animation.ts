import { Platform } from 'react-native';

// Run animations on the native thread on phones (smoother). Web doesn't
// support the native driver and warns if asked to use it.
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';
