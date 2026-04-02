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
          Map: 'map',
        },
      },
      Result: 'result',
      Notifications: 'notifications',
      Profile: 'profile',
      Settings: 'settings',
      Guides: 'guides',
      Library: 'library',
    },
  },
};

export default linking;
