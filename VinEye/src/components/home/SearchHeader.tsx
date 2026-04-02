import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SearchHeader() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.brandTitle}>VINEYE</Text>
        <Text style={styles.greetingText}>{t("home.greeting")}</Text>
      </View>

      <View style={styles.buttonsGroup}>
        <TouchableOpacity
          style={styles.notifButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.neutral[800]}
          />
          <View style={styles.notifBadge} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notifButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color={colors.neutral[800]}
          />
        </TouchableOpacity>
      </View>
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
    fontSize: 32,
    fontWeight: "900", // Très gras pour l'identité
    color: colors.primary[900],
    letterSpacing: -1, // Look "Logo"
  },
  greetingText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.neutral[500],
    marginTop: -2,
  },
  buttonsGroup: {
    flexDirection: "row" as const,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 16,
  },
  notifButton: {
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  notifBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
