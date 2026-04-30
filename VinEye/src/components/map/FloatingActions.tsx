import { View, Pressable, StyleSheet } from "react-native";
import { Layers, LocateFixed, Satellite } from "lucide-react-native";

import { colors } from "@/theme/colors";

export type FloatingActionId = "layers" | "locate" | "satellite";

interface FloatingActionsProps {
  onLayers?: () => void;
  onLocate?: () => void;
  onSatellite?: () => void;
  activeAction?: FloatingActionId;
}

export function FloatingActions({
  onLayers,
  onLocate,
  onSatellite,
  activeAction,
}: FloatingActionsProps) {
  return (
    <View style={styles.column}>
      <ActionButton active={activeAction === "layers"} onPress={onLayers}>
        <Layers
          size={22}
          color={activeAction === "layers" ? "#FFFFFF" : colors.primary[800]}
          strokeWidth={2.2}
        />
      </ActionButton>
      <ActionButton active={activeAction === "locate"} onPress={onLocate}>
        <LocateFixed
          size={22}
          color={activeAction === "locate" ? "#FFFFFF" : colors.primary[800]}
          strokeWidth={2.2}
        />
      </ActionButton>
      <ActionButton active={activeAction === "satellite"} onPress={onSatellite}>
        <Satellite
          size={22}
          color={activeAction === "satellite" ? "#FFFFFF" : colors.primary[800]}
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
      style={({ pressed }) => [
        styles.button,
        active ? styles.buttonActive : styles.buttonInactive,
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 12,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonActive: {
    backgroundColor: colors.primary[900],
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
