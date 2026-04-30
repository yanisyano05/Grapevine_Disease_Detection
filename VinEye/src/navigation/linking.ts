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
          Guides: 'guides',
          Scanner: 'scan',
          MyPlants: 'my-plants',
          Map: 'map',
        },
      },
      Result: 'result',
      // Notifications: 'notifications', // TODO: réactiver quand la page Notifications sera de retour
      Profile: 'profile',
      Settings: 'settings',
      DiseaseDetail: 'disease/:diseaseId',
      GuideDetail: 'guide/:guideId',
      ScanDetail: 'scan/:scanId',
    },
  },
};

export default linking;
