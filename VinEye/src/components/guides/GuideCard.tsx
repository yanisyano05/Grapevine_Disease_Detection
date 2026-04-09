import { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import type { Guide } from "@/data/guides";

interface GuideCardProps {
  guide: Guide;
  onPress: () => void;
}

export default function GuideCard({ guide, onPress }: GuideCardProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const hasImage = !!guide.image && !imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      {/* Background: image or fallback color + icon */}
      {hasImage ? (
        <Image
          source={{ uri: guide.image }}
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
            { backgroundColor: guide.bgColor },
          ]}
        >
          <Ionicons
            name={guide.icon as any}
            size={48}
            color={guide.iconColor}
          />
        </View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        start={{ x: 0, y: 0.25 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Read time badge */}
      <View style={styles.readTimeBadge}>
        <Ionicons name="time-outline" size={12} color="#FFFFFF" />
        <Text style={styles.readTimeText}>
          {t("common.readTime", { min: guide.readTime })}
        </Text>
      </View>

      {/* Text content at bottom */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {t(guide.title)}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {t(guide.subtitle)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 180,
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
  readTimeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  readTimeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
});
