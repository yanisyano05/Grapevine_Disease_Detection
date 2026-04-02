import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

export default function SearchSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        {/* Icône de recherche */}
        <Ionicons
          name="search"
          size={20}
          color={colors.neutral[400]}
          style={styles.searchIcon}
        />
        
        {/* Champ de saisie */}
        <TextInput
          style={styles.input}
          placeholder={t("home.searchPlaceholder") ?? "Rechercher..."}
          placeholderTextColor={colors.neutral[400]}
          selectionColor={colors.primary[500]}
          autoCorrect={false}
        />

        {/* Optionnel: Petit séparateur + Icône Filtre pour le look Premium */}
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <View style={styles.divider} />
          <Ionicons name="options-outline" size={18} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 4,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7F9", // Un gris bleuté plus frais que neutral-200
    borderRadius: 100, // On garde ton style "full"
    paddingHorizontal: 16,
    height: 52, // Hauteur standardisée pour le tactile
    borderWidth: 1,
    borderColor: "#EAECEF",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: colors.neutral[900],
    // Évite le décalage de texte sur Android
    paddingVertical: 0, 
    height: "100%",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#E2E4E7",
    marginRight: 12,
  },
});