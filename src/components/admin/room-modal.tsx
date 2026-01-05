"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"

interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    building: string
    capacity: number
    equipment: string[]
    images: string[]
    isActive: boolean
    isLocked: boolean
    restrictedRoles: string[] | null
  }) => Promise<void>
  room?: {
    id: string
    name: string
    building: string
    capacity: number
    equipment: string[]
    images: string[]
    isActive: boolean
    isLocked: boolean
    restrictedRoles: string[] | null
  } | null
}

const EQUIPMENT_OPTIONS = [
  "projector",
  "whiteboard",
  "wifi",
  "sound system",
  "microphone",
  "video conferencing",
  "computers",
  "printer",
  "monitor",
  "workbenches",
  "tools",
  "stage",
  "lighting",
]

const ROLE_OPTIONS = ["STUDENT", "FACULTY", "ADMIN"]

export function RoomModal({ isOpen, onClose, onSave, room }: RoomModalProps) {
  const [name, setName] = useState("")
  const [building, setBuilding] = useState("")
  const [capacity, setCapacity] = useState(10)
  const [equipment, setEquipment] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const [restrictedRoles, setRestrictedRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (room) {
      setName(room.name)
      setBuilding(room.building)
      setCapacity(room.capacity)
      setEquipment(Array.isArray(room.equipment) ? room.equipment : [])
      setImages(Array.isArray(room.images) ? room.images : [])
      setIsActive(room.isActive)
      setIsLocked(room.isLocked)
      setRestrictedRoles(
        Array.isArray(room.restrictedRoles) ? room.restrictedRoles : []
      )
    } else {
      // Reset for new room
      setName("")
      setBuilding("")
      setCapacity(10)
      setEquipment([])
      setImages([])
      setIsActive(true)
      setIsLocked(false)
      setRestrictedRoles([])
    }
  }, [room, isOpen])

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  const toggleRestrictedRole = (role: string) => {
    setRestrictedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Room name is required")
      return
    }

    if (!building.trim()) {
      setError("Building is required")
      return
    }

    if (capacity < 1) {
      setError("Capacity must be at least 1")
      return
    }

    try {
      setLoading(true)
      await onSave({
        name: name.trim(),
        building: building.trim(),
        capacity,
        equipment,
        images,
        isActive,
        isLocked,
        restrictedRoles: restrictedRoles.length > 0 ? restrictedRoles : null,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save room")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 w-full max-w-3xl rounded-lg border bg-background shadow-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background">
                <h2 className="text-2xl font-semibold">
                  {room ? "Edit Room" : "Create Room"}
                </h2>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Room Name *</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Lecture Hall A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Building *</label>
                    <Input
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="e.g., Science Building"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity *</label>
                  <Input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Equipment</label>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT_OPTIONS.map((item) => (
                      <Badge
                        key={item}
                        variant={equipment.includes(item) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleEquipment(item)}
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Restricted Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map((role) => (
                      <Badge
                        key={role}
                        variant={restrictedRoles.includes(role) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleRestrictedRole(role)}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to allow all roles. Select roles to restrict access.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded"
                    />
                    <label className="text-sm font-medium">Active</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isLocked}
                      onChange={(e) => setIsLocked(e.target.checked)}
                      className="rounded"
                    />
                    <label className="text-sm font-medium">Locked</label>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : room ? "Update Room" : "Create Room"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

