import { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Pencil } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { colors } from "@/theme/colors";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");
const STAT_CARD_SIZE = (width - 56) / 2;

const BENTO_STATS = [
  { key: "totalScans", icon: "scan-outline", iconColor: "#F59E0B", label: "profile.totalScans" },
  { key: "uniqueGrapes", icon: "leaf-outline", iconColor: "#10B981", label: "profile.uniqueGrapes" },
  { key: "bestStreak", icon: "flame-outline", iconColor: "#EF4444", label: "profile.bestStreak" },
  { key: "xp", icon: "star-outline", iconColor: "#6366F1", label: "profile.xpTotal" },
] as const;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { progress, reload: reloadProgress } = useGameProgress();
  const { profile, updateProfile, reload: reloadProfile } = useUserProfile();
  const [editing, setEditing] = useState(false);

  // Refresh stats + profil quand le screen reprend le focus (post-scan, post-edit, etc.)
  useFocusEffect(
    useCallback(() => {
      reloadProgress();
      reloadProfile();
    }, [reloadProgress, reloadProfile]),
  );

  const statValues: Record<string, number> = {
    totalScans: progress.totalScans ?? 0,
    uniqueGrapes: progress.uniqueGrapes?.length ?? 0,
    bestStreak: progress.bestStreak ?? 0,
    xp: progress.xp ?? 0,
  };

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Main" as never);
    }
  }

  return (
    <View style={styles.root}>
      {/* Hero Header */}
      <View style={styles.heroBlock}>
        <SafeAreaView edges={["top"]} style={styles.heroSafeArea}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={handleBack} style={styles.heroBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{profile.avatar}</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.infoCard}>
          <Text style={styles.userName}>
            {profile.displayName || t("profile.namePlaceholder")}
          </Text>
          <Text style={styles.userEmail}>
            {profile.email || t("profile.emailPlaceholder")}
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.85}
              onPress={() => setEditing(true)}
            >
              <Pencil size={14} color={colors.primary[800]} strokeWidth={2.4} />
              <Text style={styles.editBtnText}>{t("profile.editButton")}</Text>
            </TouchableOpacity>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>{progress.xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {BENTO_STATS.map((stat) => (
            <View key={stat.key} style={styles.statCard}>
              <View
                style={[styles.statIconWrap, { backgroundColor: `${stat.iconColor}15` }]}
              >
                <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={22} color={stat.iconColor} />
              </View>
              <Text style={styles.statValue}>
                {statValues[stat.key] ?? 0}
              </Text>
              <Text style={styles.statLabel}>{t(stat.label)}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <EditProfileModal
        visible={editing}
        initialProfile={profile}
        onClose={() => setEditing(false)}
        onSave={(next) => updateProfile(next)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  heroBlock: {
    height: 200,
    backgroundColor: colors.primary[700],
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  heroSafeArea: {
    flex: 1,
  },
  heroTopRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  heroBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    marginTop: -70,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  avatarEmoji: {
    fontSize: 56,
    lineHeight: 72,
    textAlign: "center",
    includeFontPadding: false,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.neutral[900],
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 2,
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary[100],
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary[800],
  },
  xpBadge: {
    backgroundColor: colors.primary[700],
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: "center",
  },
  xpBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: STAT_CARD_SIZE,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.neutral[500],
    marginTop: 4,
  },
});
