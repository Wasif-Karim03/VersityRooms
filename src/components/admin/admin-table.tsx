"use client"

import { ReactNode } from "react"
import { Skeleton } from "@/src/components/ui/skeleton"

interface AdminTableProps {
  headers: string[]
  children: ReactNode
  loading?: boolean
}

export function AdminTable({ headers, children, loading = false }: AdminTableProps) {
  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="px-6 py-4 text-left text-sm font-semibold">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                {headers.map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">{children}</tbody>
        </table>
      </div>
    </div>
  )
}

interface AdminTableRowProps {
  children: ReactNode
  onClick?: () => void
}

export function AdminTableRow({ children, onClick }: AdminTableRowProps) {
  return (
    <tr
      className={`hover:bg-muted/30 transition-colors ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface AdminTableCellProps {
  children: ReactNode
  className?: string
  colSpan?: number
}

export function AdminTableCell({ children, className = "", colSpan }: AdminTableCellProps) {
  return (
    <td className={`px-6 py-4 text-sm ${className}`} colSpan={colSpan}>
      {children}
    </td>
  )
}

