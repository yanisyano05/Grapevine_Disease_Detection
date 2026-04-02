import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

import { Card } from '@/components/ui/Card';
import { XPBar } from '@/components/gamification/XPBar';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useHistory } from '@/hooks/useHistory';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { progress, resetProgress } = useGameProgress();
  const { clearHistory } = useHistory();

  const successRate =
    progress.totalScans > 0
      ? Math.round(
          (progress.totalScans -
            // we don't store not_vine count separately, so approximate
            0) /
            progress.totalScans *
            100
        )
      : 0;

  function handleLanguageToggle() {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  }

  function handleReset() {
    Alert.alert(t('common.confirm'), t('profile.resetConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.resetData'),
        style: 'destructive',
        onPress: async () => {
          await resetProgress();
          await clearHistory();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🧑‍🌾</Text>
          </View>
          <Text style={styles.username}>Vigneron</Text>
          <Text style={styles.xpTotal}>{progress.xp} XP</Text>
        </View>

        {/* XP Bar */}
        <Card style={styles.section} variant="elevated">
          <XPBar xp={progress.xp} />
        </Card>

        {/* Stats */}
        <Card style={styles.section} variant="elevated">
          <Text style={styles.sectionTitle}>{t('profile.stats')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.totalScans}</Text>
              <Text style={styles.statLabel}>{t('profile.totalScans')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.uniqueGrapes.length}</Text>
              <Text style={styles.statLabel}>{t('profile.uniqueGrapes')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{progress.bestStreak}</Text>
              <Text style={styles.statLabel}>{t('profile.bestStreak')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.streak}</Text>
              <Text style={styles.statLabel}>{t('home.currentStreak')}</Text>
            </View>
          </View>
        </Card>

        {/* Badges */}
        <Card style={styles.section} variant="elevated">
          <Text style={styles.sectionTitle}>{t('profile.badges')}</Text>
          <View style={styles.badgesGrid}>
            {progress.badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </View>
        </Card>

        {/* Settings */}
        <Card style={styles.section} variant="elevated">
          <TouchableOpacity style={styles.settingRow} onPress={handleLanguageToggle}>
            <Text style={styles.settingLabel}>{t('profile.language')}</Text>
            <Text style={styles.settingValue}>
              {i18n.language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleReset}>
            <Text style={[styles.settingLabel, { color: colors.danger }]}>
              {t('profile.resetData')}
            </Text>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>
        </Card>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 40 },
  username: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral[900],
  },
  xpTotal: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary[700],
    fontWeight: typography.fontWeights.semibold,
  },
  section: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[800],
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral[800],
  },
  settingValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral[600],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
});
