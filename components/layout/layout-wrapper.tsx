"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { TopNav } from "./top-nav"
import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  const isLoginPage = pathname === "/login"

  // Landing page and login page don't use the standard layout
  if (isLandingPage || isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <main className="flex-1 lg:ml-64 transition-all duration-300 pb-16 lg:pb-0">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
