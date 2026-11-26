import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PosterHomeScreen } from '../screens/poster/PosterHomeScreen';
import { ChooseSubcategoryScreen } from '../screens/poster/ChooseSubcategoryScreen';
import { PostTaskScreen } from '../screens/poster/PostTaskScreen';
import { CheckoutScreen } from '../screens/poster/CheckoutScreen';
import { TaskDetailScreen } from '../screens/poster/TaskDetailScreen';
import { MyTasksScreen } from '../screens/poster/MyTasksScreen';
import { RateRunnerScreen } from '../screens/poster/RateRunnerScreen';
import { ReportProblemScreen } from '../screens/poster/ReportProblemScreen';
import { RaisePriceScreen } from '../screens/poster/RaisePriceScreen';
import { RunnerProfileScreen } from '../screens/poster/RunnerProfileScreen';
import { NotificationsInboxScreen } from '../screens/poster/NotificationsInboxScreen';
import { ChatListScreen } from '../screens/shared/ChatListScreen';
import { ChatThreadScreen } from '../screens/shared/ChatThreadScreen';
import { ProfileStack } from './ProfileStack';
import { RanksScreen } from '../screens/shared/RanksScreen';
import { tabIcon } from './tabIcon';
import { pushedScreenOptions, rootScreenOptions, tabBarOptions } from './screenOptions';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// The "Home" tab is its own stack, because tapping a category pushes
// ChooseSubcategory (if it has kinds) and then PostTask on top of the home
// screen (then Checkout), and tapping a task pushes TaskDetail. Those pushes
// keep the tab bar.
function HomeTabStack() {
  return (
    <Stack.Navigator screenOptions={pushedScreenOptions}>
      <Stack.Screen name="PosterHome" component={PosterHomeScreen} options={rootScreenOptions} />
      <Stack.Screen name="ChooseSubcategory" component={ChooseSubcategoryScreen} />
      <Stack.Screen name="PostTask" component={PostTaskScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="RaisePrice" component={RaisePriceScreen} />
      <Stack.Screen name="RunnerProfile" component={RunnerProfileScreen} />
      <Stack.Screen name="RateRunner" component={RateRunnerScreen} />
      <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="NotificationsInbox" component={NotificationsInboxScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
    </Stack.Navigator>
  );
}

// The "Tasks" tab opens the poster's task list; tapping one pushes its
// detail without leaving the tab.
function MyTasksTabStack() {
  return (
    <Stack.Navigator screenOptions={pushedScreenOptions}>
      <Stack.Screen name="MyTasks" component={MyTasksScreen} options={rootScreenOptions} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="RaisePrice" component={RaisePriceScreen} />
      <Stack.Screen name="RunnerProfile" component={RunnerProfileScreen} />
      <Stack.Screen name="RateRunner" component={RateRunnerScreen} />
      <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
    </Stack.Navigator>
  );
}

export function PosterStack() {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Home"
        component={HomeTabStack}
        options={{ tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tab.Screen
        name="Tasks"
        component={MyTasksTabStack}
        options={{ tabBarIcon: tabIcon('checkbox', 'checkbox-outline') }}
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
