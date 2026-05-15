import { Redis } from '@upstash/redis';
import { Redis as IoRedis } from 'ioredis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const localRedisUrl = process.env.LOCAL_REDIS_URL;

function createRedisClient() {
  // 1. Try Upstash REST Client (HTTPS)
  if (redisUrl?.startsWith('https://') && redisToken) {
    try {
      return new Redis({ url: redisUrl, token: redisToken });
    } catch (e) {
      console.error('Failed to init Upstash Redis:', e);
    }
  }

  // 2. Fallback to Local Redis (TCP)
  if (localRedisUrl?.startsWith('redis://')) {
    try {
      return new IoRedis(localRedisUrl);
    } catch (e) {
      console.error('Failed to init Local Redis:', e);
    }
  }

  return null;
}

export const redis = createRedisClient();

