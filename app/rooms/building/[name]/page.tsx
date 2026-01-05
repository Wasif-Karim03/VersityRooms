"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { RoomCard } from "@/src/components/rooms/room-card"
import { EmptyState } from "@/src/components/ui/empty-state"
import { Skeleton } from "@/src/components/ui/skeleton"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { StaggerList } from "@/src/components/motion/stagger-list"
import { DoorOpen, ArrowLeft } from "lucide-react"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"

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
}

export default function BuildingRoomsPage() {
  const params = useParams()
  const router = useRouter()
  const buildingName = decodeURIComponent(params.name as string)
  
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch rooms for this building
  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/rooms?building=${encodeURIComponent(buildingName)}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch rooms")
        }

        // Handle paginated response format
        const roomsData = result.data.data || result.data
        setRooms(Array.isArray(roomsData) ? roomsData : [])
      } catch (err: any) {
        setError(err.message || "Failed to load rooms")
      } finally {
        setLoading(false)
      }
    }

    if (buildingName) {
      fetchRooms()
    }
  }, [buildingName])

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/rooms")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, 'Playfair Display', serif", color: "#000000" }}>{buildingName}</h1>
            <p className="mt-1" style={{ color: "#333333" }}>
              {loading ? "Loading rooms..." : `${rooms.length} ${rooms.length === 1 ? "room" : "rooms"} available`}
            </p>
          </div>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card
          style={{
            backgroundColor: "#990000",
            borderTopColor: "#990000",
          }}
        >
          <div className="p-6">
            <p style={{ color: "#FFFFFF" }}>{error}</p>
          </div>
        </Card>
      ) : rooms.length === 0 ? (
        <Card
          style={{
            backgroundColor: "transparent",
            borderTopColor: "#990000",
          }}
        >
          <EmptyState
            icon={<DoorOpen className="h-12 w-12" />}
            title="No rooms found"
            description={`No rooms are available in ${buildingName}.`}
            action={{
              label: "Back to Buildings",
              onClick: () => router.push("/rooms"),
            }}
          />
        </Card>
      ) : (
        <StaggerList className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              name={room.name}
              building={room.building}
              capacity={room.capacity}
              equipment={room.equipment}
              isActive={room.isActive}
              isLocked={room.isLocked}
              restrictedRoles={room.restrictedRoles}
            />
          ))}
        </StaggerList>
      )}
    </PageTransition>
  )
}

