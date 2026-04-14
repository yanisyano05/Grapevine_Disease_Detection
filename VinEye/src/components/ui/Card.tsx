import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
}

export function Card({ children, style, variant = 'default', padding = 'base' }: CardProps) {
  return (
    <View style={[styles.base, VARIANT_STYLES[variant], { padding: spacing[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    backgroundColor: colors.card,
  },
});

const VARIANT_STYLES: Record<'default' | 'elevated' | 'outlined', ViewStyle> = {
  default: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  elevated: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    shadowOpacity: 0,
    elevation: 0,
  },
};
