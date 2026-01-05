/**
 * GET /api/admin/rooms - Get all rooms (admin)
 * POST /api/admin/rooms - Create new room (admin)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { createRoomSchema } from "@/src/lib/validations/rooms"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { transformRooms, stringifyJsonField } from "@/lib/json-utils"
import { sanitizeString } from "@/src/lib/utils/sanitize"
import { cacheService } from "@/src/lib/cache.service"
import { CacheKeys } from "@/src/lib/cache-keys"
import {
  parsePaginationParams,
  calculateSkip,
  createPaginatedResponse,
} from "@/src/lib/pagination"
import { checkRateLimit, getClientIdentifier, RateLimits } from "@/src/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // Parse pagination parameters
    const searchParams = request.nextUrl.searchParams
    const { page, limit } = parsePaginationParams(searchParams)

    const skip = calculateSkip(page, limit)

    // Fetch paginated rooms and total count in parallel
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        orderBy: [
          { building: "asc" },
          { name: "asc" },
        ],
        skip,
        take: limit,
      }),
      prisma.room.count(),
    ])

    const paginatedResponse = createPaginatedResponse(
      transformRooms(rooms),
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
    if (error.name === "ZodError") {
      return NextResponse.json(
        errorResponse("Invalid pagination parameters", 400),
        { status: 400 }
      )
    }
    console.error("Error fetching rooms:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch rooms", 500),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()

    // Rate limiting (10 requests per minute for admin write operations)
    const identifier = getClientIdentifier(request, admin.id)
    const rateLimitResult = await checkRateLimit(identifier, RateLimits.REPORTS)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
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

    const body = await request.json()
    const validatedData = createRoomSchema.parse(body)

    // Sanitize string inputs
    const sanitizedData = {
      ...validatedData,
      name: sanitizeString(validatedData.name),
      building: sanitizeString(validatedData.building),
      equipment: validatedData.equipment.map(sanitizeString),
      images: validatedData.images.map(sanitizeString),
    }

    const room = await prisma.room.create({
      data: {
        name: sanitizedData.name,
        building: sanitizedData.building,
        capacity: validatedData.capacity,
        equipment: stringifyJsonField(sanitizedData.equipment),
        images: stringifyJsonField(sanitizedData.images),
        isActive: validatedData.isActive,
        isLocked: validatedData.isLocked,
        restrictedRoles: validatedData.restrictedRoles ? stringifyJsonField(validatedData.restrictedRoles) : null,
      },
    })

    // Invalidate room list cache (all filter combinations)
    await cacheService.invalidate("rooms:list:*")
    // Invalidate buildings cache
    await cacheService.delete(CacheKeys.buildings())

    const response = NextResponse.json(successResponse(room), { status: 201 })
    
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
    console.error("Error creating room:", error)
    return NextResponse.json(
      errorResponse("Failed to create room", 500),
      { status: 500 }
    )
  }
}

