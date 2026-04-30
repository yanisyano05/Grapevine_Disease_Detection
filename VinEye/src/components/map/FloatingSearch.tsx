import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import SearchBar from "@/components/shared/SearchBar";
import { HeaderActionButtons } from "@/components/shared/HeaderActionButtons";
import { colors } from "@/theme/colors";
import { WINE_REGIONS } from "@/data/wineRegions";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export type MapFilterId = "myLocation" | string;

interface FloatingSearchProps {
  activeFilter: MapFilterId | null;
  onFilterPress?: (id: MapFilterId) => void;
}

export function FloatingSearch({
  activeFilter,
  onFilterPress,
}: FloatingSearchProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const filters = [
    {
      id: "myLocation",
      labelKey: "map.filters.myLocation",
      icon: "location" as const,
    },
    ...WINE_REGIONS.map((r) => ({
      id: r.id,
      labelKey: r.labelKey,
      icon: undefined,
    })),
  ];

  return (
    <View collapsable={false} style={styles.rootElevation}>
      <View className="flex-row items-center gap-2.5">
        <View className="flex-1">
          <SearchBar
            placeholder={t("map.searchPlaceholder")}
            onTriggerPress={() =>
              navigation.navigate("Search", { fromMap: true })
            }
          />
        </View>
        <HeaderActionButtons />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 pt-3 px-0.5 py-1"
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <Pressable
              key={filter.id}
              onPress={() => onFilterPress?.(filter.id)}
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"
              style={[
                styles.chipShadow,
                isActive
                  ? {
                      backgroundColor: colors.primary[800],
                      borderColor: colors.primary[800],
                      shadowOpacity: 0.12,
                      // elevation: 24,
                    }
                  : {
                      backgroundColor: "#FFFFFF",
                      borderColor: colors.primary[800],
                    },
              ]}
            >
              {filter.icon === "location" && (
                <MapPin
                  size={16}
                  color={isActive ? "#FFFFFF" : colors.primary[800]}
                  strokeWidth={2.2}
                />
              )}
              <Text
                className={
                  isActive
                    ? "text-[12px] font-semibold text-white"
                    : "text-[12px] font-medium"
                }
                style={!isActive ? { color: colors.primary[800] } : undefined}
              >
                {t(filter.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootElevation: {
    elevation: 24,
  },
  chipShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
});
