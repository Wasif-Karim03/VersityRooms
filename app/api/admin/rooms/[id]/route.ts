/**
 * PUT /api/admin/rooms/:id - Update room (admin)
 * DELETE /api/admin/rooms/:id - Delete room (admin)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { roomIdSchema, updateRoomSchema } from "@/src/lib/validations/rooms"
import { createAuditLog } from "@/src/lib/api/audit"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { stringifyJsonField, transformRoom } from "@/lib/json-utils"
import { cacheService } from "@/src/lib/cache.service"
import { CacheKeys } from "@/src/lib/cache-keys"
import { checkRateLimit, getClientIdentifier, RateLimits } from "@/src/lib/rate-limit"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = roomIdSchema.parse({ id: params.id })
    const body = await request.json()
    const validatedData = updateRoomSchema.parse(body)

    // Prepare update data, stringifying JSON fields and sanitizing strings
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = sanitizeString(validatedData.name)
    if (validatedData.building !== undefined) updateData.building = sanitizeString(validatedData.building)
    if (validatedData.capacity !== undefined) updateData.capacity = validatedData.capacity
    if (validatedData.equipment !== undefined) updateData.equipment = stringifyJsonField(validatedData.equipment.map(sanitizeString))
    if (validatedData.images !== undefined) updateData.images = stringifyJsonField(validatedData.images.map(sanitizeString))
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
    if (validatedData.isLocked !== undefined) updateData.isLocked = validatedData.isLocked
    if (validatedData.restrictedRoles !== undefined) {
      updateData.restrictedRoles = validatedData.restrictedRoles ? stringifyJsonField(validatedData.restrictedRoles) : null
    }

    const room = await prisma.room.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog({
      actorUserId: admin.id,
      actionType: "ROOM_UPDATED",
      targetType: "Room",
      targetId: id,
      reason: "Room updated by admin",
    })

    // Invalidate caches for this room
    await cacheService.delete(CacheKeys.room(id))
    await cacheService.invalidate("rooms:list:*")
    await cacheService.invalidate(`availability:${id}:*`) // Invalidate all availability caches for this room
    // Invalidate buildings cache (building name might have changed)
    await cacheService.delete(CacheKeys.buildings())

    const response = NextResponse.json(successResponse(transformRoom(room)))
    
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
    console.error("Error updating room:", error)
    return NextResponse.json(
      errorResponse("Failed to update room", 500),
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = roomIdSchema.parse({ id: params.id })

    // Instead of deleting, deactivate the room
    const room = await prisma.room.update({
      where: { id },
      data: { isActive: false },
    })

    await createAuditLog({
      actorUserId: admin.id,
      actionType: "ROOM_DEACTIVATED",
      targetType: "Room",
      targetId: id,
      reason: "Room deactivated by admin",
    })

    // Invalidate caches for this room
    await cacheService.delete(CacheKeys.room(id))
    await cacheService.invalidate("rooms:list:*")
    await cacheService.invalidate(`availability:${id}:*`) // Invalidate all availability caches for this room
    // Invalidate buildings cache (room count changed)
    await cacheService.del(CacheKeys.buildings())

    const response = NextResponse.json(successResponse(room))
    
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
    console.error("Error deleting room:", error)
    return NextResponse.json(
      errorResponse("Failed to delete room", 500),
      { status: 500 }
    )
  }
}

