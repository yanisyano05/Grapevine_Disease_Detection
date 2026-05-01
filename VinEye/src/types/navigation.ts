import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Detection } from './detection';

export type BottomTabParamList = {
  Home: undefined;
  Guides: undefined;
  Scanner: undefined;
  MyPlants: undefined;
  Map: { focusScanId?: string } | undefined;
};

export type OnboardingParamList = {
  Welcome: undefined;
  Terms: undefined;
  AuthChoice: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: NavigatorScreenParams<OnboardingParamList>;
  Main: NavigatorScreenParams<BottomTabParamList>;
  Result: { detection: Detection };
  Search: { fromMap?: boolean } | undefined;
  // Notifications: undefined; // TODO: réactiver quand la page Notifications sera de retour
  Profile: undefined;
  Settings: undefined;
  DiseaseDetail: { diseaseId: string };
  GuideDetail: { guideId: string };
  ScanDetail: { scanId: string };
};
