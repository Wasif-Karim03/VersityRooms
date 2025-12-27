/**
 * GET /api/admin/reports/export
 * Export bookings to CSV
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { errorResponse } from "@/src/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default: 30 days ago
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
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
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bookings-${startDate.toISOString().split("T")[0]}-to-${endDate.toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
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

