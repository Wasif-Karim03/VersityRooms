"use client"

import { useState, useEffect } from "react"
import { Clock, XCircle } from "lucide-react"
import { AdminTable, AdminTableRow, AdminTableCell } from "@/src/components/admin/admin-table"
import { RequestActionModal } from "@/src/components/admin/request-action-modal"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { useToast } from "@/src/components/ui/toast"
import { useRouter } from "next/navigation"

interface BookingRequest {
  id: string
  roomId: string
  userId: string
  startAt: string
  endAt: string
  purpose: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  createdAt: string
  room: {
    id: string
    name: string
    building: string
  }
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function AdminRequestsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/requests?status=PENDING")
      const result = await response.json()

      if (result.success) {
        // Handle paginated response format
        const requestsData = result.data.data || result.data
        setRequests(Array.isArray(requestsData) ? requestsData : [])
      } else {
        addToast("Failed to load requests", "error")
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error)
      addToast("Failed to load requests", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = (request: BookingRequest) => {
    setSelectedRequest(request)
    setActionModalOpen(true)
  }

  const handleSubmitAction = async (data: {
    status: "REJECTED"
    reason: string
    startAt?: Date
    endAt?: Date
  }) => {
    if (!selectedRequest) return

    // Optimistic update
    const originalRequests = [...requests]
    setRequests((prev) =>
      prev.filter((r) => r.id !== selectedRequest.id)
    )

    try {
      const response = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: data.status,
          reason: data.reason,
          startAt: data.startAt?.toISOString(),
          endAt: data.endAt?.toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast("Request rejected successfully", "success")
        setActionModalOpen(false)
        setSelectedRequest(null)
        fetchRequests()
        router.refresh()
      } else {
        // Revert on error
        setRequests(originalRequests)
        throw new Error(result.error || "Failed to process request")
      }
    } catch (error: any) {
      // Revert on error
      setRequests(originalRequests)
      addToast(error.message || "Failed to process request", "error")
      throw error
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage booking requests
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {requests.length} pending {requests.length === 1 ? "request" : "requests"}
          </p>
        </div>

        <AdminTable
          headers={["Room", "Requested By", "Purpose", "Time", "Submitted", "Actions"]}
          loading={loading}
        >
          {requests.length === 0 && !loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No pending requests</p>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            requests.map((request) => (
              <AdminTableRow key={request.id}>
                <AdminTableCell>
                  <div>
                    <p className="font-medium">{request.room.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.room.building}
                    </p>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div>
                    <p className="font-medium">{request.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.user.email}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {request.user.role}
                    </Badge>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <p className="text-muted-foreground">{request.purpose}</p>
                </AdminTableCell>
                <AdminTableCell>
                  <div>
                    <p className="text-sm">
                      {formatDateTime(request.startAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      to {new Date(request.endAt).toLocaleTimeString()}
                    </p>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </AdminTableCell>
                <AdminTableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(request)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </AdminTableCell>
              </AdminTableRow>
            ))
          )}
        </AdminTable>
      </FadeIn>

      {selectedRequest && (
      <RequestActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false)
          setSelectedRequest(null)
        }}
        onSubmit={handleSubmitAction}
        request={selectedRequest}
        action="reject"
      />
      )}
    </PageTransition>
  )
}

