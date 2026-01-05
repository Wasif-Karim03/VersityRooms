"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { StaggerList } from "@/src/components/motion/stagger-list"
import { EmptyState } from "@/src/components/ui/empty-state"
import { useToast } from "@/src/components/ui/toast"
import { motion } from "framer-motion"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: Record<string, any>
}

export default function NotificationsPage() {
  const { addToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/notifications")
      const result = await response.json()

      if (result.success) {
        setNotifications(result.data.notifications)
        setUnreadCount(result.data.unreadCount)
      } else {
        addToast("Failed to load notifications", "error")
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      addToast("Failed to load notifications", "error")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    // Optimistic update
    const originalNotifications = [...notifications]
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      })
      const result = await response.json()

      if (!result.success) {
        // Revert on error
        setNotifications(originalNotifications)
        setUnreadCount((prev) => prev + 1)
      }
    } catch (error) {
      // Revert on error
      setNotifications(originalNotifications)
      setUnreadCount((prev) => prev + 1)
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      })
      const result = await response.json()

      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
        addToast("All notifications marked as read", "success")
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error)
      addToast("Failed to mark all as read", "error")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "REQUEST_SUBMITTED":
        return <FileText className="h-5 w-5" />
      case "REQUEST_APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "REQUEST_REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "REQUEST_MODIFIED":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "REQUEST_CANCELLED":
        return <XCircle className="h-5 w-5 text-gray-500" />
      case "OVERRIDE_CREATED":
        return <Calendar className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, 'Playfair Display', serif", color: "#000000" }}>Notifications</h1>
            <p className="mt-1" style={{ color: "#333333" }}>
              {unreadCount > 0
                ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`
                : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card
          style={{
            backgroundColor: "transparent",
            borderTopColor: "#990000",
          }}
        >
          <EmptyState
            icon={<Bell className="h-12 w-12" />}
            title="No notifications"
            description="You're all caught up! New notifications will appear here."
          />
        </Card>
      ) : (
        <StaggerList className="space-y-4">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="cursor-pointer transition-colors"
                onClick={() => !notification.read && markAsRead(notification.id)}
                style={{
                  backgroundColor: "#990000",
                  borderTopColor: "#990000",
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 rounded-full p-2"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <div style={{ color: "#FFFFFF" }}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className="font-semibold"
                              style={{ color: "#FFFFFF" }}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", color: "#FFFFFF" }}>
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: "#FFFFFF" }}>
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs" style={{ color: "#FFFFFF" }}>
                          {formatDate(notification.createdAt)}
                        </p>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            style={{ color: "#FFFFFF" }}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </StaggerList>
      )}
    </PageTransition>
  )
}

