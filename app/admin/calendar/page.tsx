"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { RoomSelector } from "@/src/components/calendar/room-selector"
import { CalendarGrid } from "@/src/components/calendar/calendar-grid"
import { OverrideBookingModal } from "@/src/components/admin/override-booking-modal"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { useToast } from "@/src/components/ui/toast"
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

export default function AdminCalendarPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalRoomId, setModalRoomId] = useState("")
  const [modalRoomName, setModalRoomName] = useState("")
  const [modalStart, setModalStart] = useState<Date>(new Date())
  const [modalEnd, setModalEnd] = useState<Date>(new Date())
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])

  useEffect(() => {
    fetchRooms()
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const result = await response.json()
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [selectedRoomIds, selectedDate])

  const fetchRooms = async () => {
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

  const fetchBookings = async () => {
    if (selectedRoomIds.length === 0) {
      setBookings([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const weekStart = new Date(selectedDate)
      const day = weekStart.getDay()
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
      weekStart.setDate(diff)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const allBookings: Booking[] = []

      for (const roomId of selectedRoomIds) {
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

        const requestsResponse = await fetch(`/api/requests?status=PENDING`)
        const requestsResult = await requestsResponse.json()
        if (requestsResult.success) {
          // Handle paginated response format
          const requestsData = requestsResult.data.data || requestsResult.data
          const requestsArray = Array.isArray(requestsData) ? requestsData : []
          allBookings.push(
            ...requestsArray
              .filter((r: any) => r.roomId === roomId)
              .map((r: any) => ({
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
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const displayRooms = rooms.filter((room) => selectedRoomIds.includes(room.id))

  const handleSlotClick = (roomId: string, start: Date, end: Date) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    setModalRoomId(roomId)
    setModalRoomName(room.name)
    setModalStart(start)
    setModalEnd(end)
    setModalOpen(true)
  }

  const handleBookingClick = () => {
    // Admin can view booking details but not modify from calendar
    // They can use the override booking feature
  }

  const handleCreateOverride = async (data: {
    roomId: string
    userId: string
    startAt: Date
    endAt: Date
    purpose: string
    reason: string
  }) => {
    const response = await fetch("/api/bookings/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: data.roomId,
        userId: data.userId,
        startAt: data.startAt.toISOString(),
        endAt: data.endAt.toISOString(),
        purpose: data.purpose,
        reason: data.reason,
      }),
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || "Failed to create override booking")
    }

    addToast("Override booking created successfully", "success")
    router.refresh()
    fetchBookings()
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    setSelectedDate(newDate)
  }

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Calendar</h1>
            <p className="text-muted-foreground mt-1">
              View all room bookings and create override bookings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
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
        <Card className="p-4 md:p-6">
          <RoomSelector
            rooms={rooms}
            selectedRoomIds={selectedRoomIds}
            onSelectionChange={setSelectedRoomIds}
            loading={rooms.length === 0}
          />
        </Card>
      </FadeIn>

      {selectedRoomIds.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms selected</h3>
            <p className="text-sm text-muted-foreground">
              Select one or more rooms above to view their schedules
            </p>
          </div>
        </Card>
      ) : (
        <FadeIn delay={0.2}>
          <CalendarGrid
            rooms={displayRooms}
            bookings={bookings.map((b) => ({
              ...b,
              startAt: new Date(b.startAt),
              endAt: new Date(b.endAt),
            }))}
            selectedDate={selectedDate}
            onSlotClick={handleSlotClick}
            onBookingClick={handleBookingClick}
            loading={loading}
          />
        </FadeIn>
      )}

      <OverrideBookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOverride}
        roomId={modalRoomId}
        roomName={modalRoomName}
        initialStart={modalStart}
        initialEnd={modalEnd}
        users={users}
      />
    </PageTransition>
  )
}

