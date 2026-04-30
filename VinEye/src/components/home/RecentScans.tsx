import { View, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { ScanListItem } from "@/components/my-plants/ScanListItem";
import SectionHeader from "@/components/home/components/homeheader";
import HomeCta from "@/components/home/HomeCta";
import { useHistory } from "@/hooks/useHistory";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MAX_RECENT = 3;

export default function RecentScans() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { history, toggleFavorite, deleteScan } = useHistory();

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
});
