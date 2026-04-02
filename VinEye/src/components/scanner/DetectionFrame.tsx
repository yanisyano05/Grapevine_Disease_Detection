import { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface DetectionFrameProps {
  size?: number;
  active?: boolean;
  style?: ViewStyle;
}

export function DetectionFrame({ size = 240, active = true, style }: DetectionFrameProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(withTiming(1.02, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 1000 }), withTiming(0.5, { duration: 1000 })),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(0.7);
    }
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.frame, { width: size, height: size }, animStyle, style]} />
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
});
