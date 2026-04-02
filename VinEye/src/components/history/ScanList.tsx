import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScanCard } from './ScanCard';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import type { ScanRecord } from '@/types/detection';

interface ScanListProps {
  records: ScanRecord[];
  onDelete?: (id: string) => void;
  onPressItem?: (record: ScanRecord) => void;
}

export function ScanList({ records, onDelete, onPressItem }: ScanListProps) {
  const { t } = useTranslation();

  if (records.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🍇</Text>
        <Text style={styles.emptyText}>{t('history.empty')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={records}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ScanCard
          record={item}
          onDelete={onDelete ? () => onDelete(item.id) : undefined}
          onPress={onPressItem ? () => onPressItem(item) : undefined}
        />
      )}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.base,
  },
  separator: {
    height: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
    paddingVertical: spacing['5xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
