import { apiPost } from '@/services/api/client';
import { getDeviceId } from '@/services/auth/tokenStorage';
import type { ScanRecord } from '@/types/detection';

interface PushScanResponse {
  scan: {
    id: string;
    confidence: number;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
    disease: { slug: string; name: string } | null;
  };
}

// Best-effort push of a freshly-saved scan to the backend. The mobile app
// never blocks on this — failures are silent (offline, no account, etc.).
// Confidence on the device is 0-100; the backend stores 0-1.
export async function pushScan(record: ScanRecord) {
  const deviceId = await getDeviceId();

  const body = {
    confidence: Math.max(0, Math.min(1, record.detection.confidence / 100)),
    diseaseSlug: record.detection.diseaseSlug ?? null,
    latitude: typeof record.latitude === 'number' ? record.latitude : null,
    longitude: typeof record.longitude === 'number' ? record.longitude : null,
    deviceId,
  };

  return apiPost<PushScanResponse>('/scans', body, { auth: true, raw: true });
}
