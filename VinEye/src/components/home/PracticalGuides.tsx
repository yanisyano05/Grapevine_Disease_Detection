import { View, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import GuideListItem from "@/components/ui/GuideListItem";
import { GuideListItemSkeleton } from "@/components/ui/Skeleton";
import type { Guide } from "@/data/guides";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface PracticalGuidesProps {
  guides: Guide[];
  isLoading?: boolean;
}

export default function PracticalGuides({ guides, isLoading }: PracticalGuidesProps) {
  const navigation = useNavigation<Nav>();
  const items = guides.slice(0, 3);

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.card}>
        <GuideListItemSkeleton />
        <GuideListItemSkeleton />
        <GuideListItemSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {items.map((guide, index) => (
        <GuideListItem
          key={guide.id}
          guide={guide}
          onPress={() => navigation.navigate("GuideDetail", { guideId: guide.id })}
          showSeparator={index < items.length - 1}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
});
