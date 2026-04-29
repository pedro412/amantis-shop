/**
 * Tiny localStorage helpers for recent search terms. Best-effort: any
 * read/write failure (quota, private mode) silently no-ops.
 */

const STORAGE_KEY = 'amantis.recents';
const MAX_RECENTS = 8;

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

export function pushRecentSearch(term: string): string[] {
  const cleaned = term.trim();
  if (cleaned.length < 2) return getRecentSearches();
  const current = getRecentSearches();
  // Move-to-front + de-dupe (case-insensitive).
  const next = [
    cleaned,
    ...current.filter((s) => s.toLowerCase() !== cleaned.toLowerCase()),
  ].slice(0, MAX_RECENTS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Best-effort.
  }
  return next;
}

export function clearRecentSearches(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort.
  }
}
