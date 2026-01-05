/**
 * Rate Limiting Middleware
 * Simple rate limiter using Redis (sliding window algorithm)
 */

import { redis } from "@/lib/redis"
import { NextResponse } from "next/server"

export interface RateLimitConfig {
  window: number // Window size in seconds
  max: number    // Maximum requests per window
}

export const RateLimits = {
  // General API endpoints
  API: { window: 60, max: 100 },      // 100 requests per minute
  // Booking creation (more restrictive)
  BOOKING: { window: 60, max: 20 },   // 20 requests per minute
  // Reports (most restrictive - expensive operations)
  REPORTS: { window: 60, max: 10 },   // 10 requests per minute
  // Authentication
  AUTH: { window: 60, max: 10 },      // 10 requests per minute
}

/**
 * Check if request should be rate limited
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowStart = now - config.window * 1000

  try {
    // Get current count
    const count = await redis.zcount(key, windowStart, now)

    if (count >= config.max) {
      // Rate limit exceeded
      const oldestTimestamp = await redis.zrange(key, 0, 0, "WITHSCORES")
      const resetTime = oldestTimestamp.length > 0
        ? parseInt(oldestTimestamp[1]) + config.window * 1000
        : now + config.window * 1000

      return {
        allowed: false,
        remaining: 0,
        reset: resetTime,
      }
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`)
    
    // Set expiration
    await redis.expire(key, config.window)

    // Get remaining count
    const remaining = Math.max(0, config.max - count - 1)

    return {
      allowed: true,
      remaining,
      reset: now + config.window * 1000,
    }
  } catch (error) {
    console.error("Rate limit error:", error)
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: config.max,
      reset: now + config.window * 1000,
    }
  }
}

/**
 * Rate limit middleware wrapper
 */
export async function withRateLimit(
  identifier: string,
  config: RateLimitConfig,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const result = await checkRateLimit(identifier, config)

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": config.max.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": new Date(result.reset).toISOString(),
          "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  const response = await handler()

  // Add rate limit headers to successful responses
  response.headers.set("X-RateLimit-Limit", config.max.toString())
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", new Date(result.reset).toISOString())

  return response
}

/**
 * Get client identifier (IP address or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  // Prefer user ID if authenticated (more accurate)
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
  return `ip:${ip}`
}

