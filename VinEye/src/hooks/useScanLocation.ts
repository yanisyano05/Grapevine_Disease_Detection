import { useCallback } from 'react';
import * as Location from 'expo-location';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';

import { storage } from '@/services/storage';

export interface ScanCoords {
  latitude: number;
  longitude: number;
  capturedAt: string;
}

const LOCATION_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

export function useScanLocation() {
  const { t } = useTranslation();

  const requestAndGetLocation = useCallback(async (): Promise<ScanCoords | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const alreadyAsked = await storage.get<boolean>(storage.KEYS.LOCATION_PERMISSION_ASKED);
        if (!alreadyAsked) {
          toast.info(t('location.permissionDeniedTitle'), {
            description: `${t('location.permissionDenied')} ${t('location.settingsHint')}`,
            duration: 5000,
          });
          await storage.set(storage.KEYS.LOCATION_PERMISSION_ASKED, true);
        }
        return null;
      }

      const position = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        LOCATION_TIMEOUT_MS
      );

      if (!position) return null;

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        capturedAt: new Date(position.timestamp).toISOString(),
      };
    } catch (err) {
      if (__DEV__) {
        console.warn('[useScanLocation] failed:', err);
      }
      return null;
    }
  }, [t]);

  return { requestAndGetLocation };
}
