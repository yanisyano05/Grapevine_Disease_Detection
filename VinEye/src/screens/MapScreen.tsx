import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";

export default function MapScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="mb-6 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.primary[100] }}
        >
          <Ionicons name="map-outline" size={36} color={colors.primary[700]} />
        </View>
        <Text className="mb-2 text-xl font-semibold" style={{ color: colors.neutral[900] }}>
          {t("common.map")}
        </Text>
        <Text className="text-center text-sm" style={{ color: colors.neutral[500] }}>
          Coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
