import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

type BadgeColor = 'success' | 'warning' | 'danger' | 'primary' | 'accent' | 'neutral';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, color = 'primary', size = 'md', style }: BadgeProps) {
  return (
    <View style={[styles.base, COLOR_STYLES[color], size === 'sm' && styles.small, style]}>
      <Text style={[styles.text, COLOR_TEXT[color], size === 'sm' && styles.smallText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: 0.3,
  },
  smallText: {
    fontSize: 10,
  },
});

const COLOR_STYLES: Record<BadgeColor, ViewStyle> = {
  success: { backgroundColor: '#E8F5E9' },
  warning: { backgroundColor: '#FFF3E0' },
  danger: { backgroundColor: '#FBE9E7' },
  primary: { backgroundColor: colors.primary[200] },
  accent: { backgroundColor: colors.accent[300] },
  neutral: { backgroundColor: colors.neutral[200] },
};

const COLOR_TEXT: Record<BadgeColor, { color: string }> = {
  success: { color: '#2E7D32' },
  warning: { color: '#E65100' },
  danger: { color: '#BF360C' },
  primary: { color: colors.primary[800] },
  accent: { color: colors.accent[800] },
  neutral: { color: colors.neutral[700] },
};
