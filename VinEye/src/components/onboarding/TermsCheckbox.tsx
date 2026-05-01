import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

import { Text } from '@/components/ui/text';

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

export function TermsCheckbox({ checked, onChange, label }: TermsCheckboxProps) {
  const scale = useSharedValue(checked ? 1 : 0);
  const opacity = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    scale.value = withTiming(checked ? 1 : 0, { duration: 200 });
    opacity.value = withTiming(checked ? 1 : 0, { duration: 200 });
  }, [checked, scale, opacity]);

  const checkAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      className="flex-row items-center gap-3 active:opacity-70"
    >
      <View
        className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
          checked
            ? 'bg-[#2D6A4F] border-[#2D6A4F]'
            : 'bg-white border-gray-300'
        }`}
      >
        <Animated.View style={checkAnim}>
          <Check size={16} color="#FFFFFF" strokeWidth={3} />
        </Animated.View>
      </View>
      <Text className="flex-1 text-[14px] text-[#1A1A1A] leading-5">
        {label}
      </Text>
    </Pressable>
  );
}
