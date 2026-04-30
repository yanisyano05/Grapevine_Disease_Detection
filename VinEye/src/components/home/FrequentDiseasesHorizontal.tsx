import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import LargeDiseaseCard from "@/components/guides/LargeDiseaseCard";
import { LargeDiseaseCardCompactSkeleton } from "@/components/ui/Skeleton";
import type { Disease } from "@/data/diseases";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  diseases: Disease[];
  isLoading?: boolean;
}

const CARD_WIDTH = 260;

export default function FrequentDiseasesHorizontal({
  diseases,
  isLoading,
}: Props) {
  const navigation = useNavigation<Nav>();

  if (isLoading && diseases.length === 0) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 12,
          paddingVertical: 8,
        }}
      >
        {[0, 1, 2].map((k) => (
          <View key={k} style={{ width: CARD_WIDTH }}>
            <LargeDiseaseCardCompactSkeleton />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingVertical: 8 }}
    >
      {diseases.map((d, i) => (
        <View key={d.id} style={{ width: CARD_WIDTH }}>
          <LargeDiseaseCard
            disease={d}
            index={i}
            compact={true}
            onPress={() =>
              navigation.navigate("DiseaseDetail", { diseaseId: d.id })
            }
          />
        </View>
      ))}
    </ScrollView>
  );
}
