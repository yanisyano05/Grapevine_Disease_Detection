import { Modal, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Check, Globe } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";

export type LanguageCode = "fr" | "en";

interface LanguageOption {
  code: LanguageCode;
  flag: string;
  label: string;
}

interface LanguagePickerModalProps {
  visible: boolean;
  current: LanguageCode;
  onSelect: (code: LanguageCode) => void;
  onClose: () => void;
}

const OPTIONS: LanguageOption[] = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
];

export function LanguagePickerModal({
  visible,
  current,
  onSelect,
  onClose,
}: LanguagePickerModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center px-6 bg-black/50"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[400px] bg-white rounded-3xl p-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.18,
            shadowRadius: 28,
            elevation: 16,
          }}
        >
          {/* Header */}
          <View className="items-center mb-4">
            <View className="w-14 h-14 rounded-full items-center justify-center bg-[#E8F5E9]">
              <Globe size={26} color={colors.primary[700]} strokeWidth={2.4} />
            </View>
          </View>

          <Text className="text-[18px] font-bold text-[#1A1A1A] text-center">
            {t("settings.language.title")}
          </Text>
          <Text className="mt-2 text-[14px] leading-5 text-[#6B6B6B] text-center">
            {t("settings.language.subtitle")}
          </Text>

          {/* Options */}
          <View className="mt-6 gap-2">
            {OPTIONS.map((opt) => {
              const isCurrent = opt.code === current;
              return (
                <Pressable
                  key={opt.code}
                  onPress={() => onSelect(opt.code)}
                  className={`flex-row items-center gap-3 py-4 px-4 rounded-2xl border-2 active:opacity-70 ${
                    isCurrent
                      ? "bg-[#E8F5E9] border-[#2D6A4F]"
                      : "bg-white border-[#E5E7EB]"
                  }`}
                >
                  <Text className="text-[28px]">{opt.flag}</Text>
                  <Text
                    className={`flex-1 text-[16px] font-semibold ${
                      isCurrent ? "text-[#2D6A4F]" : "text-[#1A1A1A]"
                    }`}
                  >
                    {opt.label}
                  </Text>
                  {isCurrent && (
                    <View className="w-7 h-7 rounded-full items-center justify-center bg-[#2D6A4F]">
                      <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Cancel */}
          <Pressable
            onPress={onClose}
            className="mt-5 min-h-[52px] rounded-[14px] py-3 px-3 items-center justify-center bg-[#F2F2F2] border border-[#E0E0E0] active:opacity-70"
          >
            <Text className="text-[15px] font-bold text-[#2D2D2D]">
              {t("common.cancel")}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
