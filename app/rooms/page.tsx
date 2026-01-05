"use client"

import { useState, useEffect } from "react"
import { BuildingCard } from "@/src/components/rooms/building-card"
import { EmptyState } from "@/src/components/ui/empty-state"
import { Skeleton } from "@/src/components/ui/skeleton"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { StaggerList } from "@/src/components/motion/stagger-list"
import { Building2 } from "lucide-react"
import { Card } from "@/src/components/ui/card"

interface Building {
  name: string
  roomCount: number
}

export default function RoomsPage() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch buildings
  useEffect(() => {
    async function fetchBuildings() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/buildings")
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch buildings")
        }

        setBuildings(result.data as Building[])
      } catch (err: any) {
        setError(err.message || "Failed to load buildings")
      } finally {
        setLoading(false)
      }
    }

    fetchBuildings()
  }, [])

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, 'Playfair Display', serif", color: "#000000" }}>Buildings</h1>
          <p className="mt-1" style={{ color: "#333333" }}>
            Select a building to view available rooms
          </p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
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
      ) : buildings.length === 0 ? (
        <Card
          style={{
            backgroundColor: "transparent",
            borderTopColor: "#990000",
          }}
        >
          <EmptyState
            icon={<Building2 className="h-12 w-12" />}
            title="No buildings found"
            description="No buildings are currently available."
          />
        </Card>
      ) : (
        <StaggerList className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buildings.map((building) => (
            <BuildingCard
              key={building.name}
              name={building.name}
              roomCount={building.roomCount}
            />
          ))}
        </StaggerList>
      )}
    </PageTransition>
  )
}
