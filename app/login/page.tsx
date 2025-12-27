"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select } from "@/src/components/ui/select"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { SlideUp } from "@/src/components/motion/slide-up"
import { Building2, LogIn } from "lucide-react"
import type { UserRole } from "@/src/lib/auth/roles"

const ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: "STUDENT",
    label: "Student",
    description: "Create and manage booking requests",
  },
  {
    value: "FACULTY",
    label: "Faculty",
    description: "Create and manage booking requests",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Full access including room management",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("STUDENT")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        role,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials. Please try again.")
        setIsLoading(false)
        return
      }

      // Redirect to dashboard on success
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <PageTransition className="w-full max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">Sign in (Demo)</CardTitle>
              <CardDescription className="mt-2">
                Choose a role to continue with demo authentication
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FadeIn>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </FadeIn>

              <SlideUp delay={0.1}>
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    disabled={isLoading}
                    required
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {ROLES.find((r) => r.value === role)?.description}
                  </p>
                </div>
              </SlideUp>

              {error && (
                <FadeIn>
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </FadeIn>
              )}

              <SlideUp delay={0.2}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email || !role}
                >
                  {isLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </SlideUp>

              <p className="text-xs text-center text-muted-foreground">
                This is a demo authentication system. In production, this will
                use OWU SSO.
              </p>
            </form>
          </CardContent>
        </Card>
      </PageTransition>
    </div>
  )
}

