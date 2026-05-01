import { Modal, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { WifiOff, Check } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";

interface OfflineNoticeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function OfflineNoticeModal({ visible, onClose }: OfflineNoticeModalProps) {
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
          {/* Icon header */}
          <View className="items-center mb-4">
            <View className="w-14 h-14 rounded-full items-center justify-center bg-[#FFF4E5]">
              <WifiOff size={26} color="#E67E22" strokeWidth={2.4} />
            </View>
          </View>

          <Text className="text-[18px] font-bold text-[#1A1A1A] text-center">
            {t("network.homeOfflineModalTitle")}
          </Text>
          <Text className="mt-2 text-[14px] leading-5 text-[#6B6B6B] text-center">
            {t("network.homeOfflineModalMessage")}
          </Text>

          <View className="mt-6">
            <Pressable
              onPress={onClose}
              className="min-h-[52px] rounded-[14px] py-3 px-3 items-center justify-center bg-primary active:opacity-85"
              style={{
                shadowColor: colors.primary[900],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center">
                <Check size={16} color="#FFFFFF" strokeWidth={2.6} />
                <Text className="text-[15px] font-bold text-white ml-2">
                  {t("network.homeOfflineModalAction")}
                </Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
