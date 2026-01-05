# Authentication & Authorization

## Overview

The application implements a mock authentication system that can be easily swapped for OWU SSO in the future. The auth system uses NextAuth.js with role-based access control.

## Architecture

### Phase 1: Mock Auth (Current)

- **Login Page**: `/login` with email and role selection
- **Session Storage**: Secure JWT tokens via NextAuth.js
- **Role Selection**: Student, Faculty, Admin (for demo purposes)
- **Route Protection**: Middleware protects all authenticated routes

### Phase 2: OWU SSO (Future)

The auth system is abstracted to allow easy migration to OWU SSO:
- Auth configuration in `src/lib/auth/config.ts`
- Provider abstraction allows swapping credentials provider with OAuth
- Session structure remains the same

## File Structure

```
src/lib/auth/
├── config.ts      # NextAuth configuration (abstracted for SSO)
├── session.ts      # Session utilities (getCurrentUser, requireCurrentUser)
├── roles.ts        # Role definitions and utilities
├── guards.ts       # Route guards (requireAuth, requireRole, requireAdmin)
└── index.ts        # Central exports

app/
├── api/auth/[...nextauth]/route.ts  # NextAuth API handler
└── login/page.tsx                   # Login page

middleware.ts                         # Route protection middleware
```

## User Roles

### STUDENT
- Can create and manage booking requests
- Access: Dashboard, Rooms, Calendar, Requests

### FACULTY
- Can create and manage booking requests
- Access: Dashboard, Rooms, Calendar, Requests

### ADMIN
- Full access including room management and approvals
- Access: All routes including `/admin`

## Authentication Flow

1. User visits protected route
2. Middleware checks for valid session
3. If not authenticated, redirects to `/login`
4. User selects email and role (demo)
5. NextAuth creates JWT session
6. User is redirected to `/dashboard`
7. Session persists for 30 days

## Route Protection

### Middleware (`middleware.ts`)

Protects the following routes:
- `/dashboard`
- `/rooms`
- `/calendar`
- `/requests`
- `/admin` (requires ADMIN role)

### Server-Side Guards

Use in server components:

```typescript
import { requireAuth, requireAdmin, requireRole } from "@/src/lib/auth/guards"

// Require any authenticated user
const user = await requireAuth()

// Require admin role
const admin = await requireAdmin()

// Require specific role
const faculty = await requireRole("FACULTY")
```

### Client-Side

Use `useSession` hook:

```typescript
import { useSession } from "next-auth/react"

const { data: session } = useSession()
const user = session?.user
```

## Session Utilities

### `getCurrentUser()`

Returns the current user or `null` if not authenticated:

```typescript
import { getCurrentUser } from "@/src/lib/auth/session"

const user = await getCurrentUser()
if (user) {
  console.log(user.name, user.role)
}
```

### `requireCurrentUser()`

Throws if not authenticated:

```typescript
import { requireCurrentUser } from "@/src/lib/auth/session"

const user = await requireCurrentUser() // Always returns user
```

## Role Utilities

```typescript
import { isAdmin, canAccessAdmin } from "@/src/lib/auth/roles"

if (isAdmin(user.role)) {
  // Admin-only logic
}

if (canAccessAdmin(user.role)) {
  // Show admin UI
}
```

## Profile Dropdown

The profile dropdown in the top navigation shows:
- User name
- User email
- Role badge
- Sign out button

## Environment Variables

Required in `.env`:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret:
```bash
openssl rand -base64 32
```

## Migration to OWU SSO

When ready to implement real SSO:

1. **Update `src/lib/auth/config.ts`**:
   - Replace `CredentialsProvider` with OAuth provider
   - Add OWU SSO configuration
   - Map SSO user data to session structure

2. **Update login page** (optional):
   - Replace demo form with SSO button
   - Or redirect directly to SSO

3. **Session structure remains the same**:
   - No changes needed to guards or utilities
   - Components continue to work as-is

Example OAuth configuration:

```typescript
providers: [
  OAuthProvider({
    clientId: process.env.OWU_CLIENT_ID,
    clientSecret: process.env.OWU_CLIENT_SECRET,
    authorization: {
      url: process.env.OWU_AUTHORIZATION_URL,
    },
    token: process.env.OWU_TOKEN_URL,
    userinfo: process.env.OWU_USERINFO_URL,
    async profile(profile) {
      return {
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        role: mapSSORoleToAppRole(profile.role), // Map SSO role
      }
    },
  })
]
```

## Security Considerations

- **JWT Tokens**: Stored in secure HTTP-only cookies
- **Session Duration**: 30 days (configurable)
- **Route Protection**: Middleware runs before request completion
- **Role Validation**: Server-side guards prevent unauthorized access
- **CSRF Protection**: NextAuth.js handles CSRF tokens automatically

## Testing

### Demo Login

1. Navigate to `/login`
2. Enter any email (e.g., `student@university.edu`)
3. Select a role (Student, Faculty, or Admin)
4. Click "Sign In"
5. You'll be redirected to `/dashboard`

### Testing Role-Based Access

1. Login as Student/Faculty
2. Try to access `/admin` - should redirect to `/dashboard`
3. Login as Admin
4. Access `/admin` - should work

## Troubleshooting

### Session not persisting
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your app URL
- Check browser cookies are enabled

### Redirect loops
- Ensure middleware matcher is correct
- Verify login page is not in protected routes
- Check auth callback URLs

### Role not working
- Verify role is set in session callback
- Check JWT token includes role
- Ensure guards are checking correct role

