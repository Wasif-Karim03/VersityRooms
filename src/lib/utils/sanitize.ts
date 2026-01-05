/**
 * Input Sanitization Utilities
 * Sanitize user inputs to prevent XSS and injection attacks
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 * This is a basic sanitization - for production, consider using a library like DOMPurify
 * if you need to allow HTML content (which we don't in this app)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return String(input)
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, "")

  // Trim whitespace
  sanitized = sanitized.trim()

  // Remove control characters except newlines, tabs, and carriage returns
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

  return sanitized
}

/**
 * Sanitize an object by sanitizing all string values recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeString(sanitized[key]) as T[Extract<keyof T, string>]
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      if (Array.isArray(sanitized[key])) {
        sanitized[key] = sanitized[key].map((item: any) =>
          typeof item === "string" ? sanitizeString(item) : item
        ) as T[Extract<keyof T, string>]
      } else {
        sanitized[key] = sanitizeObject(sanitized[key]) as T[Extract<keyof T, string>]
      }
    }
  }

  return sanitized
}

/**
 * Sanitize a string array
 */
export function sanitizeStringArray(arr: string[]): string[] {
  return arr.map((item) => sanitizeString(item))
}

/**
 * Validate and sanitize email (basic validation)
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email).toLowerCase()
  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    throw new Error("Invalid email format")
  }
  return sanitized
}

