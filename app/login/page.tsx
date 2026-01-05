"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { PageTransition } from "@/src/components/motion/page-transition"
import { FadeIn } from "@/src/components/motion/fade-in"
import { SlideUp } from "@/src/components/motion/slide-up"
import { Building2, LogIn, ChevronDown, Mail, ArrowLeft, Shield } from "lucide-react"
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
  const [loginMode, setLoginMode] = useState<"user" | "admin">("user")
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("STUDENT")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send verification code. Please try again.")
        setIsLoading(false)
        return
      }

      setSuccessMessage("Verification code sent to your email!")
      setStep("code")
      setIsLoading(false)
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("email-verification", {
        email,
        code,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid verification code. Please try again.")
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("admin", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
        setIsLoading(false)
        return
      }

      // Redirect to admin rooms page on success
      router.push("/admin/rooms")
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="flex items-center justify-center fixed inset-0"
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "url('/rs129111-220418-owu-165-highres-scr.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        margin: 0,
        padding: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <PageTransition className="w-full max-w-md mx-auto px-4">
        <div 
          className="w-full rounded-lg p-8 shadow-2xl"
          style={{
            backgroundColor: "rgba(153, 0, 0, 0.25)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <div className="text-center space-y-4 mb-6">
            <div className="flex justify-center">
              <div className="rounded-full p-3" style={{ backgroundColor: "rgba(204, 0, 0, 0.1)" }}>
                <Building2 className="h-8 w-8" style={{ color: "#CC0000" }} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#FAFAFA" }}>
                {loginMode === "admin"
                  ? "Admin Sign In"
                  : step === "email"
                  ? "Sign In"
                  : "Enter Verification Code"}
              </h1>
              <p className="mt-2 text-sm" style={{ color: "#E5E7EB" }}>
                {loginMode === "admin"
                  ? "Enter your admin credentials"
                  : step === "email"
                  ? "Enter your email and role to receive a verification code"
                  : `Enter the 6-digit code sent to ${email}`}
              </p>
            </div>
          </div>

          {/* Login Mode Toggle */}
          <div className="mb-4">
            <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <button
                type="button"
                onClick={() => {
                  setLoginMode("user")
                  setStep("email")
                  setEmail("")
                  setPassword("")
                  setCode("")
                  setError("")
                  setSuccessMessage("")
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === "user"
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
                style={{
                  backgroundColor: loginMode === "user" ? "rgba(204, 0, 0, 0.5)" : "transparent",
                }}
              >
                User Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode("admin")
                  setEmail("")
                  setPassword("")
                  setCode("")
                  setError("")
                  setSuccessMessage("")
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === "admin"
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
                style={{
                  backgroundColor: loginMode === "admin" ? "rgba(204, 0, 0, 0.5)" : "transparent",
                }}
              >
                Admin Login
              </button>
            </div>
          </div>

          <div>
            {loginMode === "admin" ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <FadeIn>
                  <div className="space-y-2">
                    <label htmlFor="admin-email" className="text-sm font-medium" style={{ color: "#F3F4F6" }}>
                      Email
                    </label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@owu.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white/20 backdrop-blur-sm border-white/50 placeholder:text-gray-400"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        color: "#FAFAFA",
                      }}
                    />
                  </div>
                </FadeIn>

                <SlideUp delay={0.1}>
                  <div className="space-y-2">
                    <label htmlFor="admin-password" className="text-sm font-medium" style={{ color: "#F3F4F6" }}>
                      Password
                    </label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white/20 backdrop-blur-sm border-white/50 placeholder:text-gray-400"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        color: "#FAFAFA",
                      }}
                    />
                  </div>
                </SlideUp>

                {error && (
                  <FadeIn>
                    <div className="rounded-md border p-3" style={{ backgroundColor: "rgba(220, 38, 38, 0.2)", borderColor: "rgba(220, 38, 38, 0.5)" }}>
                      <p className="text-sm" style={{ color: "#FEE2E2" }}>{error}</p>
                    </div>
                  </FadeIn>
                )}

                <SlideUp delay={0.2}>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !email || !password}
                    style={{ backgroundColor: "#CC0000" }}
                  >
                    {isLoading ? (
                      "Signing in..."
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Sign In as Admin
                      </>
                    )}
                  </Button>
                </SlideUp>
              </form>
            ) : step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <FadeIn>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium" style={{ color: "#F3F4F6" }}>
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
                      className="bg-white/20 backdrop-blur-sm border-white/50 placeholder:text-gray-400"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        color: "#FAFAFA",
                      }}
                    />
                  </div>
                </FadeIn>

                <SlideUp delay={0.1}>
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium" style={{ color: "#F3F4F6" }}>
                      Role
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        disabled={isLoading}
                        required
                        className="flex h-10 w-full appearance-none rounded-md border px-3 py-2 text-sm pr-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(10px)",
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          color: "#FAFAFA",
                        }}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value} style={{ backgroundColor: "#1F2937", color: "#FAFAFA" }}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "#E5E7EB" }} />
                    </div>
                    <p className="text-xs" style={{ color: "#D1D5DB" }}>
                      {ROLES.find((r) => r.value === role)?.description}
                    </p>
                  </div>
                </SlideUp>

                {error && (
                  <FadeIn>
                    <div className="rounded-md border p-3" style={{ backgroundColor: "rgba(220, 38, 38, 0.2)", borderColor: "rgba(220, 38, 38, 0.5)" }}>
                      <p className="text-sm" style={{ color: "#FEE2E2" }}>{error}</p>
                    </div>
                  </FadeIn>
                )}

                <SlideUp delay={0.2}>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !email || !role}
                    style={{ backgroundColor: "#CC0000" }}
                  >
                    {isLoading ? (
                      "Sending code..."
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Verification Code
                      </>
                    )}
                  </Button>
                </SlideUp>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <FadeIn>
                  <div className="space-y-2">
                    <label htmlFor="code" className="text-sm font-medium" style={{ color: "#F3F4F6" }}>
                      Verification Code
                    </label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      disabled={isLoading}
                      maxLength={6}
                      className="bg-white/20 backdrop-blur-sm border-white/50 placeholder:text-gray-400 text-center text-2xl tracking-widest font-mono"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        color: "#FAFAFA",
                      }}
                    />
                    <p className="text-xs text-center" style={{ color: "#D1D5DB" }}>
                      Enter the 6-digit code from your email
                    </p>
                  </div>
                </FadeIn>

                {successMessage && (
                  <FadeIn>
                    <div className="rounded-md border p-3" style={{ backgroundColor: "rgba(34, 197, 94, 0.2)", borderColor: "rgba(34, 197, 94, 0.5)" }}>
                      <p className="text-sm" style={{ color: "#D1FAE5" }}>{successMessage}</p>
                    </div>
                  </FadeIn>
                )}

                {error && (
                  <FadeIn>
                    <div className="rounded-md border p-3" style={{ backgroundColor: "rgba(220, 38, 38, 0.2)", borderColor: "rgba(220, 38, 38, 0.5)" }}>
                      <p className="text-sm" style={{ color: "#FEE2E2" }}>{error}</p>
                    </div>
                  </FadeIn>
                )}

                <SlideUp delay={0.1}>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || code.length !== 6}
                    style={{ backgroundColor: "#CC0000" }}
                  >
                    {isLoading ? (
                      "Verifying..."
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Verify & Sign In
                      </>
                    )}
                  </Button>
                </SlideUp>

                <SlideUp delay={0.2}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => {
                      setStep("email")
                      setCode("")
                      setError("")
                      setSuccessMessage("")
                    }}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "#FAFAFA",
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </SlideUp>
              </form>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  )
}

