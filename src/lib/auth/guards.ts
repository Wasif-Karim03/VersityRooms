/**
 * Route Guards
 * 
 * Functions to protect routes and enforce role-based access control.
 */

import { redirect } from "next/navigation"
import { getCurrentUser } from "./session"
import type { UserRole } from "./roles"
import { canAccessAdmin } from "./roles"

/**
 * Require authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

/**
 * Require a specific role
 * Redirects to login if not authenticated, or to dashboard if role doesn't match
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect("/dashboard")
  }
  return user
}

/**
 * Require admin role
 * Redirects to login if not authenticated, or to dashboard if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()
  if (!canAccessAdmin(user.role)) {
    redirect("/dashboard")
  }
  return user
}

/**
 * Check if user has a specific role (non-blocking)
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role ?? false
}

/**
 * Check if user is admin (non-blocking)
 */
export async function isUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user ? canAccessAdmin(user.role) : false
}

