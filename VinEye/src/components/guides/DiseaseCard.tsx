import { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import type { Disease } from "@/data/diseases";

interface DiseaseCardProps {
  disease: Disease;
  onPress: () => void;
  style?: object;
}

const SEVERITY_COLORS: Record<
  Disease["severity"],
  { bg: string; label: string }
> = {
  high: { bg: "rgba(239, 68, 68, 0.9)", label: "guides.severity.critical" },
  medium: { bg: "rgba(245, 158, 11, 0.9)", label: "guides.severity.moderate" },
  low: { bg: "rgba(34, 197, 94, 0.9)", label: "guides.severity.low" },
};

export default function DiseaseCard({ disease, onPress, style }: DiseaseCardProps) {
  const { t } = useTranslation();
  const severity = SEVERITY_COLORS[disease.severity];
  const [imageError, setImageError] = useState(false);
  const hasImage = disease.images.length > 0 && !imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Background: image or fallback color + icon */}
      {hasImage ? (
        <Image
          source={{ uri: disease.images[0] }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.fallback,
            { backgroundColor: disease.bgColor },
          ]}
        >
          <Ionicons
            name={disease.icon as any}
            size={56}
            color={disease.iconColor}
          />
        </View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.75)"]}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Severity badge */}
      <View style={[styles.severityBadge, { backgroundColor: severity.bg }]}>
        <Text style={styles.severityText}>{t(severity.label)}</Text>
      </View>

      {/* Text content at bottom */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {t(disease.name)}
        </Text>
        <Text style={styles.season} numberOfLines={1}>
          {t(disease.season)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E0E0E0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  severityBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 22,
  },
  season: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
});
