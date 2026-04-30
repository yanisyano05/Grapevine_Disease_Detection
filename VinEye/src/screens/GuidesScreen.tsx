import { useState } from "react";
import { View, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { Text } from "@/components/ui/text";
import SearchHeader from "@/components/home/SearchHeader";
import SearchSection from "@/components/home/SearchSection";
import AnimatedSegmentedControl from "@/components/guides/AnimatedSegmentedControl";
import LargeDiseaseCard from "@/components/guides/LargeDiseaseCard";
import GuideListItem from "@/components/ui/GuideListItem";
import { DiseaseCardSkeleton, GuideListItemSkeleton } from "@/components/ui/Skeleton";
import { useDiseases } from "@/hooks/useDiseases";
import { useGuides } from "@/hooks/useGuides";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function GuidesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: diseases,
    isLoading: diseasesLoading,
    isRefreshing: diseasesRefreshing,
    refresh: refreshDiseases,
  } = useDiseases();

  const {
    data: guides,
    isLoading: guidesLoading,
    isRefreshing: guidesRefreshing,
    refresh: refreshGuides,
  } = useGuides();

  const tabs = [t("guides.tabDiseases"), t("guides.tabGuides")];

  async function handleRefresh() {
    if (activeTab === 0) await refreshDiseases();
    else await refreshGuides();
  }

  const isRefreshing = activeTab === 0 ? diseasesRefreshing : guidesRefreshing;
  const showDiseasesSkeleton = diseasesLoading && diseases.length === 0;
  const showGuidesSkeleton = guidesLoading && guides.length === 0;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#2D6A4F"
            progressViewOffset={insets.top}
          />
        }
      >
        <SearchHeader />
        <SearchSection />

        <AnimatedSegmentedControl
          tabs={tabs}
          activeIndex={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 0 ? (
          <View style={styles.diseaseList}>
            {showDiseasesSkeleton
              ? Array.from({ length: 3 }).map((_, i) => (
                  <DiseaseCardSkeleton key={i} style={{ height: 260, borderRadius: 32 }} />
                ))
              : diseases.map((disease, index) => (
                  <LargeDiseaseCard
                    key={disease.id}
                    disease={disease}
                    onPress={() =>
                      navigation.navigate("DiseaseDetail", { diseaseId: disease.id })
                    }
                    index={index}
                  />
                ))}
          </View>
        ) : (
          <View style={styles.guidesSection}>
            <Text style={styles.sectionTitle}>{t("guides.tabGuides")}</Text>
            <View style={styles.guidesList}>
              {showGuidesSkeleton
                ? Array.from({ length: 3 }).map((_, i) => <GuideListItemSkeleton key={i} />)
                : guides.map((guide, index) => (
                    <GuideListItem
                      key={guide.id}
                      guide={guide}
                      onPress={() =>
                        navigation.navigate("GuideDetail", { guideId: guide.id })
                      }
                      showSeparator={index < guides.length - 1}
                      index={index}
                    />
                  ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  diseaseList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  guidesSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  guidesList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
});
