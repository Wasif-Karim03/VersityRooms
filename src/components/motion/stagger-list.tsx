"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface StaggerListProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
  itemDuration?: number
}

export function StaggerList({ 
  children, 
  className,
  staggerDelay = 0.05,
  itemDuration = 0.2
}: StaggerListProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: itemDuration,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

