import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisCacheService {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private memoryCache: Map<string, { value: string; expiresAt?: number }> = new Map();

  constructor() {
    try {
      this.client = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('⚠️  Redis connection failed. Falling back to internal in-memory cache.');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 2000);
        },
        lazyConnect: true
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('✅ Connected to Redis cache service.');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
      });

      // Attempt background connection without crashing process if Redis isn't up
      this.client.connect().catch(() => {
        this.isConnected = false;
      });
    } catch (err) {
      this.isConnected = false;
      console.warn('⚠️ Redis initialization exception. Using in-memory fallback cache.');
    }
  }

  /**
   * Retrieves a cached value for shortCode.
   */
  async get(shortCode: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(`short:${shortCode}`);
      } catch (err) {
        console.warn(`Redis get error for ${shortCode}, checking in-memory fallback.`);
      }
    }

    // Fallback: check in-memory cache
    const item = this.memoryCache.get(`short:${shortCode}`);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryCache.delete(`short:${shortCode}`);
      return null;
    }
    return item.value;
  }

  /**
   * Sets a cache entry for shortCode with optional TTL in seconds (default 86400s / 24h).
   */
  async set(shortCode: string, longUrl: string, ttlSeconds: number = 86400): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds > 0) {
          await this.client.setex(`short:${shortCode}`, ttlSeconds, longUrl);
        } else {
          await this.client.set(`short:${shortCode}`, longUrl);
        }
        return;
      } catch (err) {
        console.warn(`Redis set error for ${shortCode}, writing to in-memory fallback.`);
      }
    }

    // Fallback: in-memory cache
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryCache.set(`short:${shortCode}`, { value: longUrl, expiresAt });
  }

  /**
   * Deletes a cache entry.
   */
  async del(shortCode: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(`short:${shortCode}`);
      } catch (err) {
        // ignore
      }
    }
    this.memoryCache.delete(`short:${shortCode}`);
  }
}

export const redisCache = new RedisCacheService();
