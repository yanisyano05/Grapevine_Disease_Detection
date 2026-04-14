import { View, ScrollView, StyleSheet, Platform, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import { useGameProgress } from "@/hooks/useGameProgress";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");
const STAT_CARD_SIZE = (width - 56) / 2; // Ajusté pour le gap de 16

const BENTO_STATS = [
  { key: "scans", icon: "scan-outline", iconColor: "#F59E0B", label: "profile.totalScans" },
  { key: "grapes", icon: "leaf-outline", iconColor: "#10B981", label: "profile.uniqueGrapes" },
  { key: "streak", icon: "flame-outline", iconColor: "#EF4444", label: "profile.bestStreak" },
  { key: "xp", icon: "star-outline", iconColor: "#6366F1", label: "profile.xpTotal" },
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { progress } = useGameProgress();
  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Main" as any);
    }
  }

  return (
    <View style={styles.root}>
      {/* Hero Header - Style Courbé */}
      <View style={styles.heroBlock}>
        <SafeAreaView edges={["top"]} style={styles.heroSafeArea}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={handleBack} style={styles.heroBackBtn}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.heroSettingsBtn}>
              <Ionicons name="settings-outline" size={22} color={colors.primary[800]} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Avatar avec bague de séparation */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🧑‍🌾</Text>
            </View>
          </View>
        </View>

        {/* User Info - Focus sur la clarté */}
        <View style={styles.infoCard}>
          <Text style={styles.userName}>Yanis Cyrius</Text>
          <Text style={styles.userEmail}>yanis@vineye.app</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.friendBtn} activeOpacity={0.8}>
              <Text style={styles.friendBtnText}>+ Friends</Text>
            </TouchableOpacity>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>{progress.xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid - Bento Style Pur */}
        <View style={styles.statsGrid}>
          {BENTO_STATS.map((stat) => (
            <View key={stat.key} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: `${stat.iconColor}15` }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.iconColor} />
              </View>
              <Text style={styles.statValue}>
                {stat.key === "grapes" ? (progress.uniqueGrapes?.length ?? 0) : progress[stat.key as keyof typeof progress] || 0}
              </Text>
              <Text style={styles.statLabel}>{t(stat.label)}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F9FB", // Gris très clair bleuté
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  heroBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroSettingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
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
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 48,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: "#A0A0A0",
    marginTop: 2,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  friendBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#F97316",
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  friendBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F97316",
  },
  xpBadge: {
    backgroundColor: colors.primary[600],
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
  },
  xpBadgeText: {
    fontSize: 14,
    fontWeight: "600",
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
    borderColor: "#F2F2F2",
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
    fontWeight: "500", // Medium au lieu de Bold pour le look premium
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 13,
    color: "#9A9A9A",
    marginTop: 4,
  },
});