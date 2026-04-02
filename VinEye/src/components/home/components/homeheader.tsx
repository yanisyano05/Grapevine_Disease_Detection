import { useEffect } from "react";
import { View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
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
import type { BottomTabParamList } from "@/types/navigation";
import StatCard from "@/components/home/gamificationstat";
import StatisticsSection from "@/components/home/statssection";

export default function SectionHeader({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[17px] font-semibold text-neutral-900">
        {title}
      </Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text
            className="text-[13px] font-medium"
            style={{ color: colors.primary[700] }}
          >
            {t("common.viewAll") ?? "View all"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}