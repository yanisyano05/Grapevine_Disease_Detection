import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useTranslation } from 'react-i18next';

interface StreakCounterProps {
  streak: number;
  compact?: boolean;
}

export function StreakCounter({ streak, compact = false }: StreakCounterProps) {
  const { t } = useTranslation();

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <Ionicons name="flame" size={16} color={colors.accent[700]} />
        <Text style={styles.compactValue}>{streak}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="flame" size={24} color={colors.accent[700]} />
      <Text style={styles.value}>{streak}</Text>
      <Text style={styles.label}>{t('profile.days')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.accent[700],
  },
  label: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral[600],
  },
  compactValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent[700],
  },
});
