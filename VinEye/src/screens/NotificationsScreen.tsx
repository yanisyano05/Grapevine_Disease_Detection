import { useState, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";

// ─── Types ───────────────────────────────────────────────

type NotificationType = "health_alert" | "tip" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

// ─── Mock Data ───────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "health_alert",
    title: "notifications.mock.mildewAlert.title",
    body: "notifications.mock.mildewAlert.body",
    timestamp: "2026-04-02T14:30:00Z",
    read: false,
  },
  {
    id: "2",
    type: "tip",
    title: "notifications.mock.sulfurTip.title",
    body: "notifications.mock.sulfurTip.body",
    timestamp: "2026-04-01T09:15:00Z",
    read: false,
  },
  {
    id: "3",
    type: "system",
    title: "notifications.mock.scanReminder.title",
    body: "notifications.mock.scanReminder.body",
    timestamp: "2026-03-31T18:00:00Z",
    read: true,
  },
  {
    id: "4",
    type: "health_alert",
    title: "notifications.mock.botrytisAlert.title",
    body: "notifications.mock.botrytisAlert.body",
    timestamp: "2026-03-30T11:45:00Z",
    read: true,
  },
  {
    id: "5",
    type: "tip",
    title: "notifications.mock.pruningTip.title",
    body: "notifications.mock.pruningTip.body",
    timestamp: "2026-03-29T07:00:00Z",
    read: true,
  },
  {
    id: "6",
    type: "system",
    title: "notifications.mock.updateAvailable.title",
    body: "notifications.mock.updateAvailable.body",
    timestamp: "2026-03-28T15:30:00Z",
    read: true,
  },
];

// ─── Style tokens per type ───────────────────────────────

const TYPE_STYLES: Record<
  NotificationType,
  { icon: string; iconColor: string; bgColor: string; dotColor: string }
> = {
  health_alert: {
    icon: "alert-circle",
    iconColor: "#DC2626",
    bgColor: "#FEE2E2",
    dotColor: "#EF4444",
  },
  tip: {
    icon: "bulb",
    iconColor: "#0D9488",
    bgColor: "#CCFBF1",
    dotColor: "#14B8A6",
  },
  system: {
    icon: "notifications",
    iconColor: "#6366F1",
    bgColor: "#E0E7FF",
    dotColor: "#818CF8",
  },
};

// ─── Helpers ─────────────────────────────────────────────

function timeAgo(timestamp: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ─── Component ───────────────────────────────────────────

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const renderItem = ({ item }: { item: Notification }) => {
    const style = TYPE_STYLES[item.type];

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => markRead(item.id)}
        style={[styles.card, !item.read && styles.cardUnread]}
      >
        {/* Unread dot */}
        {!item.read && (
          <View style={[styles.unreadDot, { backgroundColor: style.dotColor }]} />
        )}

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: style.bgColor }]}>
          <Ionicons name={style.icon as any} size={22} color={style.iconColor} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={[styles.title, !item.read && styles.titleUnread]}
            >
              {t(item.title)}
            </Text>
            <Text style={styles.time}>{timeAgo(item.timestamp, t)}</Text>
          </View>
          <Text numberOfLines={2} style={styles.body}>
            {t(item.body)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="notifications-off-outline" size={48} color={colors.neutral[300]} />
      </View>
      <Text style={styles.emptyTitle}>{t("notifications.empty.title")}</Text>
      <Text style={styles.emptyBody}>{t("notifications.empty.body")}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.neutral[900]} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {t("common.notifications")}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={markAllRead}
          style={styles.markAllButton}
          activeOpacity={0.7}
          disabled={unreadCount === 0}
        >
          <Text
            style={[
              styles.markAllText,
              unreadCount === 0 && styles.markAllDisabled,
            ]}
          >
            {t("notifications.markAllRead")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F5F7F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary[700],
  },
  markAllDisabled: {
    color: colors.neutral[300],
  },

  // List
  list: {
    padding: 20,
    paddingBottom: 40,
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardUnread: {
    backgroundColor: "#FAFCFF",
    borderColor: "#E8EEFF",
  },

  // Unread dot
  unreadDot: {
    position: "absolute",
    top: 18,
    left: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Icon
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  // Content
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral[700],
    flex: 1,
    marginRight: 8,
  },
  titleUnread: {
    fontWeight: "800",
    color: colors.neutral[900],
  },
  time: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[400],
  },
  body: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.neutral[500],
    lineHeight: 18,
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: "#F5F7F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.neutral[400],
    textAlign: "center",
    lineHeight: 20,
  },
});
