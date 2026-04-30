import { useEffect, useState } from "react";
import {
  View,
  Pressable,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { X, Check } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";

interface EditNameBottomSheetProps {
  initialName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export function EditNameBottomSheet({
  initialName,
  onSave,
  onClose,
}: EditNameBottomSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialName);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const trimmedName = name.trim();
  const isDirty =
    trimmedName.length > 0 && trimmedName !== initialName.trim();

  function handleSave() {
    if (!isDirty) return;
    onSave(trimmedName);
  }

  // On Android edge-to-edge, the keyboard sits on top of content. We add
  // its height as bottom padding so the buttons stay visible above it.
  const bottomPadding =
    keyboardHeight > 0 ? keyboardHeight + 75 : insets.bottom + 34;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0 bg-black/40" />
        </TouchableWithoutFeedback>

        <Animated.View
          className="bg-white rounded-t-[28px] px-5 pt-3"
          style={{ paddingBottom: bottomPadding }}
        >
          <View className="items-center pb-2">
            <View className="w-10 h-1 rounded-full bg-[#E0E0E0]" />
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-[#1B1B1B]">
              {t("myPlants.detail.renameTitle")}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              className="w-8 h-8 rounded-full items-center justify-center bg-[#FAFAFA]"
            >
              <X size={18} color={colors.neutral[600]} />
            </Pressable>
          </View>

          <Text className="text-[13px] leading-[18px] text-[#6B6B6B] mb-3">
            {t("myPlants.detail.renameSubtitle")}
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t("myPlants.detail.renamePlaceholder")}
            placeholderTextColor={colors.neutral[400]}
            autoFocus
            maxLength={64}
            returnKeyType="done"
            onSubmitEditing={handleSave}
            className="border border-[#E0E0E0] rounded-[14px] px-3.5 py-3.5 text-base text-[#1B1B1B] bg-[#FAFAFA]"
          />

          <View className="flex-row pt-4 gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 min-h-[56px] rounded-[14px] py-4 px-3 items-center justify-center bg-[#F5F5F5] border-[1.5px] border-[#BDBDBD] active:opacity-70"
            >
              <View className="flex-row items-center">
                <X size={18} color={colors.neutral[800]} strokeWidth={2.4} />
                <Text className="text-base font-bold text-[#2D2D2D] ml-2 tracking-[0.2px]">
                  {t("myPlants.actions.cancel")}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!isDirty}
              className={
                isDirty
                  ? "flex-1 min-h-[56px] rounded-[14px] py-4 px-3 items-center justify-center bg-primary active:opacity-85"
                  : "flex-1 min-h-[56px] rounded-[14px] py-4 px-3 items-center justify-center bg-primary/40"
              }
            >
              <View className="flex-row items-center">
                <Check
                  size={18}
                  color="#FFFFFF"
                  strokeWidth={2.6}
                  opacity={isDirty ? 1 : 0.7}
                />
                <Text className="text-base font-bold text-white ml-2 tracking-[0.2px]">
                  {t("myPlants.detail.renameSave")}
                </Text>
              </View>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
