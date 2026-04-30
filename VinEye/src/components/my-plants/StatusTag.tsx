import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/colors';
import type { ScanStatus } from '@/types/detection';

interface StatusTagProps {
  status: ScanStatus;
}

const STATUS_STYLE: Record<ScanStatus, { bg: string; fg: string; dot: string; labelKey: string }> = {
  healthy: {
    bg: colors.primary[100],
    fg: colors.primary[800],
    dot: colors.primary[700],
    labelKey: 'myPlants.status.healthy',
  },
  infected: {
    bg: '#FCEBEB',
    fg: '#A32D2D',
    dot: '#E63946',
    labelKey: 'myPlants.status.infected',
  },
  uncertain: {
    bg: '#FAEEDA',
    fg: '#BA7517',
    dot: '#F4A261',
    labelKey: 'myPlants.status.uncertain',
  },
};

export function StatusTag({ status }: StatusTagProps) {
  const { t } = useTranslation();
  const cfg = STATUS_STYLE[status];

  return (
    <View style={[styles.tag, { backgroundColor: cfg.bg }]}>
      <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.label, { color: cfg.fg }]}>{t(cfg.labelKey)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
