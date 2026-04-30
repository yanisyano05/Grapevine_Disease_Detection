import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
}

export default function SearchBar({
  placeholder,
  value,
  onChangeText,
  onFilterPress,
  showFilter = true,
}: SearchBarProps) {
  return (
    <View style={styles.searchWrapper}>
      <Ionicons
        name="search"
        size={20}
        color={colors.neutral[400]}
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        value={value}
        multiline={false}
        numberOfLines={1}
        scrollEnabled={false}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Rechercher..."}
        placeholderTextColor={colors.neutral[400]}
        selectionColor={colors.primary[500]}
        autoCorrect={false}
      />

      {showFilter && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={styles.filterButton}
          activeOpacity={0.7}
        >
          <View style={styles.divider} />
          <Ionicons
            name="options-outline"
            size={18}
            color={colors.primary[600]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "#EAECEF",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: colors.neutral[900],
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#E2E4E7",
    marginRight: 12,
  },
});
