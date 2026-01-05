"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, FileText, CheckCircle2, ChevronRight, ChevronLeft, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"

interface MultiStepBookingModalProps {
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
  initialStart?: Date
  initialEnd?: Date
  onConflictCheck?: (startAt: Date, endAt: Date) => Promise<boolean>
}

type Step = 1 | 2 | 3

export function MultiStepBookingModal({
  isOpen,
  onClose,
  onSubmit,
  roomId,
  roomName,
  initialStart,
  initialEnd,
  onConflictCheck,
}: MultiStepBookingModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [startDate, setStartDate] = useState(
    initialStart?.toISOString().split("T")[0] || ""
  )
  const [startTime, setStartTime] = useState(
    initialStart?.toTimeString().slice(0, 5) || ""
  )
  const [endDate, setEndDate] = useState(initialEnd?.toISOString().split("T")[0] || "")
  const [endTime, setEndTime] = useState(initialEnd?.toTimeString().slice(0, 5) || "")
  const [purpose, setPurpose] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasConflict, setHasConflict] = useState(false)
  const [checkingConflict, setCheckingConflict] = useState(false)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setError(null)
      setHasConflict(false)
      if (initialStart) {
        setStartDate(initialStart.toISOString().split("T")[0])
        setStartTime(initialStart.toTimeString().slice(0, 5))
      }
      if (initialEnd) {
        setEndDate(initialEnd.toISOString().split("T")[0])
        setEndTime(initialEnd.toTimeString().slice(0, 5))
      }
    }
  }, [isOpen, initialStart, initialEnd])

  // Check for conflicts when time changes
  useEffect(() => {
    if (startDate && startTime && endDate && endTime && onConflictCheck) {
      const startAt = new Date(`${startDate}T${startTime}`)
      const endAt = new Date(`${endDate}T${endTime}`)
      
      if (endAt > startAt) {
        setCheckingConflict(true)
        onConflictCheck(startAt, endAt)
          .then((conflict) => {
            setHasConflict(conflict)
          })
          .catch(() => {
            setHasConflict(false)
          })
          .finally(() => {
            setCheckingConflict(false)
          })
      }
    }
  }, [startDate, startTime, endDate, endTime, onConflictCheck])

  const validateStep1 = () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      setError("Please fill in all date and time fields")
      return false
    }

    const startAt = new Date(`${startDate}T${startTime}`)
    const endAt = new Date(`${endDate}T${endTime}`)

    if (endAt <= startAt) {
      setError("End time must be after start time")
      return false
    }

    if (startAt < new Date()) {
      setError("Start time cannot be in the past")
      return false
    }

    setError(null)
    return true
  }

  const validateStep2 = () => {
    if (!purpose.trim()) {
      setError("Purpose is required")
      return false
    }
    if (purpose.trim().length < 3) {
      setError("Purpose must be at least 3 characters")
      return false
    }
    setError(null)
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      setStep(1)
      return
    }

    const startAt = new Date(`${startDate}T${startTime}`)
    const endAt = new Date(`${endDate}T${endTime}`)

    try {
      setLoading(true)
      setError(null)
      await onSubmit({
        roomId,
        startAt,
        endAt,
        purpose: purpose.trim(),
      })
      onClose()
      // Reset form
      setStep(1)
      setPurpose("")
      setError(null)
      setHasConflict(false)
    } catch (err: any) {
      setError(err.message || "Failed to create booking request")
    } finally {
      setLoading(false)
    }
  }

  const getDuration = () => {
    if (!startDate || !startTime || !endDate || !endTime) return ""
    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)
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
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-semibold">Request Booking</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {roomName}
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

              {/* Progress Steps */}
              <div className="flex items-center justify-between p-6 border-b">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                          step >= s
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          step >= s ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {s === 1 ? "Time" : s === 2 ? "Purpose" : "Review"}
                      </span>
                    </div>
                    {s < 3 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground mx-2 flex-1" />
                    )}
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="p-6 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Select Date & Time</h3>
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
                          <label className="text-sm font-medium">End Date</label>
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

                      {checkingConflict && (
                        <div className="text-sm text-muted-foreground">
                          Checking availability...
                        </div>
                      )}

                      {hasConflict && !checkingConflict && (
                        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                                  Potential Conflict Detected
                                </p>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                                  This time slot overlaps with an existing approved booking.
                                  You can still submit the request, but it may be rejected.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Purpose</h3>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          What is this booking for?
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Team meeting, Class session, Event..."
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          required
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                          {purpose.length}/500 characters
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Review & Submit</h3>
                      </div>

                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Room</p>
                            <p className="font-medium">{roomName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-medium">
                              {startDate && startTime && endDate && endTime
                                ? `${new Date(`${startDate}T${startTime}`).toLocaleString()} - ${new Date(`${endDate}T${endTime}`).toLocaleTimeString()}`
                                : "Not set"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Duration: {getDuration()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Purpose</p>
                            <p className="font-medium">{purpose || "Not set"}</p>
                          </div>
                          {hasConflict && (
                            <div className="pt-2 border-t">
                              <Badge variant="warning">Potential Conflict</Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="mt-4 rounded-md bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={step === 1 ? onClose : handleBack}
                  disabled={loading}
                >
                  {step === 1 ? "Cancel" : (
                    <>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>
                {step < 3 ? (
                  <Button onClick={handleNext} disabled={loading}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

