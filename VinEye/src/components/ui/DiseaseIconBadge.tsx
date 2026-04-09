import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { getDiseaseVisual } from "@/utils/diseaseIcons";

interface DiseaseIconBadgeProps {
  diseaseId: string;
  size?: "sm" | "md" | "lg";
  staggerIndex?: number;
}

const SIZES = {
  sm: { container: 44, icon: 24, radius: 14 },
  md: { container: 56, icon: 26, radius: 16 },
  lg: { container: 72, icon: 32, radius: 20 },
};

export default function DiseaseIconBadge({
  diseaseId,
  size = "md",
  staggerIndex = 0,
}: DiseaseIconBadgeProps) {
  const visual = getDiseaseVisual(diseaseId);
  const IconComponent = visual.icon;
  const dim = SIZES[size];

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Mount animation with stagger
  useEffect(() => {
    const delay = staggerIndex * 100;
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 300 }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  function handlePressIn() {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 200 });
  }

  function handlePressOut() {
    scale.value = withSequence(
      withSpring(1.1, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
  }

  function handleLongPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withTiming(1, { duration: 80 }),
    );
  }

  return (
    <Animated.View
      style={[animStyle, { width: dim.container, height: dim.container }]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <LinearGradient
        colors={[visual.bgGradientStart, visual.bgGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            width: dim.container,
            height: dim.container,
            borderRadius: dim.radius,
          },
        ]}
      >
        <IconComponent
          size={dim.icon}
          color={visual.iconColor}
          strokeWidth={1.8}
        />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: "center",
    justifyContent: "center",
  },
});
