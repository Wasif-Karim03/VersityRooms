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
        <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight">{name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
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

