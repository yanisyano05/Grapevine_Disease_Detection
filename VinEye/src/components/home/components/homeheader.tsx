import { View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

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
    <View className="flex-row items-center justify-between">
      <Text className="text-[17px] font-semibold text-neutral-900">
        {title}
      </Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text
            className="text-[13px] font-medium"
            style={{ color: colors.primary[700] }}
          >
            {t("common.viewAll") ?? "View all"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
