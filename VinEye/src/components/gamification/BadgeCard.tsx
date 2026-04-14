import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import type { Badge } from '@/types/gamification';

interface BadgeCardProps {
  badge: Badge;
  showNewAnimation?: boolean;
}

export function BadgeCard({ badge, showNewAnimation = false }: BadgeCardProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (showNewAnimation && badge.unlocked) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0.3, { duration: 600 }),
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 800 })
      );
    }
  }, [showNewAnimation, badge.unlocked]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, !badge.unlocked && styles.locked, animStyle]}>
      {badge.unlocked && (
        <Animated.View style={[styles.glow, glowStyle]} />
      )}
      <Text style={[styles.icon, !badge.unlocked && styles.lockedIcon]}>
        {badge.icon}
      </Text>
      <Text style={[styles.name, !badge.unlocked && styles.lockedText]} numberOfLines={1}>
        {t(badge.nameKey)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 88, alignItems: 'center', gap: spacing.xs, padding: spacing.sm,
    borderRadius: 12, backgroundColor: colors.primary[100],
    position: 'relative', overflow: 'hidden',
  },
  locked: { backgroundColor: colors.neutral[200] },
  glow: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.accent[400], borderRadius: 12 },
  icon: { fontSize: 32 },
  lockedIcon: { opacity: 0.3 },
  name: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.primary[800], textAlign: 'center' },
  lockedText: { color: colors.neutral[500] },
});
