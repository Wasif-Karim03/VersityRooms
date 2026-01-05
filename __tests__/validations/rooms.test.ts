/**
 * Unit tests for Room validation schemas
 */

import { describe, it, expect } from "vitest"
import { createRoomSchema, updateRoomSchema, roomFiltersSchema } from "@/src/lib/validations/rooms"

describe("Room Validation Schemas", () => {
  describe("createRoomSchema", () => {
    it("should validate valid room data", () => {
      const validRoom = {
        name: "Room 101",
        building: "Science Building",
        capacity: 50,
        equipment: ["projector", "whiteboard"],
        images: ["image1.jpg"],
        isActive: true,
        isLocked: false,
        restrictedRoles: null,
      }

      const result = createRoomSchema.safeParse(validRoom)
      expect(result.success).toBe(true)
    })

    it("should reject missing required fields", () => {
      const invalidRoom = {
        name: "Room 101",
        // missing building
        capacity: 50,
      }

      const result = createRoomSchema.safeParse(invalidRoom)
      expect(result.success).toBe(false)
    })

    it("should reject invalid capacity", () => {
      const invalidRoom = {
        name: "Room 101",
        building: "Science Building",
        capacity: -10, // negative capacity
        equipment: [],
        images: [],
      }

      const result = createRoomSchema.safeParse(invalidRoom)
      expect(result.success).toBe(false)
    })

    it("should reject name that is too long", () => {
      const invalidRoom = {
        name: "A".repeat(201), // exceeds max length of 200
        building: "Science Building",
        capacity: 50,
        equipment: [],
        images: [],
      }

      const result = createRoomSchema.safeParse(invalidRoom)
      expect(result.success).toBe(false)
    })
  })

  describe("updateRoomSchema", () => {
    it("should validate partial room data", () => {
      const partialRoom = {
        name: "Updated Room Name",
      }

      const result = updateRoomSchema.safeParse(partialRoom)
      expect(result.success).toBe(true)
    })

    it("should validate empty update (all fields optional)", () => {
      const result = updateRoomSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe("roomFiltersSchema", () => {
    it("should validate valid filters", () => {
      const filters = {
        capacity: "50",
        building: "Science",
        equipment: "projector",
      }

      const result = roomFiltersSchema.safeParse(filters)
      expect(result.success).toBe(true)
    })

    it("should accept empty filters", () => {
      const result = roomFiltersSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })
})

