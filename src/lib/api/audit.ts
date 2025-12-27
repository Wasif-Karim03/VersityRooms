/**
 * Audit logging utilities
 */

import { prisma } from "@/lib/prisma"

export interface AuditLogData {
  actorUserId: string
  actionType: string
  targetType: string
  targetId?: string | null
  reason?: string | null
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData) {
  return await prisma.auditLog.create({
    data: {
      actorUserId: data.actorUserId,
      actionType: data.actionType,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
    },
  })
}

