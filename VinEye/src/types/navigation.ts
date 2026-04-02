import type { Detection } from './detection';

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Result: { detection: Detection };
  Notifications: undefined;
  Settings: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Scanner: undefined;
  Map: undefined;
};
