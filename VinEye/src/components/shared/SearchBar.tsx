import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  onTriggerPress?: () => void;
  showFilter?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder,
  value,
  onChangeText,
  onFilterPress,
  onTriggerPress,
  showFilter = false,
  autoFocus = false,
}: SearchBarProps) {
  const triggerMode = !!onTriggerPress;
  const wrapperClass =
    "flex-row items-center bg-white rounded-full px-4 h-[52px] border border-[#EAECEF]";

  const content = (
    <>
      <Ionicons name="search" size={20} color={colors.neutral[400]} />

      {triggerMode ? (
        <Text
          className="flex-1 ml-2.5 text-[15px] font-medium text-[#9CA3AF]"
          numberOfLines={1}
        >
          {placeholder ?? "Rechercher..."}
        </Text>
      ) : (
        <TextInput
          className="flex-1 ml-2.5 text-[15px] font-medium text-[#1A1A1A] h-full"
          style={{
            paddingVertical: 0,
            paddingHorizontal: 0,
            textAlignVertical: "center",
            includeFontPadding: false,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? "Rechercher..."}
          placeholderTextColor={colors.neutral[400]}
          selectionColor={colors.primary[500]}
          autoCorrect={false}
          autoFocus={autoFocus}
          multiline={false}
          numberOfLines={1}
          scrollEnabled={false}
        />
      )}

      {showFilter && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onFilterPress?.();
          }}
          className="flex-row items-center pl-3 active:opacity-70"
        >
          <View className="w-px h-5 bg-[#E2E4E7] mr-3" />
          <Ionicons
            name="options-outline"
            size={18}
            color={colors.primary[600]}
          />
        </Pressable>
      )}
    </>
  );

  if (triggerMode) {
    return (
      <Pressable
        onPress={onTriggerPress}
        className={`${wrapperClass} active:opacity-90`}
      >
        {content}
      </Pressable>
    );
  }

  return <View className={wrapperClass}>{content}</View>;
}
