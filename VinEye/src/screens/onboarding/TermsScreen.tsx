import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { TermsCheckbox } from '@/components/onboarding/TermsCheckbox';
import { useAuth } from '@/contexts/AuthContext';
import type { OnboardingParamList } from '@/types/navigation';
import { colors } from '@/theme/colors';

type Nav = NativeStackNavigationProp<OnboardingParamList, 'Terms'>;

const SECTION_KEYS = [
  'usage',
  'dataCollected',
  'responsibility',
  'intellectualProperty',
  'contact',
] as const;

export default function TermsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { acceptTerms } = useAuth();

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue() {
    if (!accepted || submitting) return;
    setSubmitting(true);
    try {
      await acceptTerms();
      navigation.navigate('AuthChoice');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-2">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          className="w-10 h-10 rounded-full items-center justify-center bg-white border border-gray-200 active:opacity-70"
        >
          <ChevronLeft size={20} color={colors.neutral[800]} />
        </Pressable>
        <Text className="flex-1 text-[18px] font-bold text-[#1A1A1A] ml-1">
          {t('onboarding.terms.title')}
        </Text>
      </View>

      {/* Sections scrollable */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)} className="gap-5">
          {SECTION_KEYS.map((key) => (
            <View key={key}>
              <Text className="text-[16px] font-bold text-[#1A1A1A] mb-2">
                {t(`onboarding.terms.${key}.title`)}
              </Text>
              <Text className="text-[14px] text-[#4A4A4A] leading-[22px]">
                {t(`onboarding.terms.${key}.body`)}
              </Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Footer fixe */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="mb-4">
          <TermsCheckbox
            checked={accepted}
            onChange={setAccepted}
            label={t('onboarding.terms.checkboxLabel')}
          />
        </View>
        <OnboardingButton
          variant="primary"
          disabled={!accepted}
          loading={submitting}
          onPress={handleContinue}
        >
          {t('onboarding.terms.continueButton')}
        </OnboardingButton>
      </View>
    </SafeAreaView>
  );
}
