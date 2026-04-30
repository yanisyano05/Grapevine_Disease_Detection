import { useEffect, useMemo, useState } from "react";
import { View, TextInput, Pressable, ScrollView, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import {
  Search,
  X,
  Clock,
  Leaf,
  BookOpen,
  MapPin,
  AlertTriangle,
  ChevronDown,
} from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useDiseases } from "@/hooks/useDiseases";
import { useGuides } from "@/hooks/useGuides";
import { useHistory } from "@/hooks/useHistory";
import { useScanLocation } from "@/hooks/useScanLocation";
import { getCepageById } from "@/utils/cepages";
import { haversineDistance, formatDistance } from "@/utils/distance";
import { colors } from "@/theme/colors";
import { getScanStatus } from "@/types/detection";
import type { ScanRecord, ScanStatus } from "@/types/detection";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Props = NativeStackScreenProps<RootStackParamList, "Search">;
type Category = "all" | "disease" | "guide" | "plant";

const STATUS_COLOR: Record<ScanStatus, string> = {
  healthy: colors.primary[700],
  infected: "#E63946",
  uncertain: "#F4A261",
};

const FALLBACK_IMG = require("../../assets/logo.png");

function hasLocation(
  scan: ScanRecord,
): scan is ScanRecord & { latitude: number; longitude: number } {
  return typeof scan.latitude === "number" && typeof scan.longitude === "number";
}

function getScanName(scan: ScanRecord, t: (k: string) => string): string {
  if (scan.customName?.trim()) return scan.customName.trim();
  if (scan.detection.cepageId) {
    const c = getCepageById(scan.detection.cepageId);
    if (c) return c.name.fr;
  }
  if (scan.detection.result === "vine") return t("result.vineDetected");
  if (scan.detection.result === "uncertain") return t("result.uncertain");
  return t("result.notVine");
}

// === Tag (badge) per category ===
function CategoryTag({ kind }: { kind: "disease" | "guide" | "plant" }) {
  const { t } = useTranslation();
  const styles =
    kind === "disease"
      ? { bg: "bg-[#FBE9E7]", text: "text-[#D32F2F]" }
      : kind === "guide"
        ? { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]" }
        : { bg: "bg-[#E8F5E9]", text: "text-[#2D6A4F]" };
  const labelKey =
    kind === "disease"
      ? "search.tag.disease"
      : kind === "guide"
        ? "search.tag.guide"
        : "search.tag.plant";
  return (
    <View className={`px-2 py-0.5 rounded-full ${styles.bg}`}>
      <Text
        className={`text-[10px] font-bold uppercase tracking-[0.5px] ${styles.text}`}
      >
        {t(labelKey)}
      </Text>
    </View>
  );
}

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props["route"]>();
  const fromMap = route.params?.fromMap === true;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Category>("all");
  const [closedSections, setClosedSections] = useState<
    Set<"disease" | "guide" | "plant">
  >(new Set());

  const { recents, addRecent, removeRecent, clearRecents } =
    useRecentSearches();
  const { data: diseases } = useDiseases();
  const { data: guides } = useGuides();
  const { history } = useHistory();
  const { requestAndGetLocation } = useScanLocation();

  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Fetch user location once when on map mode
  useEffect(() => {
    if (!fromMap) return;
    let alive = true;
    (async () => {
      const coords = await requestAndGetLocation();
      if (alive && coords) setUserCoords(coords);
    })();
    return () => {
      alive = false;
    };
  }, [fromMap, requestAndGetLocation]);

  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  // PLANTS LIST (map mode only) : located plants with distance
  const mapPlantHits = useMemo(() => {
    if (!fromMap) return [];
    const located = history.filter(hasLocation);
    const filtered = isSearching
      ? located.filter((s) =>
          getScanName(s, t).toLowerCase().includes(trimmed),
        )
      : located;
    return filtered
      .map((scan) => ({
        scan,
        distance: userCoords
          ? haversineDistance(userCoords, {
              latitude: scan.latitude,
              longitude: scan.longitude,
            })
          : null,
      }))
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null)
          return a.distance - b.distance;
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return (
          new Date(b.scan.createdAt).getTime() -
          new Date(a.scan.createdAt).getTime()
        );
      });
  }, [fromMap, history, isSearching, trimmed, userCoords, t]);

  // GLOBAL HITS (3 categories) : diseases + guides + plants
  const diseaseHits = useMemo(() => {
    if (fromMap || !isSearching) return [];
    return diseases.filter((d) => {
      const name = t(d.name).toLowerCase();
      const desc = t(d.description).toLowerCase();
      return name.includes(trimmed) || desc.includes(trimmed);
    });
  }, [fromMap, isSearching, diseases, trimmed, t]);

  const guideHits = useMemo(() => {
    if (fromMap || !isSearching) return [];
    return guides.filter((g) => {
      const title = t(g.title).toLowerCase();
      const subtitle = t(g.subtitle).toLowerCase();
      return title.includes(trimmed) || subtitle.includes(trimmed);
    });
  }, [fromMap, isSearching, guides, trimmed, t]);

  const plantHits = useMemo(() => {
    if (fromMap || !isSearching) return [];
    return history.filter((scan) => {
      const name = getScanName(scan, t).toLowerCase();
      return name.includes(trimmed);
    });
  }, [fromMap, isSearching, history, trimmed, t]);

  const totalHits = diseaseHits.length + guideHits.length + plantHits.length;

  function handleSelectRecent(rec: string) {
    setQuery(rec);
  }

  function handleSelectDisease(id: string) {
    if (query.trim().length > 0) addRecent(query);
    Keyboard.dismiss();
    navigation.navigate("DiseaseDetail", { diseaseId: id });
  }

  function handleSelectGuide(id: string) {
    if (query.trim().length > 0) addRecent(query);
    Keyboard.dismiss();
    navigation.navigate("GuideDetail", { guideId: id });
  }

  function handleSelectPlant(scan: ScanRecord) {
    if (query.trim().length > 0) addRecent(query);
    Keyboard.dismiss();
    if (hasLocation(scan)) {
      navigation.navigate("Main", {
        screen: "Map",
        params: { focusScanId: scan.id },
      });
    } else {
      navigation.navigate("ScanDetail", { scanId: scan.id });
    }
  }

  function handleSubmit() {
    if (trimmed.length === 0) return;
    addRecent(query);
    Keyboard.dismiss();
  }

  function toggleSection(kind: "disease" | "guide" | "plant") {
    setClosedSections((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  const showSection = (kind: Category) =>
    filter === "all" || filter === kind;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header : SearchBar + Cancel */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-[#F0F0F0]">
        <View className="flex-1 flex-row items-center bg-[#F5F7F9] rounded-full px-4 h-12 border border-[#EAECEF]">
          <Search size={18} color={colors.neutral[400]} />
          <TextInput
            className="flex-1 ml-2.5 text-[15px] font-medium text-[#1A1A1A]"
            style={{
              paddingVertical: 0,
              textAlignVertical: "center",
              includeFontPadding: false,
            }}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            placeholder={
              fromMap ? t("search.placeholderMap") : t("search.placeholder")
            }
            placeholderTextColor={colors.neutral[400]}
            selectionColor={colors.primary[500]}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8} className="ml-2">
              <X size={16} color={colors.neutral[400]} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text className="text-[15px] font-semibold text-[#2D6A4F]">
            {t("common.cancel")}
          </Text>
        </Pressable>
      </View>

      {/* Filter chips (global mode + searching) */}
      {!fromMap && isSearching && (
        <View className="border-b border-[#F0F0F0]">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}
          >
            <FilterChip
              label={t("search.filter.all")}
              count={totalHits}
              active={filter === "all"}
              onPress={() => setFilter("all")}
            />
            <FilterChip
              label={t("search.filter.diseases")}
              count={diseaseHits.length}
              active={filter === "disease"}
              onPress={() => setFilter("disease")}
            />
            <FilterChip
              label={t("search.filter.guides")}
              count={guideHits.length}
              active={filter === "guide"}
              onPress={() => setFilter("guide")}
            />
            <FilterChip
              label={t("search.filter.plants")}
              count={plantHits.length}
              active={filter === "plant"}
              onPress={() => setFilter("plant")}
            />
          </ScrollView>
        </View>
      )}

      {/* Body */}
      {fromMap ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {mapPlantHits.length > 0 && (
            <Text className="px-5 pt-5 pb-2 text-[12px] font-bold uppercase tracking-[1px] text-[#8E8E93]">
              {isSearching
                ? t("search.resultsTitle")
                : t("search.nearbyPlantsTitle")}
            </Text>
          )}
          {mapPlantHits.length === 0 ? (
            <View className="items-center justify-center px-8 pt-20">
              <Text className="text-[15px] text-[#8E8E93] text-center">
                {isSearching ? t("search.noResults") : t("search.noPlants")}
              </Text>
            </View>
          ) : (
            mapPlantHits.map(({ scan, distance }) => {
              const status = getScanStatus(scan);
              const hasImg = !!scan.detection.imageUri;
              return (
                <Pressable
                  key={scan.id}
                  onPress={() => handleSelectPlant(scan)}
                  className="flex-row items-center gap-3 px-5 py-3 active:bg-[#F8F9FB]"
                >
                  <View className="w-12 h-12 rounded-2xl bg-[#F8F9FB] overflow-hidden items-center justify-center">
                    <Image
                      source={
                        hasImg ? { uri: scan.detection.imageUri } : FALLBACK_IMG
                      }
                      style={{ width: 48, height: 48 }}
                      contentFit={hasImg ? "cover" : "contain"}
                      transition={200}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className="flex-1 text-[15px] font-semibold text-[#1A1A1A]"
                        numberOfLines={1}
                      >
                        {getScanName(scan, t)}
                      </Text>
                      <CategoryTag kind="plant" />
                    </View>
                    <View className="flex-row items-center gap-1.5 mt-0.5">
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLOR[status] }}
                      />
                      <Text className="text-[12px] text-[#8E8E93]">
                        {t(`myPlants.status.${status}`)}
                      </Text>
                    </View>
                  </View>
                  {distance !== null && (
                    <View className="flex-row items-center gap-1">
                      <MapPin size={14} color={colors.neutral[500]} />
                      <Text className="text-[13px] font-semibold text-[#6B6B6B]">
                        {formatDistance(distance, i18n.language)}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      ) : isSearching ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {totalHits === 0 && (
            <View className="items-center justify-center px-8 pt-20">
              <Text className="text-[15px] text-[#8E8E93] text-center">
                {t("search.noResults")}
              </Text>
            </View>
          )}

          {showSection("disease") && diseaseHits.length > 0 && (
            <Section
              title={t("search.section.diseases")}
              count={diseaseHits.length}
              isClosed={closedSections.has("disease")}
              onToggle={() => toggleSection("disease")}
            >
              {diseaseHits.map((d) => (
                <ResultRow
                  key={d.id}
                  onPress={() => handleSelectDisease(d.id)}
                  iconBg="bg-[#FBE9E7]"
                  icon={
                    <AlertTriangle
                      size={18}
                      color="#D32F2F"
                      strokeWidth={2.2}
                    />
                  }
                  title={t(d.name)}
                  subtitle={t(`diseases.types.${d.type}`)}
                  tag={<CategoryTag kind="disease" />}
                />
              ))}
            </Section>
          )}

          {showSection("guide") && guideHits.length > 0 && (
            <Section
              title={t("search.section.guides")}
              count={guideHits.length}
              isClosed={closedSections.has("guide")}
              onToggle={() => toggleSection("guide")}
            >
              {guideHits.map((g) => (
                <ResultRow
                  key={g.id}
                  onPress={() => handleSelectGuide(g.id)}
                  iconBg="bg-[#E3F2FD]"
                  icon={
                    <BookOpen size={18} color="#1565C0" strokeWidth={2.2} />
                  }
                  title={t(g.title)}
                  subtitle={t(g.subtitle)}
                  tag={<CategoryTag kind="guide" />}
                />
              ))}
            </Section>
          )}

          {showSection("plant") && plantHits.length > 0 && (
            <Section
              title={t("search.section.plants")}
              count={plantHits.length}
              isClosed={closedSections.has("plant")}
              onToggle={() => toggleSection("plant")}
            >
              {plantHits.map((scan) => {
                const status = getScanStatus(scan);
                return (
                  <ResultRow
                    key={scan.id}
                    onPress={() => handleSelectPlant(scan)}
                    iconBg="bg-[#E8F5E9]"
                    icon={
                      <Leaf
                        size={18}
                        color={colors.primary[700]}
                        strokeWidth={2.2}
                      />
                    }
                    title={getScanName(scan, t)}
                    subtitle={t(`myPlants.status.${status}`)}
                    tag={<CategoryTag kind="plant" />}
                  />
                );
              })}
            </Section>
          )}
        </ScrollView>
      ) : (
        // No query : recents
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-5 pt-5 pb-2">
            <Text className="text-[12px] font-bold uppercase tracking-[1px] text-[#8E8E93]">
              {t("search.recentTitle")}
            </Text>
            {recents.length > 0 && (
              <Pressable onPress={clearRecents} hitSlop={6}>
                <Text className="text-[13px] font-semibold text-[#2D6A4F]">
                  {t("search.clearAll")}
                </Text>
              </Pressable>
            )}
          </View>
          {recents.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8 pt-10">
              <Text className="text-[15px] text-[#8E8E93] text-center">
                {t("search.noRecent")}
              </Text>
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              {recents.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => handleSelectRecent(item)}
                  className="flex-row items-center gap-3 px-5 py-3 active:bg-[#F8F9FB]"
                >
                  <Clock size={18} color={colors.neutral[500]} />
                  <Text
                    className="flex-1 text-[15px] text-[#1A1A1A]"
                    numberOfLines={1}
                  >
                    {item}
                  </Text>
                  <Pressable
                    onPress={() => removeRecent(item)}
                    hitSlop={10}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <X size={16} color={colors.neutral[400]} />
                  </Pressable>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// === Subcomponents ===

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}
function FilterChip({ label, count, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={
        active
          ? "flex-row items-center px-4 py-2 rounded-full bg-[#2D6A4F]"
          : "flex-row items-center px-4 py-2 rounded-full bg-white border border-[#E2E4E7]"
      }
    >
      <Text
        className={
          active
            ? "text-[13px] font-semibold text-white"
            : "text-[13px] font-medium text-[#2D2D2D]"
        }
      >
        {label}
      </Text>
      {count > 0 && (
        <Text
          className={
            active
              ? "text-[12px] font-bold text-white ml-1.5"
              : "text-[12px] font-bold text-[#8E8E93] ml-1.5"
          }
        >
          {count}
        </Text>
      )}
    </Pressable>
  );
}

interface SectionProps {
  title: string;
  count: number;
  isClosed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
function Section({ title, count, isClosed, onToggle, children }: SectionProps) {
  return (
    <View className="mt-2">
      <Pressable
        onPress={onToggle}
        className="flex-row items-center justify-between px-5 py-3 active:bg-[#F8F9FB]"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-[12px] font-bold uppercase tracking-[1px] text-[#8E8E93]">
            {title}
          </Text>
          <Text className="text-[12px] font-bold text-[#8E8E93]">
            ({count})
          </Text>
        </View>
        <View
          style={{
            transform: [{ rotate: isClosed ? "-90deg" : "0deg" }],
          }}
        >
          <ChevronDown size={18} color={colors.neutral[500]} />
        </View>
      </Pressable>
      {!isClosed && <View>{children}</View>}
    </View>
  );
}

interface ResultRowProps {
  onPress: () => void;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag: React.ReactNode;
}
function ResultRow({
  onPress,
  iconBg,
  icon,
  title,
  subtitle,
  tag,
}: ResultRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-5 py-3 active:bg-[#F8F9FB]"
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${iconBg}`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            className="flex-1 text-[15px] font-semibold text-[#1A1A1A]"
            numberOfLines={1}
          >
            {title}
          </Text>
          {tag}
        </View>
        <Text className="text-[13px] text-[#8E8E93] mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}
