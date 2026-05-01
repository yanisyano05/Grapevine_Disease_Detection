import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '@/screens/onboarding/WelcomeScreen';
import TermsScreen from '@/screens/onboarding/TermsScreen';
import AuthChoiceScreen from '@/screens/onboarding/AuthChoiceScreen';
import type { OnboardingParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<OnboardingParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="AuthChoice" component={AuthChoiceScreen} />
    </Stack.Navigator>
  );
}
