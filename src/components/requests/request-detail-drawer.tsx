"use client"

import { X, Calendar, Clock, User, FileText, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"

interface RequestDetailDrawerProps {
  request: {
    id: string
    roomId: string
    startAt: string
    endAt: string
    purpose: string
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
    createdAt: string
    updatedAt: string
    room: {
      id: string
      name: string
      building: string
    }
    user: {
      id: string
      name: string
      email: string
    }
  }
  isOpen: boolean
  onClose: () => void
  onCancel?: (id: string) => Promise<void>
}

export function RequestDetailDrawer({
  request,
  isOpen,
  onClose,
  onCancel,
}: RequestDetailDrawerProps) {
  const [cancelling, setCancelling] = useState(false)

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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

  const getDuration = () => {
    const start = new Date(request.startAt)
    const end = new Date(request.endAt)
    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`
    } else {
      return `${minutes} minute${minutes > 1 ? "s" : ""}`
    }
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

  const handleCancel = async () => {
    if (!onCancel || !confirm("Are you sure you want to cancel this request?")) {
      return
    }

    try {
      setCancelling(true)
      await onCancel(request.id)
      onClose()
    } catch (error) {
      console.error("Failed to cancel request:", error)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-background border-l shadow-xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Request Details</h2>
                  <div className="mt-2">{getStatusBadge()}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Room Info */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{request.room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.room.building}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Info */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {formatTime(request.startAt)} - {formatTime(request.endAt)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateTime(request.startAt)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Duration: {getDuration()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purpose */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Purpose</p>
                      <p className="text-sm text-muted-foreground">
                        {request.purpose}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Info */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Requested by</p>
                      <p className="text-sm">{request.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.user.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(request.createdAt).toLocaleString()}</span>
                  </div>
                  {request.updatedAt !== request.createdAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{new Date(request.updatedAt).toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              {request.status === "PENDING" && onCancel && (
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Request"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

