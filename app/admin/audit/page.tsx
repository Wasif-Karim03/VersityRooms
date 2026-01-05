"use client"

import { useState, useEffect } from "react"
import { FileText, Search, Filter } from "lucide-react"
import { AdminTable, AdminTableRow, AdminTableCell } from "@/src/components/admin/admin-table"
import { AuditDetailDrawer } from "@/src/components/admin/audit-detail-drawer"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select } from "@/src/components/ui/select"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { useToast } from "@/src/components/ui/toast"

interface AuditLog {
  id: string
  actorUserId: string
  actionType: string
  targetType: string
  targetId: string | null
  reason: string | null
  createdAt: string
  actor: {
    id: string
    name: string
    email: string
  }
}

export default function AdminAuditPage() {
  const { addToast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActionType, setFilterActionType] = useState("")
  const [filterTargetType, setFilterTargetType] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/audit")
      const result = await response.json()

      if (result.success) {
        setLogs(result.data.logs)
      } else {
        addToast("Failed to load audit logs", "error")
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
      addToast("Failed to load audit logs", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !log.actionType.toLowerCase().includes(query) &&
        !log.targetType.toLowerCase().includes(query) &&
        !log.actor.name.toLowerCase().includes(query) &&
        !(log.reason?.toLowerCase().includes(query))
      ) {
        return false
      }
    }
    if (filterActionType && log.actionType !== filterActionType) return false
    if (filterTargetType && log.targetType !== filterTargetType) return false
    return true
  })

  const actionTypes = Array.from(new Set(logs.map((log) => log.actionType)))
  const targetTypes = Array.from(new Set(logs.map((log) => log.targetType)))

  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log)
    setDrawerOpen(true)
  }

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground mt-1">
            View system activity and compliance records
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search actions, users, reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterActionType}
            onChange={(e) => setFilterActionType(e.target.value)}
            className="w-full md:w-48"
          >
            <option value="">All Actions</option>
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Select
            value={filterTargetType}
            onChange={(e) => setFilterTargetType(e.target.value)}
            className="w-full md:w-48"
          >
            <option value="">All Targets</option>
            {targetTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <AdminTable
          headers={["Action", "Actor", "Target", "Reason", "Date", "Time"]}
          loading={loading}
        >
          {filteredLogs.length === 0 && !loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No audit logs found</p>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            filteredLogs.map((log) => (
              <AdminTableRow
                key={log.id}
                onClick={() => handleLogClick(log)}
              >
                <AdminTableCell>
                  <Badge variant="outline">{log.actionType}</Badge>
                </AdminTableCell>
                <AdminTableCell>
                  <div>
                    <p className="font-medium">{log.actor.name}</p>
                    <p className="text-xs text-muted-foreground">{log.actor.email}</p>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div>
                    <p className="text-sm">{log.targetType}</p>
                    {log.targetId && (
                      <p className="text-xs text-muted-foreground">{log.targetId}</p>
                    )}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                    {log.reason || "—"}
                  </p>
                </AdminTableCell>
                <AdminTableCell>
                  <p className="text-sm">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </AdminTableCell>
                <AdminTableCell>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </AdminTableCell>
              </AdminTableRow>
            ))
          )}
        </AdminTable>
      </FadeIn>

      {selectedLog && (
        <AuditDetailDrawer
          log={selectedLog}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false)
            setSelectedLog(null)
          }}
        />
      )}
    </PageTransition>
  )
}

