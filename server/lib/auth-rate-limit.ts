/**
 * Basic in-memory rate limiter for failed login attempts.
 *
 * Single-process, single-instance, ephemeral — fine for a one-admin
 * V1 catalog hosted on Vercel (where each cold-started lambda gets its
 * own clean state, which is actually a benign side-effect: the limiter
 * resets when the function recycles, but a real attacker still hits
 * the cap within a single connection burst).
 *
 * If we ever scale to multi-instance or want persistence across cold
 * starts, swap the Map for Upstash Redis (or another distributed KV).
 */
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

type Entry = { count: number; firstFailureAt: number; lockUntil: number };
const failures = new Map<string, Entry>();

function key(identifier: string): string {
  return identifier.toLowerCase().trim();
}

export function requireNotRateLimited(identifier: string): void {
  const e = failures.get(key(identifier));
  if (!e) return;
  const now = Date.now();
  if (e.lockUntil > now) {
    throw new Error('rate-limited');
  }
  // Expire the window cleanly so the next attempt starts fresh.
  if (now - e.firstFailureAt > WINDOW_MS) {
    failures.delete(key(identifier));
  }
}

export function recordFailure(identifier: string): void {
  const k = key(identifier);
  const now = Date.now();
  const e = failures.get(k);
  if (!e || now - e.firstFailureAt > WINDOW_MS) {
    failures.set(k, { count: 1, firstFailureAt: now, lockUntil: 0 });
    return;
  }
  e.count += 1;
  if (e.count >= MAX_FAILURES) {
    e.lockUntil = now + WINDOW_MS;
  }
  failures.set(k, e);
}

export function resetFailures(identifier: string): void {
  failures.delete(key(identifier));
}
