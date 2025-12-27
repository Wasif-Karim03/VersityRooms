"use client"

import { X, User, Target, FileText, Calendar, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"

interface AuditDetailDrawerProps {
  log: {
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
  isOpen: boolean
  onClose: () => void
}

export function AuditDetailDrawer({
  log,
  isOpen,
  onClose,
}: AuditDetailDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-background border-l shadow-xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Audit Log Details</h2>
                  <Badge variant="outline" className="mt-2">
                    {log.actionType}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Actor</p>
                      <p className="text-sm">{log.actor.name}</p>
                      <p className="text-xs text-muted-foreground">{log.actor.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Target</p>
                      <p className="text-sm">{log.targetType}</p>
                      {log.targetId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {log.targetId}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {log.reason && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Reason</p>
                        <p className="text-sm text-muted-foreground">{log.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!log.reason && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-900 dark:text-yellow-100">
                        No reason provided for this action.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

