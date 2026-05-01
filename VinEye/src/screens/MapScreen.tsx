import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";

import {
  VineyardMapView,
  type VineyardMapHandle,
  type MapRegion,
} from "@/components/map/MapView";
import { FloatingSearch } from "@/components/map/FloatingSearch";
import { FloatingActions } from "@/components/map/FloatingActions";
import { MapBottomSheet } from "@/components/map/MapBottomSheet";
import { useHistory } from "@/hooks/useHistory";
import { useScanLocation } from "@/hooks/useScanLocation";
import { getRegionById } from "@/data/wineRegions";
import type { ScanRecord } from "@/types/detection";
import type { BottomTabParamList, RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type MapRoute = RouteProp<BottomTabParamList, "Map">;

const DEFAULT_REGION: MapRegion = {
  latitude: 44.8378,
  longitude: -0.5792,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

function hasLocation(
  scan: ScanRecord,
): scan is ScanRecord & { latitude: number; longitude: number } {
  return (
    typeof scan.latitude === "number" && typeof scan.longitude === "number"
  );
}

function computeInitialRegion(scans: ScanRecord[]): MapRegion {
  const located = scans.filter(hasLocation);
  if (located.length === 0) return DEFAULT_REGION;
  if (located.length === 1) {
    return {
      latitude: located[0].latitude,
      longitude: located[0].longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };
  }
  const lats = located.map((s) => s.latitude);
  const lngs = located.map((s) => s.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.04),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.04),
  };
}

export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<MapRoute>();
  const { history, isLoading: historyLoading, renameScan, reload } = useHistory();
  const { requestAndGetLocation } = useScanLocation();
  const mapRef = useRef<VineyardMapHandle>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const geojsonCache = useRef<Map<string, object>>(new Map());
  const activeFilterRef = useRef<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [previewScan, setPreviewScan] = useState<ScanRecord | null>(null);
  activeFilterRef.current = activeFilter;

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const locatedScans = useMemo(() => history.filter(hasLocation), [history]);
  const initialRegion = useMemo(() => computeInitialRegion(history), [history]);

  // React to focusScanId param (from SearchScreen) → animate + zoom + preview
  const focusScanId = route.params?.focusScanId;
  useEffect(() => {
    if (!focusScanId) return;
    const target = locatedScans.find((s) => s.id === focusScanId);
    if (!target) return;
    // Zoom progressif : étape large → étape proche pour effet de glissement + zoom
    // Décale la caméra vers le sud (lat - delta * 0.18) pour que la plante
    // apparaisse au-dessus du bottom sheet (qui occupe ~20% bas)
    const FAR_DELTA = 0.08;
    const CLOSE_DELTA = 0.012;
    mapRef.current?.animateToRegion(
      {
        latitude: target.latitude - FAR_DELTA * 0.18,
        longitude: target.longitude,
        latitudeDelta: FAR_DELTA,
        longitudeDelta: FAR_DELTA,
      },
      450,
    );
    const t1 = setTimeout(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: target.latitude - CLOSE_DELTA * 0.18,
          longitude: target.longitude,
          latitudeDelta: CLOSE_DELTA,
          longitudeDelta: CLOSE_DELTA,
        },
        500,
      );
    }, 480);
    const t2 = setTimeout(() => {
      setPreviewScan(target);
      sheetRef.current?.snapToIndex(0);
    }, 1000);

    // Reset le param pour que ça ne re-trigger pas (ex. retour sur Map)
    navigation.setParams({ focusScanId: undefined } as never);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [focusScanId, locatedScans, navigation]);

  function handleScanPress(scan: ScanRecord) {
    // 2nd click on the same scan in preview → open detail
    if (previewScan?.id === scan.id) {
      setPreviewScan(null);
      navigation.navigate("ScanDetail", { scanId: scan.id });
      return;
    }

    // 1st click (or click on a different scan) → preview mode
    // Décalage caméra vers le sud pour ne pas être masqué par le sheet
    if (hasLocation(scan)) {
      const delta = 0.04;
      mapRef.current?.animateToRegion({
        latitude: scan.latitude - delta * 0.18,
        longitude: scan.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      });
    }
    setActiveFilter(null);
    mapRef.current?.highlightGeoJSON(null);
    setPreviewScan(scan);
    sheetRef.current?.snapToIndex(0);
  }

  function handlePreviewClose() {
    setPreviewScan(null);
  }

  async function handleLocateUser() {
    const coords = await requestAndGetLocation();
    if (coords) {
      mapRef.current?.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      mapRef.current?.setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      mapRef.current?.highlightGeoJSON(null);
      setActiveFilter("myLocation");
    } else {
      toast.info(t("location.permissionDeniedTitle"), {
        description: t("location.permissionDenied"),
      });
    }
  }

  function handleComingSoon() {
    toast.info(t("map.comingSoon"));
  }

  async function fetchRegionGeoJSON(url: string): Promise<object | null> {
    const cached = geojsonCache.current.get(url);
    if (cached) return cached;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as object;
      geojsonCache.current.set(url, json);
      return json;
    } catch (err) {
      if (__DEV__) console.warn("[MapScreen] geojson fetch failed:", err);
      return null;
    }
  }

  async function handleFilterPress(id: string) {
    if (id === "myLocation") {
      handleLocateUser();
      return;
    }
    const region = getRegionById(id);
    if (!region) return;

    setActiveFilter(id);
    mapRef.current?.animateToRegion({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });

    const geojson = await fetchRegionGeoJSON(region.geojsonUrl);
    if (geojson && activeFilterRef.current === id) {
      mapRef.current?.highlightGeoJSON(geojson);
    } else if (!geojson) {
      toast.error(t("map.regionLoadFailed"));
    }
  }

  function handleRename(scanId: string, newName: string) {
    renameScan(scanId, newName);
  }

  const isEmpty = locatedScans.length === 0;

  return (
    <View style={styles.root}>
      <VineyardMapView
        ref={mapRef}
        scans={locatedScans}
        initialRegion={initialRegion}
        onScanPress={handleScanPress}
      />

      <LinearGradient
        colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0)"]}
        style={[styles.topGradient, { height: insets.top + 140 }]}
        pointerEvents="none"
      />

      <View
        style={[styles.searchSlot, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
        collapsable={false}
      >
        <FloatingSearch
          activeFilter={activeFilter}
          onFilterPress={handleFilterPress}
        />
      </View>

      <View
        style={styles.actionsSlot}
        pointerEvents="box-none"
        collapsable={false}
      >
        <FloatingActions
          onLocate={handleLocateUser}
          onLayers={handleComingSoon}
          onSatellite={handleComingSoon}
          activeAction={activeFilter === "myLocation" ? "locate" : "layers"}
        />
      </View>

      <MapBottomSheet
        ref={sheetRef}
        scans={locatedScans}
        isLoading={historyLoading}
        previewScan={previewScan}
        onPreviewClose={handlePreviewClose}
        onScanPress={handleScanPress}
        onRename={handleRename}
        onScanCta={() => navigation.navigate("Main", { screen: "Scanner" })}
        defaultIndex={isEmpty ? 1 : 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  searchSlot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  actionsSlot: {
    position: "absolute",
    right: 16,
    top: "30%",
    zIndex: 1,
    elevation: 1,
  },
});
