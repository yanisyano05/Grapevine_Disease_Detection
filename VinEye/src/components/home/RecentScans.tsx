import { useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { ScanListItem } from "@/components/my-plants/ScanListItem";
import SectionHeader from "@/components/home/components/homeheader";
import HomeCta from "@/components/home/HomeCta";
import { ScanListItemSkeleton } from "@/components/ui/Skeleton";
import { useHistory } from "@/hooks/useHistory";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MAX_RECENT = 3;

export default function RecentScans() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { history, isLoading, toggleFavorite, deleteScan, reload } =
    useHistory();

  // useHistory() crée une instance state locale par consumer → l'addScan fait
  // depuis Scanner ne remonte pas ici. On reload depuis AsyncStorage à chaque
  // focus du tab Home pour récupérer les scans ajoutés ailleurs.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  // Loading + pas encore de cache → skeleton
  if (isLoading && history.length === 0) {
    return (
      <View className="mb-6 mx-5 gap-3">
        <SectionHeader
          title={t("home.recentScans")}
          onViewAll={() => navigation.navigate("Main", { screen: "MyPlants" })}
        />
        <View style={styles.cardLoading}>
          <ScanListItemSkeleton showSeparator />
          <ScanListItemSkeleton showSeparator />
          <ScanListItemSkeleton />
        </View>
      </View>
    );
  }

  if (history.length === 0) {
    return <HomeCta />;
  }

  const recent = history.slice(0, MAX_RECENT);

  return (
    <View className="mb-6 mx-5 gap-3">
      <SectionHeader
        title={t("home.recentScans")}
        onViewAll={() => navigation.navigate("Main", { screen: "MyPlants" })}
      />
      <View style={styles.card}>
        {recent.map((scan, index) => (
          <ScanListItem
            key={scan.id}
            scan={scan}
            onPress={() => navigation.navigate("ScanDetail", { scanId: scan.id })}
            onToggleFavorite={() => toggleFavorite(scan.id)}
            onDelete={() => deleteScan(scan.id)}
            grouped
            showSeparator={index < recent.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  // Loading: pas de shadow / elevation → évite le flash "rectangle blanc + ombre"
  // sur Android avant que les skeletons ne fadent in via FadeInDown du parent.
  cardLoading: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
});
