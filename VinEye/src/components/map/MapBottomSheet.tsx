import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Text as RNText,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Leaf,
  Clock,
  Pencil,
  X,
  ScanLine,
  MapPin,
  Check,
} from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import { getScanStatus } from "@/types/detection";
import { getScanDisplayName } from "@/utils/scanDisplay";
import type { ScanRecord, ScanStatus } from "@/types/detection";

interface MapBottomSheetProps {
  scans: ScanRecord[];
  previewScan?: ScanRecord | null;
  onPreviewClose?: () => void;
  onScanPress?: (scan: ScanRecord) => void;
  onRename?: (scanId: string, newName: string) => void;
  onScanCta?: () => void;
  defaultIndex?: number;
}

export const MapBottomSheet = forwardRef<BottomSheet, MapBottomSheetProps>(
  function MapBottomSheet(
    {
      scans,
      previewScan,
      onPreviewClose,
      onScanPress,
      onRename,
      onScanCta,
      defaultIndex = 0,
    },
    ref,
  ) {
    const { t } = useTranslation();
    const snapPoints = useMemo(() => ["20%", "55%", "85%"], []);
    const internalRef = useRef<BottomSheet>(null);
    const [renamingScan, setRenamingScan] = useState<ScanRecord | null>(null);
    const [draftName, setDraftName] = useState("");

    useImperativeHandle(
      ref,
      () =>
        ({
          snapToIndex: (i: number) => internalRef.current?.snapToIndex(i),
          snapToPosition: (p: number | string) =>
            internalRef.current?.snapToPosition(p),
          expand: () => internalRef.current?.expand(),
          collapse: () => internalRef.current?.collapse(),
          close: () => internalRef.current?.close(),
          forceClose: () => internalRef.current?.forceClose(),
        }) as BottomSheet,
      [],
    );

    useEffect(() => {
      if (renamingScan) {
        setDraftName(getScanDisplayName(renamingScan, t));
      }
    }, [renamingScan, t]);

    function handleStartRename(scan: ScanRecord) {
      setRenamingScan(scan);
      // remonte à 85% pour bien voir l'input + boutons au-dessus du clavier
      internalRef.current?.snapToIndex(2);
    }

    function handleConfirmRename() {
      if (renamingScan) {
        onRename?.(renamingScan.id, draftName);
      }
      setRenamingScan(null);
      setDraftName("");
      // redescend pour voir la map
      internalRef.current?.snapToIndex(0);
    }

    function handleCancelRename() {
      setRenamingScan(null);
      setDraftName("");
      // redescend pour voir la map
      internalRef.current?.snapToIndex(0);
    }

    return (
      <>
        <BottomSheet
          ref={internalRef}
          index={defaultIndex}
          snapPoints={snapPoints}
          handleIndicatorStyle={styles.handleIndicator}
          backgroundStyle={styles.background}
          containerStyle={styles.sheetContainer}
          enableDynamicSizing={false}
          enablePanDownToClose={false}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
        >
          {renamingScan ? (
            <BottomSheetScrollView
              contentContainerStyle={[
                styles.renameWrap,
                { paddingBottom: 24 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.renameHeader}>
                <Pressable
                  onPress={handleCancelRename}
                  hitSlop={10}
                  style={styles.backBtn}
                >
                  <ChevronLeft size={20} color={colors.neutral[700]} />
                </Pressable>
                <Text style={styles.title}>{t("map.rename.title")}</Text>
                <View style={styles.backBtnPlaceholder} />
              </View>
              <Text style={styles.renameSubtitle}>
                {t("map.rename.subtitle")}
              </Text>
              <BottomSheetTextInput
                value={draftName}
                onChangeText={setDraftName}
                placeholder={t("map.rename.placeholder")}
                placeholderTextColor={colors.neutral[400]}
                autoFocus
                maxLength={64}
                returnKeyType="done"
                onSubmitEditing={handleConfirmRename}
                style={styles.renameInput}
              />
              <View style={styles.renameActions}>
                <Pressable
                  onPress={handleCancelRename}
                  style={({ pressed }) => [
                    styles.renameBtn,
                    styles.renameBtnGhost,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.renameBtnInner}>
                    <X
                      size={18}
                      color={colors.neutral[800]}
                      strokeWidth={2.4}
                    />
                    <RNText style={styles.renameBtnGhostLabel}>
                      {t("common.cancel")}
                    </RNText>
                  </View>
                </Pressable>
                <Pressable
                  onPress={handleConfirmRename}
                  style={({ pressed }) => [
                    styles.renameBtn,
                    styles.renameBtnPrimary,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View style={styles.renameBtnInner}>
                    <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
                    <RNText style={styles.renameBtnPrimaryLabel}>
                      {t("map.rename.save")}
                    </RNText>
                  </View>
                </Pressable>
              </View>
            </BottomSheetScrollView>
          ) : previewScan ? (
            <View>
              <View style={styles.previewHeader}>
                <Text style={styles.title}>{t("map.preview.title")}</Text>
                <Pressable
                  onPress={onPreviewClose}
                  hitSlop={10}
                  style={styles.previewCloseBtn}
                >
                  <X size={18} color={colors.neutral[600]} />
                </Pressable>
              </View>
              <View style={styles.previewBody}>
                <ScanRow
                  scan={previewScan}
                  isLast
                  onPress={() => onScanPress?.(previewScan)}
                  onEdit={() => handleStartRename(previewScan)}
                />
                <Text style={styles.previewHint}>
                  {t("map.preview.tapHint")}
                </Text>
              </View>
            </View>
          ) : (
            <>
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
            </>
          )}
        </BottomSheet>
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
  sheetContainer: {
    zIndex: 100,
    elevation: 100,
  },
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
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  previewCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral[100],
  },
  previewBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  previewHint: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.neutral[500],
    textAlign: "center",
    paddingTop: 4,
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
  // Rename inline form
  renameWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
    gap: 12,
  },
  renameHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral[100],
  },
  backBtnPlaceholder: {
    width: 36,
    height: 36,
  },
  renameSubtitle: {
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  renameInput: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.neutral[900],
    backgroundColor: "#FAFAFA",
  },
  renameActions: {
    flexDirection: "row",
    paddingTop: 16,
    gap: 12,
  },
  renameBtn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  renameBtnInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  renameBtnGhost: {
    backgroundColor: colors.neutral[200],
    borderWidth: 1.5,
    borderColor: colors.neutral[400],
  },
  renameBtnGhostLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[800],
    letterSpacing: 0.2,
    marginLeft: 8,
  },
  renameBtnPrimary: {
    backgroundColor: colors.primary[800],
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  renameBtnPrimaryLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
    marginLeft: 8,
  },
});
