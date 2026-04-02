import React from "react";
import { View, Text, Dimensions } from "react-native";
import { Svg, Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  title: string;
  value: number; // Ex: 82 pour 82%
  trend: string; // Ex: "+5.1%"
  isUp?: boolean;
  color?: string;
}

const StatCard = ({
  title,
  value,
  trend,
  isUp = true,
  color = "#3B82F6",
}: StatCardProps) => {
  // Config de l'arc
  const size = 180;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // On veut un arc de 180 degrés (le haut du cercle)
  const arcTotalLength = circumference / 2;
  const progress = (value / 100) * arcTotalLength;

  return (
    <View className="bg-white p-6 rounded-[32px] shadow-sm overflow-hidden relative border border-gray-50">
      {/* Header : Titre + Icône flèche */}
      <View className="flex-row justify-between items-start mb-10">
        <Text className="text-gray-400 font-medium text-[15px]">{title}</Text>
        <View className="bg-gray-50 p-2 rounded-xl">
          <Ionicons
            name="arrow-up-outline"
            size={18}
            color="#9CA3AF"
            style={{ transform: [{ rotate: "45deg" }] }}
          />
        </View>
      </View>

      <View className="flex-row items-end justify-between">
        {/* Section Chiffres */}
        <View className="z-10">
          <View className="flex-row items-center mb-1">
            <Text
              className={`text-xs font-bold ${isUp ? "text-blue-500" : "text-red-500"}`}
            >
              {trend}
            </Text>
            <Ionicons
              name={isUp ? "caret-up" : "caret-down"}
              size={12}
              color={isUp ? "#3B82F6" : "#EF4444"}
              className="ml-1"
            />
          </View>
          <Text className="text-5xl font-bold text-gray-900 tracking-tighter">
            {value}%
          </Text>
        </View>

        {/* L'arc de cercle (Gauge) */}
        {/* On tourne de -180 deg pour que l'arc soit en haut/droite comme sur la photo */}
        <View
          className="absolute -right-6 -bottom-[92px]"
          style={{ transform: [{ rotate: "-190deg" }] }}
        >
          <Svg width={size} height={size}>
            {/* Rail gris */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F3F4F6"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcTotalLength} ${circumference}`}
              strokeLinecap="round"
              fill="none"
            />
            {/* Progression colorée */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${progress} ${circumference}`}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>

          {/* Le petit curseur blanc au bout du remplissage */}
          {/* Note: Le calcul de position exacte du point demande de la trigo, 
              ici on le place de façon fixe pour le style, ou on le retire pour plus de sobriété */}
          <View
            className="absolute bg-white rounded-full border-[3px] border-blue-500 shadow-sm"
            style={{
              width: 12,
              height: 12,
              top: "47%",
              left: 1,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default StatCard;
