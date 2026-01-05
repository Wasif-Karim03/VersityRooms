/**
 * NextAuth Configuration
 * 
 * Abstracted auth configuration that can be swapped between
 * demo auth and real OWU SSO with minimal changes.
 */

import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { UserRole } from "./roles"
import { prisma } from "@/lib/prisma"

// Extend NextAuth types to include role
declare module "next-auth" {
  interface User {
    role: UserRole
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    id: string
  }
}

/**
 * Email Verification Auth Provider
 * 
 * Uses 6-digit verification codes sent via email for authentication.
 * In production, this will be replaced with OWU SSO.
 */
const emailVerificationProvider = CredentialsProvider({
  id: "email-verification",
  name: "Email Verification",
  credentials: {
    email: { label: "Email", type: "email" },
    code: { label: "Verification Code", type: "text" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.code) {
      return null
    }

    // Verify the code
    const { verifyCode } = await import("./verification")
    const verified = await verifyCode(credentials.email.toLowerCase(), credentials.code)

    if (!verified) {
      return null // Invalid or expired code
    }

    // Sync user with database (find or create)
    // This ensures the user exists in the database for foreign key relationships
    const user = await prisma.user.upsert({
      where: { email: verified.email },
      update: {
        // Update role if changed
        role: verified.role as UserRole,
      },
      create: {
        email: verified.email,
        name: verified.email.split("@")[0] || "User",
        role: verified.role as UserRole,
      },
    })

    // Return user object with database ID
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    }
  },
})

/**
 * Admin Credentials Provider
 * 
 * Uses hardcoded email and password for admin authentication.
 * TODO: Replace with secure admin authentication in production.
 */
const adminCredentialsProvider = CredentialsProvider({
  id: "admin",
  name: "Admin",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null
    }

    // Hardcoded admin credentials (TODO: Move to environment variables or database)
    const ADMIN_EMAIL = "admin@owu.edu"
    const ADMIN_PASSWORD = "admin123"

    if (
      credentials.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
      credentials.password !== ADMIN_PASSWORD
    ) {
      return null // Invalid credentials
    }

    // Sync admin user with database (find or create)
    const user = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        role: "ADMIN",
      },
      create: {
        email: ADMIN_EMAIL,
        name: "Admin",
        role: "ADMIN",
      },
    })

    // Return user object with database ID
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    }
  },
})

/**
 * NextAuth Configuration
 * 
 * This configuration can be easily swapped to use OWU SSO
 * by replacing the providers array with an OAuth provider.
 */
export const authOptions: NextAuthOptions = {
  providers: [emailVerificationProvider, adminCredentialsProvider],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "demo-secret-change-in-production",
}

/**
 * Future: OWU SSO Configuration
 * 
 * When ready to implement real SSO, replace the providers array with:
 * 
 * providers: [
 *   OAuthProvider({
 *     clientId: process.env.OWU_CLIENT_ID,
 *     clientSecret: process.env.OWU_CLIENT_SECRET,
 *     authorization: {
 *       url: process.env.OWU_AUTHORIZATION_URL,
 *       params: { ... }
 *     },
 *     token: process.env.OWU_TOKEN_URL,
 *     userinfo: process.env.OWU_USERINFO_URL,
 *   })
 * ]
 */

