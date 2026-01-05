"use client"

import { X, Clock, User, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"

interface BookingDetailPopoverProps {
  booking: {
    id: string
    startAt: Date
    endAt: Date
    purpose: string
    status: "APPROVED" | "PENDING"
    user: {
      name: string
      email: string
    }
  }
  isOpen: boolean
  onClose: () => void
  position?: { x: number; y: number }
}

export function BookingDetailPopover({
  booking,
  isOpen,
  onClose,
  position,
}: BookingDetailPopoverProps) {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bg-popover border rounded-lg shadow-lg p-4 w-80"
            style={
              position
                ? {
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                  }
                : undefined
            }
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={booking.status === "APPROVED" ? "default" : "warning"}
                  >
                    {booking.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg">{booking.purpose}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(booking.startAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Booked by</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.user.email}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

