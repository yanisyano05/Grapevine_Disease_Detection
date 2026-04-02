import React from 'react';
import { View, Text, TouchableOpacity, Platform, LayoutAnimation, UIManager } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

// Imports de tes écrans
import HomeScreen from '@/screens/HomeScreen';
import ScannerScreen from '@/screens/ScannerScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import ProfileScreen from '@/screens/ProfileScreen';

// Activation de LayoutAnimation pour Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Tab = createBottomTabNavigator();

function MyCustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  
  // Gestion de la marge basse pour éviter la superposition avec la barre système
  const safeBottom = Platform.OS === 'android' ? Math.max(insets.bottom, 24) : insets.bottom;

  return (
    <View 
      className="absolute bg-white flex-row items-center justify-between px-2"
      style={{
        bottom: safeBottom + 10,
        left: 20,
        right: 20,
        height: 70,
        borderRadius: 35,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          // 1. Retour Haptique (Vibration légère "Impact")
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          // 2. Animation de la transition (Pill expansion)
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Choix de l'icône (Outline vs Solid)
        const getIcon = (name: string, focused: boolean) => {
          switch (name) {
            case 'Home': return focused ? 'home' : 'home-outline';
            case 'History': return focused ? 'receipt' : 'receipt-outline';
            case 'Scanner': return focused ? 'scan' : 'scan-outline';
            case 'Profile': return focused ? 'person' : 'person-outline';
            default: return 'help-outline';
          }
        };

        const label = options.tabBarLabel || route.name;

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            activeOpacity={0.7}
            style={{ flex: isFocused ? 2 : 1 }}
            className="items-center justify-center h-full"
          >
            <View 
              className={`flex-row items-center justify-center py-2.5 ${
                isFocused ? 'bg-gray-900 px-5' : 'bg-transparent px-0'
              }`}
              style={{ borderRadius: 999 }} 
            >
              <Ionicons 
                name={getIcon(route.name, isFocused) as any} 
                size={22} 
                color={isFocused ? '#FFFFFF' : '#9CA3AF'} 
              />
              
              {isFocused && (
                <Text 
                  numberOfLines={1}
                  className="ml-2 text-white font-bold text-[13px]"
                >
                  {label}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function BottomTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <MyCustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: t('common.home') }} 
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ tabBarLabel: t('common.history') }} 
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen} 
        options={{ tabBarLabel: 'Scan' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: t('common.profile') }} 
      />
    </Tab.Navigator>
  );
}