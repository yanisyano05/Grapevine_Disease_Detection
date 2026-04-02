import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Badge } from '@/components/ui/Badge';
import { getCepageById } from '@/utils/cepages';
import type { ScanRecord } from '@/types/detection';

interface ScanCardProps {
  record: ScanRecord;
  onDelete?: () => void;
  onPress?: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ScanCard({ record, onDelete, onPress }: ScanCardProps) {
  const { t } = useTranslation();
  const { detection } = record;
  const cepage = detection.cepageId ? getCepageById(detection.cepageId) : undefined;

  const resultColor =
    detection.result === 'vine'
      ? 'success'
      : detection.result === 'uncertain'
      ? 'warning'
      : 'danger';

  const resultLabel =
    detection.result === 'vine'
      ? t('result.vineDetected')
      : detection.result === 'uncertain'
      ? t('result.uncertain')
      : t('result.notVine');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      {/* Colored strip */}
      <View style={[styles.strip, { backgroundColor: colors[detection.result === 'vine' ? 'success' : detection.result === 'uncertain' ? 'warning' : 'danger'] }]} />

      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={styles.date}>{formatDate(record.createdAt)}</Text>
          <Badge label={`+${record.xpEarned} XP`} color="primary" size="sm" />
        </View>

        <View style={styles.middle}>
          <Badge label={resultLabel} color={resultColor} />
          {cepage && (
            <Text style={styles.ceepage}>{cepage.name.fr}</Text>
          )}
        </View>

        <View style={styles.bottom}>
          <Text style={styles.confidence}>
            {t('scanner.confidence')} : <Text style={{ fontWeight: typography.fontWeights.bold }}>{detection.confidence}%</Text>
          </Text>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.delete}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  strip: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  middle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral[600],
  },
  ceepage: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary[800],
  },
  confidence: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral[600],
  },
  delete: {
    fontSize: 16,
    opacity: 0.6,
  },
});
