import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}

export default function Skeleton({ width, height, borderRadius = 12, style }: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as number, height, borderRadius },
        animStyle,
        style,
      ]}
    />
  );
}

export function DiseaseCardSkeleton({ style }: { style?: object }) {
  return <Skeleton width="100%" height={220} borderRadius={20} style={style} />;
}

export function GuideCardSkeleton() {
  return <Skeleton width="100%" height={180} borderRadius={20} style={{ marginBottom: 12 }} />;
}

export function CarouselCardSkeleton() {
  return <Skeleton width={160} height={140} borderRadius={24} />;
}

export function GuideListItemSkeleton() {
  return (
    <View style={skeletonStyles.listItem}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={skeletonStyles.listItemText}>
        <Skeleton width="60%" height={16} borderRadius={6} />
        <Skeleton width="40%" height={13} borderRadius={5} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  listItemText: {
    flex: 1,
  },
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#E5E7EB",
  },
});
