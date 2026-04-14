import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { getXPProgress, getNextLevel, getLevelForXP } from '@/utils/achievements';

interface XPBarProps {
  xp: number;
  compact?: boolean;
}

export function XPBar({ xp, compact = false }: XPBarProps) {
  const { t } = useTranslation();
  const { current, total, ratio } = getXPProgress(xp);
  const nextLevel = getNextLevel(xp);
  const currentLevel = getLevelForXP(xp);
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(ratio, { duration: 800 });
  }, [ratio]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactLevel}>{t(currentLevel.labelKey)}</Text>
        <View style={styles.trackCompact}>
          <Animated.View style={[styles.bar, barStyle]} />
        </View>
        <Text style={styles.compactXP}>{xp} XP</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.levelLabel}>{t(currentLevel.labelKey)}</Text>
        {nextLevel && (
          <Text style={styles.xpLabel}>{current}/{total} XP</Text>
        )}
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
      {nextLevel && (
        <Text style={styles.nextLevelLabel}>
          {t('levels.xpToNext', { xp: total - current })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  compactContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelLabel: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.primary[800] },
  xpLabel: { fontSize: typography.fontSizes.xs, color: colors.neutral[600] },
  track: { height: 8, backgroundColor: colors.neutral[200], borderRadius: 4, overflow: 'hidden' },
  trackCompact: { flex: 1, height: 5, backgroundColor: colors.neutral[200], borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: colors.primary[700], borderRadius: 4 },
  nextLevelLabel: { fontSize: typography.fontSizes.xs, color: colors.neutral[500], textAlign: 'right' },
  compactLevel: { fontSize: typography.fontSizes.xs, color: colors.primary[700], fontWeight: typography.fontWeights.medium, minWidth: 70 },
  compactXP: { fontSize: typography.fontSizes.xs, color: colors.neutral[600], minWidth: 50, textAlign: 'right' },
});
