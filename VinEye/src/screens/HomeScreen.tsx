import { useEffect } from "react";
import { View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";
import { ProgressRing } from "@/components/gamification/ProgressRing";
import { ScanCard } from "@/components/history/ScanCard";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useHistory } from "@/hooks/useHistory";
import { colors } from "@/theme/colors";
import {
  getLevelForXP,
  getLevelNumber,
  getXPProgress,
} from "@/utils/achievements";
import type { RootStackParamList } from "@/types/navigation";
import StatCard from "@/components/home/gamificationstat";
import StatisticsSection from "@/components/home/statssection";
import SearchHeader from "@/components/home/SearchHeader";
import SectionHeader from "@/components/home/components/homeheader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type HomeNav = NativeStackNavigationProp<RootStackParamList>;

interface GameProgress {
  totalScans: number;
  uniqueGrapes: string[];
  streak: number;
}

const userProgress = {
  streak: 12, // La série de jours
  xpTotal: 2450, // Le total de points XP
  // ... tes autres données
};

const STAT_CARDS: {
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  accent: string;
  dark: string;
  getValue: (p: GameProgress) => number;
}[] = [
  {
    labelKey: "home.totalScans",
    icon: "scan-outline",
    bg: "#E8F0EA",
    accent: "#2D6A4F",
    dark: "#1B4332",
    getValue: (p) => p.totalScans,
  },
  {
    labelKey: "home.uniqueGrapes",
    icon: "leaf-outline",
    bg: "#EBE5F6",
    accent: "#7B5EA7",
    dark: "#3E0047",
    getValue: (p) => p.uniqueGrapes.length,
  },
  {
    labelKey: "home.currentStreak",
    icon: "flame-outline",
    bg: "#F0EBE3",
    accent: "#8B7355",
    dark: "#4A3F30",
    getValue: (p) => p.streak,
  },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNav>();
  const { progress } = useGameProgress();
  const { history } = useHistory();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const lastScan = history[0];

  const currentLevel = getLevelForXP(progress.xp);
  const levelNumber = getLevelNumber(progress.xp);
  const {
    current: xpInLevel,
    total: xpTotal,
    ratio: xpRatio,
  } = getXPProgress(progress.xp);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 24,
        }}
      >
        <SearchHeader />

        <StatisticsSection progress={userProgress} />

        {/* Scan banner */}
        <View
          className="mx-5 mb-6 rounded-2xl px-5 pt-5 pb-4 shadow-sm overflow-hidden relative border border-gray-50"
          style={{ backgroundColor: colors.primary[100] }}
        >
          {/* Decorative leaf top-right */}
          <View className="absolute -top-1 -right-1 opacity-30">
            <Ionicons name="leaf" size={80} color={colors.primary[600]} />
          </View>

          <Text
            className="mb-1 text-[18px] font-bold"
            style={{ color: colors.primary[900] }}
          >
            {t("home.bannerTitle")}
          </Text>
          <Text
            className="mb-5 max-w-[220px] text-[13px] leading-[18px]"
            style={{ color: colors.primary[700] }}
          >
            {t("home.bannerSubtitle")}
          </Text>

          {/* Scan icon centered */}
          <View className="mb-5 items-center">
            <Animated.View style={pulseStyle}>
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary[200] }}
              >
                <Ionicons name="scan" size={36} color={colors.primary[800]} />
              </View>
            </Animated.View>
          </View>

          {/* Full-width scan button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-2 rounded-full py-3"
            style={{ backgroundColor: colors.primary[800] }}
            onPress={() => navigation.navigate("Scanner")}
          >
            <Text className="text-[15px] font-semibold text-white">
              {t("home.scanButton")}
            </Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Last scan section */}
        {lastScan && (
          <View className="mx-5 mb-6 gap-2">
            <SectionHeader
              title={t("home.lastScan")}
              onViewAll={() => navigation.navigate("Notifications")}
            />
            <ScanCard record={lastScan} />
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
