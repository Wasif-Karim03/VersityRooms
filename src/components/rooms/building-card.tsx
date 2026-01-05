"use client"

import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Building2, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BuildingCardProps {
  name: string
  roomCount: number
}

export function BuildingCard({ name, roomCount }: BuildingCardProps) {
  return (
    <Link href={`/rooms/building/${encodeURIComponent(name)}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Card 
          className="h-full border-2 hover:border-[#990000]/50 transition-all duration-300 group cursor-pointer"
          style={{
            backgroundColor: "#990000",
            borderTopColor: "#990000",
          }}
        >
          <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="rounded-xl p-3 transition-colors" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                  <Building2 className="h-6 w-6" style={{ color: "#FFFFFF" }} />
                </div>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#FFFFFF" }} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight" style={{ color: "#FFFFFF" }}>{name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", color: "#FFFFFF" }}>
                    {roomCount} {roomCount === 1 ? "room" : "rooms"}
                  </Badge>
                </div>
              </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}

