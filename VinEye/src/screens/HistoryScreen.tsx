import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ScanList } from "@/components/history/ScanList";
import { useHistory } from "@/hooks/useHistory";
import { getCepageById } from "@/utils/cepages";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing } from "@/theme/spacing";
import type { DetectionResult, ScanRecord } from "@/types/detection";

type Filter = "all" | "vine" | "not_vine";
type SortBy = "date" | "confidence";

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { history, deleteScan } = useHistory();
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [search, setSearch] = useState("");

  const filteredHistory = useMemo(() => {
    let result: ScanRecord[] = [...history];

    // Filter by result type
    if (filter === "vine") {
      result = result.filter((r) => r.detection.result === "vine");
    } else if (filter === "not_vine") {
      result = result.filter((r) => r.detection.result !== "vine");
    }

    // Filter by ceepage search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((r) => {
        if (!r.detection.cepageId) return false;
        const c = getCepageById(r.detection.cepageId);
        return (
          c?.name.fr.toLowerCase().includes(q) ||
          c?.name.en.toLowerCase().includes(q)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return b.detection.confidence - a.detection.confidence;
    });

    return result;
  }, [history, filter, sortBy, search]);

  function handleDelete(id: string) {
    Alert.alert(t("history.deleteConfirm"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => deleteScan(id),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        {/* <Text style={styles.title}>{t("history.title")}</Text> */}

        <View style={styles.header}>
          <Ionicons
            name="search-outline"
            size={22}
            color={colors.neutral[800]}
          />
          <TextInput
            style={styles.search}
            placeholder={t("history.search")}
            placeholderTextColor={colors.neutral[500]}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Search */}
        {/* <TextInput
          style={styles.search}
          placeholder={t("history.search")}
          placeholderTextColor={colors.neutral[500]}
          value={search}
          onChangeText={setSearch}
        /> */}

        {/* Filters */}
        <View style={styles.filters}>
          {(["all", "vine", "not_vine"] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {t(`history.filter.${f === "not_vine" ? "notVine" : f}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sort */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>{t("history.sortBy")} :</Text>
          {(["date", "confidence"] as SortBy[]).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSortBy(s)}
              style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
            >
              <Text
                style={[styles.sortText, sortBy === s && styles.sortTextActive]}
              >
                {t(`history.${s}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScanList records={filteredHistory} onDelete={handleDelete} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[300],
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.fontSizes["2xl"],
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral[900],
  },
  search: {
    backgroundColor: colors.neutral[200],
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: colors.neutral[900],
  },
  filters: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.neutral[200],
  },
  filterBtnActive: {
    backgroundColor: colors.primary[700],
  },
  filterText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral[700],
    fontWeight: typography.fontWeights.medium,
  },
  filterTextActive: {
    color: colors.surface,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sortLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral[600],
  },
  sortBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortBtnActive: {
    backgroundColor: colors.primary[200],
  },
  sortText: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral[600],
  },
  sortTextActive: {
    color: colors.primary[800],
    fontWeight: typography.fontWeights.semibold,
  },
});
