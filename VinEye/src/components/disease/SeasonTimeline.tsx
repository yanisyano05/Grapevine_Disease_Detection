import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";

interface SeasonTimelineProps {
  startMonth: number;
  endMonth: number;
  peakMonth: number;
  activeColor: string;
}

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function SeasonTimeline({
  startMonth,
  endMonth,
  peakMonth,
  activeColor,
}: SeasonTimelineProps) {
  // Convert 1-indexed months to 0-indexed for display
  const start = startMonth - 1;
  const end = endMonth - 1;
  const peak = peakMonth - 1;

  function isActive(index: number): boolean {
    if (start <= end) {
      return index >= start && index <= end;
    }
    // Wraps around year (e.g. Nov → Feb)
    return index >= start || index <= end;
  }

  return (
    <View style={styles.container}>
      {/* Bar */}
      <View style={styles.track}>
        {MONTHS.map((_, index) => {
          const active = isActive(index);
          const isPeak = index === peak;
          return (
            <View
              key={index}
              style={[
                styles.segment,
                active && { backgroundColor: activeColor },
                isPeak && styles.peakSegment,
                isPeak && { backgroundColor: activeColor },
                index === 0 && styles.segmentFirst,
                index === 11 && styles.segmentLast,
              ]}
            >
              {isPeak && <View style={[styles.peakDot, { backgroundColor: "#FFFFFF" }]} />}
            </View>
          );
        })}
      </View>

      {/* Month labels */}
      <View style={styles.labels}>
        {MONTHS.map((label, index) => {
          const active = isActive(index);
          return (
            <Text
              key={index}
              style={[
                styles.monthLabel,
                active && styles.monthLabelActive,
                index === peak && styles.monthLabelPeak,
              ]}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  track: {
    flexDirection: "row",
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentFirst: {
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  segmentLast: {
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  peakSegment: {
    opacity: 1,
  },
  peakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labels: {
    flexDirection: "row",
    marginTop: 6,
  },
  monthLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "400",
    color: "#BDBDBD",
    textAlign: "center",
  },
  monthLabelActive: {
    color: "#6B6B6B",
    fontWeight: "500",
  },
  monthLabelPeak: {
    fontWeight: "700",
    color: "#1A1A1A",
  },
});
