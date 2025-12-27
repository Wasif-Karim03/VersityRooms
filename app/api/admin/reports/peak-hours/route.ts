/**
 * GET /api/admin/reports/peak-hours
 * Get peak booking hours heatmap data
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

    // Get all bookings for the period
    const bookings = await prisma.booking.findMany({
      where: {
        startAt: { gte: startDate },
      },
      select: {
        startAt: true,
        endAt: true,
      },
    })

    // Initialize hour buckets (0-23)
    const hourCounts: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0
    }

    // Count bookings per hour
    bookings.forEach((booking) => {
      const start = new Date(booking.startAt)
      const end = new Date(booking.endAt)
      
      // For each hour the booking spans, increment count
      let current = new Date(start)
      while (current < end) {
        const hour = current.getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
        current.setHours(current.getHours() + 1)
      }
    })

    // Convert to array format for chart
    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        hourLabel: formatHour(parseInt(hour)),
        count,
      }))
      .sort((a, b) => a.hour - b.hour)

    // Calculate peak hour
    const maxCount = Math.max(...peakHours.map((h) => h.count))
    const peakHour = peakHours.find((h) => h.count === maxCount)

    return NextResponse.json(
      successResponse({
        peakHours,
        peakHour: peakHour?.hour,
        maxCount,
      })
    )
  } catch (error: any) {
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error fetching peak hours:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch peak hours data", 500),
      { status: 500 }
    )
  }
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return "12 PM"
  return `${hour - 12} PM`
}

