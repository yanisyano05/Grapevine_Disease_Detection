import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";

import { colors } from "@/theme/colors";
import { getScanStatus } from "@/types/detection";
import type { ScanRecord, ScanStatus } from "@/types/detection";

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface VineyardMapHandle {
  animateToRegion: (region: MapRegion, durationMs?: number) => void;
  highlightGeoJSON: (geojson: object | null) => void;
  setUserLocation: (location: UserLocation | null) => void;
}

interface VineyardMapViewProps {
  scans: ScanRecord[];
  initialRegion: MapRegion;
  onScanPress?: (scan: ScanRecord) => void;
}

const STATUS_COLOR: Record<ScanStatus, string> = {
  healthy: colors.primary[800],
  infected: "#E63946",
  uncertain: "#F4A261",
  not_vine: "#9E9E9E",
};

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  color: string;
}

function buildMarkers(scans: ScanRecord[]): MapMarker[] {
  return scans
    .filter(
      (s): s is ScanRecord & { latitude: number; longitude: number } =>
        typeof s.latitude === "number" && typeof s.longitude === "number"
    )
    .map((s) => ({
      id: s.id,
      lat: s.latitude,
      lng: s.longitude,
      color: STATUS_COLOR[getScanStatus(s)],
    }));
}

function deltaToZoom(latitudeDelta: number): number {
  return Math.max(2, Math.min(19, Math.round(Math.log2(360 / latitudeDelta))));
}

function buildHtml(markers: MapMarker[], region: MapRegion): string {
  const zoom = deltaToZoom(region.latitudeDelta);
  const markersJson = JSON.stringify(markers);
  const accentColor = colors.primary[800];

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #F5F5F5; }
      .vineye-marker { width: 36px; height: 36px; border-radius: 10px; border: 3px solid #fff; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.25); }
      .vineye-marker svg { transform: rotate(45deg); }
      .vineye-user-wrap { position: relative; width: 44px; height: 44px; }
      .vineye-user { box-sizing: border-box; position: absolute; top: 0; left: 0; width: 44px; height: 44px; border-radius: 50%; background: ${accentColor}; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(45,106,79,0.45); }
      .vineye-user-pulse { position: absolute; top: 50%; left: 50%; width: 44px; height: 44px; margin-left: -22px; margin-top: -22px; border-radius: 50%; background: ${accentColor}; opacity: 0.25; animation: vineye-pulse 1.6s ease-out infinite; }
      @keyframes vineye-pulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2); opacity: 0; } }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      var ACCENT = '${accentColor}';
      var map = L.map('map', { zoomControl: false, attributionControl: false })
        .setView([${region.latitude}, ${region.longitude}], ${zoom});
      L.tileLayer('https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      var leafIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13C4 7.5 11 4 21 4c0 9.5-3 16-10 16Z"/><path d="M2 22 17 7"/></svg>';
      var smileIcon = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';

      var markers = ${markersJson};
      markers.forEach(function (m) {
        var icon = L.divIcon({
          className: '',
          html: '<div class="vineye-marker" style="background:' + m.color + '">' + leafIcon + '</div>',
          iconSize: [44, 44],
          iconAnchor: [22, 44]
        });
        L.marker([m.lat, m.lng], { icon: icon })
          .on('click', function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scan_press', id: m.id }));
          })
          .addTo(map);
      });

      window.__vineyeAnimate = function (lat, lng, latDelta) {
        map.flyTo([lat, lng], Math.max(2, Math.min(19, Math.round(Math.log2(360 / latDelta)))), { duration: 0.6 });
      };

      var highlightLayer = null;
      window.__vineyeHighlightGeoJSON = function (gj) {
        if (highlightLayer) { map.removeLayer(highlightLayer); highlightLayer = null; }
        if (!gj) return;
        try {
          highlightLayer = L.geoJSON(gj, {
            style: {
              color: ACCENT,
              weight: 2.5,
              fillColor: ACCENT,
              fillOpacity: 0.12,
              dashArray: '6, 8',
              lineJoin: 'round'
            }
          }).addTo(map);
        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'geojson_failed:' + (e && e.message ? e.message : 'unknown') }));
        }
      };

      var userMarker = null;
      window.__vineyeSetUser = function (lat, lng) {
        if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
        if (lat == null) return;
        var icon = L.divIcon({
          className: '',
          html: '<div class="vineye-user-wrap"><div class="vineye-user-pulse"></div><div class="vineye-user">' + smileIcon + '</div></div>',
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });
        userMarker = L.marker([lat, lng], { icon: icon, zIndexOffset: 1000 }).addTo(map);
      };
    </script>
  </body>
</html>`;
}

export const VineyardMapView = forwardRef<VineyardMapHandle, VineyardMapViewProps>(
  function VineyardMapView({ scans, initialRegion, onScanPress }, ref) {
    const webRef = useRef<WebView>(null);

    const markers = useMemo(() => buildMarkers(scans), [scans]);
    const html = useMemo(() => buildHtml(markers, initialRegion), [markers, initialRegion]);

    useImperativeHandle(
      ref,
      () => ({
        animateToRegion(region: MapRegion) {
          webRef.current?.injectJavaScript(
            `window.__vineyeAnimate(${region.latitude}, ${region.longitude}, ${region.latitudeDelta}); true;`
          );
        },
        highlightGeoJSON(gj: object | null) {
          const payload = gj === null ? "null" : JSON.stringify(gj);
          webRef.current?.injectJavaScript(`window.__vineyeHighlightGeoJSON(${payload}); true;`);
        },
        setUserLocation(loc: UserLocation | null) {
          if (loc === null) {
            webRef.current?.injectJavaScript(`window.__vineyeSetUser(null, null); true;`);
          } else {
            webRef.current?.injectJavaScript(
              `window.__vineyeSetUser(${loc.latitude}, ${loc.longitude}); true;`
            );
          }
        },
      }),
      []
    );

    function handleMessage(event: WebViewMessageEvent) {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type: string; id?: string; message?: string };
        if (data.type === "scan_press" && data.id) {
          const scan = scans.find((s) => s.id === data.id);
          if (scan) onScanPress?.(scan);
        } else if (data.type === "error" && __DEV__) {
          console.warn("[MapView]", data.message);
        }
      } catch {
        // ignore malformed messages
      }
    }

    return (
      <WebView
        ref={webRef}
        style={[StyleSheet.absoluteFill, { backgroundColor: "transparent" }]}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        androidLayerType="hardware"
      />
    );
  }
);
