import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";

const CURRENT_ALERT = {
  type: "warning" as const,
  title: "Stay in the know",
  message: "Get alerts on your money activity and budgets",
};

export default function SeasonAlert() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Bouton Fermer */}
        <TouchableOpacity style={styles.closeButton} activeOpacity={0.7}>
          <Ionicons name="close" size={18} color={colors.primary[900]} />
        </TouchableOpacity>

        {/* Contenu Texte */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t(CURRENT_ALERT.title)}</Text>
          <Text style={styles.message}>{t(CURRENT_ALERT.message)}</Text>
        </View>

        {/* Bouton d'action */}
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={styles.actionText}>{t("Allow notifications")}</Text>
        </TouchableOpacity>

        {/* Illustration decorative */}
        <View style={styles.decoration}>
          <Ionicons name="notifications" size={100} color={colors.primary[300]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 28,
    backgroundColor: colors.primary[200],
    overflow: "hidden",
  },
  content: {
    position: "relative",
    padding: 24,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primary[300],
    zIndex: 1,
  },
  textContainer: {
    paddingRight: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: colors.primary[900],
  },
  message: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: colors.primary[800],
    opacity: 0.6,
  },
  actionButton: {
    marginTop: 24,
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: colors.primary[400],
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary[900],
  },
  decoration: {
    position: "absolute",
    bottom: -16,
    right: -16,
    opacity: 0.8,
  },
});
