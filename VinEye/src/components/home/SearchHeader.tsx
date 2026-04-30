import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Text } from "@/components/ui/text";
import { HeaderActionButtons } from "@/components/shared/HeaderActionButtons";
import { colors } from "@/theme/colors";

export default function SearchHeader() {
  const { t } = useTranslation();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.brandTitle}>VINEYE</Text>
        <Text style={styles.greetingText}>{t("home.greeting")}</Text>
      </View>

      <HeaderActionButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "transparent",
  },
  textContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.primary[900],
    letterSpacing: -1,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.neutral[500],
    marginTop: -2,
  },
});
