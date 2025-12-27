/**
 * GET /api/admin/audit
 * Get audit logs with optional filters (admin only)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const actionType = searchParams.get("actionType")
    const targetType = searchParams.get("targetType")
    const actorUserId = searchParams.get("actorUserId")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {}

    if (actionType) {
      where.actionType = actionType
    }

    if (targetType) {
      where.targetType = targetType
    }

    if (actorUserId) {
      where.actorUserId = actorUserId
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json(
      successResponse({
        logs,
        total,
        limit,
        offset,
      })
    )
  } catch (error: any) {
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error fetching audit logs:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch audit logs", 500),
      { status: 500 }
    )
  }
}

