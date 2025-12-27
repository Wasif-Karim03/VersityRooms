"use client"

import { useState } from "react"
import { Calendar, Users, Building2, Wrench } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Select } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { motion } from "framer-motion"

export interface RoomFilters {
  date?: string
  capacity?: number
  building?: string
  equipment?: string[]
}

interface FilterBarProps {
  filters: RoomFilters
  onFiltersChange: (filters: RoomFilters) => void
  buildings: string[]
  equipmentOptions: string[]
}

export function FilterBar({
  filters,
  onFiltersChange,
  buildings,
  equipmentOptions,
}: FilterBarProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    filters.equipment || []
  )

  const handleEquipmentToggle = (equipment: string) => {
    const newSelection = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter((e) => e !== equipment)
      : [...selectedEquipment, equipment]
    
    setSelectedEquipment(newSelection)
    onFiltersChange({ ...filters, equipment: newSelection })
  }

  const clearFilters = () => {
    setSelectedEquipment([])
    onFiltersChange({})
  }

  const hasActiveFilters = 
    filters.date || 
    filters.capacity || 
    filters.building || 
    selectedEquipment.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-card border rounded-lg p-4 md:p-6 space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </label>
          <Input
            type="date"
            value={filters.date || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, date: e.target.value })
            }
            className="w-full"
          />
        </div>

        {/* Capacity Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Min Capacity
          </label>
          <Input
            type="number"
            min="1"
            placeholder="Any"
            value={filters.capacity || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                capacity: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="w-full"
          />
        </div>

        {/* Building Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Building
          </label>
          <Select
            value={filters.building || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                building: e.target.value || undefined,
              })
            }
            className="w-full"
          >
            <option value="">All Buildings</option>
            {buildings.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </Select>
        </div>

        {/* Equipment Filter - Multi-select */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Equipment
          </label>
          <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
            {equipmentOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              equipmentOptions.map((equipment) => (
                <Badge
                  key={equipment}
                  variant={
                    selectedEquipment.includes(equipment)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleEquipmentToggle(equipment)}
                >
                  {equipment}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

