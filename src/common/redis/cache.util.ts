import Redis from 'ioredis';

export async function getOrSetCache<T>(
  redis: Redis,
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const data = await fetchFn();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

export async function invalidateByPattern(redis: Redis, pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}
