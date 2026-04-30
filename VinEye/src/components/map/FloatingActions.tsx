import React from "react";
import { View, Pressable } from "react-native";
import { Layers, LocateFixed, Satellite } from "lucide-react-native";

import { colors } from "@/theme/colors";

export type FloatingActionId = "layers" | "locate" | "satellite";

interface FloatingActionsProps {
  onLayers?: () => void;
  onLocate?: () => void;
  onSatellite?: () => void;
  activeAction?: FloatingActionId;
}

function getIconColor(isActive: boolean) {
  return isActive ? "#FFFFFF" : colors.primary[800];
}

export function FloatingActions({
  onLayers,
  onLocate,
  onSatellite,
  activeAction,
}: FloatingActionsProps) {
  return (
    <View className="gap-3 shadow-2xl" collapsable={false}>
      <ActionButton active={activeAction === "layers"} onPress={onLayers}>
        <Layers
          size={20}
          color={getIconColor(activeAction === "layers")}
          strokeWidth={2.2}
        />
      </ActionButton>

      <ActionButton active={activeAction === "locate"} onPress={onLocate}>
        <LocateFixed
          size={20}
          color={getIconColor(activeAction === "locate")}
          strokeWidth={2.2}
        />
      </ActionButton>

      <ActionButton active={activeAction === "satellite"} onPress={onSatellite}>
        <Satellite
          size={20}
          color={getIconColor(activeAction === "satellite")}
          strokeWidth={2.2}
        />
      </ActionButton>
    </View>
  );
}

interface ActionButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  active?: boolean;
}

function ActionButton({ children, onPress, active }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-10 h-10 rounded-full items-center justify-center shadow-lg ${
        active ? "bg-primary" : "bg-card border border-border"
      }`}
      style={({ pressed }) => [
        { transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}
