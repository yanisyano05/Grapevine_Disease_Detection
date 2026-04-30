import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ChevronRight } from "lucide-react-native";
import { toast } from "sonner-native";
import i18n from "@/i18n";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useHistory } from "@/hooks/useHistory";
import { storage } from "@/services/storage";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: string;
  label: string;
  rightText?: string;
  rightColor?: string;
  danger?: boolean;
  onPress?: () => void;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { progress, resetProgress } = useGameProgress();
  const { clearHistory, seedTestData } = useHistory();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    storage
      .get<boolean>(storage.KEYS.NOTIFICATIONS_ENABLED)
      .then((v) => setNotificationsEnabled(v ?? true));
  }, []);

  async function handleNotificationsToggle(value: boolean) {
    setNotificationsEnabled(value);
    await storage.set(storage.KEYS.NOTIFICATIONS_ENABLED, value);
    toast.success(
      value
        ? t("settings.notifications.enabled")
        : t("settings.notifications.disabled"),
    );
  }

  async function handleSeed() {
    await seedTestData();
    toast.success(t("settings.seedDone"));
  }

  function handleLanguageToggle() {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  }

  function handleReset() {
    Alert.alert(t("common.confirm"), t("profile.resetConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.resetData"),
        style: "destructive",
        onPress: async () => {
          await resetProgress();
          await clearHistory();
        },
      },
    ]);
  }

  const generalItems: MenuItem[] = [
    {
      icon: "globe-outline",
      label: t("profile.language"),
      rightText: i18n.language === "fr" ? "Français" : "English",
      onPress: handleLanguageToggle,
    },
    // {
    //   icon: "notifications-outline",
    //   label: t("settings.notifications.label"),
    //   toggleValue: notificationsEnabled,
    //   onToggle: handleNotificationsToggle,
    // },
    {
      icon: "shield-outline",
      label: t("settings.privacy"),
    },
  ];

  // Premium status + Apparence désactivés pour le moment — décommenter quand prêts
  const appItems: MenuItem[] = [
    /*
    {
      icon: "diamond-outline",
      label: t("settings.premiumStatus"),
      rightText: t("settings.inactive"),
      rightColor: "#F97316",
    },
    {
      icon: "color-palette-outline",
      label: t("settings.appearance"),
    },
    */
    {
      icon: "help-circle-outline",
      label: t("settings.helpCenter"),
    },
    {
      icon: "document-text-outline",
      label: t("settings.terms"),
    },
  ];

  const devItems: MenuItem[] = __DEV__
    ? [
        {
          icon: "flask-outline",
          label: t("settings.seedTestData"),
          onPress: handleSeed,
        },
      ]
    : [];

  const dangerItems: MenuItem[] = [
    {
      icon: "trash-outline",
      label: t("profile.resetData"),
      danger: true,
      onPress: handleReset,
    },
  ];

  const renderMenuGroup = (items: MenuItem[]) => (
    <View style={styles.menuCard}>
      {items.map((item, index) => {
        const isToggle = typeof item.onToggle === "function";
        const Wrapper = isToggle ? View : TouchableOpacity;

        return (
          <View key={item.label}>
            {index > 0 && <View style={styles.divider} />}
            <Wrapper
              style={styles.menuRow}
              {...(isToggle
                ? {}
                : { activeOpacity: 0.5, onPress: item.onPress })}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: item.danger ? "#FEF2F2" : "#F8F9FA" },
                ]}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={item.danger ? "#EF4444" : "#636E72"}
                />
              </View>

              <Text
                style={[
                  styles.menuLabel,
                  item.danger && styles.menuLabelDanger,
                ]}
              >
                {item.label}
              </Text>

              <View style={styles.menuRight}>
                {isToggle ? (
                  <Switch
                    value={item.toggleValue ?? false}
                    onValueChange={item.onToggle}
                    trackColor={{
                      false: colors.neutral[300],
                      true: colors.primary[700],
                    }}
                    thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
                    ios_backgroundColor={colors.neutral[300]}
                  />
                ) : (
                  <>
                    {item.rightText && (
                      <Text
                        style={[
                          styles.menuRightText,
                          item.rightColor && { color: item.rightColor },
                        ]}
                      >
                        {item.rightText}
                      </Text>
                    )}
                    <ChevronRight size={16} color="#D1D1D6" strokeWidth={2} />
                  </>
                )}
              </View>
            </Wrapper>
          </View>
        );
      })}
    </View>
  );

  const userLevel = progress?.level ?? 1;
  const userXp = progress?.xp ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("common.settings")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Profile button → ProfileScreen */}
        <TouchableOpacity
          style={styles.profileHero}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{t("settings.editProfile")}</Text>
            <Text style={styles.profileMeta}>
              {t("profile.level", { level: userLevel })} · {userXp} XP
            </Text>
          </View>
          <View style={styles.profileChevronWrap}>
            <ChevronRight size={20} color={colors.primary[800]} strokeWidth={2.4} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>{t("settings.general")}</Text>
        {renderMenuGroup(generalItems)}

        <Text style={styles.sectionLabel}>{t("settings.app")}</Text>
        {renderMenuGroup(appItems)}

        {/* Banner Referral désactivé — gardé commenté pour usage futur */}
        {/*
        <TouchableOpacity style={styles.referCard} activeOpacity={0.9}>
          <View style={styles.referContent}>
            <Text style={styles.referTitle}>Refer a friend</Text>
            <Text style={styles.referBody}>Get $50 per successful referral</Text>
          </View>
          <View style={styles.referIconWrap}>
            <Ionicons name="gift" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        */}

        {devItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>{t("settings.developer")}</Text>
            {renderMenuGroup(devItems)}
          </>
        )}

        {renderMenuGroup(dangerItems)}

        <Text style={styles.versionText}>VinEye • Version 1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.primary[800],
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: { flex: 1, gap: 2 },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.2,
  },
  profileMeta: { fontSize: 13, color: "#8E8E93" },
  profileChevronWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A0A0A0",
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#2D3436",
  },
  menuLabelDanger: { color: "#EF4444" },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  menuRightText: {
    fontSize: 13,
    color: "#B2B2B2",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginLeft: 60,
  },
  /* Styles du Referral card — gardés au cas où on réactive */
  referCard: {
    backgroundColor: "#F97316",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  referContent: { flex: 1 },
  referTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  referBody: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  referIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#C7C7CC",
    marginTop: 10,
    fontWeight: "500",
  },
});
