/**
 * Availability checking utilities
 */

import { prisma } from "@/lib/prisma"

export interface TimeSlot {
  start: Date
  end: Date
  isAvailable: boolean
  bookingId?: string
  purpose?: string
}

/**
 * Check if two time ranges overlap
 * Overlap if: newStart < existingEnd AND newEnd > existingStart
 */
export function hasOverlap(
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date
): boolean {
  return newStart < existingEnd && newEnd > existingStart
}

/**
 * Check if a booking conflicts with existing bookings
 */
export async function checkBookingConflicts(
  roomId: string,
  startAt: Date,
  endAt: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const conflicts = await prisma.booking.findMany({
    where: {
      roomId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        {
          AND: [
            { startAt: { lte: startAt } },
            { endAt: { gt: startAt } },
          ],
        },
        {
          AND: [
            { startAt: { lt: endAt } },
            { endAt: { gte: endAt } },
          ],
        },
        {
          AND: [
            { startAt: { gte: startAt } },
            { endAt: { lte: endAt } },
          ],
        },
      ],
    },
  })

  return conflicts.length > 0
}

/**
 * Get time slots for a specific day
 */
export async function getDayTimeSlots(
  roomId: string,
  date: Date
): Promise<TimeSlot[]> {
  // Generate slots for a wider UTC range to account for timezone differences
  // Generate from (UTC date - 1 day) 00:00 UTC to (UTC date + 1 day) 23:59 UTC
  // This ensures we cover the entire local day regardless of timezone offset
  // For example: Jan 4 00:00 UTC to Jan 6 23:59 UTC covers Jan 5 in any timezone
  const slotDayStart = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() - 1,
    0, 0, 0, 0
  ))
  
  const slotDayEnd = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
    23, 59, 59, 999
  ))
  
  // Query bookings with wider range to account for timezone differences:
  // Query from (date - 1 day) 12:00 UTC to (date + 1 day) 12:00 UTC
  // This ensures we capture bookings that fall within the local date
  // even if they're stored on a different calendar day in UTC
  const bookingDayStart = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() - 1,
    12, 0, 0, 0
  ))
  
  const bookingDayEnd = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
    12, 0, 0, 0
  ))

  // Get all bookings for this day (using wider range)
  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      OR: [
        {
          AND: [
            { startAt: { gte: bookingDayStart } },
            { startAt: { lte: bookingDayEnd } },
          ],
        },
        {
          AND: [
            { endAt: { gte: bookingDayStart } },
            { endAt: { lte: bookingDayEnd } },
          ],
        },
        {
          AND: [
            { startAt: { lte: bookingDayStart } },
            { endAt: { gte: bookingDayEnd } },
          ],
        },
      ],
    },
    orderBy: {
      startAt: "asc",
    },
  })

  // Generate time slots (30-minute intervals) for the actual UTC date
  const slots: TimeSlot[] = []
  const slotDuration = 30 * 60 * 1000 // 30 minutes in milliseconds

  let currentTime = new Date(slotDayStart)
  
  while (currentTime < slotDayEnd) {
    const slotEnd = new Date(currentTime.getTime() + slotDuration)
    
    // Check if this slot overlaps with any booking
    const overlappingBooking = bookings.find((booking) =>
      hasOverlap(currentTime, slotEnd, booking.startAt, booking.endAt)
    )

    slots.push({
      start: new Date(currentTime),
      end: new Date(slotEnd),
      isAvailable: !overlappingBooking,
      bookingId: overlappingBooking?.id,
      purpose: overlappingBooking?.purpose,
    })

    currentTime = new Date(slotEnd)
  }

  return slots
}

