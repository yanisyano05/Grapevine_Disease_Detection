import type { ScanRecord } from '@/types/detection';

export type DateGroupKey = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'older';

export interface DateGroup {
  key: DateGroupKey;
  label: string;
  scans: ScanRecord[];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMondayOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  // getDay(): 0=Sun, 1=Mon... shift so Monday=0
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function getDateGroupKey(scanDate: Date, now: Date): DateGroupKey {
  const todayStart = startOfDay(now);
  const scanStart = startOfDay(scanDate);
  const scanTime = scanStart.getTime();

  // Today
  if (scanTime === todayStart.getTime()) return 'today';

  // Yesterday
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  if (scanTime === yesterdayStart.getTime()) return 'yesterday';

  // This week (Monday to today)
  const mondayStart = getMondayOfWeek(now);
  if (scanTime >= mondayStart.getTime() && scanTime < yesterdayStart.getTime()) {
    return 'thisWeek';
  }

  // This month (1st to Monday of this week)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  if (scanTime >= monthStart.getTime() && scanTime < mondayStart.getTime()) {
    return 'thisMonth';
  }

  return 'older';
}

const GROUP_ORDER: DateGroupKey[] = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'older'];

export function groupScansByDate(scans: ScanRecord[]): DateGroup[] {
  const now = new Date();
  const grouped = new Map<DateGroupKey, ScanRecord[]>();

  for (const scan of scans) {
    const key = getDateGroupKey(new Date(scan.createdAt), now);
    const list = grouped.get(key) ?? [];
    list.push(scan);
    grouped.set(key, list);
  }

  // Sort scans within each group by date desc
  for (const list of grouped.values()) {
    list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Return only non-empty groups, in chronological order
  return GROUP_ORDER
    .filter((key) => grouped.has(key))
    .map((key) => ({
      key,
      label: `myPlants.groups.${key}`,
      scans: grouped.get(key)!,
    }));
}
