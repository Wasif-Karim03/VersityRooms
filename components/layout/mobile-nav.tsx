"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  DoorOpen,
  FileText,
  Calendar,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/rooms", label: "Rooms", icon: DoorOpen },
    { href: "/requests", label: "Requests", icon: FileText },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/notifications", label: "Notifications", icon: Bell },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs",
                  isActive
                    ? "text-[#990000]"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

