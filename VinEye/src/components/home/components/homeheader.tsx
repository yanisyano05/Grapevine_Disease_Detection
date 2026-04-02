import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";

export default function SectionHeader({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Titre avec graisse plus affirmée */}
      <Text style={styles.title}>
        {title}
      </Text>

      {onViewAll && (
        <TouchableOpacity 
          onPress={onViewAll}
          activeOpacity={0.6}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {t("common.viewAll") ?? "View all"}
          </Text>
          
          {/* Petit chevron discret pour guider l'œil */}
          <View style={styles.iconWrapper}>
            <Ionicons 
              name="chevron-forward" 
              size={12} 
              color={colors.primary[600]} 
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16, // Espace constant sous le header
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "800", // Plus épais pour le style Bento
    color: "#1A1A1A",
    letterSpacing: -0.5, // Look moderne
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary[50]}`, // Fond très léger
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary[700],
    marginRight: 4,
  },
  iconWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 2,
    // Légère ombre pour faire ressortir l'icône
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});