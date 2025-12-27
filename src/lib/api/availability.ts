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
  // Get start and end of day
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  // Get all bookings for this day
  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      OR: [
        {
          AND: [
            { startAt: { gte: dayStart } },
            { startAt: { lte: dayEnd } },
          ],
        },
        {
          AND: [
            { endAt: { gte: dayStart } },
            { endAt: { lte: dayEnd } },
          ],
        },
        {
          AND: [
            { startAt: { lte: dayStart } },
            { endAt: { gte: dayEnd } },
          ],
        },
      ],
    },
    orderBy: {
      startAt: "asc",
    },
  })

  // Generate time slots (30-minute intervals)
  const slots: TimeSlot[] = []
  const slotDuration = 30 * 60 * 1000 // 30 minutes in milliseconds

  let currentTime = new Date(dayStart)
  
  while (currentTime < dayEnd) {
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

