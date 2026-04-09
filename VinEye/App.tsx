import 'react-native-gesture-handler';
import './global.css';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { PortalHost } from '@rn-primitives/portal';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { NetworkToastWatcher } from '@/contexts/ToastContext';
import RootNavigator from '@/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('transparent');
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkProvider>
          <NetworkToastWatcher>
            <StatusBar style="dark" translucent backgroundColor="transparent" />
            <RootNavigator />
            <PortalHost />
            <Toaster position="bottom-center" offset={120} />
          </NetworkToastWatcher>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
