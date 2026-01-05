/**
 * Zod validation schemas for Bookings endpoints
 */

import { z } from "zod"

export const bookingQuerySchema = z.object({
  roomId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export const createOverrideBookingSchema = z.object({
  roomId: z.string().cuid(),
  userId: z.string().cuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  purpose: z.string().min(1).max(500),
  reason: z.string().min(1).max(1000),
}).refine(
  (data) => new Date(data.endAt) > new Date(data.startAt),
  {
    message: "End time must be after start time",
    path: ["endAt"],
  }
)

