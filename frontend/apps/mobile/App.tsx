import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ModeProvider } from './src/context/ModeContext';
import { TasksProvider } from './src/context/TasksContext';
import { ChatProvider } from './src/context/ChatContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { FeedbackProvider } from './src/context/FeedbackContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { RunnerJobsProvider } from './src/context/RunnerJobsContext';
import { colors } from './src/theme/colors';
import * as WebBrowser from 'expo-web-browser';

// Web only: when Paystack's popup returns to /payment-complete, this closes
// the popup and hands the result to the Checkout tab that opened it
// (see src/utils/openPaystackCheckout.ts). Does nothing on phones.
WebBrowser.maybeCompleteAuthSession();

// Widest the app gets on a desktop browser, so the web preview looks like a
// phone instead of stretching across the screen.
const WEB_MAX_WIDTH = 480;

// Where the app comes together: app-wide providers wrap the navigator.
// Add new app-wide providers here (outermost = available to everything).
export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.backdrop}>
        <View style={styles.app}>
          <AuthProvider>
            <SettingsProvider>
              <ModeProvider>
                <NotificationsProvider>
                  <TasksProvider>
                    <ChatProvider>
                      <RunnerJobsProvider>
                        <FeedbackProvider>
                          <RootNavigator />
                        </FeedbackProvider>
                      </RunnerJobsProvider>
                    </ChatProvider>
                  </TasksProvider>
                </NotificationsProvider>
              </ModeProvider>
            </SettingsProvider>
          </AuthProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: isWeb ? colors.backdrop : colors.background,
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: isWeb ? WEB_MAX_WIDTH : undefined,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});
