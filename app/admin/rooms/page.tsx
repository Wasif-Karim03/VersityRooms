"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Lock, Unlock, Building2 } from "lucide-react"
import { AdminTable, AdminTableRow, AdminTableCell } from "@/src/components/admin/admin-table"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { useToast } from "@/src/components/ui/toast"
import { useRouter } from "next/navigation"
import { RoomModal } from "@/src/components/admin/room-modal"

interface Room {
  id: string
  name: string
  building: string
  capacity: number
  equipment: string[]
  images: string[]
  isActive: boolean
  isLocked: boolean
  restrictedRoles: string[] | null
  createdAt: string
}

export default function AdminRoomsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/rooms")
      const result = await response.json()

      if (result.success) {
        // Handle paginated response format
        const roomsData = result.data.data || result.data
        setRooms(Array.isArray(roomsData) ? roomsData : [])
      } else {
        addToast("Failed to load rooms", "error")
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
      addToast("Failed to load rooms", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRoom(null)
    setModalOpen(true)
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return

    try {
      // In a real app, this would be a DELETE endpoint
      // For now, we'll just deactivate it
      addToast("Room deletion not yet implemented. Use edit to deactivate.", "info")
    } catch (error: any) {
      addToast(error.message || "Failed to delete room", "error")
    }
  }

  const handleToggleLock = async (room: Room) => {
    // Optimistic update
    const originalRooms = [...rooms]
    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id ? { ...r, isLocked: !r.isLocked } : r
      )
    )

    try {
      const response = await fetch(`/api/admin/rooms/${room.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isLocked: !room.isLocked,
        }),
      })
      const result = await response.json()
      if (!result.success) {
        // Revert on error
        setRooms(originalRooms)
        throw new Error(result.error || "Failed to toggle lock")
      }
      addToast(`Room ${!room.isLocked ? "locked" : "unlocked"} successfully`, "success")
      fetchRooms()
      router.refresh()
    } catch (error: any) {
      // Revert on error
      setRooms(originalRooms)
      addToast(error.message || "Failed to toggle lock", "error")
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingRoom) {
        // Update existing room
        const response = await fetch(`/api/admin/rooms/${editingRoom.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || "Failed to update room")
        }
        addToast("Room updated successfully", "success")
      } else {
        // Create new room
        const response = await fetch("/api/admin/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || "Failed to create room")
        }
        addToast("Room created successfully", "success")
      }
      fetchRooms()
      setModalOpen(false)
      setEditingRoom(null)
      router.refresh()
    } catch (error: any) {
      addToast(error.message || "Failed to save room", "error")
    }
  }

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, edit, and manage rooms
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <AdminTable
          headers={["Name", "Building", "Capacity", "Equipment", "Status", "Actions"]}
          loading={loading}
        >
          {rooms.length === 0 && !loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No rooms found</p>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            rooms.map((room) => (
              <AdminTableRow key={room.id}>
                <AdminTableCell>
                  <div>
                    <p className="font-medium">{room.name}</p>
                    {room.isLocked && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        Locked
                      </Badge>
                    )}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <p className="text-muted-foreground">{room.building}</p>
                </AdminTableCell>
                <AdminTableCell>
                  <Badge variant="secondary">{room.capacity}</Badge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(room.equipment) &&
                      room.equipment.slice(0, 3).map((item) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    {Array.isArray(room.equipment) && room.equipment.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{room.equipment.length - 3}
                      </Badge>
                    )}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    {room.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {room.restrictedRoles &&
                      Array.isArray(room.restrictedRoles) &&
                      room.restrictedRoles.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Restricted
                        </Badge>
                      )}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(room)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleLock(room)}
                    >
                      {room.isLocked ? (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Lock
                        </>
                      )}
                    </Button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))
          )}
        </AdminTable>
      </FadeIn>

      <RoomModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingRoom(null)
        }}
        onSave={handleSave}
        room={editingRoom}
      />
    </PageTransition>
  )
}

