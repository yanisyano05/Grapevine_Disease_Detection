import { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react-native';

import { ScanListItem } from './ScanListItem';
import type { ScanRecord } from '@/types/detection';
import type { DateGroupKey } from '@/utils/dateGrouping';

interface DateGroupAccordionProps {
  groupKey: DateGroupKey;
  label: string;
  scans: ScanRecord[];
  isOpen: boolean;
  onToggle: () => void;
  onPressScan: (scan: ScanRecord) => void;
  onToggleFavorite: (scanId: string) => void;
  onDeleteScan: (scanId: string) => void;
}

export function DateGroupAccordion({
  label,
  scans,
  isOpen,
  onToggle,
  onPressScan,
  onToggleFavorite,
  onDeleteScan,
}: DateGroupAccordionProps) {
  const { t } = useTranslation();
  const rotation = useSharedValue(isOpen ? 0 : -90);

  useEffect(() => {
    rotation.value = withTiming(isOpen ? 0 : -90, { duration: 250 });
  }, [isOpen, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{t(label)}</Text>
          <Text style={styles.count}>({scans.length})</Text>
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={18} color="#8E8E93" />
        </Animated.View>
      </TouchableOpacity>

      {/* Content */}
      {isOpen && (
        <View style={styles.content}>
          {scans.map((scan) => (
            <ScanListItem
              key={scan.id}
              scan={scan}
              onPress={() => onPressScan(scan)}
              onToggleFavorite={() => onToggleFavorite(scan.id)}
              onDelete={() => onDeleteScan(scan.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  count: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  content: {
    paddingTop: 4,
    paddingBottom: 8,
  },
});
