import type { TFunction } from 'i18next';

import { getCepageById } from './cepages';
import type { ScanRecord } from '@/types/detection';

export function getScanDisplayName(scan: ScanRecord, t: TFunction): string {
  if (scan.customName && scan.customName.trim().length > 0) {
    return scan.customName.trim();
  }
  if (scan.detection.cepageId) {
    const cepage = getCepageById(scan.detection.cepageId);
    if (cepage) return cepage.name.fr;
  }
  if (scan.detection.result === 'vine') return t('result.vineDetected');
  if (scan.detection.result === 'uncertain') return t('result.uncertain');
  return t('result.notVine');
}
