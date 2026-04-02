import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { RootStackParamList } from "@/types/navigation";
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
              onViewAll={() => navigation.navigate("Guides")}
            />
          </View>
          <FrequentDiseases />
        </View>

        {/* Season alert */}
        <SeasonAlert />

        {/* Practical guides */}
        <View className="mx-5 mb-6 gap-3">
          <SectionHeader
            title={t("home.practicalGuides")}
            onViewAll={() => navigation.navigate("Guides")}
          />
          <PracticalGuides />
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
