import { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import SearchHeader from "@/components/home/SearchHeader";
import SearchSection from "@/components/home/SearchSection";

// ─── Types ───────────────────────────────────────────────

interface ScannedPlant {
  id: string;
  name: string;
  date: string;
  color: string;
  iconColor: string;
  favorite: boolean;
}

// ─── Mock Data ───────────────────────────────────────────

const INITIAL_PLANTS: ScannedPlant[] = [
  {
    id: "1",
    name: "Merlot",
    date: "2026-04-01",
    color: "#E9F5EC",
    iconColor: colors.primary[700],
    favorite: true,
  },
  {
    id: "2",
    name: "Cabernet Sauvignon",
    date: "2026-03-28",
    color: "#EEEDFE",
    iconColor: "#534AB7",
    favorite: false,
  },
  {
    id: "3",
    name: "Chardonnay",
    date: "2026-03-25",
    color: "#FAEEDA",
    iconColor: "#BA7517",
    favorite: true,
  },
  {
    id: "4",
    name: "Pinot Noir",
    date: "2026-03-20",
    color: "#FAECE7",
    iconColor: "#993C1D",
    favorite: false,
  },
  {
    id: "5",
    name: "Sauvignon Blanc",
    date: "2026-03-15",
    color: "#E6F1FB",
    iconColor: "#185FA5",
    favorite: false,
  },
  {
    id: "6",
    name: "Grenache",
    date: "2026-03-10",
    color: "#FCEBEB",
    iconColor: "#A32D2D",
    favorite: true,
  },
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 56) / 2;

// ─── Component ───────────────────────────────────────────

export default function LibraryScreen() {
  const { t } = useTranslation();
  const [plants, setPlants] = useState(INITIAL_PLANTS);

  function toggleFavorite(id: string) {
    setPlants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)),
    );
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const renderItem = ({ item }: { item: ScannedPlant }) => (
    <View style={styles.card}>
      {/* Image placeholder */}
      <View style={[styles.imagePlaceholder, { backgroundColor: item.color }]}>
        <Ionicons name="leaf" size={32} color={item.iconColor} />
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={styles.heartBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.favorite ? "heart" : "heart-outline"}
            size={18}
            color={item.favorite ? "#EF4444" : "#C7C7CC"}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.plantName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.plantDate}>{formatDate(item.date)}</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="leaf-outline" size={48} color={colors.neutral[300]} />
      </View>
      <Text style={styles.emptyTitle}>{t("library.empty.title")}</Text>
      <Text style={styles.emptyBody}>{t("library.empty.body")}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <>
            <SearchHeader />
            <SearchSection />
            <View style={styles.titleRow}>
              <Text style={styles.sectionTitle}>{t("library.title")}</Text>
              <Text style={styles.countText}>
                {plants.length} {t("library.plants")}
              </Text>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  listContent: {
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.4,
  },
  countText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#8E8E93",
  },
  row: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 16,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  cardInfo: {
    padding: 14,
  },
  plantName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  plantDate: {
    fontSize: 12,
    fontWeight: "400",
    color: "#8E8E93",
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    fontWeight: "400",
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
});
