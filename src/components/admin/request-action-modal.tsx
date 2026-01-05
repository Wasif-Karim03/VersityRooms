"use client"

import { useState } from "react"
import { X, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"

interface RequestActionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    status: "APPROVED" | "REJECTED"
    reason: string
    startAt?: Date
    endAt?: Date
  }) => Promise<void>
  request: {
    id: string
    roomId: string
    startAt: string
    endAt: string
    purpose: string
    room: {
      name: string
      building: string
    }
    user: {
      name: string
      email: string
    }
  }
  action: "approve" | "reject"
}

export function RequestActionModal({
  isOpen,
  onClose,
  onSubmit,
  request,
  action,
}: RequestActionModalProps) {
  const [reason, setReason] = useState("")
  const [modifyTimes, setModifyTimes] = useState(false)
  const [startDate, setStartDate] = useState(
    new Date(request.startAt).toISOString().split("T")[0]
  )
  const [startTime, setStartTime] = useState(
    new Date(request.startAt).toTimeString().slice(0, 5)
  )
  const [endDate, setEndDate] = useState(
    new Date(request.endAt).toISOString().split("T")[0]
  )
  const [endTime, setEndTime] = useState(
    new Date(request.endAt).toTimeString().slice(0, 5)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters")
      return
    }

    try {
      setLoading(true)

      const startAt = modifyTimes
        ? new Date(`${startDate}T${startTime}`)
        : new Date(request.startAt)
      const endAt = modifyTimes
        ? new Date(`${endDate}T${endTime}`)
        : new Date(request.endAt)

      if (endAt <= startAt) {
        setError("End time must be after start time")
        setLoading(false)
        return
      }

      await onSubmit({
        status: action === "approve" ? "APPROVED" : "REJECTED",
        reason: reason.trim(),
        startAt: modifyTimes ? startAt : undefined,
        endAt: modifyTimes ? endAt : undefined,
      })

      onClose()
      setReason("")
      setModifyTimes(false)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to process request")
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
                  <h2 className="text-2xl font-semibold">
                    {action === "approve" ? "Approve" : "Reject"} Request
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.room.name} • {request.room.building}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Requested by</p>
                      <p className="text-sm">{request.user.name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Purpose</p>
                      <p className="text-sm text-muted-foreground">{request.purpose}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Original Time</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.startAt).toLocaleString()} -{" "}
                        {new Date(request.endAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={modifyTimes}
                      onChange={(e) => setModifyTimes(e.target.checked)}
                      className="rounded"
                    />
                    Modify booking times
                  </label>

                  {modifyTimes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid grid-cols-2 gap-4 pt-2"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time</label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Time</label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Reason <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={`Explain why you're ${action === "approve" ? "approving" : "rejecting"} this request...`}
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                    minLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    {reason.length}/10 characters (minimum required)
                  </p>
                </div>

                {error && (
                  <Card className="border-destructive bg-destructive/10">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={action === "approve" ? "default" : "destructive"}
                    disabled={loading || reason.trim().length < 10}
                  >
                    {loading
                      ? "Processing..."
                      : action === "approve"
                      ? "Approve Request"
                      : "Reject Request"}
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

