import IORedis from "ioredis";
import type { ConnectionOptions } from "bullmq";

let redisSingleton: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (redisSingleton) return redisSingleton;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is required");
  }

  redisSingleton = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  return redisSingleton;
}

export function getBullConnectionOptions(): ConnectionOptions {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is required");
  }

  const parsed = new URL(redisUrl);
  const isTls = parsed.protocol === "rediss:";

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    tls: isTls ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}
