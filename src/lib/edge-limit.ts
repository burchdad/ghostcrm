import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const enabled = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const limiter = enabled ? new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(30, "1 m"), // 30 sends/min
  analytics: true,
  prefix: "msg_send"
}) : null;

export async function limitKey(key: string) {
  if (!limiter) return { allow: true, reset: Date.now(), remaining: 999 };
  const r = await limiter.limit(key);
  return { allow: r.success, reset: r.reset, remaining: r.remaining };
}
