import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { getLevelForXP, getLevelNumber } from '@/utils/achievements';

interface LevelIndicatorProps {
  xp: number;
  showLabel?: boolean;
}

export function LevelIndicator({ xp, showLabel = true }: LevelIndicatorProps) {
  const { t } = useTranslation();
  const level = getLevelForXP(xp);
  const levelNumber = getLevelNumber(xp);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.number}>{levelNumber}</Text>
      </View>
      {showLabel && (
        <Text style={styles.label}>{t(level.labelKey)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.surface,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary[800],
  },
});
