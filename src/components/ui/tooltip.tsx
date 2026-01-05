"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  delayDuration?: number
}

function Tooltip({ children, content, side = "top", delayDuration = 200 }: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => setOpen(true), delayDuration)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setOpen(false)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
              sideClasses[side]
            )}
            role="tooltip"
          >
            {content}
            <div
              className={cn(
                "absolute h-2 w-2 rotate-45 border-l border-b bg-popover",
                side === "top" && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-b-0 border-l-0 border-t border-r",
                side === "bottom" && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-0 border-r-0 border-b border-l",
                side === "left" && "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-l-0 border-b-0 border-r border-t",
                side === "right" && "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-r-0 border-t-0 border-l border-b"
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Tooltip }

