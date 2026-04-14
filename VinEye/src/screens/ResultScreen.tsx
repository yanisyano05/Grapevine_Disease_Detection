import { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/Badge';
import { getCepageById } from '@/utils/cepages';
import { colors } from '@/theme/colors';
import type { RootStackParamList } from '@/types/navigation';
import type { DetectionResult } from '@/types/detection';

type ResultNav = NativeStackNavigationProp<RootStackParamList, 'Result'>;
type ResultRoute = RouteProp<RootStackParamList, 'Result'>;

function getResultColor(result: DetectionResult): string {
  if (result === 'vine') return colors.success;
  if (result === 'uncertain') return colors.warning;
  return colors.danger;
}

function InfoCard({ icon, iconColor, label, value }: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View className="w-[48%] gap-1 rounded-[14px] bg-white p-[14px] shadow-sm" style={{ elevation: 1 }}>
      <View
        className="h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: iconColor + '18' }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="text-[11px] text-neutral-500">{label}</Text>
      <Text className="text-[15px] font-semibold text-neutral-900">{value}</Text>
    </View>
  );
}

export default function ResultScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ResultNav>();
  const route = useRoute<ResultRoute>();
  const { detection } = route.params;

  const cepage = detection.cepageId ? getCepageById(detection.cepageId) : undefined;
  const resultColor = getResultColor(detection.result);

  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.8);
  const cardTranslateY = useSharedValue(30);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 400 });
    headerScale.value = withTiming(1, { duration: 500 });
    cardTranslateY.value = withDelay(250, withTiming(0, { duration: 400 }));
    cardOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const resultLabel =
    detection.result === 'vine'
      ? t('result.vineDetected')
      : detection.result === 'uncertain'
      ? t('result.uncertain')
      : t('result.notVine');

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-5 p-4 pb-12">
        {/* Close button */}
        <TouchableOpacity
          className="h-8 w-8 items-center justify-center self-end rounded-full bg-neutral-200"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={20} color={colors.neutral[700]} />
        </TouchableOpacity>

        {/* Confidence circle */}
        <Animated.View className="items-center gap-3 py-4" style={headerStyle}>
          <ProgressCircle
            size={100}
            strokeWidth={8}
            progress={detection.confidence / 100}
            color={resultColor}
            trackColor={resultColor + '25'}
          >
            <Text className="text-[20px] font-extrabold" style={{ color: resultColor }}>
              {detection.confidence}%
            </Text>
          </ProgressCircle>

          {/* Success message with checkmark */}
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name={detection.result === 'vine' ? 'checkmark-circle' : detection.result === 'uncertain' ? 'help-circle' : 'close-circle'}
              size={20}
              color={resultColor}
            />
            <Text className="text-[13px] font-medium" style={{ color: resultColor }}>
              {resultLabel}
            </Text>
          </View>
        </Animated.View>

        {/* Plant name + tags + description + info grid */}
        {cepage && detection.result === 'vine' && (
          <Animated.View style={cardStyle}>
            <Text className="mb-1 text-[24px] font-bold text-neutral-900">{cepage.name.fr}</Text>

            {/* Tags */}
            <View className="mb-5 flex-row flex-wrap gap-2">
              <Badge
                label={cepage.color === 'rouge' ? '🍷 Rouge' : cepage.color === 'blanc' ? '🥂 Blanc' : '🌸 Rosé'}
                color="neutral"
                size="sm"
              />
              {cepage.regions.slice(0, 2).map((r) => (
                <Badge key={r} label={r} color="neutral" size="sm" />
              ))}
            </View>

            {/* Description */}
            <View className="mb-4 gap-1">
              <Text className="text-[17px] font-semibold text-neutral-900">
                {t('result.characteristics')}
              </Text>
              <Text className="text-[13px] leading-[22px] text-neutral-600">
                {cepage.characteristics.fr}
              </Text>
            </View>

            {/* 2x2 info grid */}
            <View className="flex-row flex-wrap gap-[10px]">
              <InfoCard icon="leaf" iconColor={colors.primary[700]} label={t('result.origin')} value={cepage.origin.fr} />
              <InfoCard icon="water" iconColor="#2196F3" label={t('scanner.confidence')} value={`${detection.confidence}%`} />
              <InfoCard icon="sunny" iconColor="#FF9800" label={t('result.regions')} value={cepage.regions[0] ?? '—'} />
              <InfoCard icon="wine" iconColor="#E91E63" label="Type" value={cepage.color === 'rouge' ? 'Rouge' : cepage.color === 'blanc' ? 'Blanc' : 'Rosé'} />
            </View>
          </Animated.View>
        )}

        {/* Action buttons */}
        <Animated.View className="mt-2 gap-2" style={cardStyle}>
          <Button
            variant="default"
            size="lg"
            className="w-full rounded-[14px]"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="scan" size={18} color={colors.surface} />
            <Text className="text-white">{t('result.scanAgain')}</Text>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full rounded-[14px]"
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: colors.primary[700] }}>{t('result.viewHistory')}</Text>
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
