/**
 * Type-safe API response utilities
 */

export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number }

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function errorResponse(
  error: string,
  statusCode: number = 400
): ApiResponse<never> {
  return { success: false, error, statusCode }
}

