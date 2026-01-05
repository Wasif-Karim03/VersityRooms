# Local Development Setup Guide

## Quick Start (Recommended: Free Cloud Database)

### Step 1: Get a Free PostgreSQL Database

**Option A: Supabase (Recommended - 2 minutes)**
1. Go to https://supabase.com
2. Sign up (free)
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

**Option B: Neon (Alternative - 2 minutes)**
1. Go to https://neon.tech
2. Sign up (free)
3. Create a new project
4. Copy the connection string from the dashboard

### Step 2: Update .env File

Open `.env` and update the `DATABASE_URL` with your connection string:

```env
DATABASE_URL="postgresql://postgres:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Gmail SMTP (for email verification codes)
# See docs/GMAIL-SETUP.md for setup instructions
GMAIL_EMAIL=your-company-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### Step 3: Run Setup Commands

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

---

## Alternative: Local PostgreSQL Setup

### Install PostgreSQL on Windows

1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Create a database:
   ```bash
   createdb versityrooms
   ```
   Or using psql:
   ```bash
   psql -U postgres
   CREATE DATABASE versityrooms;
   \q
   ```

5. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/versityrooms?schema=public"
   ```

---

## After Database Setup

Once your database is configured, run:

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Create database tables
npm run db:push

# 3. Seed with sample data (optional but recommended)
npm run db:seed

# 4. Start the development server
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## Demo Login Credentials

After seeding, you can login with:

- **Admin**: `admin@owu.edu` (any password, role: ADMIN)
- **Faculty**: `jane.smith@owu.edu` (any password, role: FACULTY)  
- **Student**: `john.doe@owu.edu` (any password, role: STUDENT)

Note: The demo auth accepts any email/password combination - just select the role you want.

---

## Troubleshooting

**Database connection error?**
- Check your DATABASE_URL in `.env`
- Ensure PostgreSQL is running (if using local)
- Verify network access (if using cloud)

**Prisma errors?**
- Run `npm run db:generate` again
- Delete `node_modules/.prisma` and regenerate

**Port 3000 already in use?**
- Change port: `npm run dev -- -p 3001`

