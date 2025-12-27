"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"

interface TimeSlot {
  hour: number
  minute: number
  display: string
}

interface BookingBlock {
  id: string
  roomId: string
  startAt: Date
  endAt: Date
  purpose: string
  status: "APPROVED" | "PENDING"
  user: {
    name: string
    email: string
  }
}

interface CalendarGridProps {
  rooms: Array<{ id: string; name: string; building: string }>
  bookings: BookingBlock[]
  selectedDate: Date
  onSlotClick: (roomId: string, startTime: Date, endTime: Date) => void
  onBookingClick: (booking: BookingBlock, event: React.MouseEvent) => void
  loading?: boolean
}

const TIME_SLOTS: TimeSlot[] = []
for (let hour = 8; hour <= 23; hour++) {
  TIME_SLOTS.push({
    hour,
    minute: 0,
    display: hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`,
  })
}

export function CalendarGrid({
  rooms,
  bookings,
  selectedDate,
  onSlotClick,
  onBookingClick,
  loading = false,
}: CalendarGridProps) {
  const [hoveredSlot, setHoveredSlot] = useState<{
    roomId: string
    hour: number
  } | null>(null)

  // Get week days
  const weekDays = useMemo(() => {
    const days: Date[] = []
    const startOfWeek = new Date(selectedDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }
    return days
  }, [selectedDate])

  const getBookingsForSlot = (roomId: string, day: Date, hour: number) => {
    const slotStart = new Date(day)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(day)
    slotEnd.setHours(hour + 1, 0, 0, 0)

    return bookings.filter((booking) => {
      if (booking.roomId !== roomId) return false
      const bookingStart = new Date(booking.startAt)
      const bookingEnd = new Date(booking.endAt)

      // Check if booking overlaps with this hour slot
      return (
        bookingStart < slotEnd &&
        bookingEnd > slotStart &&
        bookingStart.toDateString() === day.toDateString()
      )
    })
  }

  const getSlotPosition = (start: Date, end: Date, hour: number) => {
    const slotStart = new Date(start)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(start)
    slotEnd.setHours(hour + 1, 0, 0, 0)

    const bookingStartMinutes = start.getHours() * 60 + start.getMinutes()
    const bookingEndMinutes = end.getHours() * 60 + end.getMinutes()
    const slotStartMinutes = hour * 60
    const slotEndMinutes = (hour + 1) * 60

    if (bookingStartMinutes >= slotEndMinutes || bookingEndMinutes <= slotStartMinutes) {
      return null
    }

    const top = Math.max(0, bookingStartMinutes - slotStartMinutes)
    const height = Math.min(slotEndMinutes - slotStartMinutes, bookingEndMinutes - slotStartMinutes) - top

    return {
      top: (top / 60) * 100,
      height: (height / 60) * 100,
    }
  }

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-px bg-border">
          <div className="p-4 bg-background">
            <Skeleton className="h-4 w-16" />
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-4 bg-background">
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        {TIME_SLOTS.map((_, i) => (
          <div key={i} className="grid grid-cols-8 gap-px bg-border">
            <div className="p-2 bg-background">
              <Skeleton className="h-4 w-12" />
            </div>
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-16 bg-background">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="grid grid-cols-8 gap-px bg-border">
        {/* Header */}
        <div className="p-4 bg-muted/50 font-medium text-sm">Time</div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`p-4 text-center bg-muted/50 ${
              day.toDateString() === new Date().toDateString()
                ? "bg-primary/10 font-semibold"
                : ""
            }`}
          >
            <div className="text-sm font-medium">
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div className="text-xs text-muted-foreground">
              {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {TIME_SLOTS.map((timeSlot, slotIndex) => (
          <div key={slotIndex} className="grid grid-cols-8 gap-px bg-border">
            {/* Time label */}
            <div className="p-2 bg-muted/30 text-xs text-muted-foreground text-right pr-4">
              {timeSlot.display}
            </div>

            {/* Room columns */}
            {rooms.map((room) => {
              const slotBookings = getBookingsForSlot(room.id, weekDays[0], timeSlot.hour)
              const isHovered =
                hoveredSlot?.roomId === room.id && hoveredSlot?.hour === timeSlot.hour

              return (
                <div
                  key={room.id}
                  className="relative h-16 bg-background group"
                  onMouseEnter={() => setHoveredSlot({ roomId: room.id, hour: timeSlot.hour })}
                  onMouseLeave={() => setHoveredSlot(null)}
                >
                  {/* Empty slot - clickable */}
                  {slotBookings.length === 0 && (
                    <motion.button
                      whileHover={{ backgroundColor: "hsl(var(--accent))" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const start = new Date(weekDays[0])
                        start.setHours(timeSlot.hour, 0, 0, 0)
                        const end = new Date(weekDays[0])
                        end.setHours(timeSlot.hour + 1, 0, 0, 0)
                        onSlotClick(room.id, start, end)
                      }}
                      className="w-full h-full flex items-center justify-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Click to book
                    </motion.button>
                  )}

                  {/* Booking blocks */}
                  {slotBookings.map((booking) => {
                    const position = getSlotPosition(
                      new Date(booking.startAt),
                      new Date(booking.endAt),
                      timeSlot.hour
                    )

                    if (!position) return null

                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, zIndex: 10 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onBookingClick(booking, e as any)
                        }}
                        className={`absolute left-0 right-0 rounded cursor-pointer ${
                          booking.status === "APPROVED"
                            ? "bg-primary/80 hover:bg-primary"
                            : "bg-yellow-500/80 hover:bg-yellow-500"
                        } text-white p-1 text-xs shadow-sm`}
                        style={{
                          top: `${position.top}%`,
                          height: `${position.height}%`,
                        }}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <Badge
                            variant={booking.status === "APPROVED" ? "default" : "warning"}
                            className="text-xs px-1 py-0"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="font-medium truncate">{booking.purpose}</p>
                        <p className="text-xs opacity-90 truncate">{booking.user.name}</p>
                      </motion.div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

