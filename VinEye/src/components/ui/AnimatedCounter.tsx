import { useEffect } from 'react';
import { Text, type TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import { typography } from '@/theme/typography';
import { colors } from '@/theme/colors';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  duration?: number;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  style,
  duration = 600,
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration });
  }, [value, duration]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${prefix}${Math.floor(animatedValue.value)}${suffix}`,
  }));

  return (
    <AnimatedText
      style={[{ fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.primary[800] }, style]}
      // @ts-expect-error animatedProps text property
      animatedProps={animatedProps}
    />
  );
}
