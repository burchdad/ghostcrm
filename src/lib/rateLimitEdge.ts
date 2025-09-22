// Edge-safe rate limiter (no node:crypto)
// Uses UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

export const ratelimit = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(5, "10 m"), // 5 attempts / 10 minutes
      analytics: true,
      prefix: "mw_login",
    })
  : null;

export async function limitKey(key: string) {
  if (!ratelimit) return { allowed: true, reset: Date.now(), remaining: 99 };
  const r = await ratelimit.limit(key);
  return { allowed: r.success, reset: r.reset, remaining: r.remaining };
}
