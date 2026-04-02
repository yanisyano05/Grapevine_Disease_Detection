import { View, TouchableOpacity, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SearchHeader() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
      <View className="flex-1 flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center rounded-full bg-neutral-200 px-3 py-2">
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.neutral[500]}
          />
          <TextInput
            className="ml-2 flex-1 text-[14px]"
            placeholder={t("history.search")}
            placeholderTextColor={colors.neutral[500]}
            style={{ color: colors.neutral[900], paddingVertical: 0 }}
          />
        </View>
        <TouchableOpacity
          className="h-9 w-9 items-center justify-center rounded-full bg-neutral-200"
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.neutral[800]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="h-9 w-9 items-center justify-center rounded-full bg-white border border-neutral-200"
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={colors.neutral[900]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
