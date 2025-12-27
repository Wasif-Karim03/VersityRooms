"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { StaggerList } from "@/src/components/motion/stagger-list"
import {
  DoorOpen,
  Calendar,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"

interface DashboardStats {
  totalRooms: number
  myBookings: number
  pendingRequests: number
  upcoming: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      // Fetch rooms count
      const roomsRes = await fetch("/api/rooms")
      const roomsData = await roomsRes.json()
      const totalRooms = roomsData.success ? roomsData.data.length : 0

      // Fetch user's bookings
      const bookingsRes = await fetch("/api/bookings")
      const bookingsData = await bookingsRes.json()
      const myBookings = bookingsData.success ? bookingsData.data.length : 0

      // Fetch user's requests
      const requestsRes = await fetch("/api/requests?mine=true")
      const requestsData = await requestsRes.json()
      const allRequests = requestsData.success ? requestsData.data || [] : []
      const pendingRequests = allRequests.filter(
        (r: any) => r.status === "PENDING"
      ).length

      // Calculate upcoming (bookings in next 7 days)
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const upcoming = allRequests.filter((r: any) => {
        const startAt = new Date(r.startAt)
        return startAt >= now && startAt <= nextWeek
      }).length

      setStats({
        totalRooms,
        myBookings,
        pendingRequests,
        upcoming,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Rooms",
      value: stats?.totalRooms ?? 0,
      description: "Available for booking",
      icon: DoorOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/rooms",
    },
    {
      title: "My Bookings",
      value: stats?.myBookings ?? 0,
      description: "Active reservations",
      icon: Calendar,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      link: "/requests",
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      description: "Awaiting approval",
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      link: "/requests",
    },
    {
      title: "Upcoming",
      value: stats?.upcoming ?? 0,
      description: "Next 7 days",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      link: "/calendar",
    },
  ]

  return (
    <PageTransition className="space-y-8">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Welcome to the room booking system
          </p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <StaggerList className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={stat.link}>
                  <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`rounded-xl ${stat.bgColor} p-3 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold tracking-tight">
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stat.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </StaggerList>
      )}

      {/* Quick Actions */}
      <FadeIn delay={0.3}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/rooms">
                <Button variant="outline" className="w-full justify-start group">
                  <DoorOpen className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                  Browse Rooms
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" className="w-full justify-start group">
                  <Calendar className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                  View Calendar
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="/requests">
                <Button variant="outline" className="w-full justify-start group">
                  <Clock className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                  My Requests
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-primary/10 p-1.5 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Browse available rooms</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Explore rooms by building, capacity, and equipment
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-primary/10 p-1.5 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Request a booking</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submit booking requests for your meetings and events
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-primary/10 p-1.5 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Track your requests</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor the status of your booking requests
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </PageTransition>
  )
}
