import type { ScanRecord } from '@/types/detection';

function generateId(suffix: string): string {
  return `seed-${Date.now()}-${suffix}`;
}

function isoMinusDays(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function buildMockScans(): ScanRecord[] {
  return [
    {
      id: generateId('1'),
      createdAt: isoMinusDays(0),
      xpEarned: 25,
      latitude: 44.84,
      longitude: -0.58,
      locationCapturedAt: isoMinusDays(0),
      customName: 'Vigne du potager',
      detection: {
        result: 'vine',
        confidence: 0.94,
        diseaseClass: 'healthy',
        cepageId: 'cabernet_sauvignon',
        timestamp: Date.now(),
        allProbabilities: [
          { class: 'healthy', probability: 0.94 },
          { class: 'esca', probability: 0.03 },
          { class: 'black_rot', probability: 0.02 },
          { class: 'leaf_blight', probability: 0.01 },
        ],
      },
    },
    {
      id: generateId('2'),
      createdAt: isoMinusDays(1),
      xpEarned: 35,
      latitude: 44.66,
      longitude: -0.35,
      locationCapturedAt: isoMinusDays(1),
      detection: {
        result: 'vine',
        confidence: 0.81,
        diseaseClass: 'esca',
        diseaseSlug: 'esca',
        cepageId: 'merlot',
        timestamp: Date.now() - 86_400_000,
        allProbabilities: [
          { class: 'esca', probability: 0.81 },
          { class: 'healthy', probability: 0.12 },
          { class: 'leaf_blight', probability: 0.05 },
          { class: 'black_rot', probability: 0.02 },
        ],
      },
    },
    {
      id: generateId('3'),
      createdAt: isoMinusDays(2),
      xpEarned: 30,
      latitude: 47.32,
      longitude: 4.83,
      locationCapturedAt: isoMinusDays(2),
      customName: 'Pinot du grand-père',
      detection: {
        result: 'vine',
        confidence: 0.88,
        diseaseClass: 'healthy',
        cepageId: 'pinot_noir',
        timestamp: Date.now() - 2 * 86_400_000,
        allProbabilities: [
          { class: 'healthy', probability: 0.88 },
          { class: 'leaf_blight', probability: 0.07 },
          { class: 'esca', probability: 0.03 },
          { class: 'black_rot', probability: 0.02 },
        ],
      },
    },
    {
      id: generateId('4'),
      createdAt: isoMinusDays(3),
      xpEarned: 20,
      latitude: 49.05,
      longitude: 4.05,
      locationCapturedAt: isoMinusDays(3),
      detection: {
        result: 'uncertain',
        confidence: 0.55,
        diseaseClass: 'leaf_blight',
        diseaseSlug: 'leaf-blight',
        cepageId: 'chardonnay',
        timestamp: Date.now() - 3 * 86_400_000,
        allProbabilities: [
          { class: 'leaf_blight', probability: 0.55 },
          { class: 'healthy', probability: 0.28 },
          { class: 'esca', probability: 0.10 },
          { class: 'black_rot', probability: 0.07 },
        ],
      },
    },
    {
      id: generateId('5'),
      createdAt: isoMinusDays(4),
      xpEarned: 35,
      latitude: 44.92,
      longitude: -0.62,
      locationCapturedAt: isoMinusDays(4),
      detection: {
        result: 'vine',
        confidence: 0.76,
        diseaseClass: 'black_rot',
        diseaseSlug: 'black-rot',
        cepageId: 'cabernet_sauvignon',
        timestamp: Date.now() - 4 * 86_400_000,
        allProbabilities: [
          { class: 'black_rot', probability: 0.76 },
          { class: 'healthy', probability: 0.15 },
          { class: 'esca', probability: 0.06 },
          { class: 'leaf_blight', probability: 0.03 },
        ],
      },
    },
  ];
}
