import { useEffect, useRef, useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";

import type { RootStackParamList } from "@/types/navigation";
import { useDiseases } from "@/hooks/useDiseases";
import { useGuides } from "@/hooks/useGuides";
import { useNetwork } from "@/contexts/NetworkContext";
import SearchHeader from "@/components/home/SearchHeader";
import SearchSection from "@/components/home/SearchSection";
import SectionHeader from "@/components/home/components/homeheader";
import FrequentDiseasesHorizontal from "@/components/home/FrequentDiseasesHorizontal";
// import SeasonAlert from "@/components/home/SeasonAlert"; // TODO: réactiver quand la page Notifications sera de retour
import PracticalGuides from "@/components/home/PracticalGuides";
import RecentScans from "@/components/home/RecentScans";
import { OfflineNoticeModal } from "@/components/ui/OfflineNoticeModal";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ENTER_DURATION = 420;
// Reanimated v4 : un `entering` avec delay 0 sur un nœud fraîchement monté peut
// rester invisible (l'anim démarre avant que le layout soit prêt). On garantit
// au minimum 60ms pour que la 1re vue rende toujours.
function entering(delay: number) {
  return FadeInDown.delay(Math.max(delay, 60))
    .duration(ENTER_DURATION)
    .springify()
    .damping(16);
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { data: diseases, isLoading: diseasesLoading } = useDiseases();
  const { data: guides, isLoading: guidesLoading } = useGuides();
  const { isConnected } = useNetwork();

  // Modal "Connexion requise" affichée 1× par session offline.
  // Reset du flag quand l'utilisateur se reconnecte → si il repart offline,
  // la modal se réaffichera la prochaine fois qu'il atteint Home.
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const dismissedThisOfflineSessionRef = useRef(false);

  useEffect(() => {
    if (isConnected) {
      dismissedThisOfflineSessionRef.current = false;
      return;
    }
    if (!dismissedThisOfflineSessionRef.current) {
      setOfflineModalOpen(true);
    }
  }, [isConnected]);

  function handleCloseOfflineModal() {
    setOfflineModalOpen(false);
    dismissedThisOfflineSessionRef.current = true;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Animated.View entering={entering(0)}>
          <SearchHeader />
        </Animated.View>

        <Animated.View entering={entering(60)}>
          <SearchSection />
        </Animated.View>

        <Animated.View entering={entering(120)}>
          <RecentScans />
        </Animated.View>

        {/* Frequent diseases carousel */}
        <Animated.View entering={entering(200)} className="mb-6 gap-3">
          <View className="px-5">
            <SectionHeader
              title={t("home.frequentDiseases")}
              onViewAll={() => navigation.navigate("Main", { screen: "Guides" })}
            />
          </View>
          <FrequentDiseasesHorizontal
            diseases={diseases}
            isLoading={diseasesLoading}
          />
        </Animated.View>

        {/* Season alert — désactivé tant que la page Notifications n'est pas prête */}
        {/* <SeasonAlert /> */}

        {/* Practical guides */}
        <Animated.View entering={entering(280)} className="mx-5 mb-6 gap-3">
          <SectionHeader
            title={t("home.practicalGuides")}
            onViewAll={() => navigation.navigate("Main", { screen: "Guides" })}
          />
          <PracticalGuides guides={guides} isLoading={guidesLoading} />
        </Animated.View>

        <View className="h-8" />
      </ScrollView>

      <OfflineNoticeModal
        visible={offlineModalOpen}
        onClose={handleCloseOfflineModal}
      />
    </SafeAreaView>
  );
}
