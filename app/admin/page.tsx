import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { StaggerList } from "@/src/components/motion/stagger-list"
import { DoorOpen, Users, FileCheck, BarChart3, Calendar } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { requireAdmin } from "@/src/lib/auth/guards"
import Link from "next/link"

const adminCards = [
  {
    title: "Room Management",
    description: "Add, edit, and manage rooms",
    icon: DoorOpen,
    action: "Manage Rooms",
    href: "/admin/rooms",
  },
  {
    title: "All Bookings",
    description: "View all bookings and who booked what rooms",
    icon: Calendar,
    action: "View Bookings",
    href: "/admin/bookings",
  },
  {
    title: "Booking Approvals",
    description: "Review and approve booking requests",
    icon: FileCheck,
    action: "View Requests",
    href: "/admin/requests",
  },
  {
    title: "Analytics & Reports",
    description: "View booking statistics and reports",
    icon: BarChart3,
    action: "View Reports",
    href: "/admin/reports",
  },
]

export default async function AdminPage() {
  // Require admin role - redirects if not admin
  await requireAdmin()

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground mt-1">
            Manage rooms, users, and bookings
          </p>
        </div>
      </FadeIn>

      <StaggerList className="grid gap-4 md:grid-cols-2">
        {adminCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{card.title}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={card.href}>
                  <Button variant="outline" className="w-full">
                    {card.action}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </StaggerList>
    </PageTransition>
  )
}
