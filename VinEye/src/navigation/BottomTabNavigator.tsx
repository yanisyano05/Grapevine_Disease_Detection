import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { House, ScanLine, Map, BookOpen, Sprout } from "lucide-react-native";

import HomeScreen from "@/screens/HomeScreen";
import ScannerScreen from "@/screens/ScannerScreen";
import MapScreen from "@/screens/MapScreen";
import GuidesScreen from "@/screens/GuidesScreen";
import MyPlantsScreen from "@/screens/MyPlantsScreen";
import { colors } from "@/theme/colors";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, any> = {
  Home: House,
  Guides: BookOpen,
  MyPlants: Sprout,
  Map: Map,
};

function MyCustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[300],
        paddingBottom: insets.bottom,
        paddingTop: 8,
        alignItems: "flex-end",
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = options.tabBarLabel || route.name;
        const isScanner = route.name === "Scanner";

        const onPress = () => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // FAB central pour Scanner
        if (isScanner) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={label}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.primary[800],
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -25,
                  shadowColor: colors.primary[900],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <ScanLine size={26} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          );
        }

        // Onglets classiques (Home, Map)
        const Icon = TAB_ICONS[route.name];
        const tintColor = isFocused ? colors.primary[700] : colors.neutral[400];

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={label}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 6,
            }}
          >
            {Icon && (
              <Icon
                size={22}
                color={tintColor}
                strokeWidth={isFocused ? 2.5 : 1.8}
              />
            )}
            <Text
              numberOfLines={1}
              style={{
                fontSize: 11,
                marginTop: 4,
                color: tintColor,
                fontWeight: isFocused ? "600" : "400",
              }}
            >
              {label}
            </Text>
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
        options={{ tabBarLabel: t("common.home") }}
      />
      <Tab.Screen
        name="Guides"
        component={GuidesScreen}
        options={{ tabBarLabel: t("guides.screenTitle") }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{ tabBarLabel: t("common.scan") }}
      />
      <Tab.Screen
        name="MyPlants"
        component={MyPlantsScreen}
        options={{ tabBarLabel: t("myPlants.tabLabel") }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarLabel: t("common.map") }}
      />
    </Tab.Navigator>
  );
}
