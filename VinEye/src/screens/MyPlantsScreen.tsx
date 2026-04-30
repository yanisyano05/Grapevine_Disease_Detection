import { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { ScanLine } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { DateGroupAccordion } from '@/components/my-plants/DateGroupAccordion';
import { HeaderActionButtons } from '@/components/shared/HeaderActionButtons';
import SearchBar from '@/components/shared/SearchBar';
import { ScanListItemSkeleton } from '@/components/ui/Skeleton';
import { useHistory } from '@/hooks/useHistory';
import { groupScansByDate } from '@/utils/dateGrouping';
import type { DateGroupKey, DateGroup } from '@/utils/dateGrouping';
import { colors } from '@/theme/colors';
import type { RootStackParamList } from '@/types/navigation';
import type { ScanRecord } from '@/types/detection';

const ENTER_DURATION = 380;
function entering(delay: number) {
  return FadeInDown.delay(delay).duration(ENTER_DURATION).springify().damping(18);
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_OPEN: Set<DateGroupKey> = new Set(['today', 'yesterday', 'thisWeek']);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const EMPTY_IMAGE = require('../../assets/logo.png');

export default function MyPlantsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { history, isLoading, deleteScan, toggleFavorite, reload } = useHistory();

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

  // Group scans by date
  const groups = useMemo(() => groupScansByDate(history), [history]);

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

  // ScanListItem gère déjà sa propre ConfirmDialog → on appelle directement
  // deleteScan ici sans afficher un second modal.
  function handleDeleteScan(scanId: string) {
    deleteScan(scanId);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  function renderGroup({ item, index }: { item: DateGroup; index: number }) {
    return (
      <Animated.View entering={entering(index * 60)}>
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
      </Animated.View>
    );
  }

  const isEmpty = history.length === 0 && !isLoading;
  const showSkeleton = isLoading && history.length === 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={entering(0)} style={styles.header}>
        <Text style={styles.title}>{t('myPlants.title')}</Text>
        <HeaderActionButtons />
      </Animated.View>

      {/* Search bar (trigger global SearchScreen) */}
      <Animated.View entering={entering(60)} style={styles.searchContainer}>
        <SearchBar
          placeholder={t('myPlants.searchPlaceholder')}
          onTriggerPress={() => navigation.navigate('Search')}
        />
      </Animated.View>

      {/* Content */}
      {showSkeleton ? (
        <Animated.View
          entering={entering(120)}
          style={styles.skeletonGroups}
        >
          {[0, 1].map((g) => (
            <View key={g} style={styles.skeletonGroup}>
              <View style={styles.skeletonGroupHeader}>
                <View style={styles.skeletonHeaderBar} />
              </View>
              <View style={styles.skeletonGroupCard}>
                <ScanListItemSkeleton showSeparator />
                <ScanListItemSkeleton showSeparator />
                <ScanListItemSkeleton />
              </View>
            </View>
          ))}
        </Animated.View>
      ) : isEmpty ? (
        <Animated.View entering={entering(120)} style={styles.emptyContainer}>
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
        </Animated.View>
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
  // Skeleton (loading state)
  skeletonGroups: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  skeletonGroup: {
    marginBottom: 4,
  },
  skeletonGroupHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  skeletonHeaderBar: {
    width: 130,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  skeletonGroupCard: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
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
