/**
 * GET /api/admin/users
 * Get all users (admin only)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
      orderBy: [
        { name: "asc" },
      ],
    })

    return NextResponse.json(successResponse(users))
  } catch (error: any) {
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error fetching users:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch users", 500),
      { status: 500 }
    )
  }
}

