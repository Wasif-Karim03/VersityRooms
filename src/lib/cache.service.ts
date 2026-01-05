/**
 * Cache Service
 * Provides caching layer using Redis with fallback to database
 */

import { redis } from "@/lib/redis"
import { CacheKeys, CacheTTL } from "./cache-keys"

export class CacheService {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      if (!data) return null
      
      return JSON.parse(data) as T
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      // Return null on error - fallback to database
      return null
    }
  }

  /**
   * Set value in cache
   */
  async set(
    key: string,
    value: any,
    ttl: number = 3600
  ): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
      // Non-critical, continue without cache
    }
  }

  /**
   * Delete a cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error(`Cache invalidation error for pattern ${pattern}:`, error)
    }
  }

  /**
   * Get or set pattern (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch from source (database)
    const data = await fetcher()

    // Store in cache (non-blocking)
    this.set(key, data, ttl).catch((err) => {
      console.error(`Error caching ${key}:`, err)
    })

    return data
  }

  /**
   * Invalidate availability cache for a specific room and date
   */
  async invalidateAvailability(roomId: string, date: Date): Promise<void> {
    const dateStr = date.toISOString().split("T")[0] // YYYY-MM-DD format
    await this.delete(CacheKeys.availability(roomId, dateStr))
  }

  /**
   * Invalidate availability cache for a date range (e.g., when booking spans multiple days)
   */
  async invalidateAvailabilityRange(
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const keys: string[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0]
      keys.push(CacheKeys.availability(roomId, dateStr))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (keys.length > 0) {
      try {
        await Promise.all(keys.map(key => this.delete(key)))
      } catch (error) {
        console.error("Error invalidating availability range:", error)
      }
    }
  }
}

// Singleton instance
export const cacheService = new CacheService()

