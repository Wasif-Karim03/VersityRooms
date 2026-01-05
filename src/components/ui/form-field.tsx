"use client"

import { ReactNode } from "react"
import { Label } from "./label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
  htmlFor?: string
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground" role="note">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}

