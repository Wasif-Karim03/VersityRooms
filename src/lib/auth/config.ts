/**
 * NextAuth Configuration
 * 
 * Abstracted auth configuration that can be swapped between
 * demo auth and real OWU SSO with minimal changes.
 */

import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { UserRole } from "./roles"

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
 * Demo Auth Provider
 * 
 * This is a simple credentials provider for demo purposes.
 * In production, this will be replaced with OWU SSO.
 */
const demoAuthProvider = CredentialsProvider({
  name: "Demo",
  credentials: {
    email: { label: "Email", type: "email" },
    role: { label: "Role", type: "text" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.role) {
      return null
    }

    // Validate role
    const validRoles: UserRole[] = ["STUDENT", "FACULTY", "ADMIN"]
    if (!validRoles.includes(credentials.role as UserRole)) {
      return null
    }

    // For demo, create a simple user object
    // In production, this would validate against OWU SSO
    return {
      id: `demo-${credentials.email}`,
      email: credentials.email,
      name: credentials.email.split("@")[0] || "Demo User",
      role: credentials.role as UserRole,
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
  providers: [demoAuthProvider],
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

