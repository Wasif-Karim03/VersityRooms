"use client"

import { useState } from "react"
import { Calendar, Clock } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { motion } from "framer-motion"

interface TimeSlot {
  start: Date
  end: Date
  isAvailable: boolean
  bookingId?: string
  purpose?: string
}

interface Booking {
  id: string
  startAt: Date
  endAt: Date
  purpose: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface ScheduleViewProps {
  date: string
  timeSlots: TimeSlot[]
  bookings: Booking[]
  onDateChange: (date: string) => void
}

export function ScheduleView({
  date,
  timeSlots,
  bookings,
  onDateChange,
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<"day" | "week">("day")

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z")
    return d.toLocaleDateString("en-US", { weekday: "long" })
  }

  // Group bookings by hour for better visualization
  const availableSlots = timeSlots.filter((slot) => slot.isAvailable).length
  const totalSlots = timeSlots.length

  return (
    <div className="space-y-4">
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "day" | "week")}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Schedule</h3>
            <p className="text-sm text-muted-foreground">
              {availableSlots} of {totalSlots} slots available
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="day" className="mt-4">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {getDayName(date)}, {new Date(date + "T00:00:00Z").toLocaleDateString()}
                </span>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="mt-2 text-sm border rounded-md px-3 py-2"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {timeSlots.map((slot, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    slot.isAvailable
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </span>
                  </div>
                  {slot.isAvailable ? (
                    <Badge variant="success">Available</Badge>
                  ) : (
                    <div className="text-right">
                      <Badge variant="destructive">Booked</Badge>
                      {slot.purpose && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {slot.purpose}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

        <TabsContent value="week" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Week view coming soon. Use day view to see detailed schedule.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

