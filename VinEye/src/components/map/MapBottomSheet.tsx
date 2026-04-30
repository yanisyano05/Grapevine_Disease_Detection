import { forwardRef, useMemo, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  AlertTriangle,
  Leaf,
  Clock,
  Pencil,
  X,
  ScanLine,
  MapPin,
} from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import { getScanStatus } from "@/types/detection";
import { getScanDisplayName } from "@/utils/scanDisplay";
import type { ScanRecord, ScanStatus } from "@/types/detection";

interface MapBottomSheetProps {
  scans: ScanRecord[];
  onScanPress?: (scan: ScanRecord) => void;
  onRename?: (scanId: string, newName: string) => void;
  onScanCta?: () => void;
  defaultIndex?: number;
}

export const MapBottomSheet = forwardRef<BottomSheet, MapBottomSheetProps>(
  function MapBottomSheet({ scans, onScanPress, onRename, onScanCta, defaultIndex = 0 }, ref) {
    const { t } = useTranslation();
    const snapPoints = useMemo(() => ["20%", "55%", "85%"], []);
    const [renamingScan, setRenamingScan] = useState<ScanRecord | null>(null);
    const [draftName, setDraftName] = useState("");

    function handleStartRename(scan: ScanRecord) {
      setRenamingScan(scan);
      setDraftName(getScanDisplayName(scan, t));
    }

    function handleConfirmRename() {
      if (renamingScan) {
        onRename?.(renamingScan.id, draftName);
      }
      setRenamingScan(null);
      setDraftName("");
    }

    function handleCancelRename() {
      setRenamingScan(null);
      setDraftName("");
    }

    return (
      <>
        <BottomSheet
          ref={ref}
          index={defaultIndex}
          snapPoints={snapPoints}
          handleIndicatorStyle={styles.handleIndicator}
          backgroundStyle={styles.background}
          enablePanDownToClose={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t("map.scannedPlants")}</Text>
            <Text style={styles.count}>
              {t("map.plantCount", { count: scans.length })}
            </Text>
          </View>

          {scans.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <MapPin size={32} color={colors.primary[800]} strokeWidth={2} />
              </View>
              <Text style={styles.emptyTitle}>{t("map.empty.title")}</Text>
              <Text style={styles.emptySubtitle}>{t("map.empty.subtitle")}</Text>
              {onScanCta && (
                <Pressable
                  onPress={onScanCta}
                  style={({ pressed }) => [
                    styles.emptyCta,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <ScanLine size={18} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.emptyCtaLabel}>{t("map.empty.cta")}</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <BottomSheetScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {scans.map((scan, index) => (
                <ScanRow
                  key={scan.id}
                  scan={scan}
                  isLast={index === scans.length - 1}
                  onPress={() => onScanPress?.(scan)}
                  onEdit={() => handleStartRename(scan)}
                />
              ))}
            </BottomSheetScrollView>
          )}
        </BottomSheet>

        <Modal
          visible={renamingScan !== null}
          transparent
          animationType="fade"
          onRequestClose={handleCancelRename}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalOverlay}
          >
            <Pressable style={styles.modalBackdrop} onPress={handleCancelRename} />
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("map.rename.title")}</Text>
                <Pressable onPress={handleCancelRename} hitSlop={10}>
                  <X size={20} color={colors.neutral[600]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtitle}>{t("map.rename.subtitle")}</Text>
              <TextInput
                style={styles.modalInput}
                value={draftName}
                onChangeText={setDraftName}
                placeholder={t("map.rename.placeholder")}
                placeholderTextColor={colors.neutral[400]}
                autoFocus
                maxLength={64}
                returnKeyType="done"
                onSubmitEditing={handleConfirmRename}
              />
              <View style={styles.modalActions}>
                <Pressable
                  onPress={handleCancelRename}
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.modalButtonGhost,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.modalButtonGhostLabel}>
                    {t("common.cancel")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmRename}
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.modalButtonPrimary,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.modalButtonPrimaryLabel}>
                    {t("map.rename.save")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </>
    );
  }
);

const STATUS_TINT: Record<ScanStatus, { bg: string; fg: string }> = {
  healthy: { bg: colors.primary[100], fg: colors.primary[800] },
  infected: { bg: "#FCEBEB", fg: "#A32D2D" },
  uncertain: { bg: "#FAEEDA", fg: "#BA7517" },
};

interface ScanRowProps {
  scan: ScanRecord;
  isLast: boolean;
  onPress: () => void;
  onEdit: () => void;
}

function ScanRow({ scan, isLast, onPress, onEdit }: ScanRowProps) {
  const { t } = useTranslation();
  const status = getScanStatus(scan);
  const tint = STATUS_TINT[status];
  const Icon =
    status === "healthy" ? Leaf : status === "infected" ? AlertTriangle : Clock;

  const displayName = getScanDisplayName(scan, t);
  const formattedDate = new Date(scan.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Pressable onPress={onPress} style={styles.rowMain}>
        <View style={[styles.iconBadge, { backgroundColor: tint.bg }]}>
          <Icon size={22} color={tint.fg} strokeWidth={2.2} />
        </View>

        <View style={styles.rowText}>
          <Text style={styles.location} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.region} numberOfLines={1}>
            {formattedDate}
          </Text>
        </View>
      </Pressable>

      <Pressable onPress={onEdit} hitSlop={8} style={styles.editPencil}>
        <Pencil size={16} color={colors.neutral[600]} strokeWidth={2} />
      </Pressable>
      <Pressable onPress={onPress} hitSlop={8}>
        <ChevronRight size={20} color={colors.neutral[400]} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  handleIndicator: {
    backgroundColor: colors.neutral[300],
    width: 40,
    height: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  count: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.neutral[500],
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  location: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  region: {
    fontSize: 13,
    color: colors.neutral[600],
  },
  editPencil: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral[100],
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 8,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.neutral[600],
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 4,
  },
  emptyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary[800],
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 8,
  },
  emptyCtaLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.neutral[900],
    backgroundColor: "#FAFAFA",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonGhost: {
    backgroundColor: colors.neutral[100],
  },
  modalButtonGhostLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral[800],
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary[800],
  },
  modalButtonPrimaryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
