"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { EmptyState } from "@/src/components/ui/empty-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Skeleton } from "@/src/components/ui/skeleton"
import { RequestCard } from "@/src/components/requests/request-card"
import { RequestDetailDrawer } from "@/src/components/requests/request-detail-drawer"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { StaggerList } from "@/src/components/motion/stagger-list"
import { FileText, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/src/components/ui/toast"
import { useRouter, usePathname } from "next/navigation"

interface BookingRequest {
  id: string
  roomId: string
  userId: string
  startAt: string
  endAt: string
  purpose: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  createdAt: string
  updatedAt: string
  room: {
    id: string
    name: string
    building: string
  }
  user: {
    id: string
    name: string
    email: string
  }
}

export default function RequestsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { addToast } = useToast()
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const hasFetchedRef = useRef(false)
  const isFetchingRef = useRef(false)

  const fetchRequests = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return
    }

    try {
      isFetchingRef.current = true
      setLoading(true)
      const response = await fetch("/api/requests?mine=true")
      const result = await response.json()

      console.log("API Response:", result)

      if (result.success) {
        // Handle paginated response format
        // API returns: { success: true, data: { data: [...], pagination: {...} } }
        const requestsData = result.data?.data || result.data
        const requestsArray = Array.isArray(requestsData) ? requestsData : []
        setRequests(requestsArray)
        console.log(`✅ Loaded ${requestsArray.length} booking requests`)
        console.log("Requests data:", requestsArray)
      } else {
        console.error("❌ Failed to load requests:", result.error)
        // Only show error if this is the first fetch attempt
        if (!hasFetchedRef.current) {
          addToast("Failed to load requests", "error")
        }
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error)
      // Only show error if this is the first fetch attempt
      if (!hasFetchedRef.current) {
        addToast("Failed to load requests", "error")
      }
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [addToast])

  useEffect(() => {
    fetchRequests()
    hasFetchedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Refetch when pathname changes (user navigates to this page)
  useEffect(() => {
    if (pathname === '/requests') {
      // Always refetch when navigating to this page
      if (!isFetchingRef.current) {
        fetchRequests()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]) // fetchRequests is stable, guard prevents duplicates
  
  // Refetch when page becomes visible (e.g., user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasFetchedRef.current && !isFetchingRef.current) {
        // Small delay to avoid immediate duplicate calls
        setTimeout(() => {
          fetchRequests()
        }, 100)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // fetchRequests is stable, guard prevents duplicates

  const handleCancelRequest = async (id: string) => {
    // Optimistic update
    const originalRequests = [...requests]
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "CANCELLED" as const } : r
      )
    )

    try {
      const response = await fetch(`/api/requests/${id}/cancel`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        addToast("Request cancelled successfully", "success")
        fetchRequests()
        router.refresh()
      } else {
        // Revert on error
        setRequests(originalRequests)
        throw new Error(result.error || "Failed to cancel request")
      }
    } catch (error: any) {
      // Revert on error
      setRequests(originalRequests)
      addToast(error.message || "Failed to cancel request", "error")
      throw error
    }
  }

  const handleRequestClick = (request: BookingRequest) => {
    setSelectedRequest(request)
    setDrawerOpen(true)
  }

  const filteredRequests = requests.filter((request) => {
    if (activeTab === "all") return true
    return request.status === activeTab.toUpperCase()
  })

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, 'Playfair Display', serif", color: "#000000" }}>My Requests</h1>
          <p className="mt-1" style={{ color: "#333333" }}>
            View and manage your booking requests
          </p>
        </div>
      </FadeIn>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card
              style={{
                backgroundColor: "transparent",
                borderTopColor: "#990000",
              }}
            >
              <CardContent className="p-0">
                <EmptyState
                  icon={
                    activeTab === "approved" ? (
                      <CheckCircle2 className="h-12 w-12" />
                    ) : activeTab === "rejected" ? (
                      <XCircle className="h-12 w-12" />
                    ) : (
                      <FileText className="h-12 w-12" />
                    )
                  }
                  title={
                    activeTab === "approved"
                      ? "No approved requests"
                      : activeTab === "rejected"
                      ? "No rejected requests"
                      : "No booking requests"
                  }
                  description={
                    activeTab === "all"
                      ? "You haven't created any booking requests yet. Start by browsing available rooms and making your first booking."
                      : `You don't have any ${activeTab} booking requests at the moment.`
                  }
                  action={
                    activeTab === "all"
                      ? {
                          label: "Browse Rooms",
                          onClick: () => {
                            router.push("/rooms")
                          },
                        }
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <StaggerList className="space-y-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={() => handleRequestClick(request)}
                />
              ))}
            </StaggerList>
          )}
        </TabsContent>
      </Tabs>

      {selectedRequest && (
        <RequestDetailDrawer
          request={selectedRequest}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false)
            setSelectedRequest(null)
          }}
          onCancel={undefined}
        />
      )}
    </PageTransition>
  )
}
