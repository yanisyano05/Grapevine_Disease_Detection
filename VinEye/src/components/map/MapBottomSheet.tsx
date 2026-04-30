import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Pressable } from "react-native";
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

    const trimmedDraft = draftName.trim();
    const initialDraft = renamingScan
      ? getScanDisplayName(renamingScan, t).trim()
      : "";
    const isDraftDirty =
      trimmedDraft.length > 0 && trimmedDraft !== initialDraft;

    function handleStartRename(scan: ScanRecord) {
      setRenamingScan(scan);
      internalRef.current?.snapToIndex(2);
    }

    function handleConfirmRename() {
      if (!isDraftDirty) return;
      if (renamingScan) {
        onRename?.(renamingScan.id, trimmedDraft);
      }
      setRenamingScan(null);
      setDraftName("");
      internalRef.current?.snapToIndex(0);
    }

    function handleCancelRename() {
      setRenamingScan(null);
      setDraftName("");
      internalRef.current?.snapToIndex(0);
    }

    return (
      <BottomSheet
        ref={internalRef}
        index={defaultIndex}
        snapPoints={snapPoints}
        handleIndicatorStyle={{
          backgroundColor: colors.neutral[300],
          width: 40,
          height: 4,
        }}
        backgroundStyle={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
        containerStyle={{ zIndex: 100, elevation: 100 }}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        {renamingScan ? (
          <BottomSheetScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 4,
              paddingBottom: 24,
              gap: 12,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={handleCancelRename}
                hitSlop={10}
                className="w-9 h-9 rounded-full items-center justify-center bg-[#FAFAFA]"
              >
                <ChevronLeft size={20} color={colors.neutral[700]} />
              </Pressable>
              <Text className="text-lg font-bold text-[#1B1B1B]">
                {t("map.rename.title")}
              </Text>
              <View className="w-9 h-9" />
            </View>
            <Text className="text-[13px] leading-[18px] text-[#6B6B6B] px-1">
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
              style={{
                borderWidth: 1,
                borderColor: colors.neutral[300],
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 14,
                fontSize: 16,
                color: colors.neutral[900],
                backgroundColor: "#FAFAFA",
              }}
            />
            <View className="flex-row pt-4 gap-3">
              <Pressable
                onPress={handleCancelRename}
                className="flex-1 min-h-[56px] rounded-[14px] py-4 px-3 items-center justify-center bg-[#F5F5F5] border-[1.5px] border-[#BDBDBD] active:opacity-70"
              >
                <View className="flex-row items-center">
                  <X size={18} color={colors.neutral[800]} strokeWidth={2.4} />
                  <Text className="text-base font-bold text-[#2D2D2D] ml-2 tracking-[0.2px]">
                    {t("common.cancel")}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={handleConfirmRename}
                disabled={!isDraftDirty}
                className={
                  isDraftDirty
                    ? "flex-1 min-h-[56px] rounded-[14px] py-4 px-3 items-center justify-center bg-primary active:opacity-85"
                    : "flex-1 min-h-[56px] rounded-[14px] py-4 px-3 items-center justify-center bg-primary/40"
                }
              >
                <View className="flex-row items-center">
                  <Check
                    size={18}
                    color="#FFFFFF"
                    strokeWidth={2.6}
                    opacity={isDraftDirty ? 1 : 0.7}
                  />
                  <Text className="text-base font-bold text-white ml-2 tracking-[0.2px]">
                    {t("map.rename.save")}
                  </Text>
                </View>
              </Pressable>
            </View>
          </BottomSheetScrollView>
        ) : previewScan ? (
          <View>
            <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
              <Text className="text-lg font-bold text-[#1B1B1B]">
                {t("map.preview.title")}
              </Text>
              <Pressable
                onPress={onPreviewClose}
                hitSlop={10}
                className="w-8 h-8 rounded-full items-center justify-center bg-[#FAFAFA]"
              >
                <X size={18} color={colors.neutral[600]} />
              </Pressable>
            </View>
            <View className="px-5 pb-5 gap-2">
              <ScanRow
                scan={previewScan}
                isLast
                onPress={() => onScanPress?.(previewScan)}
                onEdit={() => handleStartRename(previewScan)}
              />
              <Text className="text-xs font-medium text-[#9E9E9E] text-center pt-1">
                {t("map.preview.tapHint")}
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View className="flex-row items-baseline justify-between px-5 pt-2 pb-3">
              <Text className="text-lg font-bold text-[#1B1B1B]">
                {t("map.scannedPlants")}
              </Text>
              <Text className="text-[13px] font-medium text-[#9E9E9E]">
                {t("map.plantCount", { count: scans.length })}
              </Text>
            </View>

            {scans.length === 0 ? (
              <View className="items-center px-8 py-6 gap-2">
                <View className="w-16 h-16 rounded-2xl bg-[#E9F5EC] items-center justify-center mb-2">
                  <MapPin
                    size={32}
                    color={colors.primary[800]}
                    strokeWidth={2}
                  />
                </View>
                <Text className="text-base font-bold text-[#1B1B1B] text-center">
                  {t("map.empty.title")}
                </Text>
                <Text className="text-[13px] text-[#6B6B6B] text-center leading-[18px] mb-1">
                  {t("map.empty.subtitle")}
                </Text>
                {onScanCta && (
                  <Pressable
                    onPress={onScanCta}
                    className="flex-row items-center gap-2 bg-primary px-5 py-3 rounded-full mt-2 active:opacity-85"
                  >
                    <ScanLine size={18} color="#FFFFFF" strokeWidth={2.2} />
                    <Text className="text-white text-sm font-semibold">
                      {t("map.empty.cta")}
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <BottomSheetScrollView
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingBottom: 24,
                }}
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
    );
  },
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
    <View
      className={`flex-row items-center gap-2 py-3.5 ${
        !isLast ? "border-b border-[#F5F5F5]" : ""
      }`}
    >
      <Pressable
        onPress={onPress}
        className="flex-1 flex-row items-center gap-3.5"
      >
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: tint.bg }}
        >
          <Icon size={22} color={tint.fg} strokeWidth={2.2} />
        </View>

        <View className="flex-1 gap-0.5">
          <Text
            className="text-[15px] font-bold text-[#1B1B1B]"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text className="text-[13px] text-[#6B6B6B]" numberOfLines={1}>
            {formattedDate}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={onEdit}
        hitSlop={8}
        className="w-8 h-8 rounded-full items-center justify-center bg-[#FAFAFA]"
      >
        <Pencil size={16} color={colors.neutral[600]} strokeWidth={2} />
      </Pressable>
      <Pressable onPress={onPress} hitSlop={8}>
        <ChevronRight size={20} color={colors.neutral[400]} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
