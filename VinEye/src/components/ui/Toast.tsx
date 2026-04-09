import { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  WifiOff,
} from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

import { Text } from "@/components/ui/text";

export type ToastType = "success" | "error" | "warning" | "info" | "offline";

export interface ToastConfig {
  type: ToastType;
  message: string;
  subtitle?: string;
  duration?: number;
  persistent?: boolean;
}

interface ToastProps {
  config: ToastConfig | null;
  onDismiss: () => void;
}

// Palette Luxueuse : Fond sombre, accents subtils
const THEME: Record<ToastType, { iconColor: string }> = {
  success: { iconColor: "#10B981" }, // Emeraude subtil
  error: { iconColor: "#EF4444" },   // Rouge soft
  warning: { iconColor: "#F59E0B" }, // Ambre
  info: { iconColor: "#60A5FA" },    // Bleu ciel
  offline: { iconColor: "#94A3B8" }, // Ardoise
};

const ICONS = { 
  success: CheckCircle2, 
  error: XCircle, 
  warning: AlertCircle, 
  info: Info, 
  offline: WifiOff 
};

const TAB_BAR_HEIGHT = 70;

export default function Toast({ config, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!config) {
      translateY.value = withTiming(40, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
      return;
    }

    // Entrée élégante
    translateY.value = withSpring(0, { damping: 20, stiffness: 120 });
    opacity.value = withTiming(1, { duration: 400 });

    if (!config.persistent) {
      const timeout = setTimeout(() => {
        runOnJS(onDismiss)();
      }, config.duration ?? 3500);
      return () => clearTimeout(timeout);
    }
  }, [config]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const swipeGesture = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationY > 20 || Math.abs(e.translationX) > 50) {
        runOnJS(onDismiss)();
      }
    });

  if (!config) return null;

  const theme = THEME[config.type];
  const IconComponent = ICONS[config.type];

  return (
    <View
      style={[styles.wrapper, { bottom: TAB_BAR_HEIGHT + insets.bottom + 20 }]}
      pointerEvents="box-none"
    >
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.container, containerStyle]}>
          <View style={styles.textContainer}>
            <Text style={styles.message}>
              {config.message}
            </Text>
            {config.subtitle && (
              <Text style={styles.subtitle}>
                {config.subtitle}
              </Text>
            )}
          </View>
          
          <View style={styles.iconWrapper}>
            <IconComponent size={20} color={theme.iconColor} strokeWidth={2.5} />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 500,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20, // Plus arrondi pour le côté organique/moderne
    backgroundColor: "rgba(23, 23, 23, 0.95)", // Noir profond légèrement transparent
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)", // Bordure fine "glass"
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  message: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#A1A1AA", // Gris neutre (Zinc 400)
    marginTop: 2,
  },
  iconWrapper: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
  },
});