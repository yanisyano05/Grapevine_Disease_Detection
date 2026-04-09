import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from '@/screens/SplashScreen';
import ResultScreen from '@/screens/ResultScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import DiseaseDetailScreen from '@/screens/DiseaseDetailScreen';
import GuideDetailScreen from '@/screens/GuideDetailScreen';
import ScanDetailScreen from '@/screens/ScanDetailScreen';
import BottomTabNavigator from './BottomTabNavigator';
import linking from './linking';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 250,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DiseaseDetail" component={DiseaseDetailScreen} />
        <Stack.Screen name="GuideDetail" component={GuideDetailScreen} />
        <Stack.Screen name="ScanDetail" component={ScanDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
