import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['vineye://'],
  config: {
    screens: {
      Splash: 'splash',
      Main: {
        screens: {
          Home: 'home',
          Scanner: 'scan',
          History: 'history',
          Profile: 'profile',
        },
      },
      Result: 'result',
    },
  },
};

export default linking;
