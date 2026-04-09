import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { RootStackParamList } from "@/types/navigation";
import { useDiseases } from "@/hooks/useDiseases";
import { useGuides } from "@/hooks/useGuides";
import SearchHeader from "@/components/home/SearchHeader";
import SearchSection from "@/components/home/SearchSection";
import SectionHeader from "@/components/home/components/homeheader";
import FrequentDiseases from "@/components/home/FrequentDiseases";
import SeasonAlert from "@/components/home/SeasonAlert";
import PracticalGuides from "@/components/home/PracticalGuides";
import HeroScanner from "@/components/home/HomeCta";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { data: diseases, isLoading: diseasesLoading } = useDiseases();
  const { data: guides } = useGuides();

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <SearchHeader />

        <SearchSection />

        <HeroScanner />

        {/* Frequent diseases carousel */}
        <View className="mb-6 gap-3">
          <View className="px-5">
            <SectionHeader
              title={t("home.frequentDiseases")}
              onViewAll={() => navigation.navigate("Main", { screen: "Guides" })}
            />
          </View>
          <FrequentDiseases diseases={diseases} isLoading={diseasesLoading} />
        </View>

        {/* Season alert */}
        <SeasonAlert />

        {/* Practical guides */}
        <View className="mx-5 mb-6 gap-3">
          <SectionHeader
            title={t("home.practicalGuides")}
            onViewAll={() => navigation.navigate("Main", { screen: "Guides" })}
          />
          <PracticalGuides guides={guides} />
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
