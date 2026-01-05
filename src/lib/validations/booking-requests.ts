/**
 * Zod validation schemas for Booking Requests endpoints
 */

import { z } from "zod"

export const createBookingRequestSchema = z.object({
  roomId: z.string().cuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  purpose: z.string().min(1).max(500),
}).refine(
  (data) => new Date(data.endAt) > new Date(data.startAt),
  {
    message: "End time must be after start time",
    path: ["endAt"],
  }
)

export const bookingRequestIdSchema = z.object({
  id: z.string().cuid(),
})

export const bookingRequestQuerySchema = z.object({
  mine: z.coerce.boolean().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
})

export const updateBookingRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().min(1).max(1000),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.startAt && data.endAt) {
      return new Date(data.endAt) > new Date(data.startAt)
    }
    return true
  },
  {
    message: "End time must be after start time",
    path: ["endAt"],
  }
)

