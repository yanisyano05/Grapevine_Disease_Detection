import type { Detection } from './detection';

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Result: { detection: Detection };
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
  Guides: undefined;
  Library: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Guides: undefined;
  Scanner: undefined;
  Library: undefined;
  Map: undefined;
};
