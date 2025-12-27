"use client"

import { Calendar, Clock, MapPin } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { motion } from "framer-motion"

interface RequestCardProps {
  request: {
    id: string
    roomId: string
    startAt: string
    endAt: string
    purpose: string
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
    room: {
      name: string
      building: string
    }
  }
  onClick: () => void
}

export function RequestCard({ request, onClick }: RequestCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusBadge = () => {
    switch (request.status) {
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>
      case "APPROVED":
        return <Badge variant="success">Approved</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick()
          }
        }}
        aria-label={`View details for ${request.purpose} booking request`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{request.purpose}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{request.room.name}</span>
                <span>•</span>
                <span>{request.room.building}</span>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(request.startAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatTime(request.startAt)} - {formatTime(request.endAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

