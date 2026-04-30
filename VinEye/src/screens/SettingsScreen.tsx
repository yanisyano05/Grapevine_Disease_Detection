import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import i18n from "@/i18n";

import { toast } from "sonner-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useHistory } from "@/hooks/useHistory";

interface MenuItem {
  icon: string;
  label: string;
  rightText?: string;
  rightColor?: string;
  danger?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { resetProgress } = useGameProgress();
  const { clearHistory, seedTestData } = useHistory();

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
      icon: "person-outline",
      label: t("settings.editProfile"),
    },
    {
      icon: "globe-outline",
      label: t("profile.language"),
      rightText: i18n.language === "fr" ? "Français" : "English",
      onPress: handleLanguageToggle,
    },
    {
      icon: "notifications-outline",
      label: t("common.notifications"),
    },
    {
      icon: "shield-outline",
      label: t("settings.privacy"),
    },
  ];

  const appItems: MenuItem[] = [
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
      {items.map((item, index) => (
        <View key={item.label}>
          {index > 0 && <View style={styles.divider} />}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.5}
            onPress={item.onPress}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: item.danger ? "#FEF2F2" : "#F8F9FA" },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={item.danger ? "#EF4444" : "#636E72"}
              />
            </View>

            <Text
              style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}
            >
              {item.label}
            </Text>

            <View style={styles.menuRight}>
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
              <Ionicons name="chevron-forward" size={14} color="#D1D1D6" />
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header épuré style Bumble/Apple */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("common.settings")}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionLabel}>{t("settings.general")}</Text>
        {renderMenuGroup(generalItems)}

        <Text style={styles.sectionLabel}>{t("settings.app")}</Text>
        {renderMenuGroup(appItems)}

        {/* Banner Referral plus "Flat" et moderne */}
        <TouchableOpacity style={styles.referCard} activeOpacity={0.9}>
          <View style={styles.referContent}>
            <Text style={styles.referTitle}>Refer a friend</Text>
            <Text style={styles.referBody}>
              Get $50 per successful referral
            </Text>
          </View>
          <View style={styles.referIconWrap}>
            <Ionicons name="gift" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

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
    backgroundColor: "#F8F9FB", // Gris encore plus clair/bleuté
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "transparent", // Pas de démarcation brutale
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600", // Pas de Bold 900 ici, juste Medium/SemiBold
    color: "#1A1A1A",
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#A0A0A0",
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    fontWeight: "400", // On reste sur du Regular
    color: "#2D3436",
  },
  menuLabelDanger: {
    color: "#EF4444",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuRightText: {
    fontSize: 14,
    color: "#B2B2B2",
  },
  divider: {
    height: 1,
    backgroundColor: "#F8F9FA",
    marginLeft: 60, // Aligné avec le texte, pas l'icône
  },
  referCard: {
    backgroundColor: "#F97316",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  referContent: {
    flex: 1,
  },
  referTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  referBody: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
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
    color: "#D1D1D6",
    marginTop: 10,
  },
});
