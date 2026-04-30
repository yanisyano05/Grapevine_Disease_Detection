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

export function LargeDiseaseCardCompactSkeleton() {
  return (
    <View style={skeletonStyles.compactCard}>
      <View style={skeletonStyles.compactHeader}>
        <Skeleton width={70} height={22} borderRadius={999} />
        <Skeleton width={36} height={36} borderRadius={999} />
      </View>
      <View style={{ gap: 8, marginTop: 16 }}>
        <Skeleton width="80%" height={20} borderRadius={6} />
        <Skeleton width="100%" height={12} borderRadius={4} />
        <Skeleton width="70%" height={12} borderRadius={4} />
      </View>
      <View style={skeletonStyles.compactFooter}>
        <Skeleton width={80} height={24} borderRadius={999} />
        <Skeleton width={40} height={40} borderRadius={999} />
      </View>
    </View>
  );
}

export function ScanListItemSkeleton({
  showSeparator = false,
}: { showSeparator?: boolean } = {}) {
  return (
    <View>
      <View style={skeletonStyles.scanRow}>
        <Skeleton width={64} height={64} borderRadius={16} />
        <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
          <Skeleton width="70%" height={16} borderRadius={6} />
          <Skeleton width={70} height={20} borderRadius={999} />
          <Skeleton width="40%" height={12} borderRadius={4} />
        </View>
        <Skeleton width={44} height={44} borderRadius={999} />
      </View>
      {showSeparator && <View style={skeletonStyles.separator} />}
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
  compactCard: {
    width: "100%",
    minHeight: 220,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    padding: 20,
    justifyContent: "space-between",
  },
  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  scanRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 92,
  },
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#E5E7EB",
  },
});
