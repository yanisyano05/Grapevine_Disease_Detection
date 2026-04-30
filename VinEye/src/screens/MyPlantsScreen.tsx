import { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { ScanLine } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { DateGroupAccordion } from '@/components/my-plants/DateGroupAccordion';
import { HeaderActionButtons } from '@/components/shared/HeaderActionButtons';
import SearchBar from '@/components/shared/SearchBar';
import { useHistory } from '@/hooks/useHistory';
import { getCepageById } from '@/utils/cepages';
import { groupScansByDate } from '@/utils/dateGrouping';
import type { DateGroupKey, DateGroup } from '@/utils/dateGrouping';
import { colors } from '@/theme/colors';
import type { RootStackParamList } from '@/types/navigation';
import type { ScanRecord } from '@/types/detection';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_OPEN: Set<DateGroupKey> = new Set(['today', 'yesterday', 'thisWeek']);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const EMPTY_IMAGE = require('../../assets/logo.png');

export default function MyPlantsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { history, isLoading, deleteScan, toggleFavorite, reload } = useHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<Set<DateGroupKey>>(
    new Set(DEFAULT_OPEN),
  );
  const [refreshing, setRefreshing] = useState(false);

  // Reload scans when screen regains focus
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  // Filter scans by search query
  const filteredScans = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter((scan) => {
      // Search by cepage name
      if (scan.detection.cepageId) {
        const c = getCepageById(scan.detection.cepageId);
        if (
          c?.name.fr.toLowerCase().includes(q) ||
          c?.name.en.toLowerCase().includes(q)
        ) {
          return true;
        }
      }
      // Search by result label
      const resultLabel =
        scan.detection.result === 'vine'
          ? t('result.vineDetected')
          : scan.detection.result === 'uncertain'
            ? t('result.uncertain')
            : t('result.notVine');
      return resultLabel.toLowerCase().includes(q);
    });
  }, [history, searchQuery, t]);

  // Group filtered scans by date
  const groups = useMemo(() => groupScansByDate(filteredScans), [filteredScans]);

  function toggleGroup(key: DateGroupKey) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handlePressScan(scan: ScanRecord) {
    navigation.navigate('ScanDetail', { scanId: scan.id });
  }

  function handleDeleteScan(scanId: string) {
    Alert.alert(
      t('myPlants.actions.deleteConfirmTitle'),
      t('myPlants.actions.deleteConfirmMessage'),
      [
        { text: t('myPlants.actions.cancel'), style: 'cancel' },
        {
          text: t('myPlants.actions.delete'),
          style: 'destructive',
          onPress: () => deleteScan(scanId),
        },
      ],
    );
  }

  async function handleRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  function renderGroup({ item }: { item: DateGroup }) {
    return (
      <DateGroupAccordion
        groupKey={item.key}
        label={item.label}
        scans={item.scans}
        isOpen={openGroups.has(item.key)}
        onToggle={() => toggleGroup(item.key)}
        onPressScan={handlePressScan}
        onToggleFavorite={(id) => toggleFavorite(id)}
        onDeleteScan={handleDeleteScan}
      />
    );
  }

  const isEmpty = history.length === 0 && !isLoading;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('myPlants.title')}</Text>
        <HeaderActionButtons />
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder={t('myPlants.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Image
              source={EMPTY_IMAGE}
              style={styles.emptyImage}
              contentFit="contain"
            />
          </View>
          <Text style={styles.emptyTitle}>{t('myPlants.empty.title')}</Text>
          <Text style={styles.emptySubtitle}>{t('myPlants.empty.subtitle')}</Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => navigation.navigate('Main', { screen: 'Scanner' })}
            activeOpacity={0.8}
          >
            <ScanLine size={18} color="#FFFFFF" />
            <Text style={styles.emptyCtaText}>{t('myPlants.empty.cta')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.key}
          renderItem={renderGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  // Search
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  // List
  listContent: {
    paddingBottom: 100,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 32,
    // backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyImage: {
    width: 96,
    height: 96,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary[800],
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 8,
  },
  emptyCtaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
