import { useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { Star, StarOff, Trash2 } from 'lucide-react-native';
import { toast } from 'sonner-native';

import { getCepageById } from '@/utils/cepages';
import { hapticLight, hapticSuccess } from '@/services/haptics';
import { colors } from '@/theme/colors';
import type { ScanRecord } from '@/types/detection';

interface ScanListItemProps {
  scan: ScanRecord;
  onPress: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getPlantName(scan: ScanRecord, t: (key: string) => string): string {
  if (scan.detection.cepageId) {
    const c = getCepageById(scan.detection.cepageId);
    if (c) return c.name.fr;
  }
  if (scan.detection.result === 'vine') return t('result.vineDetected');
  if (scan.detection.result === 'uncertain') return t('result.uncertain');
  return t('result.notVine');
}

function getStatusLabel(scan: ScanRecord, t: (key: string) => string): string {
  if (scan.detection.result === 'vine') return t('result.vineDetected');
  if (scan.detection.result === 'uncertain') return t('result.uncertain');
  return t('result.notVine');
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FALLBACK_IMAGE = require('../../../assets/logo.png');

export function ScanListItem({ scan, onPress, onToggleFavorite, onDelete }: ScanListItemProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const isFav = scan.isFavorite === true;

  function handleFavorite() {
    onToggleFavorite();
    hapticSuccess();
    toast.success(isFav ? t('myPlants.toasts.unfavorited') : t('myPlants.toasts.favorited'));
    swipeableRef.current?.close();
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
          onPress: () => {
            onDelete();
            hapticSuccess();
            toast.success(t('myPlants.toasts.deleted'));
          },
        },
      ],
    );
    swipeableRef.current?.close();
  }

  function renderRightActions() {
    return (
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.favoriteBtn]}
          onPress={handleFavorite}
          activeOpacity={0.7}
        >
          {isFav ? (
            <StarOff size={20} color="#FFFFFF" />
          ) : (
            <Star size={20} color="#FFFFFF" />
          )}
          <Text style={styles.actionLabel}>
            {isFav ? t('myPlants.actions.unfavorite') : t('myPlants.actions.favorite')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={styles.actionLabel}>{t('myPlants.actions.delete')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          hapticLight();
          onPress();
        }}
        activeOpacity={0.7}
      >
        {/* Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={scan.detection.imageUri ? { uri: scan.detection.imageUri } : FALLBACK_IMAGE}
            style={styles.image}
            contentFit={scan.detection.imageUri ? 'cover' : 'contain'}
            transition={200}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.plantName} numberOfLines={1}>
            {getPlantName(scan, t)}
          </Text>
          <Text style={styles.status} numberOfLines={1}>
            {getStatusLabel(scan, t)}
          </Text>
          <Text style={styles.time}>{formatTime(scan.createdAt)}</Text>
        </View>

        {/* Favorite star */}
        {isFav && (
          <View style={styles.starWrapper}>
            <Star size={18} color="#FFB800" fill="#FFB800" />
          </View>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8F9FB',
  },
  image: {
    width: 64,
    height: 64,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  status: {
    fontSize: 13,
    color: '#8E8E93',
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  starWrapper: {
    paddingLeft: 8,
  },
  // Swipe actions
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    marginRight: 16,
  },
  actionBtn: {
    width: 72,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  favoriteBtn: {
    backgroundColor: '#FFB800',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  deleteBtn: {
    backgroundColor: '#E63946',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
