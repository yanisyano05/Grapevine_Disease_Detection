import type { Detection } from './detection';

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Result: { detection: Detection };
};

export type BottomTabParamList = {
  Home: undefined;
  Scanner: undefined;
  History: undefined;
  Profile: undefined;
};
