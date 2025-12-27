/**
 * User Roles
 * 
 * Defines the available roles in the system.
 * These roles determine access control and permissions.
 */

export type UserRole = "STUDENT" | "FACULTY" | "ADMIN"

export const ROLES = {
  STUDENT: "STUDENT" as const,
  FACULTY: "FACULTY" as const,
  ADMIN: "ADMIN" as const,
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  STUDENT: "Can create and manage booking requests",
  FACULTY: "Can create and manage booking requests",
  ADMIN: "Full access including room management and approvals",
}

/**
 * Check if a role has admin privileges
 */
export function isAdmin(role: UserRole): boolean {
  return role === ROLES.ADMIN
}

/**
 * Check if a role can access admin panel
 */
export function canAccessAdmin(role: UserRole): boolean {
  return isAdmin(role)
}

