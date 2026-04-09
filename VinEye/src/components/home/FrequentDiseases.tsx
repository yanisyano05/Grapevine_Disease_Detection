import { View, FlatList, StyleSheet } from "react-native";

import SmallDiseaseCard from "@/components/ui/SmallDiseaseCard";
import { CarouselCardSkeleton } from "@/components/ui/Skeleton";
import type { Disease } from "@/data/diseases";

interface FrequentDiseasesProps {
  diseases: Disease[];
  isLoading?: boolean;
}

export default function FrequentDiseases({ diseases, isLoading }: FrequentDiseasesProps) {
  if (isLoading && diseases.length === 0) {
    return (
      <View style={styles.skeletonRow}>
        <CarouselCardSkeleton />
        <CarouselCardSkeleton />
        <CarouselCardSkeleton />
      </View>
    );
  }

  return (
    <FlatList
      data={diseases}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item, index }) => (
        <SmallDiseaseCard
          disease={item}
          onPress={() => {}}
          index={index}
          size="carousel"
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 16,
  },
  skeletonRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 16,
  },
});
