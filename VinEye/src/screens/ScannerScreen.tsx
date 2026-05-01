import { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';

import { CameraOverlay } from '@/components/scanner/CameraOverlay';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useDetection } from '@/hooks/useDetection';
import { loadModel } from '@/services/tflite/model';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useHistory } from '@/hooks/useHistory';
import { useScanLocation } from '@/hooks/useScanLocation';
import { hapticSuccess, hapticLight } from '@/services/haptics';
import { colors } from '@/theme/colors';
import type { RootStackParamList } from '@/types/navigation';
import type { ScanRecord } from '@/types/detection';

type ScannerNav = NativeStackNavigationProp<RootStackParamList>;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ScannerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ScannerNav>();
  const [permission, requestPermission] = useCameraPermissions();
  const { analyze, isAnalyzing } = useDetection();
  const { processDetection } = useGameProgress();
  const { addScan } = useHistory();
  const { requestAndGetLocation } = useScanLocation();
  const [liveConfidence, setLiveConfidence] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<CameraView>(null);

  async function handleToggleFacing() {
    if (isAnalyzing) return;
    await hapticLight();
    const next = facing === 'back' ? 'front' : 'back';
    setFacing(next);
    if (next === 'front') {
      toast.info(t('scanner.frontWarningTitle'), {
        description: t('scanner.frontWarningDescription'),
      });
    }
  }

  const shutterScale = useSharedValue(1);
  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Préchargement du modèle TFLite dès le mount du Scanner — évite de bloquer
  // la 1ère capture par le download/decode du modèle (~1-2s).
  useEffect(() => {
    let cancelled = false;
    loadModel()
      .then((ok) => {
        if (cancelled) return;
        if (!ok) {
          console.warn('[Scanner] Model preload failed — fallback mock will be used');
        } else if (__DEV__) {
          console.log('[Scanner] Model preloaded');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('[Scanner] Model preload error:', err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function processImage(imageUri: string) {
    const interval = setInterval(() => {
      setLiveConfidence((prev) => Math.min(prev + Math.floor(Math.random() * 12), 85));
    }, 150);

    const [detection, coords] = await Promise.all([
      analyze(imageUri),
      requestAndGetLocation(),
    ]);
    clearInterval(interval);

    if (!detection) {
      setLiveConfidence(0);
      return;
    }

    setLiveConfidence(detection.confidence);

    if (detection.result === 'vine') {
      await hapticSuccess();
    }

    const xpEarned = await processDetection(detection);

    const record: ScanRecord = {
      id: generateId(),
      detection,
      xpEarned: typeof xpEarned === 'number' ? xpEarned : 10,
      createdAt: new Date().toISOString(),
      ...(coords && {
        latitude: coords.latitude,
        longitude: coords.longitude,
        locationCapturedAt: coords.capturedAt,
      }),
    };

    await addScan(record);
    navigation.navigate('Result', { detection });
    setTimeout(() => setLiveConfidence(0), 500);
  }

  async function handleCapture() {
    if (isAnalyzing) return;

    if (!cameraRef.current) {
      Alert.alert(t('common.error'), 'Camera not initialized');
      return;
    }
    if (!isCameraReady) {
      Alert.alert(t('common.error'), 'Camera is not ready yet — please wait.');
      return;
    }

    await hapticLight();

    shutterScale.value = withSequence(
      withTiming(0.88, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );

    let imageUri: string | undefined;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
        exif: false,
      });
      imageUri = photo?.uri;
      if (__DEV__) {
        console.log('[Scanner] Captured photo:', imageUri);
      }
    } catch (err) {
      setLiveConfidence(0);
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[Scanner] takePictureAsync failed:', message);
      Alert.alert(t('common.error'), `Capture failed: ${message}`);
      return;
    }

    if (!imageUri) {
      setLiveConfidence(0);
      return;
    }

    await processImage(imageUri);
  }

  async function handlePickFromGallery() {
    // TODO: réactiver après rebuild natif Android (expo prebuild + run:android)
    // pour ajouter `expo-image-picker` au build natif
    await hapticLight();
    toast.info(t('scanner.galleryComingSoonTitle'), {
      description: t('scanner.galleryComingSoonDescription'),
    });
  }

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAFA]">
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-[#FAFAFA] p-8">
        <Text className="text-[64px]">📷</Text>
        <Text className="text-center text-[20px] font-bold text-neutral-900">
          {t('scanner.permissionRequired')}
        </Text>
        <Text className="mb-4 text-center text-[15px] leading-6 text-neutral-600">
          {t('scanner.permissionMessage')}
        </Text>
        <Button onPress={requestPermission} size="lg" variant="default" className="w-full">
          <Text className="text-white">{t('scanner.grantPermission')}</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-900">
      <CameraView
        ref={cameraRef}
        className="flex-1"
        style={{ flex: 1 }}
        facing={facing}
        onCameraReady={() => setIsCameraReady(true)}
        onMountError={(e) => {
          console.warn('[Scanner] Camera mount error:', e);
          Alert.alert(t('common.error'), `Camera mount: ${e.message ?? 'unknown'}`);
        }}
      >
        <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-10">
          <View className="flex-row items-center justify-between px-5 py-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="leaf" size={18} color={colors.surface} />
              <Text className="text-[15px] font-semibold text-white">
                {t('scanner.identify') ?? 'Identify the plant'}
              </Text>
            </View>
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={22} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <CameraOverlay isScanning={isAnalyzing} confidence={liveConfidence} />

        {isAnalyzing && (
          <View
            className="absolute inset-0 z-20 items-center justify-center px-8"
            style={{ backgroundColor: 'rgba(20,20,20,0.96)' }}
          >
            <View className="w-full max-w-[320px] items-center gap-4">
              <Skeleton width={120} height={120} borderRadius={24} />
              <Skeleton width="80%" height={24} borderRadius={8} />
              <Skeleton width="60%" height={16} borderRadius={6} />
            </View>
            <View className="mt-8 items-center gap-1.5">
              <Text className="text-white text-lg font-bold">
                {t('scanner.analyzingTitle')}
              </Text>
              <Text className="text-white/70 text-sm">
                {t('scanner.analyzingSubtitle')}
              </Text>
            </View>
          </View>
        )}

        <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between px-8 pb-12 pt-5">
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-lg"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
              opacity: isAnalyzing ? 0.4 : 1,
            }}
            onPress={handlePickFromGallery}
            disabled={isAnalyzing}
            accessibilityLabel={t('scanner.pickFromGallery')}
            activeOpacity={0.7}
          >
            <Ionicons name="image-outline" size={20} color={colors.surface} />
          </TouchableOpacity>

          <Animated.View
            className="h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white"
            style={shutterStyle}
          >
            <TouchableOpacity
              className="h-[60px] w-[60px] items-center justify-center rounded-full bg-white"
              onPress={handleCapture}
              disabled={isAnalyzing || !isCameraReady}
              activeOpacity={0.8}
            >
              {isAnalyzing ? (
                <Text className="text-center text-[11px] font-semibold" style={{ color: colors.primary[800] }}>
                  {t('scanner.analyzing')}
                </Text>
              ) : (
                <View
                  className="h-[52px] w-[52px] rounded-full"
                  style={{ backgroundColor: isCameraReady ? '#fff' : colors.neutral[300] }}
                />
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              opacity: isAnalyzing ? 0.4 : 1,
            }}
            onPress={handleToggleFacing}
            disabled={isAnalyzing}
            accessibilityLabel={t('scanner.flipCamera')}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-reverse-outline" size={24} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}
