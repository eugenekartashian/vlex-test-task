/** Simple in-memory cache for async JSON requests. */
const cache = new Map();

export async function cachedJSON(key, fetcher, { ttl = 60000 } = {}) {
  const hit = cache.get(key);
  const now = Date.now();
  if (hit && now - hit.t <= ttl) return hit.v;
  const v = await fetcher();
  cache.set(key, { v, t: now });
  return v;
}
