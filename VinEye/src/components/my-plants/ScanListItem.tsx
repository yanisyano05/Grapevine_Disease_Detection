import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { Star, StarOff, Trash2 } from 'lucide-react-native';
import { toast } from 'sonner-native';

import { ConfidenceTile } from '@/components/my-plants/ConfidenceTile';
import { StatusTag } from '@/components/my-plants/StatusTag';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getCepageById } from '@/utils/cepages';
import { hapticLight, hapticSuccess } from '@/services/haptics';
import { colors } from '@/theme/colors';
import { getScanStatus } from '@/types/detection';
import type { ScanRecord, ScanStatus } from '@/types/detection';

interface ScanListItemProps {
  scan: ScanRecord;
  onPress: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  grouped?: boolean;
  showSeparator?: boolean;
}

const STATUS_FILL: Record<ScanStatus, string> = {
  healthy: colors.primary[700],
  infected: '#E63946',
  uncertain: '#F4A261',
  not_vine: '#9E9E9E',
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FALLBACK_IMAGE = require('../../../assets/logo.png');

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getPlantName(scan: ScanRecord, t: (key: string) => string): string {
  if (scan.customName && scan.customName.trim().length > 0) return scan.customName.trim();
  if (scan.detection.cepageId) {
    const c = getCepageById(scan.detection.cepageId);
    if (c) return c.name.fr;
  }
  if (scan.detection.result === 'vine') return t('result.vineDetected');
  if (scan.detection.result === 'uncertain') return t('result.uncertain');
  return t('result.notVine');
}

export function ScanListItem({
  scan,
  onPress,
  onToggleFavorite,
  onDelete,
  grouped = false,
  showSeparator = false,
}: ScanListItemProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isFav = scan.isFavorite === true;
  const status = getScanStatus(scan);
  const hasImage = !!scan.detection.imageUri;

  function handleFavorite() {
    onToggleFavorite();
    hapticSuccess();
    toast.success(isFav ? t('myPlants.toasts.unfavorited') : t('myPlants.toasts.favorited'));
    swipeableRef.current?.close();
  }

  function handleDelete() {
    setConfirmOpen(true);
    swipeableRef.current?.close();
  }

  function handleConfirmDelete() {
    setConfirmOpen(false);
    onDelete();
    hapticSuccess();
    toast.success(t('myPlants.toasts.deleted'));
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
    <>
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={[styles.container, grouped && styles.containerGrouped]}
        onPress={() => {
          hapticLight();
          onPress();
        }}
        activeOpacity={0.7}
      >
        {/* Image (cover for real captures, contain for fallback) */}
        <View style={styles.imageWrapper}>
          <Image
            source={hasImage ? { uri: scan.detection.imageUri } : FALLBACK_IMAGE}
            style={hasImage ? styles.image : styles.fallbackImage}
            contentFit={hasImage ? 'cover' : 'contain'}
            transition={200}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.plantName} numberOfLines={1}>
            {getPlantName(scan, t)}
          </Text>
          <View style={styles.metaRow}>
            <StatusTag status={status} />
          </View>
          <Text style={styles.time}>{formatTime(scan.createdAt)}</Text>
        </View>

        {/* Confidence score on the right */}
        <View style={styles.rightSlot}>
          <ConfidenceTile
            confidence={scan.detection.confidence}
            fillColor={STATUS_FILL[status]}
            size={44}
            scoreSize={13}
          />
          {isFav && (
            <View style={styles.favStarMini}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      {grouped && showSeparator && <View style={styles.separator} />}
    </Swipeable>

    <ConfirmDialog
      visible={confirmOpen}
      title={t('myPlants.actions.deleteConfirmTitle')}
      message={t('myPlants.actions.deleteConfirmMessage')}
      confirmLabel={t('myPlants.actions.delete')}
      cancelLabel={t('myPlants.actions.cancel')}
      variant="destructive"
      onConfirm={handleConfirmDelete}
      onCancel={() => setConfirmOpen(false)}
    />
    </>
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
  containerGrouped: {
    borderRadius: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    borderWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 92,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 64,
    height: 64,
  },
  fallbackImage: {
    width: 64,
    height: 64,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  rightSlot: {
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  favStarMini: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
