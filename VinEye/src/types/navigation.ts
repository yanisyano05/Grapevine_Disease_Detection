import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Detection } from './detection';

export type BottomTabParamList = {
  Home: undefined;
  Guides: undefined;
  Scanner: undefined;
  MyPlants: undefined;
  Map: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Main: NavigatorScreenParams<BottomTabParamList>;
  Result: { detection: Detection };
  // Notifications: undefined; // TODO: réactiver quand la page Notifications sera de retour
  Profile: undefined;
  Settings: undefined;
  DiseaseDetail: { diseaseId: string };
  GuideDetail: { guideId: string };
  ScanDetail: { scanId: string };
};
