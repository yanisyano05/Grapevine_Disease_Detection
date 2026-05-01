import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { Camera, Leaf, Brain } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import type { OnboardingParamList } from '@/types/navigation';
import { colors } from '@/theme/colors';

type Nav = NativeStackNavigationProp<OnboardingParamList, 'Welcome'>;

const LOGO = require('../../assets/images/icon.png');

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const features = [
    {
      icon: Camera,
      title: t('onboarding.welcome.feature1Title'),
      desc: t('onboarding.welcome.feature1Desc'),
    },
    {
      icon: Leaf,
      title: t('onboarding.welcome.feature2Title'),
      desc: t('onboarding.welcome.feature2Desc'),
    },
    {
      icon: Brain,
      title: t('onboarding.welcome.feature3Title'),
      desc: t('onboarding.welcome.feature3Desc'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-8">
        <Animated.View
          entering={FadeIn.duration(500)}
          className="items-center mb-8"
        >
          <Image
            source={LOGO}
            style={{ width: 96, height: 96 }}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <Text className="text-3xl font-bold text-[#1A1A1A] text-center">
            {t('onboarding.welcome.title')}
          </Text>
          <Text className="mt-3 text-base text-[#8E8E93] text-center leading-6">
            {t('onboarding.welcome.subtitle')}
          </Text>
        </Animated.View>

        <View className="mt-10 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Animated.View
                key={f.title}
                entering={FadeInDown.delay(160 + i * 90).duration(500)}
                className="flex-row items-center gap-4 bg-white rounded-3xl p-5 border border-gray-100"
              >
                <View className="w-12 h-12 rounded-2xl bg-[#E8F5E9] items-center justify-center">
                  <Icon size={22} color={colors.primary[700]} strokeWidth={2.2} />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-[#1A1A1A]">
                    {f.title}
                  </Text>
                  <Text className="mt-0.5 text-[13px] text-[#8E8E93] leading-5">
                    {f.desc}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View className="flex-1" />

        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <OnboardingButton
            variant="primary"
            onPress={() => navigation.navigate('Terms')}
          >
            {t('onboarding.welcome.cta')}
          </OnboardingButton>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
