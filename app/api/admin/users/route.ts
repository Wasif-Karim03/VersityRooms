/**
 * GET /api/admin/users
 * Get all users (admin only)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import {
  parsePaginationParams,
  calculateSkip,
  createPaginatedResponse,
} from "@/src/lib/pagination"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // Parse pagination parameters
    const searchParams = request.nextUrl.searchParams
    const { page, limit } = parsePaginationParams(searchParams)

    const skip = calculateSkip(page, limit)

    // Fetch paginated users and total count in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ])

    const paginatedResponse = createPaginatedResponse(
      users,
      total,
      page,
      limit
    )

    return NextResponse.json(successResponse(paginatedResponse))
  } catch (error: any) {
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
    console.error("Error fetching users:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch users", 500),
      { status: 500 }
    )
  }
}

