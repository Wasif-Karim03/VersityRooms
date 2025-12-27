"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Download, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { Skeleton } from "@/src/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useToast } from "@/src/components/ui/toast"

interface UtilizationData {
  roomId: string
  roomName: string
  building: string
  totalHours: number
  avgHoursPerWeek: number
  weeklyBreakdown: Array<{ week: string; hours: number }>
}

interface PeakHoursData {
  peakHours: Array<{ hour: number; hourLabel: string; count: number }>
  peakHour: number
  maxCount: number
}

interface BookingsByRoleData {
  byRole: Array<{ role: string; count: number; hours: number; percentage: number }>
  total: { count: number; hours: number }
}

const NEUTRAL_COLORS = [
  "#6b7280", // gray-500
  "#9ca3af", // gray-400
  "#d1d5db", // gray-300
  "#4b5563", // gray-600
  "#374151", // gray-700
]

export default function AdminReportsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [utilization, setUtilization] = useState<UtilizationData[]>([])
  const [peakHours, setPeakHours] = useState<PeakHoursData | null>(null)
  const [bookingsByRole, setBookingsByRole] = useState<BookingsByRoleData | null>(null)
  const [weeks, setWeeks] = useState(4)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/admin")
      return
    }
    fetchData()
  }, [weeks, session, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        weeks: weeks.toString(),
        ...(startDate && { startDate }),
      })

      const [utilRes, peakRes, roleRes] = await Promise.all([
        fetch(`/api/admin/reports/utilization?${params}`),
        fetch(`/api/admin/reports/peak-hours?${params}`),
        fetch(`/api/admin/reports/bookings-by-role?${params}`),
      ])

      const [utilData, peakData, roleData] = await Promise.all([
        utilRes.json(),
        peakRes.json(),
        roleRes.json(),
      ])

      if (utilData.success) setUtilization(utilData.data)
      if (peakData.success) setPeakHours(peakData.data)
      if (roleData.success) setBookingsByRole(roleData.data)
    } catch (error) {
      console.error("Failed to fetch reports:", error)
      addToast("Failed to load reports", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.set("startDate", startDate)
      if (endDate) params.set("endDate", endDate)

      const response = await fetch(`/api/admin/reports/export?${params}`)
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bookings-${startDate || "all"}-${endDate || "now"}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      addToast("Export downloaded successfully", "success")
    } catch (error) {
      console.error("Export failed:", error)
      addToast("Failed to export bookings", "error")
    }
  }

  // Prepare chart data
  const utilizationChartData = utilization
    .sort((a, b) => b.avgHoursPerWeek - a.avgHoursPerWeek)
    .slice(0, 10)
    .map((room) => ({
      name: room.roomName,
      hours: room.avgHoursPerWeek,
    }))

  const roleChartData = bookingsByRole?.byRole
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.role,
      value: item.count,
      hours: item.hours,
      percentage: item.percentage,
    })) || []

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Room utilization, booking patterns, and usage statistics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="weeks" className="text-sm">
                Weeks:
              </Label>
              <Input
                id="weeks"
                type="number"
                min="1"
                max="12"
                value={weeks}
                onChange={(e) => setWeeks(parseInt(e.target.value) || 4)}
                className="w-20"
              />
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="export-start">Start Date</Label>
              <Input
                id="export-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="export-end">End Date</Label>
              <Input
                id="export-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleExport} className="mb-0">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Room Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Room Utilization (Top 10)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Average hours booked per week
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={utilizationChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="hours" fill={NEUTRAL_COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak Booking Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Booking Hours</CardTitle>
              <p className="text-sm text-muted-foreground">
                Number of bookings per hour of day
              </p>
            </CardHeader>
            <CardContent>
              {peakHours && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peakHours.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="hourLabel"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar dataKey="count" fill={NEUTRAL_COLORS[1]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Bookings by Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Role</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Distribution of bookings by user role
                </p>
              </CardHeader>
              <CardContent>
                {bookingsByRole && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={roleChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roleChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={NEUTRAL_COLORS[index % NEUTRAL_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsByRole && (
                  <div className="space-y-4">
                    {bookingsByRole.byRole.map((item) => (
                      <div key={item.role} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.role}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.count} bookings
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.hours} hours</span>
                          <span>{item.percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/20 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-sm font-semibold">
                          {bookingsByRole.total.count} bookings
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {bookingsByRole.total.hours} total hours
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageTransition>
  )
}

