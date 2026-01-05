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
      const roomsArray = roomsData.success ? (roomsData.data.data || roomsData.data) : []
      const totalRooms = Array.isArray(roomsArray) ? roomsArray.length : 0

      // Fetch user's bookings
      const bookingsRes = await fetch("/api/bookings")
      const bookingsData = await bookingsRes.json()
      const bookingsArray = bookingsData.success ? (bookingsData.data.data || bookingsData.data) : []
      const myBookings = Array.isArray(bookingsArray) ? bookingsArray.length : 0

      // Calculate upcoming (bookings in next 7 days)
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const upcoming = bookingsArray.filter((r: any) => {
        const startAt = new Date(r.startAt)
        return startAt >= now && startAt <= nextWeek
      }).length

      setStats({
        totalRooms,
        myBookings,
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
          <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Georgia, 'Playfair Display', serif", color: "#000000" }}>Dashboard</h1>
          <p className="text-lg" style={{ color: "#333333" }}>
            Welcome to the room booking system
          </p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
                  <Card 
                    className="h-full border-2 hover:border-[#990000]/50 transition-all duration-300 group cursor-pointer"
                    style={{
                      backgroundColor: "#990000",
                      borderTopColor: "#990000",
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="rounded-xl p-3 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                          <Icon className="h-6 w-6" style={{ color: "#FFFFFF" }} />
                        </div>
                        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#FFFFFF" }} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold tracking-tight" style={{ color: "#FFFFFF" }}>
                          {stat.value}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
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
          <Card 
            className="border-2 hover:border-[#990000]/50 transition-all duration-300"
            style={{
              backgroundColor: "#990000",
              borderTopColor: "#990000",
            }}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#FFFFFF" }}>
                <Calendar className="h-5 w-5" style={{ color: "#FFFFFF" }} />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/rooms">
                <Button 
                  variant="outline" 
                  className="w-full justify-start group"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "#FFFFFF",
                  }}
                >
                  <DoorOpen className="mr-2 h-4 w-4" style={{ color: "#FFFFFF" }} />
                  Browse Rooms
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#FFFFFF" }} />
                </Button>
              </Link>
              <Link href="/calendar">
                <Button 
                  variant="outline" 
                  className="w-full justify-start group"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "#FFFFFF",
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" style={{ color: "#FFFFFF" }} />
                  View Calendar
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#FFFFFF" }} />
                </Button>
              </Link>
              <Link href="/requests">
                <Button 
                  variant="outline" 
                  className="w-full justify-start group"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "#FFFFFF",
                  }}
                >
                  <Clock className="mr-2 h-4 w-4" style={{ color: "#FFFFFF" }} />
                  My Requests
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#FFFFFF" }} />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card 
            className="border-2 hover:border-[#990000]/50 transition-all duration-300 md:col-span-2"
            style={{
              backgroundColor: "#990000",
              borderTopColor: "#990000",
            }}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#FFFFFF" }}>
                <TrendingUp className="h-5 w-5" style={{ color: "#FFFFFF" }} />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full p-1.5 mt-0.5" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#FFFFFF" }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#FFFFFF" }}>Browse available rooms</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                      Explore rooms by building, capacity, and equipment
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full p-1.5 mt-0.5" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#FFFFFF" }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#FFFFFF" }}>Request a booking</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                      Submit booking requests for your meetings and events
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full p-1.5 mt-0.5" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#FFFFFF" }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#FFFFFF" }}>Track your requests</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
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
