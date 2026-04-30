import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import SearchBar from "@/components/shared/SearchBar";

export default function SearchSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <SearchBar placeholder={t("home.searchPlaceholder") ?? "Rechercher..."} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 4,
  },
});
