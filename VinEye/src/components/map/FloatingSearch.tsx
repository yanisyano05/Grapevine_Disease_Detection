import { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Search, MapPin } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import { WINE_REGIONS } from "@/data/wineRegions";

export type MapFilterId = "myLocation" | string;

interface FloatingSearchProps {
  activeFilter: MapFilterId | null;
  onFilterPress?: (id: MapFilterId) => void;
}

export function FloatingSearch({ activeFilter, onFilterPress }: FloatingSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const filters = [
    { id: "myLocation", labelKey: "map.filters.myLocation", icon: "location" as const },
    ...WINE_REGIONS.map((r) => ({ id: r.id, labelKey: r.labelKey, icon: undefined })),
  ];

  return (
    <View>
      <View style={styles.searchBar}>
        <Search size={20} color={colors.primary[800]} strokeWidth={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("map.searchPlaceholder")}
          placeholderTextColor={colors.neutral[500]}
          style={styles.input}
        />
        <View style={styles.logoWrap}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <Pressable
              key={filter.id}
              onPress={() => onFilterPress?.(filter.id)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              {filter.icon === "location" && (
                <MapPin
                  size={14}
                  color={isActive ? "#FFFFFF" : colors.neutral[800]}
                  strokeWidth={2.2}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.chipTextActive,
                ]}
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[900],
    padding: 0,
  },
  logoWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  chipsRow: {
    gap: 8,
    paddingTop: 12,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: colors.primary[800],
    borderColor: colors.primary[800],
    shadowOpacity: 0.12,
    elevation: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2D2D2D",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
