import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = createClient({ url: redisUrl });
redis.connect();

export async function rateLimit({ key, max = 10, windowSec = 60 }) {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowSec)}`;
  const countRaw = await redis.incr(windowKey);
  const count = typeof countRaw === 'string' ? parseInt(countRaw, 10) : countRaw;
  if (count === 1) {
    await redis.expire(windowKey, windowSec);
  }
  if (count > max) {
    return { limited: true, count };
  }
  return { limited: false, count };
}

export { redis };
