import { useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  ChevronLeft,
  Star,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Calendar,
  Award,
  MapPin,
  Share2,
  Trash2,
  AlertCircle,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { toast } from 'sonner-native';

import { Text } from '@/components/ui/text';
import { useScanDetail } from '@/hooks/useScanDetail';
import { getCepageById } from '@/utils/cepages';
import { hapticSuccess } from '@/services/haptics';
import { colors } from '@/theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { DetectionResult } from '@/types/detection';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanDetail'>;

const RESULT_STYLES: Record<DetectionResult, { bg: string; text: string; Icon: typeof CheckCircle2; labelKey: string }> = {
  vine: { bg: '#E8F5E9', text: '#2D6A4F', Icon: CheckCircle2, labelKey: 'myPlants.detail.results.vine' },
  uncertain: { bg: '#FFF4E5', text: '#E67E22', Icon: HelpCircle, labelKey: 'myPlants.detail.results.uncertain' },
  not_vine: { bg: '#FFEBEE', text: '#C62828', Icon: XCircle, labelKey: 'myPlants.detail.results.notVine' },
};

const FALLBACK_IMAGE = require('../../assets/logo.png');

function formatDateLong(iso: string, locale: string): string {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return locale === 'fr' ? `${dateStr} à ${timeStr}` : `${dateStr} at ${timeStr}`;
}

export default function ScanDetailScreen({ route }: Props) {
  const { scanId } = route.params;
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { scan, loading, error, toggleFavorite, deleteScan } = useScanDetail(scanId);

  // Entry animation
  const contentY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (scan) {
      const timing = { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) };
      contentY.value = withTiming(0, timing);
      contentOpacity.value = withTiming(1, timing);
    }
  }, [scan, contentY, contentOpacity]);

  const contentAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOpacity.value,
  }));

  // Confidence bar animation
  const barWidth = useSharedValue(0);
  useEffect(() => {
    if (scan) {
      barWidth.value = withTiming(scan.detection.confidence, { duration: 600 });
    }
  }, [scan, barWidth]);

  const barAnim = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  // Loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[700]} />
      </View>
    );
  }

  // Error / not found
  if (error || !scan) {
    return (
      <View style={styles.centered}>
        <AlertCircle size={48} color={colors.neutral[400]} />
        <Text style={styles.errorText}>{t('myPlants.detail.notFound')}</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errorBtnText}>{t('myPlants.detail.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { detection } = scan;
  const cepage = detection.cepageId ? getCepageById(detection.cepageId) : null;
  const resultStyle = RESULT_STYLES[detection.result];
  const isFav = scan.isFavorite === true;
  const hasImage = !!detection.imageUri;

  const heroTitle = cepage
    ? cepage.name.fr
    : detection.result === 'vine'
      ? t('myPlants.detail.results.vine')
      : t('myPlants.detail.results.unidentified');

  async function handleToggleFavorite() {
    await toggleFavorite();
    hapticSuccess();
    toast.success(isFav ? t('myPlants.toasts.unfavorited') : t('myPlants.toasts.favorited'));
  }

  function handleDelete() {
    Alert.alert(
      t('myPlants.actions.deleteConfirmTitle'),
      t('myPlants.actions.deleteConfirmMessage'),
      [
        { text: t('myPlants.actions.cancel'), style: 'cancel' },
        {
          text: t('myPlants.actions.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteScan();
            hapticSuccess();
            toast.success(t('myPlants.toasts.deleted'));
            navigation.goBack();
          },
        },
      ],
    );
  }

  function handleShare() {
    Alert.alert(
      t('myPlants.detail.shareConfirmTitle'),
      t('myPlants.detail.shareConfirmMessage'),
      [
        { text: t('myPlants.actions.cancel'), style: 'cancel' },
        {
          text: t('myPlants.detail.shareAction'),
          onPress: async () => {
            if (!scan) return;
            const name = cepage?.name.fr ?? t('myPlants.detail.results.unidentified');
            const date = formatDateLong(scan.createdAt, i18n.language);
            const text = `${t('myPlants.detail.shareText')}\n\n${name}\n${t('myPlants.detail.confidence')} : ${detection.confidence}%\n${date}`;
            try {
              await Share.share({
                message: text,
                ...(detection.imageUri ? { url: detection.imageUri } : {}),
              });
            } catch {
              toast.error(t('myPlants.detail.shareError'));
            }
          },
        },
      ],
    );
  }

  const ResultIcon = resultStyle.Icon;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.heroContainer}>
          <Image
            source={hasImage ? { uri: detection.imageUri } : FALLBACK_IMAGE}
            style={StyleSheet.absoluteFillObject}
            contentFit={hasImage ? 'cover' : 'contain'}
            transition={300}
          />
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent']} style={styles.gradientTop} />
          <LinearGradient colors={['transparent', '#F8F9FB']} style={styles.gradientBottom} />
          <Text style={styles.heroTitle}>{heroTitle}</Text>
        </View>

        {/* ── Floating buttons ── */}
        <TouchableOpacity
          style={[styles.floatingBtn, { top: insets.top + 8, left: 16 }]}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.floatingBtn, { top: insets.top + 8, right: 16 }]}
          activeOpacity={0.8}
          onPress={handleToggleFavorite}
        >
          <Star size={20} color={isFav ? '#FFB800' : '#1A1A1A'} fill={isFav ? '#FFB800' : 'none'} />
        </TouchableOpacity>

        {/* ── Content ── */}
        <Animated.View style={contentAnim}>
          {/* Result Card */}
          <View style={styles.resultCard}>
            <View style={[styles.badgePill, { backgroundColor: resultStyle.bg }]}>
              <ResultIcon size={16} color={resultStyle.text} />
              <Text style={[styles.badgeText, { color: resultStyle.text }]}>
                {t(resultStyle.labelKey)}
              </Text>
            </View>
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>{t('myPlants.detail.confidence')}</Text>
              <Text style={[styles.confidenceValue, { color: resultStyle.text }]}>
                {detection.confidence}%
              </Text>
            </View>
            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFill, { backgroundColor: resultStyle.text }, barAnim]} />
            </View>
          </View>

          {/* Cepage Card */}
          {detection.result === 'vine' && cepage && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('myPlants.detail.cepageSection')}</Text>
              <Text style={styles.cepageName}>{cepage.name.fr}</Text>
              <Text style={styles.cepageNameEn}>{cepage.name.en}</Text>
              <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: 'rgba(45,106,79,0.1)' }]}>
                  <Text style={[styles.tagText, { color: '#2D6A4F' }]}>
                    {cepage.color === 'rouge' ? '🍷 Rouge' : cepage.color === 'blanc' ? '🥂 Blanc' : '🌸 Rosé'}
                  </Text>
                </View>
                {cepage.regions.slice(0, 2).map((r) => (
                  <View key={r} style={[styles.tag, { backgroundColor: '#F0F0F0' }]}>
                    <Text style={[styles.tagText, { color: '#444' }]}>{r}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.cepageDesc}>{cepage.characteristics.fr}</Text>
            </View>
          )}

          {/* Meta Card */}
          <View style={styles.card}>
            <View style={styles.metaRow}>
              <Calendar size={18} color={colors.primary[700]} />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>{t('myPlants.detail.scannedOn')}</Text>
                <Text style={styles.metaValue}>{formatDateLong(scan.createdAt, i18n.language)}</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaRow}>
              <Award size={18} color={colors.primary[700]} />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>{t('myPlants.detail.xpEarned')}</Text>
                <Text style={styles.metaValue}>+{scan.xpEarned} XP</Text>
              </View>
            </View>
          </View>

          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.metaRow}>
              <MapPin size={18} color={colors.primary[700]} />
              <Text style={styles.cardTitle}>{t('myPlants.detail.location')}</Text>
            </View>
            {scan.location ? (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.locationName}>
                  {scan.location.placeName ?? 'Lieu inconnu'}
                </Text>
                <Text style={styles.locationCoords}>
                  {scan.location.latitude.toFixed(6)}, {scan.location.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.noLocation}>{t('myPlants.detail.noLocation')}</Text>
                <TouchableOpacity
                  style={styles.addLocationBtn}
                  onPress={() => console.warn('[ScanDetail] add location — to be implemented in prompt 3')}
                  activeOpacity={0.7}
                >
                  <MapPin size={14} color={colors.primary[700]} />
                  <Text style={styles.addLocationText}>{t('myPlants.detail.addLocation')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.7}>
          <Share2 size={18} color="#1A1A1A" />
          <Text style={styles.shareBtnText}>{t('myPlants.detail.share')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBottomBtn} onPress={handleDelete} activeOpacity={0.7}>
          <Trash2 size={18} color="#C62828" />
          <Text style={styles.deleteBtnText}>{t('myPlants.detail.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FB' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FB', gap: 16 },
  errorText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  errorBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary[700], borderRadius: 100 },
  errorBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  // Hero
  heroContainer: { height: 380, position: 'relative', backgroundColor: '#E0E0E0', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  gradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  heroTitle: { position: 'absolute', bottom: 24, left: 20, right: 20, fontSize: 28, fontWeight: '700', color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },

  // Floating buttons
  floatingBtn: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },

  // Result card
  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginHorizontal: 16, marginTop: -24, borderWidth: 1, borderColor: '#F0F0F0', gap: 12 },
  badgePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confidenceLabel: { fontSize: 14, color: '#8E8E93' },
  confidenceValue: { fontSize: 20, fontWeight: '700' },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: '#F0F0F0', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },

  // Generic card
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

  // Cepage
  cepageName: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginTop: 8 },
  cepageNameEn: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, fontWeight: '600' },
  cepageDesc: { fontSize: 14, lineHeight: 22, color: '#444444', marginTop: 12 },

  // Meta
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaContent: { flex: 1, gap: 2 },
  metaLabel: { fontSize: 12, color: '#8E8E93' },
  metaValue: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  metaDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 14 },

  // Location
  locationName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  locationCoords: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#8E8E93', marginTop: 4 },
  noLocation: { fontSize: 14, color: '#8E8E93' },
  addLocationBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: 'rgba(45,106,79,0.08)', borderRadius: 12, alignSelf: 'flex-start' },
  addLocationText: { fontSize: 14, fontWeight: '600', color: colors.primary[700] },

  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingTop: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F0F0F0', borderRadius: 16, paddingVertical: 14 },
  shareBtnText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  deleteBottomBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFEBEE', borderRadius: 16, paddingVertical: 14 },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: '#C62828' },
});
