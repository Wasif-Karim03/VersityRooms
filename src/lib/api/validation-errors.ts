/**
 * Validation Error Utilities
 * Format Zod validation errors into field-level error messages
 */

import { ZodError } from "zod"
import { errorResponse } from "./response"

/**
 * Format Zod error into field-level errors
 */
export function formatValidationErrors(error: ZodError): {
  message: string
  fields: Record<string, string>
} {
  const fields: Record<string, string> = {}
  let generalMessage = "Validation failed"

  error.errors.forEach((err) => {
    const field = err.path.join(".")
    const message = err.message

    if (field) {
      fields[field] = message
    } else {
      generalMessage = message
    }
  })

  return {
    message: generalMessage,
    fields: Object.keys(fields).length > 0 ? fields : undefined,
  }
}

/**
 * Handle Zod validation errors - returns formatted error response
 */
export function handleValidationError(error: any): ReturnType<typeof errorResponse> | null {
  if (error?.name === "ZodError" || error instanceof ZodError) {
    const { message, fields } = formatValidationErrors(error as ZodError)
    return errorResponse(message, 400, fields)
  }
  return null
}

