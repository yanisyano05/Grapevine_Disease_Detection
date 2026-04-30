import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface HeaderActionButtonsProps {
  showNotifBadge?: boolean;
}

export function HeaderActionButtons({
  showNotifBadge = true,
}: HeaderActionButtonsProps) {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.group}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Notifications")}
        accessibilityLabel="Notifications"
      >
        <Ionicons
          name="notifications-outline"
          size={22}
          color={colors.neutral[800]}
        />
        {showNotifBadge && <View style={styles.badge} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Settings")}
        accessibilityLabel="Settings"
      >
        <Ionicons
          name="settings-outline"
          size={22}
          color={colors.neutral[800]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 32,
  },
  button: {
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
  },
  badge: {
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
