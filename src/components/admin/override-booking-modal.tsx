"use client"

import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select } from "@/src/components/ui/select"
import { Card, CardContent } from "@/src/components/ui/card"

interface OverrideBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    roomId: string
    userId: string
    startAt: Date
    endAt: Date
    purpose: string
    reason: string
  }) => Promise<void>
  roomId: string
  roomName: string
  initialStart: Date
  initialEnd: Date
  users: Array<{ id: string; name: string; email: string }>
}

export function OverrideBookingModal({
  isOpen,
  onClose,
  onSubmit,
  roomId,
  roomName,
  initialStart,
  initialEnd,
  users,
}: OverrideBookingModalProps) {
  const [startDate, setStartDate] = useState(
    initialStart.toISOString().split("T")[0]
  )
  const [startTime, setStartTime] = useState(
    initialStart.toTimeString().slice(0, 5)
  )
  const [endDate, setEndDate] = useState(initialEnd.toISOString().split("T")[0])
  const [endTime, setEndTime] = useState(initialEnd.toTimeString().slice(0, 5))
  const [userId, setUserId] = useState(users[0]?.id || "")
  const [purpose, setPurpose] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!userId) {
      setError("Please select a user")
      return
    }

    if (!purpose.trim()) {
      setError("Purpose is required")
      return
    }

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters")
      return
    }

    const startAt = new Date(`${startDate}T${startTime}`)
    const endAt = new Date(`${endDate}T${endTime}`)

    if (endAt <= startAt) {
      setError("End time must be after start time")
      return
    }

    try {
      setLoading(true)
      await onSubmit({
        roomId,
        userId,
        startAt,
        endAt,
        purpose: purpose.trim(),
        reason: reason.trim(),
      })
      onClose()
      setPurpose("")
      setReason("")
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to create override booking")
    } finally {
      setLoading(false)
    }
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 w-full max-w-2xl rounded-lg border bg-background shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-semibold">Create Override Booking</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {roomName} • Bypasses conflict checks
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">
                          Override Booking
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                          This booking will bypass conflict checks. Use only when necessary.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <label className="text-sm font-medium">User</label>
                  <Select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  >
                    <option value="">Select user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time</label>
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
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Time</label>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Reason for Override <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why this override booking is necessary..."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                    minLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    {reason.length}/10 characters (minimum required)
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || reason.trim().length < 10}
                  >
                    {loading ? "Creating..." : "Create Override Booking"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

