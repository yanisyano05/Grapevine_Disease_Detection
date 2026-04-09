import { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";
import { getGuideVisual } from "@/utils/guideIcons";
import type { Guide } from "@/data/guides";

interface GuideListItemProps {
  guide: Guide;
  onPress: () => void;
  showSeparator?: boolean;
  index?: number;
}

export default function GuideListItem({
  guide,
  onPress,
  showSeparator = true,
  index = 0,
}: GuideListItemProps) {
  const { t } = useTranslation();
  const visual = getGuideVisual(guide.category);
  const IconComponent = visual.icon;

  // Stagger animation
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  useEffect(() => {
    const delay = index * 50;
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 200 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  // Build subtitle
  const subtitle = t(guide.subtitle);
  const readTimeLabel = guide.readTime ? `${guide.readTime} min` : "";
  const subtitleText = subtitle && readTimeLabel
    ? `${subtitle} · ${readTimeLabel}`
    : subtitle || readTimeLabel;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onPress}
        style={styles.container}
      >
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: visual.bgColor }]}>
          <IconComponent size={22} color={visual.iconColor} strokeWidth={1.8} />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {t(guide.title)}
          </Text>
          {subtitleText ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitleText}
            </Text>
          ) : null}
        </View>

        {/* Chevron */}
        <ChevronRight size={18} color="#C7C7CC" strokeWidth={2} />
      </TouchableOpacity>

      {/* Separator (indented to align with text) */}
      {showSeparator && <View style={styles.separator} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#8E8E93",
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 74, // 16 padding + 44 icon + 14 gap = indented to text start
  },
});
