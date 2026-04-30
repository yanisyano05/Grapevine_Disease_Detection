/**
 * Haversine distance entre deux points GPS, en mètres.
 */
export function haversineDistance(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

/**
 * Format une distance en mètres pour l'UI (ex. "1.2 km", "350 m").
 */
export function formatDistance(meters: number, locale: string = "fr"): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  const formatted =
    km >= 100 ? Math.round(km).toString() : km.toFixed(1).replace(".", locale === "fr" ? "," : ".");
  return `${formatted} km`;
}
