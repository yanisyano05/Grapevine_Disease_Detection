import * as Crypto from 'expo-crypto';
import i18next from 'i18next';

import type { User } from '@/types/auth';

const PREFIXES_FR = [
  'Sommelier',
  'Vendangeur',
  'Caviste',
  'Œnologue',
  'Vigneron',
  'Amateur',
  'Maître de Chai',
  'Tonnelier',
];

const PREFIXES_EN = [
  'Sommelier',
  'Wine Lover',
  'Vintner',
  'Cellar Master',
  'Grape Picker',
  'Wine Taster',
];

export function generateGuestUser(): User {
  const lang = i18next.language?.startsWith('fr') ? 'fr' : 'en';
  const prefixes = lang === 'fr' ? PREFIXES_FR : PREFIXES_EN;
  const suffix = lang === 'fr' ? 'Anonyme' : 'Anonymous';

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  return {
    id: Crypto.randomUUID(),
    name: `${prefix} ${suffix} #${number}`,
    email: null,
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
}
