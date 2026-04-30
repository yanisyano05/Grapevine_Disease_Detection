import { View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ArrowRight, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';
import type { Disease } from '@/data/diseases';

interface LargeDiseaseCardProps {
  disease: Disease;
  onPress: () => void;
  index?: number;
}

const TYPE_TINT: Record<Disease['type'], { bg: string; fg: string }> = {
  fungal: { bg: '#7B1FA2', fg: '#FFFFFF' },
  bacterial: { bg: '#C62828', fg: '#FFFFFF' },
  pest: { bg: '#EF6C00', fg: '#FFFFFF' },
  abiotic: { bg: '#1565C0', fg: '#FFFFFF' },
};

const SEVERITY_TINT: Record<Disease['severity'], { bg: string; fg: string; labelKey: string }> = {
  high: { bg: '#FBE9E7', fg: '#D32F2F', labelKey: 'guides.riskLevel.high' },
  medium: { bg: '#FFF8E1', fg: '#F9A825', labelKey: 'guides.riskLevel.medium' },
  low: { bg: '#E8F5E9', fg: '#2E7D32', labelKey: 'guides.riskLevel.low' },
};

const TYPE_LABEL: Record<Disease['type'], string> = {
  fungal: 'diseases.types.fungal',
  bacterial: 'diseases.types.bacterial',
  pest: 'diseases.types.pest',
  abiotic: 'diseases.types.abiotic',
};

export default function LargeDiseaseCard({
  disease,
  onPress,
  index = 0,
}: LargeDiseaseCardProps) {
  const { t } = useTranslation();
  const type = TYPE_TINT[disease.type];
  const severity = SEVERITY_TINT[disease.severity];

  return (
    <Animated.View entering={FadeInDown.delay(index * 90).duration(550).springify().damping(16)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        {/* Header: type badge + icon */}
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: type.bg }]}>
            <Text style={[styles.typeLabel, { color: type.fg }]}>
              {t(TYPE_LABEL[disease.type]).toUpperCase()}
            </Text>
          </View>
          <View style={styles.iconCircle}>
            <Ionicons
              name={disease.icon as keyof typeof Ionicons.glyphMap}
              size={26}
              color={disease.iconColor}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {t(disease.name)}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {t(disease.description)}
          </Text>
        </View>

        {/* Footer: severity tag + arrow button */}
        <View style={styles.footer}>
          <View style={[styles.severityTag, { backgroundColor: severity.bg }]}>
            <AlertTriangle size={14} color={severity.fg} strokeWidth={2.5} />
            <Text style={[styles.severityLabel, { color: severity.fg }]}>
              {t(severity.labelKey).toUpperCase()}
            </Text>
          </View>

          <View style={styles.arrowButton}>
            <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 32,
    padding: 24,
    minHeight: 260,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  description: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  severityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  severityLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.primary[800],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});
