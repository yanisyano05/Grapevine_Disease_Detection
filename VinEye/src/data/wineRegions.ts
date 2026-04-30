export interface WineRegion {
  id: string;
  labelKey: string;
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  geojsonUrl: string;
}

const GEOJSON_BASE =
  'https://france-geojson.gregoiredavid.fr/repo/departements';

export const WINE_REGIONS: WineRegion[] = [
  {
    id: 'bordeaux',
    labelKey: 'map.regions.bordeaux',
    latitude: 44.84,
    longitude: -0.58,
    latitudeDelta: 1.6,
    longitudeDelta: 1.6,
    geojsonUrl: `${GEOJSON_BASE}/33-gironde/departement-33-gironde.geojson`,
  },
  {
    id: 'burgundy',
    labelKey: 'map.regions.burgundy',
    latitude: 47.32,
    longitude: 4.83,
    latitudeDelta: 1.8,
    longitudeDelta: 1.8,
    geojsonUrl: `${GEOJSON_BASE}/21-cote-d-or/departement-21-cote-d-or.geojson`,
  },
  {
    id: 'champagne',
    labelKey: 'map.regions.champagne',
    latitude: 48.95,
    longitude: 4.05,
    latitudeDelta: 1.4,
    longitudeDelta: 1.4,
    geojsonUrl: `${GEOJSON_BASE}/51-marne/departement-51-marne.geojson`,
  },
];

export function getRegionById(id: string): WineRegion | undefined {
  return WINE_REGIONS.find((r) => r.id === id);
}
