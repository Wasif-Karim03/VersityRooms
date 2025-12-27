"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface Room {
  id: string
  name: string
  building: string
  capacity: number
}

interface RoomSelectorProps {
  rooms: Room[]
  selectedRoomIds: string[]
  onSelectionChange: (roomIds: string[]) => void
  loading?: boolean
}

export function RoomSelector({
  rooms,
  selectedRoomIds,
  onSelectionChange,
  loading = false,
}: RoomSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms
    const query = searchQuery.toLowerCase()
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(query) ||
        room.building.toLowerCase().includes(query)
    )
  }, [rooms, searchQuery])

  const toggleRoom = (roomId: string) => {
    if (selectedRoomIds.includes(roomId)) {
      onSelectionChange(selectedRoomIds.filter((id) => id !== roomId))
    } else {
      onSelectionChange([...selectedRoomIds, roomId])
    }
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {selectedRoomIds.length > 0 && (
          <Badge variant="secondary" className="gap-1">
            {selectedRoomIds.length} selected
            <button
              onClick={clearSelection}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      <AnimatePresence>
        {isOpen && filteredRooms.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover border rounded-lg shadow-lg max-h-96 overflow-y-auto"
            >
              <div className="p-2 space-y-1">
                {filteredRooms.map((room) => {
                  const isSelected = selectedRoomIds.includes(room.id)
                  return (
                    <motion.button
                      key={room.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        toggleRoom(room.id)
                        setIsOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{room.name}</p>
                          <p className="text-xs opacity-80">{room.building}</p>
                        </div>
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedRoomIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedRoomIds.map((roomId) => {
            const room = rooms.find((r) => r.id === roomId)
            if (!room) return null
            return (
              <Badge
                key={roomId}
                variant="outline"
                className="gap-1"
              >
                {room.name}
                <button
                  onClick={() => toggleRoom(roomId)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

