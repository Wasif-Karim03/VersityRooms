/**
 * Room Service
 * Business logic for room operations
 * 
 * This is an example service layer structure.
 * To fully refactor, move business logic from API routes to services.
 */

import { prisma } from "@/lib/prisma"
import { transformRooms, transformRoom, stringifyJsonField } from "@/lib/json-utils"
import { sanitizeString } from "@/src/lib/utils/sanitize"
import { createRoomSchema, updateRoomSchema } from "@/src/lib/validations/rooms"
import { z } from "zod"

export class RoomService {
  /**
   * Create a new room
   */
  async createRoom(data: z.infer<typeof createRoomSchema>) {
    // Sanitize string inputs
    const sanitizedData = {
      ...data,
      name: sanitizeString(data.name),
      building: sanitizeString(data.building),
      equipment: data.equipment.map(sanitizeString),
      images: data.images.map(sanitizeString),
    }

    const room = await prisma.room.create({
      data: {
        name: sanitizedData.name,
        building: sanitizedData.building,
        capacity: data.capacity,
        equipment: stringifyJsonField(sanitizedData.equipment),
        images: stringifyJsonField(sanitizedData.images),
        isActive: data.isActive ?? true,
        isLocked: data.isLocked ?? false,
        restrictedRoles: data.restrictedRoles ? stringifyJsonField(data.restrictedRoles) : null,
      },
    })

    return transformRoom(room)
  }

  /**
   * Update a room
   */
  async updateRoom(id: string, data: z.infer<typeof updateRoomSchema>) {
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = sanitizeString(data.name)
    if (data.building !== undefined) updateData.building = sanitizeString(data.building)
    if (data.capacity !== undefined) updateData.capacity = data.capacity
    if (data.equipment !== undefined) {
      updateData.equipment = stringifyJsonField(data.equipment.map(sanitizeString))
    }
    if (data.images !== undefined) {
      updateData.images = stringifyJsonField(data.images.map(sanitizeString))
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.isLocked !== undefined) updateData.isLocked = data.isLocked
    if (data.restrictedRoles !== undefined) {
      updateData.restrictedRoles = data.restrictedRoles 
        ? stringifyJsonField(data.restrictedRoles) 
        : null
    }

    const room = await prisma.room.update({
      where: { id },
      data: updateData,
    })

    return transformRoom(room)
  }

  /**
   * Deactivate a room (soft delete)
   */
  async deactivateRoom(id: string) {
    const room = await prisma.room.update({
      where: { id },
      data: { isActive: false },
    })

    return room
  }

  /**
   * Get room by ID
   */
  async getRoomById(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      return null
    }

    return transformRoom(room)
  }
}

// Export singleton instance
export const roomService = new RoomService()

