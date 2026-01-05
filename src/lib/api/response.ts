/**
 * Type-safe API response utilities
 */

export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; fields?: Record<string, string>; statusCode?: number }

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function errorResponse(
  error: string,
  statusCode: number = 400,
  fields?: Record<string, string>
): ApiResponse<never> {
  return { success: false, error, statusCode, fields }
}

