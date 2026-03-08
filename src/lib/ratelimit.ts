import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1 request per day per IP
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(4, "1 d"),
});
