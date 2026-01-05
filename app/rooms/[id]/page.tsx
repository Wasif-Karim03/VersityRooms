"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, Users, Wrench, Calendar, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { SlideUp } from "@/src/components/motion/slide-up"
import { ScheduleView } from "@/src/components/rooms/schedule-view"
import { MultiStepBookingModal } from "@/src/components/booking/multi-step-booking-modal"
import { useToast } from "@/src/components/ui/toast"
import Link from "next/link"
import { motion } from "framer-motion"

interface Room {
  id: string
  name: string
  building: string
  capacity: number
  equipment: string[]
  images: string[]
  isActive: boolean
  isLocked: boolean
  restrictedRoles: string[] | null
  createdAt: string
}

interface AvailabilityData {
  date: string
  roomId: string
  timeSlots: Array<{
    start: string
    end: string
    isAvailable: boolean
    bookingId?: string
    purpose?: string
  }>
  bookings: Array<{
    id: string
    startAt: string
    endAt: string
    purpose: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [modalStart, setModalStart] = useState<Date>(new Date())
  const [modalEnd, setModalEnd] = useState<Date>(new Date())

  // Fetch room details
  useEffect(() => {
    async function fetchRoom() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/rooms/${roomId}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch room")
        }

        setRoom(result.data)
      } catch (err: any) {
        setError(err.message || "Failed to load room")
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      fetchRoom()
    }
  }, [roomId])

  // Fetch availability
  useEffect(() => {
    async function fetchAvailability() {
      if (!roomId || !selectedDate) return

      try {
        const response = await fetch(
          `/api/rooms/${roomId}/availability?date=${selectedDate}`
        )
        const result = await response.json()

        if (result.success) {
          setAvailability(result.data)
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err)
      }
    }

    fetchAvailability()
  }, [roomId, selectedDate])

  const [modalOpen, setModalOpen] = useState(false)
  const { addToast } = useToast()

  const checkConflict = async (startAt: Date, endAt: Date): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/bookings?roomId=${roomId}&from=${startAt.toISOString()}&to=${endAt.toISOString()}`
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
    try {
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
      
      // Log full response for debugging
      console.log("Booking request API response:", {
        status: response.status,
        statusText: response.statusText,
        result: result
      })
      
      if (!result.success) {
        console.error("Booking request failed:", result)
        throw new Error(result.error || "Failed to create booking request")
      }

      addToast("Room booked successfully!", "success")
      
      // Refresh availability to show the new booking
      const availabilityResponse = await fetch(
        `/api/rooms/${roomId}/availability?date=${data.startAt.toISOString().split("T")[0]}`
      )
      const availabilityResult = await availabilityResponse.json()
      if (availabilityResult.success) {
        setAvailability(availabilityResult.data)
      }
      
      router.refresh()
    } catch (err: any) {
      console.error("Error in handleCreateRequest:", err)
      throw err
    }
  }

  const handleRequestBooking = () => {
    // Set default time to next hour
    const now = new Date()
    const nextHour = new Date(now)
    nextHour.setHours(now.getHours() + 1, 0, 0, 0)
    const endHour = new Date(nextHour)
    endHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
    
    setModalStart(nextHour)
    setModalEnd(endHour)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <PageTransition className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </PageTransition>
    )
  }

  if (error || !room) {
    return (
      <PageTransition className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              {error || "Room not found"}
            </p>
            <Link href="/rooms">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Rooms
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="space-y-6">
      {/* Back Button */}
      <FadeIn>
        <Link href="/rooms">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rooms
          </Button>
        </Link>
      </FadeIn>

      {/* Hero Header */}
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{room.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{room.building}</span>
          </div>
          {room.isLocked && (
            <Badge variant="destructive">Currently Locked</Badge>
          )}
          {!room.isActive && (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </FadeIn>

      {/* Image Gallery */}
      {room.images && Array.isArray(room.images) && room.images.length > 0 && (
        <SlideUp delay={0.1}>
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                {room.images.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={image}
                      alt={`${room.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken images
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </SlideUp>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Info Grid */}
        <SlideUp delay={0.2}>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Room Details</h2>
                
                <div className="space-y-4">
                  {/* Capacity */}
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-muted-foreground">
                        Up to {room.capacity} people
                      </p>
                    </div>
                  </div>

                  {/* Equipment */}
                  {room.equipment && Array.isArray(room.equipment) && room.equipment.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium mb-2">Equipment</p>
                        <div className="flex flex-wrap gap-2">
                          {room.equipment.map((item) => (
                            <Badge key={item} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Policies */}
                  <div className="pt-4 border-t">
                    <p className="font-medium mb-2">Booking Policies</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {room.restrictedRoles && Array.isArray(room.restrictedRoles) && room.restrictedRoles.length > 0 ? (
                        <li>
                          Restricted to: {room.restrictedRoles.join(", ")}
                        </li>
                      ) : (
                        <li>Available to all users</li>
                      )}
                      <li>Bookings require approval</li>
                      <li>Maximum booking duration: 4 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideUp>

        {/* Schedule Section */}
        <SlideUp delay={0.3}>
          {availability && (
            <ScheduleView
              date={selectedDate}
              timeSlots={availability.timeSlots.map((slot) => ({
                start: new Date(slot.start),
                end: new Date(slot.end),
                isAvailable: slot.isAvailable,
                bookingId: slot.bookingId,
                purpose: slot.purpose,
              }))}
              bookings={availability.bookings.map((booking) => ({
                id: booking.id,
                startAt: new Date(booking.startAt),
                endAt: new Date(booking.endAt),
                purpose: booking.purpose,
                user: booking.user,
              }))}
              onDateChange={setSelectedDate}
            />
          )}
        </SlideUp>
      </div>

      {/* CTA Button */}
      <FadeIn delay={0.4}>
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleRequestBooking}
            disabled={!room.isActive || room.isLocked}
            className="min-w-[200px]"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Request Booking
          </Button>
        </div>
      </FadeIn>

      {/* Booking Modal */}
      <MultiStepBookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateRequest}
        roomId={room.id}
        roomName={room.name}
        initialStart={modalStart}
        initialEnd={modalEnd}
        onConflictCheck={checkConflict}
      />
    </PageTransition>
  )
}

