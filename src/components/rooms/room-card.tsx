"use client"

import Link from "next/link"
import { Users, MapPin, Calendar } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { motion } from "framer-motion"

interface RoomCardProps {
  id: string
  name: string
  building: string
  capacity: number
  equipment: string[]
  isActive: boolean
  isLocked: boolean
  restrictedRoles?: string[] | null
}

export function RoomCard({
  id,
  name,
  building,
  capacity,
  equipment,
  isActive,
  isLocked,
  restrictedRoles,
}: RoomCardProps) {
  const statusBadge = isLocked
    ? { label: "Locked", variant: "destructive" as const }
    : !isActive
    ? { label: "Inactive", variant: "secondary" as const }
    : null

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6 flex-1">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h3 className="text-xl font-semibold mb-1">{name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{building}</span>
              </div>
            </div>

            {/* Status Badge */}
            {statusBadge && (
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            )}

            {/* Capacity */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <Badge variant="secondary" className="mr-2">
                  {capacity}
                </Badge>
                <span className="text-muted-foreground">capacity</span>
              </span>
            </div>

            {/* Equipment */}
            {equipment.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Equipment:</p>
                <div className="flex flex-wrap gap-2">
                  {equipment.slice(0, 4).map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="text-xs"
                    >
                      {item}
                    </Badge>
                  ))}
                  {equipment.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{equipment.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Restrictions */}
            {restrictedRoles && Array.isArray(restrictedRoles) && restrictedRoles.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Restricted to: {restrictedRoles.join(", ")}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Link href={`/rooms/${id}`} className="w-full">
            <Button variant="outline" className="w-full" disabled={!isActive || isLocked}>
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

