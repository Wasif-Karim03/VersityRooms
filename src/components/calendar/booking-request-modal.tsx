"use client"

import { useState } from "react"
import { X, Calendar, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface BookingRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    roomId: string
    startAt: Date
    endAt: Date
    purpose: string
  }) => Promise<void>
  roomId: string
  roomName: string
  initialStart: Date
  initialEnd: Date
}

export function BookingRequestModal({
  isOpen,
  onClose,
  onSubmit,
  roomId,
  roomName,
  initialStart,
  initialEnd,
}: BookingRequestModalProps) {
  const [startDate, setStartDate] = useState(
    initialStart.toISOString().split("T")[0]
  )
  const [startTime, setStartTime] = useState(
    initialStart.toTimeString().slice(0, 5)
  )
  const [endDate, setEndDate] = useState(initialEnd.toISOString().split("T")[0])
  const [endTime, setEndTime] = useState(initialEnd.toTimeString().slice(0, 5))
  const [purpose, setPurpose] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const startAt = new Date(`${startDate}T${startTime}`)
    const endAt = new Date(`${endDate}T${endTime}`)

    if (endAt <= startAt) {
      setError("End time must be after start time")
      return
    }

    if (!purpose.trim()) {
      setError("Purpose is required")
      return
    }

    try {
      setLoading(true)
      await onSubmit({
        roomId,
        startAt,
        endAt,
        purpose: purpose.trim(),
      })
      onClose()
      setPurpose("")
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to create booking request")
    } finally {
      setLoading(false)
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">New Booking Request</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Request to book <strong>{roomName}</strong>
                  </p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                End Time
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Purpose</label>
            <Input
              type="text"
              placeholder="Meeting, class, event..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {purpose.length}/500 characters
            </p>
          </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Request"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

