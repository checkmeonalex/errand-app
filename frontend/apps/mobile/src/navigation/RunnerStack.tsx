import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RunnerHomeScreen } from '../screens/runner/RunnerHomeScreen';
import { RunnerTaskPreviewScreen } from '../screens/runner/RunnerTaskPreviewScreen';
import { RunnerJobScreen } from '../screens/runner/RunnerJobScreen';
import { HandoverCodeEntryScreen } from '../screens/runner/HandoverCodeEntryScreen';
import { MyJobsScreen } from '../screens/runner/MyJobsScreen';
import { EarningsScreen } from '../screens/runner/EarningsScreen';
import { ChatThreadScreen } from '../screens/shared/ChatThreadScreen';
import { RanksScreen } from '../screens/shared/RanksScreen';
import { ProfileStack } from './ProfileStack';
import { tabIcon } from './tabIcon';
import { pushedScreenOptions, rootScreenOptions, tabBarOptions } from './screenOptions';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Runner mode: four tabs (Find tasks, My jobs, Ranks, Profile). Earnings
// opens from the card on Find tasks instead of having its own tab. A job
// can be opened from either of the first two tabs, so both stacks carry the
// job screens.
function FindTabStack() {
  return (
    <Stack.Navigator screenOptions={pushedScreenOptions}>
      <Stack.Screen name="RunnerHome" component={RunnerHomeScreen} options={rootScreenOptions} />
      <Stack.Screen name="RunnerTaskPreview" component={RunnerTaskPreviewScreen} />
      <Stack.Screen name="RunnerJob" component={RunnerJobScreen} />
      <Stack.Screen name="HandoverCodeEntry" component={HandoverCodeEntryScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
    </Stack.Navigator>
  );
}

function JobsTabStack() {
  return (
    <Stack.Navigator screenOptions={pushedScreenOptions}>
      <Stack.Screen name="MyJobs" component={MyJobsScreen} options={rootScreenOptions} />
      <Stack.Screen name="RunnerJob" component={RunnerJobScreen} />
      <Stack.Screen name="HandoverCodeEntry" component={HandoverCodeEntryScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
    </Stack.Navigator>
  );
}

export function RunnerStack() {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Find"
        component={FindTabStack}
        options={{ title: 'Find tasks', tabBarIcon: tabIcon('search', 'search-outline') }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsTabStack}
        options={{ title: 'My jobs', tabBarIcon: tabIcon('briefcase', 'briefcase-outline') }}
      />
      <Tab.Screen
        name="Ranks"
        component={RanksScreen}
        options={{ tabBarIcon: tabIcon('trophy', 'trophy-outline') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tab.Navigator>
  );
}
