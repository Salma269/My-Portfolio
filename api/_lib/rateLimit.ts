import { HttpError } from './http';

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    throw new HttpError(429, 'RATE_LIMITED', `Too many requests. Try again in ${retryAfter}s.`, { retryAfter });
  }
  entry.count += 1;
}
