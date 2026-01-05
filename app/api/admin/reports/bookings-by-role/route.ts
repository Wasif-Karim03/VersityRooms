/**
 * GET /api/admin/reports/bookings-by-role
 * Get bookings breakdown by user role
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { reportQuerySchema } from "@/src/lib/validations/reports"
import { checkRateLimit, getClientIdentifier, RateLimits } from "@/src/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()

    // Rate limiting for reports (10 requests per minute - expensive operations)
    const identifier = getClientIdentifier(request, admin.id)
    const rateLimitResult = await checkRateLimit(identifier, RateLimits.REPORTS)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many report requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RateLimits.REPORTS.max.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = {
      weeks: searchParams.get("weeks"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    }

    // Validate query parameters
    const validatedQuery = reportQuerySchema.parse(query)

    const startDate = validatedQuery.startDate
      ? new Date(validatedQuery.startDate)
      : new Date(Date.now() - validatedQuery.weeks * 7 * 24 * 60 * 60 * 1000)

    // Get bookings with user role
    const bookings = await prisma.booking.findMany({
      where: {
        startAt: { gte: startDate },
      },
      include: {
        user: {
          select: {
            role: true,
          },
        },
      },
    })

    // Group by role
    const roleCounts: Record<string, { count: number; hours: number }> = {
      STUDENT: { count: 0, hours: 0 },
      FACULTY: { count: 0, hours: 0 },
      ADMIN: { count: 0, hours: 0 },
    }

    bookings.forEach((booking) => {
      const role = booking.user.role
      const hours = (booking.endAt.getTime() - booking.startAt.getTime()) / (1000 * 60 * 60)
      
      if (roleCounts[role]) {
        roleCounts[role].count++
        roleCounts[role].hours += hours
      }
    })

    // Convert to array format
    const byRole = Object.entries(roleCounts).map(([role, data]) => ({
      role,
      count: data.count,
      hours: Math.round(data.hours * 10) / 10,
      percentage: bookings.length > 0
        ? Math.round((data.count / bookings.length) * 100 * 10) / 10
        : 0,
    }))

    const total = {
      count: bookings.length,
      hours: Math.round(
        bookings.reduce(
          (sum, b) =>
            sum + (b.endAt.getTime() - b.startAt.getTime()) / (1000 * 60 * 60),
          0
        ) * 10
      ) / 10,
    }

    const response = NextResponse.json(
      successResponse({
        byRole,
        total,
      })
    )

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", RateLimits.REPORTS.max.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())
    response.headers.set("X-RateLimit-Reset", new Date(rateLimitResult.reset).toISOString())
    
    return response
  } catch (error: any) {
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error fetching bookings by role:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch bookings by role data", 500),
      { status: 500 }
    )
  }
}

