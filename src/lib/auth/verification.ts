/**
 * Email Verification Code Service
 * 
 * Generates, stores, and verifies 6-digit verification codes for email-based login.
 */

import { redis } from "@/lib/redis"

const CODE_EXPIRY_SECONDS = 10 * 60 // 10 minutes
const CODE_KEY_PREFIX = "verification:code:"

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Store verification code in Redis with email and role
 */
export async function storeVerificationCode(
  email: string,
  role: string,
  code: string
): Promise<void> {
  const key = `${CODE_KEY_PREFIX}${email}`
  const value = JSON.stringify({ code, role, email, createdAt: Date.now() })
  
  await redis.setex(key, CODE_EXPIRY_SECONDS, value)
}

/**
 * Verify and retrieve verification code data
 * Returns the role if code is valid, null otherwise
 */
export async function verifyCode(
  email: string,
  code: string
): Promise<{ role: string; email: string } | null> {
  const key = `${CODE_KEY_PREFIX}${email}`
  
  try {
    const data = await redis.get(key)
    if (!data) {
      return null // Code expired or doesn't exist
    }
    
    const parsed = JSON.parse(data)
    
    if (parsed.code !== code) {
      return null // Invalid code
    }
    
    // Code is valid, delete it (one-time use)
    await redis.del(key)
    
    return {
      role: parsed.role,
      email: parsed.email,
    }
  } catch (error) {
    console.error("Error verifying code:", error)
    return null
  }
}

/**
 * Check if a code exists for an email (without consuming it)
 */
export async function hasPendingCode(email: string): Promise<boolean> {
  const key = `${CODE_KEY_PREFIX}${email}`
  const exists = await redis.exists(key)
  return exists === 1
}

