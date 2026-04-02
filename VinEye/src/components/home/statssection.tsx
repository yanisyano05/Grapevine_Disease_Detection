import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import StatCard from "./gamificationstat";
import SectionHeader from "./components/homeheader";
// import SectionHeader from '@/components/SectionHeader';

export default function StatisticsSection({ progress }: { progress: any }) {
  const { t } = useTranslation();

  // On ne garde que les deux stats essentielles
  const STATS = [
    {
      label: t("home.daily_streak"),
      value: `${progress.streak}`,
      unit: t("profile.days"),
      icon: "flame",
      color: "#F59E0B", // Amber 500
      bgColor: "#FFFBEB", // Amber 50
    },
    {
      label: t("home.total_xp"),
      value: `${progress.xpTotal}`,
      unit: "XP",
      icon: "flash",
      color: "#3B82F6", // Blue 500
      bgColor: "#EFF6FF", // Blue 50
    },
  ];

  return (
    <View className="mx-5 mb-2">
      <View>
        <SectionHeader title={t("home.statistics") ?? "Statistics"} />
      </View>

      {/* Progression Section */}
      <View className="my-2">
        <StatCard
          title="Task Execution"
          value={82}
          trend="+5.1%"
          color="#3B82F6"
        />
      </View>

      {/* Container avec un gap réduit pour coller les cartes */}
      <View className="flex-row gap-3">
        {STATS.map((stat, i) => (
          <View
            key={i}
            className="flex-1 bg-white p-4 rounded-[32px] shadow-sm overflow-hidden relative border border-gray-50"
            style={{
              elevation: 2,

              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
            }}
          >
            {/* Top Row: Icon + Unit */}
            <View className="flex-row justify-between items-start mb-2">
              <View
                className="w-8 h-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: stat.bgColor }}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={16}
                  color={stat.color}
                />
              </View>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {stat.unit}
              </Text>
            </View>

            {/* Value Section */}
            <View>
              <Text className="text-2xl font-bold text-gray-900 leading-tight">
                {stat.value}
              </Text>
              <Text
                className="text-[11px] font-medium mt-0.5"
                style={{ color: stat.color }}
                numberOfLines={1}
              >
                {stat.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
