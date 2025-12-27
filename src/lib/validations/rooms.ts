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

