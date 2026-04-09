import { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface AnimatedSegmentedControlProps {
  tabs: string[];
  activeIndex: number;
  onTabChange: (index: number) => void;
}

const INDICATOR_PADDING = 3;

export default function AnimatedSegmentedControl({
  tabs,
  activeIndex,
  onTabChange,
}: AnimatedSegmentedControlProps) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(activeIndex, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = 100 / tabs.length;
    return {
      width: `${tabWidth}%` as any,
      left: `${translateX.value * tabWidth}%` as any,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {/* Animated indicator */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {/* Tab labels */}
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => onTabChange(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeIndex === index && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  track: {
    flexDirection: "row",
    backgroundColor: "rgba(120, 120, 128, 0.12)",
    borderRadius: 12,
    padding: INDICATOR_PADDING,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: INDICATOR_PADDING,
    bottom: INDICATOR_PADDING,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  tabTextActive: {
    color: "#1A1A1A",
    fontWeight: "600",
  },
});
