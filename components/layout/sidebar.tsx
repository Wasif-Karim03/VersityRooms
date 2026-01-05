"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  DoorOpen,
  FileText,
  Calendar,
  Settings,
  X,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { canAccessAdmin } from "@/src/lib/auth/roles"
import type { UserRole } from "@/src/lib/auth/roles"
import { useState, useEffect } from "react"

function UnreadBadge() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch("/api/notifications?unread=true&limit=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUnreadCount(data.data.unreadCount)
        }
      })
      .catch(() => {})
  }, [])

  if (unreadCount === 0) return null

  return (
    <Badge
      variant="destructive"
      className="ml-auto h-5 min-w-5 px-1.5 text-xs"
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  )
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/requests", label: "My Requests", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/notifications", label: "Notifications", icon: Bell },
]

const adminItems = [
  { href: "/admin", label: "Admin", icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user?.role as UserRole) || "STUDENT"
  const isAdmin = canAccessAdmin(userRole)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener("resize", checkDesktop)
    return () => window.removeEventListener("resize", checkDesktop)
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : open ? 0 : -280,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r shadow-sm",
          "lg:translate-x-0 lg:relative lg:top-0 lg:h-screen lg:shadow-none"
        )}
        style={{
          backgroundColor: "#1e293b", // Dark slate/navy
        }}
      >
        <div className="flex h-full flex-col p-4">
          <div className="lg:hidden mb-4 flex justify-end">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors relative",
                      isActive
                        ? "text-white"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    )}
                    style={isActive ? { backgroundColor: "#990000" } : {}}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                    {item.href === "/notifications" && <UnreadBadge />}
                  </motion.div>
                </Link>
              )
            })}
            {isAdmin &&
              adminItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "text-white"
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      )}
                      style={isActive ? { backgroundColor: "#990000" } : {}}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </motion.div>
                  </Link>
                )
              })}
          </nav>
        </div>
      </motion.aside>
    </>
  )
}
