import { useCallback, useMemo, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import BottomSheet from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";

import { VineyardMapView, type VineyardMapHandle, type MapRegion } from "@/components/map/MapView";
import { FloatingSearch } from "@/components/map/FloatingSearch";
import { FloatingActions } from "@/components/map/FloatingActions";
import { MapBottomSheet } from "@/components/map/MapBottomSheet";
import { useHistory } from "@/hooks/useHistory";
import { useScanLocation } from "@/hooks/useScanLocation";
import { getRegionById } from "@/data/wineRegions";
import type { ScanRecord } from "@/types/detection";
import type { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_REGION: MapRegion = {
  latitude: 44.8378,
  longitude: -0.5792,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

function hasLocation(scan: ScanRecord): scan is ScanRecord & { latitude: number; longitude: number } {
  return typeof scan.latitude === "number" && typeof scan.longitude === "number";
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
  const { history, renameScan, reload } = useHistory();
  const { requestAndGetLocation } = useScanLocation();
  const mapRef = useRef<VineyardMapHandle>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const geojsonCache = useRef<Map<string, object>>(new Map());
  const activeFilterRef = useRef<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  activeFilterRef.current = activeFilter;

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const locatedScans = useMemo(() => history.filter(hasLocation), [history]);
  const initialRegion = useMemo(() => computeInitialRegion(history), [history]);

  function handleScanPress(scan: ScanRecord) {
    if (hasLocation(scan)) {
      mapRef.current?.animateToRegion({
        latitude: scan.latitude,
        longitude: scan.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
    }
    setActiveFilter(null);
    mapRef.current?.highlightGeoJSON(null);
    navigation.navigate("ScanDetail", { scanId: scan.id });
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
      >
        <FloatingSearch activeFilter={activeFilter} onFilterPress={handleFilterPress} />
      </View>

      <MapBottomSheet
        ref={sheetRef}
        scans={locatedScans}
        onScanPress={handleScanPress}
        onRename={handleRename}
        onScanCta={() => navigation.navigate("Main", { screen: "Scanner" })}
        defaultIndex={isEmpty ? 1 : 0}
      />

      <View style={styles.actionsSlot} pointerEvents="box-none">
        <FloatingActions
          onLocate={handleLocateUser}
          onLayers={handleComingSoon}
          onSatellite={handleComingSoon}
          activeAction={activeFilter === "myLocation" ? "locate" : undefined}
        />
      </View>
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
    zIndex: 10,
    elevation: 10,
  },
});
