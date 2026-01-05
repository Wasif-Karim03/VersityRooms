"use client"

import { ReactNode } from "react"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border relative",
        className
      )}
      style={{
        backgroundColor: "#990000",
        borderWidth: "1px",
        borderColor: "#e5e7eb",
        borderTopWidth: "4px",
        borderTopColor: "#990000",
      }}
    >
      {icon && (
        <div className="mb-4" style={{ color: "#FFFFFF", opacity: 0.9 }}>
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>{title}</h3>
      <p className="text-sm max-w-sm mb-6 leading-relaxed" style={{ color: "#FFFFFF" }}>
        {description}
      </p>
      {action && (
        <Button 
          onClick={action.onClick} 
          variant="default"
          style={{
            backgroundColor: "#FFFFFF",
            color: "#990000",
          }}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

