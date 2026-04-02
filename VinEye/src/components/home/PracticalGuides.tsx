import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import { PRACTICAL_GUIDES } from "@/data/guides";

export default function PracticalGuides() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {PRACTICAL_GUIDES.map((guide) => (
        <TouchableOpacity
          key={guide.id}
          activeOpacity={0.6}
          style={styles.card}
        >
          {/* Icône avec fond translucide assorti */}
          <View 
            style={[
              styles.iconContainer, 
              { backgroundColor: `${guide.iconColor}12` } // 12 = ~7% d'opacité
            ]}
          >
            <Ionicons
              name={guide.icon as any}
              size={24}
              color={guide.iconColor}
            />
          </View>

          {/* Textes */}
          <View style={styles.textStack}>
            <Text numberOfLines={1} style={styles.title}>
              {t(guide.title)}
            </Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {t(guide.subtitle)}
            </Text>
          </View>

          {/* Indicateur d'action discret */}
          <View style={styles.chevronWrapper}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.neutral[300]}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 4, // Pour ne pas couper l'ombre
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // Arrondi plus prononcé style "Bento"
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textStack: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[900],
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.neutral[500],
  },
  chevronWrapper: {
    marginLeft: 8,
    backgroundColor: "#F8F9FA",
    padding: 6,
    borderRadius: 12,
  },
});