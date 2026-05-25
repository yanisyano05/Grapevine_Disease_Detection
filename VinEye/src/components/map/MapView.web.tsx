// Variant WEB de MapView.tsx : react-native-webview ne tourne pas sur web et
// la Map est masquée (cf. BottomTabNavigator). Ce stub fournit la même API
// publique pour que MapScreen compile, et affiche un placeholder.
import { forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';

import type { ScanRecord } from '@/types/detection';

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

export const VineyardMapView = forwardRef<VineyardMapHandle, VineyardMapViewProps>(
  function VineyardMapView(_props, ref) {
    useImperativeHandle(
      ref,
      () => ({
        animateToRegion() {},
        highlightGeoJSON() {},
        setUserLocation() {},
      }),
      [],
    );

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F5F5',
        }}
      >
        <Text style={{ color: '#8E8E93' }}>Carte indisponible sur le web</Text>
      </View>
    );
  },
);
