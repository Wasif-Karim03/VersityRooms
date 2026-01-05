/**
 * Zod validation schemas for Rooms endpoints
 */

import { z } from "zod"

export const roomFiltersSchema = z.object({
  capacity: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().int().positive().optional()
  ),
  building: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  equipment: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
})

export const roomIdSchema = z.object({
  id: z.string().cuid(),
})

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
})

export const createRoomSchema = z.object({
  name: z.string().min(1).max(200),
  building: z.string().min(1).max(200),
  capacity: z.number().int().positive(),
  equipment: z.array(z.string()),
  images: z.array(z.string()),
  isActive: z.boolean().default(true),
  isLocked: z.boolean().default(false),
  restrictedRoles: z.array(z.enum(["STUDENT", "FACULTY", "ADMIN"])).nullable(),
})

export const updateRoomSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  building: z.string().min(1).max(200).optional(),
  capacity: z.number().int().positive().optional(),
  equipment: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  restrictedRoles: z.array(z.enum(["STUDENT", "FACULTY", "ADMIN"])).nullable().optional(),
})

