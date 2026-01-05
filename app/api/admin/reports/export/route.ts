/**
 * GET /api/admin/reports/export
 * Export bookings to CSV
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { exportQuerySchema } from "@/src/lib/validations/reports"
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
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    }

    // Validate query parameters
    const validatedQuery = exportQuerySchema.parse(query)

    const startDate = validatedQuery.startDate
      ? new Date(validatedQuery.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default: 30 days ago
    const endDate = validatedQuery.endDate
      ? new Date(validatedQuery.endDate)
      : new Date()

    // Get bookings with related data
    const bookings = await prisma.booking.findMany({
      where: {
        startAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        room: {
          select: {
            name: true,
            building: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            department: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    })

    // Generate CSV
    const headers = [
      "Booking ID",
      "Room Name",
      "Building",
      "User Name",
      "User Email",
      "User Role",
      "Department",
      "Start Time",
      "End Time",
      "Duration (hours)",
      "Purpose",
      "Is Override",
      "Created At",
    ]

    const rows = bookings.map((booking) => {
      const duration =
        (booking.endAt.getTime() - booking.startAt.getTime()) / (1000 * 60 * 60)
      return [
        booking.id,
        booking.room.name,
        booking.room.building,
        booking.user.name,
        booking.user.email,
        booking.user.role,
        booking.user.department || "",
        booking.startAt.toISOString(),
        booking.endAt.toISOString(),
        Math.round(duration * 10) / 10,
        booking.purpose,
        booking.isOverride ? "Yes" : "No",
        booking.createdAt.toISOString(),
      ]
    })

    // Escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return ""
      const str = String(value)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n")

    // Return CSV file
    const response = new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bookings-${startDate.toISOString().split("T")[0]}-to-${endDate.toISOString().split("T")[0]}.csv"`,
        "X-RateLimit-Limit": RateLimits.REPORTS.max.toString(),
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
      },
    })
    
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
    console.error("Error exporting bookings:", error)
    return NextResponse.json(
      errorResponse("Failed to export bookings", 500),
      { status: 500 }
    )
  }
}

