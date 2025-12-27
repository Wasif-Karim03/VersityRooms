/**
 * Session Management
 * 
 * Handles session creation, validation, and retrieval.
 * Abstracted to allow easy swapping between demo auth and real SSO.
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth/config"
import type { UserRole } from "./roles"

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Session {
  user: SessionUser
}

/**
 * Get the current user session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return null
    }
    return session.user as SessionUser
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Get the current user session (throws if not authenticated)
 * Use this when you're certain the user is authenticated
 */
export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("User not authenticated")
  }
  return user
}

