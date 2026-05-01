import { ActivityIndicator, Pressable } from 'react-native';

import { Text } from '@/components/ui/text';

interface OnboardingButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

export function OnboardingButton({
  variant = 'primary',
  disabled = false,
  loading = false,
  onPress,
  children,
}: OnboardingButtonProps) {
  const isInactive = disabled || loading;
  const baseClass = 'h-14 rounded-2xl items-center justify-center w-full';
  const variantClass =
    variant === 'primary'
      ? 'bg-[#2D6A4F]'
      : 'bg-white border border-gray-200';
  const labelClass =
    variant === 'primary'
      ? 'text-white font-semibold text-[15px]'
      : 'text-[#1A1A1A] font-semibold text-[15px]';

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      className={`${baseClass} ${variantClass} ${
        isInactive ? 'opacity-40' : 'active:opacity-80'
      }`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#1A1A1A'}
        />
      ) : (
        <Text className={labelClass}>{children}</Text>
      )}
    </Pressable>
  );
}
