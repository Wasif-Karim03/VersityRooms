/**
 * GET /api/admin/reports/bookings-by-role
 * Get bookings breakdown by user role
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const weeks = parseInt(searchParams.get("weeks") || "4")
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000)

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

    return NextResponse.json(
      successResponse({
        byRole,
        total,
      })
    )
  } catch (error: any) {
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

