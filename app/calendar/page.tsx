"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { RoomSelector } from "@/src/components/calendar/room-selector"
import { CalendarGrid } from "@/src/components/calendar/calendar-grid"
import { BookingDetailPopover } from "@/src/components/calendar/booking-detail-popover"
import { MultiStepBookingModal } from "@/src/components/booking/multi-step-booking-modal"
import { useToast } from "@/src/components/ui/toast"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { useRouter } from "next/navigation"

interface Room {
  id: string
  name: string
  building: string
  capacity: number
}

interface Booking {
  id: string
  roomId: string
  startAt: string
  endAt: string
  purpose: string
  status: "APPROVED" | "PENDING"
  user: {
    id: string
    name: string
    email: string
  }
}

interface BookingRequest {
  id: string
  roomId: string
  startAt: string
  endAt: string
  purpose: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  user: {
    id: string
    name: string
    email: string
  }
}

export default function CalendarPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalRoomId, setModalRoomId] = useState("")
  const [modalRoomName, setModalRoomName] = useState("")
  const [modalStart, setModalStart] = useState<Date>(new Date())
  const [modalEnd, setModalEnd] = useState<Date>(new Date())

  // Fetch rooms
  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await fetch("/api/rooms")
        const result = await response.json()
        if (result.success) {
          // Handle paginated response format
          const roomsData = result.data.data || result.data
          setRooms(Array.isArray(roomsData) ? roomsData : [])
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error)
      }
    }
    fetchRooms()
  }, [])

  // Fetch bookings for selected rooms and date range
  useEffect(() => {
    async function fetchBookings() {
      if (selectedRoomIds.length === 0) {
        setBookings([])
        setBookingRequests([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Get week start and end
        const weekStart = new Date(selectedDate)
        const day = weekStart.getDay()
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
        weekStart.setDate(diff)
        weekStart.setHours(0, 0, 0, 0)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

        // Fetch bookings for each room
        const allBookings: Booking[] = []
        const allRequests: BookingRequest[] = []

        for (const roomId of selectedRoomIds) {
          // Fetch bookings
          const bookingsResponse = await fetch(
            `/api/bookings?roomId=${roomId}&from=${weekStart.toISOString()}&to=${weekEnd.toISOString()}`
          )
          const bookingsResult = await bookingsResponse.json()
          if (bookingsResult.success) {
            // Handle paginated response format
            const bookingsData = bookingsResult.data.data || bookingsResult.data
            const bookingsArray = Array.isArray(bookingsData) ? bookingsData : []
            allBookings.push(
              ...bookingsArray.map((b: any) => ({
                ...b,
                status: "APPROVED" as const,
              }))
            )
          }

          // Fetch pending requests
          const requestsResponse = await fetch(`/api/requests?status=PENDING`)
          const requestsResult = await requestsResponse.json()
          if (requestsResult.success) {
            // Handle paginated response format
            const requestsData = requestsResult.data.data || requestsResult.data
            const requestsArray = Array.isArray(requestsData) ? requestsData : []
            allRequests.push(
              ...requestsArray
                .filter((r: BookingRequest) => r.roomId === roomId)
                .map((r: BookingRequest) => ({
                  id: r.id,
                  roomId: r.roomId,
                  startAt: r.startAt,
                  endAt: r.endAt,
                  purpose: r.purpose,
                  status: "PENDING" as const,
                  user: r.user,
                }))
            )
          }
        }

        setBookings(allBookings)
        setBookingRequests(allRequests)
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [selectedRoomIds, selectedDate])

  // Combine bookings and requests
  const allBookings = useMemo(() => {
    const combined = [
      ...bookings.map((b) => ({
        ...b,
        startAt: new Date(b.startAt),
        endAt: new Date(b.endAt),
      })),
      ...bookingRequests.map((r) => ({
        id: r.id,
        roomId: r.roomId,
        startAt: new Date(r.startAt),
        endAt: new Date(r.endAt),
        purpose: r.purpose,
        status: r.status as "APPROVED" | "PENDING",
        user: r.user,
      })),
    ]
    return combined
  }, [bookings, bookingRequests])

  // Filter rooms based on selection
  const displayRooms = useMemo(() => {
    if (selectedRoomIds.length === 0) return []
    return rooms.filter((room) => selectedRoomIds.includes(room.id))
  }, [rooms, selectedRoomIds])

  const handleBookingClick = (booking: Booking, event: React.MouseEvent) => {
    setSelectedBooking(booking)
    setPopoverPosition({
      x: event.clientX,
      y: event.clientY,
    })
    setPopoverOpen(true)
  }

  const handleSlotClick = (roomId: string, start: Date, end: Date) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    setModalRoomId(roomId)
    setModalRoomName(room.name)
    setModalStart(start)
    setModalEnd(end)
    setModalOpen(true)
  }

  const checkConflict = async (startAt: Date, endAt: Date): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/bookings?roomId=${modalRoomId}&from=${startAt.toISOString()}&to=${endAt.toISOString()}`
      )
      const result = await response.json()
      if (result.success) {
        return result.data.length > 0
      }
      return false
    } catch {
      return false
    }
  }

  const handleCreateRequest = async (data: {
    roomId: string
    startAt: Date
    endAt: Date
    purpose: string
  }) => {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: data.roomId,
        startAt: data.startAt.toISOString(),
        endAt: data.endAt.toISOString(),
        purpose: data.purpose,
      }),
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || "Failed to create booking request")
    }

    addToast("Room booked successfully!", "success")
    
    // Refresh bookings
    router.refresh()
    // Trigger re-fetch
    setSelectedRoomIds([...selectedRoomIds])
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, 'Playfair Display', serif", color: "#000000" }}>Calendar</h1>
            <p className="mt-1" style={{ color: "#333333" }}>
              View room availability and bookings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card 
          className="p-4 md:p-6"
          style={{
            backgroundColor: "#990000",
            borderTopColor: "#990000",
          }}
        >
          <RoomSelector
            rooms={rooms}
            selectedRoomIds={selectedRoomIds}
            onSelectionChange={setSelectedRoomIds}
            loading={rooms.length === 0}
          />
        </Card>
      </FadeIn>

      {selectedRoomIds.length === 0 ? (
        <Card
          style={{
            backgroundColor: "#990000",
            borderTopColor: "#990000",
          }}
        >
          <div className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4" style={{ color: "#FFFFFF" }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>No rooms selected</h3>
            <p className="text-sm" style={{ color: "#FFFFFF" }}>
              Select one or more rooms above to view their schedules
            </p>
          </div>
        </Card>
      ) : (
        <FadeIn delay={0.2}>
          <CalendarGrid
            rooms={displayRooms}
            bookings={allBookings}
            selectedDate={selectedDate}
            onSlotClick={handleSlotClick}
            onBookingClick={(booking, event) =>
              handleBookingClick(booking, event)
            }
            loading={loading}
          />
        </FadeIn>
      )}

      {selectedBooking && (
        <BookingDetailPopover
          booking={selectedBooking}
          isOpen={popoverOpen}
          onClose={() => setPopoverOpen(false)}
          position={popoverPosition}
        />
      )}

      <MultiStepBookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateRequest}
        roomId={modalRoomId}
        roomName={modalRoomName}
        initialStart={modalStart}
        initialEnd={modalEnd}
        onConflictCheck={checkConflict}
      />
    </PageTransition>
  )
}
