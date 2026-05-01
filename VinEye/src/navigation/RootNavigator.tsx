import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { BannedModal } from '@/components/auth/BannedModal';
import SplashScreen from '@/screens/SplashScreen';
import ResultScreen from '@/screens/ResultScreen';
import SearchScreen from '@/screens/SearchScreen';
// import NotificationsScreen from '@/screens/NotificationsScreen'; // TODO: réactiver quand la page Notifications sera de retour
import ProfileScreen from '@/screens/ProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import DiseaseDetailScreen from '@/screens/DiseaseDetailScreen';
import GuideDetailScreen from '@/screens/GuideDetailScreen';
import ScanDetailScreen from '@/screens/ScanDetailScreen';
import BottomTabNavigator from './BottomTabNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import linking from './linking';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoading, isOnboardingComplete } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8F9FB',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary[700]} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <BannedModal />
      <Stack.Navigator
        initialRouteName={isOnboardingComplete ? 'Splash' : 'Onboarding'}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 250,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {!isOnboardingComplete && (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={({ route }) => ({
            presentation: 'modal',
            animation: route.params?.fromMap ? 'fade' : 'fade_from_bottom',
            animationDuration: 250,
          })}
        />
        {/* <Stack.Screen name="Notifications" component={NotificationsScreen} /> */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DiseaseDetail" component={DiseaseDetailScreen} />
        <Stack.Screen name="GuideDetail" component={GuideDetailScreen} />
        <Stack.Screen name="ScanDetail" component={ScanDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
