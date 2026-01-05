"use client"

import { useState, useRef, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { ROLE_LABELS } from "@/src/lib/auth/roles"
import type { UserRole } from "@/src/lib/auth/roles"

export function ProfileDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  if (!session?.user) {
    return null
  }

  const user = session.user
  const role = user.role as UserRole

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-auto py-2 px-3"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1.5">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">
              {ROLE_LABELS[role]}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover shadow-lg z-50"
            >
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{user.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {ROLE_LABELS[role]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="border-t pt-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

