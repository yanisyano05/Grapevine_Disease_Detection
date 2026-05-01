import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useTranslation } from 'react-i18next';

interface ConfidenceMeterProps {
  confidence: number; // 0–100
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return colors.success;
  if (confidence >= 40) return colors.warning;
  return colors.danger;
}

export function ConfidenceMeter({ confidence }: ConfidenceMeterProps) {
  const { t } = useTranslation();
  const animatedWidth = useSharedValue(0);
  const barColor = getConfidenceColor(confidence);

  useEffect(() => {
    animatedWidth.value = withTiming(confidence / 100, { duration: 500 });
  }, [confidence]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
    backgroundColor: barColor,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{t('scanner.confidence')}</Text>
        <Text style={[styles.value, { color: barColor }]}>{confidence}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: spacing.base, gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: typography.fontSizes.sm, color: colors.surface, fontWeight: typography.fontWeights.medium, opacity: 0.9 },
  value: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
  track: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
});
