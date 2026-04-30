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
import { colors } from '@/theme/colors';
import { CLASS_TO_LABEL_KEY, CLASS_TO_SLUG } from '@/services/ml/classes';
import type { RootStackParamList } from '@/types/navigation';
import type { Detection, DetectionResult, DiseaseClass } from '@/types/detection';

type ResultNav = NativeStackNavigationProp<RootStackParamList, 'Result'>;
type ResultRoute = RouteProp<RootStackParamList, 'Result'>;

function getStatusColor(detection: Detection): string {
  if (detection.diseaseClass === 'healthy' && detection.result === 'vine') return colors.success;
  if (detection.result === 'vine') return colors.danger;
  if (detection.result === 'uncertain') return colors.warning;
  return colors.neutral[500];
}

function getStatusIcon(detection: Detection): keyof typeof Ionicons.glyphMap {
  if (detection.diseaseClass === 'healthy' && detection.result === 'vine') return 'checkmark-circle';
  if (detection.result === 'vine') return 'alert-circle';
  if (detection.result === 'uncertain') return 'help-circle';
  return 'close-circle';
}

function getStatusLabel(detection: Detection, t: (k: string) => string): string {
  if (detection.diseaseClass === 'healthy' && detection.result === 'vine') {
    return t('result.healthy');
  }
  if (detection.result === 'vine' && detection.diseaseClass) {
    return t(CLASS_TO_LABEL_KEY[detection.diseaseClass]);
  }
  if (detection.result === 'uncertain') return t('result.uncertain');
  return t('result.notVine');
}

export default function ResultScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ResultNav>();
  const route = useRoute<ResultRoute>();
  const { detection } = route.params;

  const statusColor = getStatusColor(detection);
  const statusIcon = getStatusIcon(detection);
  const statusLabel = getStatusLabel(detection, t);

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

  const diseaseSlug = detection.diseaseSlug;
  const showDiseaseCta = detection.result === 'vine' && diseaseSlug;
  const showHealthy = detection.result === 'vine' && detection.diseaseClass === 'healthy';

  function handleViewDisease() {
    if (!diseaseSlug) return;
    navigation.navigate('DiseaseDetail', { diseaseId: diseaseSlug.replace(/-/g, '_') });
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-5 p-4 pb-12">
        <TouchableOpacity
          className="h-8 w-8 items-center justify-center self-end rounded-full bg-neutral-200"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={20} color={colors.neutral[700]} />
        </TouchableOpacity>

        <Animated.View className="items-center gap-3 py-4" style={headerStyle}>
          <ProgressCircle
            size={100}
            strokeWidth={8}
            progress={detection.confidence / 100}
            color={statusColor}
            trackColor={statusColor + '25'}
          >
            <Text className="text-[20px] font-extrabold" style={{ color: statusColor }}>
              {detection.confidence}%
            </Text>
          </ProgressCircle>

          <View className="flex-row items-center gap-1.5">
            <Ionicons name={statusIcon} size={20} color={statusColor} />
            <Text className="text-[13px] font-medium" style={{ color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
        </Animated.View>

        {showHealthy && (
          <Animated.View style={cardStyle} className="gap-2 rounded-[20px] bg-white p-5 shadow-sm">
            <Text className="text-[20px] font-bold text-neutral-900">
              {t('result.healthyTitle')}
            </Text>
            <Text className="text-[13px] leading-[22px] text-neutral-600">
              {t('result.healthyMessage')}
            </Text>
          </Animated.View>
        )}

        {showDiseaseCta && !showHealthy && (
          <Animated.View style={cardStyle}>
            <Text className="mb-1 text-[24px] font-bold text-neutral-900">
              {statusLabel}
            </Text>

            <View className="mb-5 flex-row flex-wrap gap-2">
              <Badge label={t('result.detectedDisease')} color="warning" size="sm" />
              {detection.allProbabilities && (
                <Badge
                  label={`${detection.confidence}% ${t('result.confidence')}`}
                  color="neutral"
                  size="sm"
                />
              )}
            </View>

            {detection.allProbabilities && (
              <View className="mb-4 gap-2 rounded-[14px] bg-white p-4 shadow-sm">
                <Text className="text-[13px] font-semibold text-neutral-700">
                  {t('result.allProbabilities')}
                </Text>
                {detection.allProbabilities
                  .slice()
                  .sort((a, b) => b.probability - a.probability)
                  .map((p) => (
                    <ProbabilityRow
                      key={p.class}
                      label={t(CLASS_TO_LABEL_KEY[p.class])}
                      value={p.probability}
                      isTop={p.class === detection.diseaseClass}
                    />
                  ))}
              </View>
            )}
          </Animated.View>
        )}

        {detection.result === 'uncertain' && (
          <Animated.View style={cardStyle} className="gap-2 rounded-[20px] bg-white p-5 shadow-sm">
            <Text className="text-[20px] font-bold text-neutral-900">
              {t('result.uncertainTitle')}
            </Text>
            <Text className="text-[13px] leading-[22px] text-neutral-600">
              {t('result.uncertainMessage')}
            </Text>
          </Animated.View>
        )}

        <Animated.View className="mt-2 gap-2" style={cardStyle}>
          {showDiseaseCta && !showHealthy && (
            <Button
              variant="default"
              size="lg"
              className="w-full rounded-[14px]"
              onPress={handleViewDisease}
            >
              <Ionicons name="information-circle" size={18} color={colors.surface} />
              <Text className="text-white">{t('result.viewDiseaseDetail')}</Text>
            </Button>
          )}
          <Button
            variant={showDiseaseCta && !showHealthy ? 'ghost' : 'default'}
            size="lg"
            className="w-full rounded-[14px]"
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="scan"
              size={18}
              color={showDiseaseCta && !showHealthy ? colors.primary[700] : colors.surface}
            />
            <Text style={{ color: showDiseaseCta && !showHealthy ? colors.primary[700] : '#fff' }}>
              {t('result.scanAgain')}
            </Text>
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProbabilityRow({ label, value, isTop }: { label: string; value: number; isTop: boolean }) {
  const percent = Math.round(value * 100);
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text
          className={`text-[12px] ${isTop ? 'font-semibold text-neutral-900' : 'text-neutral-600'}`}
        >
          {label}
        </Text>
        <Text
          className={`text-[12px] ${isTop ? 'font-semibold text-neutral-900' : 'text-neutral-500'}`}
        >
          {percent}%
        </Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: isTop ? colors.primary[700] : colors.neutral[400],
          }}
        />
      </View>
    </View>
  );
}
