"use client"

import Link from "next/link"
import { Menu, Building2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { ProfileDropdown } from "@/src/components/layout/profile-dropdown"
import { motion } from "framer-motion"

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="sticky top-0 z-50 w-full border-b"
      style={{ backgroundColor: "#990000" }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Building2 className="h-6 w-6" style={{ color: "#FFFFFF" }} />
            <span className="text-xl font-bold" style={{ color: "#FFFFFF" }}>Room Booking</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ProfileDropdown />
        </div>
      </div>
    </motion.header>
  )
}

