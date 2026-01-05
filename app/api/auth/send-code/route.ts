/**
 * Send Verification Code API
 * 
 * Sends a 6-digit verification code to the user's email
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateVerificationCode, storeVerificationCode } from "@/src/lib/auth/verification"
import { sendEmail } from "@/src/lib/notifications"
import { errorResponse, successResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"

const sendCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["STUDENT", "FACULTY", "ADMIN"], {
    errorMap: () => ({ message: "Invalid role. Must be STUDENT, FACULTY, or ADMIN" }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = sendCodeSchema.safeParse(body)
    if (!validationResult.success) {
      const error = handleValidationError(validationResult.error)
      if (error) return error
      return NextResponse.json(errorResponse("Validation failed", 400), { status: 400 })
    }
    
    const { email, role } = validationResult.data
    
    // Generate 6-digit code
    const code = generateVerificationCode()
    
    // Store code in Redis (10 minute expiry)
    await storeVerificationCode(email.toLowerCase(), role, code)
    
    // Send email with code
    const emailSubject = "Your Room Booking Login Code"
    const emailBody = `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
    
    await sendEmail(email, emailSubject, emailBody)
    
    return NextResponse.json(
      successResponse({ message: "Verification code sent to your email" }),
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error sending verification code:", error)
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? `Failed to send verification code: ${error.message}` : "Failed to send verification code. Please try again.",
        500
      ),
      { status: 500 }
    )
  }
}

