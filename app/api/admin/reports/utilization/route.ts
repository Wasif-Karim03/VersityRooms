/**
 * GET /api/admin/reports/utilization
 * Get room utilization metrics (hours booked per week)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { successResponse, errorResponse } from "@/src/lib/api/response"
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
    const weeks = parseInt(searchParams.get("weeks") || "4")
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000)

    // Get all active rooms
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      select: { id: true, name: true, building: true },
      orderBy: [{ building: "asc" }, { name: "asc" }],
    })

    // Get bookings for the period
    const bookings = await prisma.booking.findMany({
      where: {
        startAt: { gte: startDate },
      },
      select: {
        roomId: true,
        startAt: true,
        endAt: true,
      },
    })

    // Calculate hours per room per week
    const utilization = rooms.map((room) => {
      const roomBookings = bookings.filter((b) => b.roomId === room.id)

      // Group by week
      const weeklyHours: Record<string, number> = {}
      
      roomBookings.forEach((booking) => {
        const hours = (booking.endAt.getTime() - booking.startAt.getTime()) / (1000 * 60 * 60)
        const weekKey = getWeekKey(booking.startAt)
        weeklyHours[weekKey] = (weeklyHours[weekKey] || 0) + hours
      })

      // Calculate total hours
      const totalHours = roomBookings.reduce((sum, booking) => {
        return sum + (booking.endAt.getTime() - booking.startAt.getTime()) / (1000 * 60 * 60)
      }, 0)

      // Calculate average hours per week
      const weekCount = Object.keys(weeklyHours).length || 1
      const avgHoursPerWeek = totalHours / weekCount

      return {
        roomId: room.id,
        roomName: room.name,
        building: room.building,
        totalHours,
        avgHoursPerWeek: Math.round(avgHoursPerWeek * 10) / 10,
        weeklyBreakdown: Object.entries(weeklyHours).map(([week, hours]) => ({
          week,
          hours: Math.round(hours * 10) / 10,
        })),
      }
    })

    const response = NextResponse.json(successResponse(utilization))
    
    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", RateLimits.REPORTS.max.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())
    response.headers.set("X-RateLimit-Reset", new Date(rateLimitResult.reset).toISOString())
    
    return response
  } catch (error: any) {
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error fetching utilization:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch utilization data", 500),
      { status: 500 }
    )
  }
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  const monday = new Date(d.setDate(diff))
  return `${monday.getFullYear()}-W${getWeekNumber(monday)}`
}

function getWeekNumber(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return String(Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)).padStart(2, "0")
}

