import { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HeroScanner() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.bannerContainer}>
      {/* Decorative background */}
      <View style={styles.gridOverlay} />
      <View style={styles.leafDecorator}>
        <Ionicons name="leaf" size={140} color={colors.primary[300]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("home.bannerTitle")}</Text>
        <Text style={styles.subtitle}>{t("home.bannerSubtitle")}</Text>
      </View>

      {/* Animated scan zone */}
      <View style={styles.scanZone}>
        <Animated.View style={[styles.pulseOuter, pulseStyle]}>
          <View style={styles.pulseInner}>
            <View style={styles.iconCircle}>
              <Ionicons name="scan-outline" size={38} color={colors.surface} />
            </View>
          </View>
        </Animated.View>
       
      </View>

      {/* Main CTA button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("Scanner")}
        style={styles.mainButton}
      >
        <Text style={styles.buttonText}>{t("home.scanButton")}</Text>
        <View style={styles.buttonIconWrapper}>
          <MaterialIcons
            name="arrow-forward"
            size={18}
            color={colors.primary[800]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 32,
    padding: 24,
    backgroundColor: colors.primary[600],
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[900],
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  leafDecorator: {
    position: "absolute",
    top: -20,
    right: -20,
    opacity: 0.15,
    transform: [{ rotate: "-15deg" }],
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.surface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.primary[200],
    marginTop: 4,
    maxWidth: "80%",
    lineHeight: 20,
  },
  scanZone: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  pulseOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primary[500] + "26",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseInner: {
    width: 85,
    height: 85,
    borderRadius: 42,
    backgroundColor: colors.primary[400] + "40",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary[300] + "4D",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[400] + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  hintText: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary[200],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary[900],
    marginRight: 8,
  },
  buttonIconWrapper: {
    backgroundColor: colors.primary[100],
    padding: 4,
    borderRadius: 8,
  },
});
