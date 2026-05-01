import { useState } from 'react';
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { toast } from 'sonner-native';

import { Text } from '@/components/ui/text';
import { EmailNameForm } from '@/components/onboarding/EmailNameForm';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useAuth } from '@/contexts/AuthContext';
import type { OnboardingParamList } from '@/types/navigation';
import { colors } from '@/theme/colors';

type Nav = NativeStackNavigationProp<OnboardingParamList, 'AuthChoice'>;

export default function AuthChoiceScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { login, loginAsGuest, completeOnboarding } = useAuth();

  const [creating, setCreating] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  async function handleCreateAccount({
    name,
    email,
  }: {
    name: string;
    email: string;
  }) {
    if (creating) return;
    setCreating(true);
    try {
      await login(name, email);
      await completeOnboarding();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('auth.errors.network');
      toast.error(t('auth.errors.signupFailed'), { description: message });
    } finally {
      setCreating(false);
    }
  }

  async function handleGuestLogin() {
    if (guestLoading) return;
    setGuestLoading(true);
    try {
      await loginAsGuest();
      await completeOnboarding();
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 gap-2">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            className="w-10 h-10 rounded-full items-center justify-center bg-white border border-gray-200 active:opacity-70"
          >
            <ChevronLeft size={20} color={colors.neutral[800]} />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 24, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(400)}>
            <Text className="text-2xl font-bold text-[#1A1A1A]">
              {t('onboarding.authChoice.title')}
            </Text>
            <Text className="mt-2 text-sm text-[#8E8E93] leading-5">
              {t('onboarding.authChoice.subtitle')}
            </Text>

            <View className="mt-6">
              <EmailNameForm
                onSubmit={handleCreateAccount}
                submitting={creating}
              />
            </View>

            {/* Séparateur */}
            <View className="flex-row items-center my-6 gap-3">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-xs uppercase tracking-[1px] text-[#8E8E93]">
                {t('onboarding.authChoice.or')}
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <OnboardingButton
              variant="secondary"
              loading={guestLoading}
              onPress={handleGuestLogin}
            >
              {t('onboarding.authChoice.continueAsGuest')}
            </OnboardingButton>

            <Text className="mt-4 text-xs text-[#8E8E93] text-center leading-4">
              {t('onboarding.authChoice.footerHint')}
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
