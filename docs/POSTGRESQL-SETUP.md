# PostgreSQL Setup Guide
## Step 1: Database Migration

We've updated the schema to use PostgreSQL. Now you need to set up a PostgreSQL database.

---

## Option 1: Cloud Database (Recommended - Easiest & Fastest)

### Free Options:

#### A. Supabase (Recommended - 2 minutes) ⭐
1. Go to https://supabase.com
2. Sign up (free tier available)
3. Click "New Project"
4. Fill in project details
5. Go to **Settings** → **Database**
6. Copy the **Connection string** (URI format)
7. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
8. Update your `.env` file with this connection string

**Connection String Format**:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?connection_limit=20&pool_timeout=10"
```

#### B. Neon (Alternative - 2 minutes)
1. Go to https://neon.tech
2. Sign up (free tier available)
3. Create a new project
4. Copy the connection string from the dashboard
5. Update your `.env` file

#### C. Railway (Alternative)
1. Go to https://railway.app
2. Sign up
3. Create new PostgreSQL project
4. Copy connection string
5. Update your `.env` file

---

## Option 2: Local PostgreSQL (For Development)

### macOS:
```bash
# Install PostgreSQL via Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb roombooking

# Or using psql:
psql postgres
CREATE DATABASE roombooking;
\q
```

### Update .env:
```env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/roombooking?connection_limit=20&pool_timeout=10"
```

Or with password:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/roombooking?connection_limit=20&pool_timeout=10"
```

### Linux (Ubuntu/Debian):
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE roombooking;
CREATE USER roombooking_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE roombooking TO roombooking_user;
\q
```

### Windows:
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set
4. Open pgAdmin or psql
5. Create database: `CREATE DATABASE roombooking;`

---

## Step 2: Update .env File

Once you have your PostgreSQL connection string:

1. Open `.env` file in the project root
2. Update `DATABASE_URL` with your PostgreSQL connection string
3. **Important**: Add connection pool parameters:
   ```
   ?connection_limit=20&pool_timeout=10
   ```

**Example**:
```env
# Before (SQLite):
# DATABASE_URL="file:./dev.db"

# After (PostgreSQL):
DATABASE_URL="postgresql://user:password@host:5432/roombooking?connection_limit=20&pool_timeout=10"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Step 3: Generate Prisma Client & Run Migrations

After updating `.env`, run these commands:

```bash
# 1. Generate Prisma Client for PostgreSQL
npm run db:generate

# 2. Create database schema (migrate)
npm run db:push

# Or create a migration file (recommended for production):
npm run db:migrate
# This will prompt you for a migration name, e.g., "init_postgresql"

# 3. Seed database with initial data (optional)
npm run db:seed
```

---

## Step 4: Verify Connection

Test that everything works:

```bash
# Start the dev server
npm run dev

# The app should start without errors
# Try accessing: http://localhost:3000
```

If you see any connection errors, check:
1. PostgreSQL is running (for local setup)
2. Connection string is correct
3. Database exists
4. User has proper permissions

---

## Connection String Parameters Explained

```
postgresql://user:password@host:port/database?connection_limit=20&pool_timeout=10
```

- **connection_limit=20**: Maximum 20 database connections per instance (important for 500+ users)
- **pool_timeout=10**: Wait up to 10 seconds for a connection from the pool

---

## Troubleshooting

### Error: "Connection refused"
- PostgreSQL is not running (local setup)
- Check: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)

### Error: "password authentication failed"
- Check your password in the connection string
- For local: Try `psql postgres` to test password

### Error: "database does not exist"
- Create the database first
- Run: `createdb roombooking` or use `CREATE DATABASE roombooking;`

### Error: "permission denied"
- User needs database permissions
- Run: `GRANT ALL PRIVILEGES ON DATABASE roombooking TO your_user;`

---

## Next Steps

Once PostgreSQL is set up:
1. ✅ Schema is already migrated to PostgreSQL
2. ✅ Critical indexes are added
3. ✅ Connection pooling is configured
4. ⏭️ Next: Set up Redis for caching (Priority 2)

---

## Quick Reference

**Cloud Setup** (Fastest):
1. Sign up for Supabase/Neon
2. Copy connection string
3. Update `.env`
4. Run `npm run db:generate && npm run db:push`

**Local Setup**:
1. Install PostgreSQL
2. Create database
3. Update `.env`
4. Run `npm run db:generate && npm run db:push`

