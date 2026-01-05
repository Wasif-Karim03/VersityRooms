/**
 * Next.js Middleware
 * 
 * Protects routes and enforces authentication.
 * Runs before the request is completed.
 */

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes require admin role
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = ["/", "/login", "/api/auth"]
        if (publicRoutes.some((route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route))) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/rooms/:path*",
    "/calendar/:path*",
    "/requests/:path*",
    "/admin/:path*",
    "/notifications/:path*",
  ],
}

