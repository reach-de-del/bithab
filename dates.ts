const pad = (n: number) => String(n).padStart(2, '0');

/** Local-time date key, e.g. "2026-11-22". */
export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, delta: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + delta);
  return dateKey(d);
}

/** The last `n` date keys ending at `end`, oldest first. */
export function lastDays(end: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}

export function prettyDate(key: string): string {
  return parseKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function weekdayLetter(key: string): string {
  return parseKey(key).toLocaleDateString(undefined, { weekday: 'narrow' });
}
