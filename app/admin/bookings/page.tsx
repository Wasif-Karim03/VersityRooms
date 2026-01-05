"use client"

import { useState, useEffect } from "react"
import { Calendar, User, Mail, Clock, Building2 } from "lucide-react"
import { AdminTable, AdminTableRow, AdminTableCell } from "@/src/components/admin/admin-table"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { useToast } from "@/src/components/ui/toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"

interface Booking {
  id: string
  roomId: string
  userId: string
  startAt: string
  endAt: string
  purpose: string
  createdAt: string
  room: {
    id: string
    name: string
    building: string
  }
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function AdminBookingsPage() {
  const { addToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRoom, setFilterRoom] = useState("")
  const [filterUser, setFilterUser] = useState("")
  const [allRooms, setAllRooms] = useState<Array<{ id: string; name: string; building: string }>>([])

  useEffect(() => {
    fetchRooms()
    fetchBookings()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms?limit=1000")
      const result = await response.json()
      if (result.success) {
        const roomsData = result.data.data || result.data
        setAllRooms(Array.isArray(roomsData) ? roomsData : [])
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/bookings?limit=1000")
      const result = await response.json()

      if (result.success) {
        const bookingsData = result.data.data || result.data
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      } else {
        addToast("Failed to load bookings", "error")
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      addToast("Failed to load bookings", "error")
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const filteredBookings = bookings.filter((booking) => {
    const roomMatch = !filterRoom || 
      booking.room.name.toLowerCase().includes(filterRoom.toLowerCase()) ||
      booking.room.building.toLowerCase().includes(filterRoom.toLowerCase())
    const userMatch = !filterUser ||
      booking.user.name.toLowerCase().includes(filterUser.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(filterUser.toLowerCase())
    return roomMatch && userMatch
  })

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
          <p className="text-muted-foreground mt-1">
            View all room bookings with user information
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="filter-room" className="text-sm font-medium">
                  Filter by Room
                </label>
                <Input
                  id="filter-room"
                  type="text"
                  placeholder="Search by room name or building..."
                  value={filterRoom}
                  onChange={(e) => setFilterRoom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="filter-user" className="text-sm font-medium">
                  Filter by User
                </label>
                <Input
                  id="filter-user"
                  type="text"
                  placeholder="Search by user name or email..."
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card>
          <CardContent className="p-0">
            <AdminTable
              headers={[
                "Room",
                "Booked By",
                "Purpose",
                "Date & Time",
                "Duration",
                "Booked On",
              ]}
              loading={loading}
            >
              {filteredBookings.length === 0 && !loading ? (
                <AdminTableRow>
                  <AdminTableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {bookings.length === 0
                      ? "No bookings found"
                      : "No bookings match the filters"}
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <AdminTableRow key={booking.id}>
                    <AdminTableCell>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {booking.room.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.room.building}
                        </p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {booking.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {booking.user.email}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {booking.user.role}
                        </Badge>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <p className="text-muted-foreground">{booking.purpose}</p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div>
                        <p className="text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDateTime(booking.startAt)}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                        </p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(
                          (new Date(booking.endAt).getTime() -
                            new Date(booking.startAt).getTime()) /
                            (1000 * 60)
                        )}{" "}
                        minutes
                      </p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTable>
          </CardContent>
        </Card>
      </FadeIn>
    </PageTransition>
  )
}

