import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import LargeDiseaseCard from "@/components/guides/LargeDiseaseCard";
import { CarouselCardSkeleton } from "@/components/ui/Skeleton";
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
      <View className="flex-row gap-4 px-5">
        <CarouselCardSkeleton />
        <CarouselCardSkeleton />
      </View>
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
