import { Modal, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { X, Check, Trash2, AlertTriangle } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";

type Variant = "default" | "destructive";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: Variant;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const cancelText = cancelLabel ?? t("common.cancel");
  const isDestructive = variant === "destructive";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        onPress={onCancel}
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
            <View
              className={`w-14 h-14 rounded-full items-center justify-center ${
                isDestructive ? "bg-[#FBE9E7]" : "bg-[#E8F5E9]"
              }`}
            >
              {isDestructive ? (
                <AlertTriangle
                  size={26}
                  color="#D32F2F"
                  strokeWidth={2.4}
                />
              ) : (
                <Check size={26} color={colors.primary[700]} strokeWidth={2.6} />
              )}
            </View>
          </View>

          {/* Title */}
          <Text className="text-[18px] font-bold text-[#1A1A1A] text-center">
            {title}
          </Text>

          {/* Message */}
          {message ? (
            <Text className="mt-2 text-[14px] leading-5 text-[#6B6B6B] text-center">
              {message}
            </Text>
          ) : null}

          {/* Actions */}
          <View className="flex-row mt-6">
            <Pressable
              onPress={onCancel}
              className="flex-1 min-h-[52px] rounded-[14px] py-3 px-3 items-center justify-center bg-[#F2F2F2] border border-[#E0E0E0] active:opacity-70"
              style={{ marginRight: 6 }}
            >
              <View className="flex-row items-center">
                <X size={16} color={colors.neutral[800]} strokeWidth={2.4} />
                <Text className="text-[15px] font-bold text-[#2D2D2D] ml-2">
                  {cancelText}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`flex-1 min-h-[52px] rounded-[14px] py-3 px-3 items-center justify-center active:opacity-85 ${
                isDestructive ? "bg-[#D32F2F]" : "bg-[#2D6A4F]"
              }`}
              style={{
                marginLeft: 6,
                shadowColor: isDestructive ? "#D32F2F" : colors.primary[900],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center">
                {isDestructive ? (
                  <Trash2 size={16} color="#FFFFFF" strokeWidth={2.4} />
                ) : (
                  <Check size={16} color="#FFFFFF" strokeWidth={2.6} />
                )}
                <Text className="text-[15px] font-bold text-white ml-2">
                  {confirmLabel}
                </Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
