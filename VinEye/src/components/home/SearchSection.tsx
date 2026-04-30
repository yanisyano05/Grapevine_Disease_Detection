import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import SearchBar from "@/components/shared/SearchBar";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SearchSection() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <View className="px-5 pt-1 pb-4">
      <SearchBar
        placeholder={t("home.searchPlaceholder") ?? "Rechercher..."}
        onTriggerPress={() => navigation.navigate("Search")}
      />
    </View>
  );
}
