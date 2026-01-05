# Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications. It's free for personal projects and has excellent GitHub integration.

### Step 1: Create Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with your GitHub account (recommended for easy integration)

### Step 2: Import Your Repository

1. Click "Add New Project" in your Vercel dashboard
2. Import your GitHub repository: `Wasif-Karim03/VersityRooms`
3. Vercel will automatically detect it's a Next.js project

### Step 3: Set Up Database

You'll need a PostgreSQL database. Options:

#### Option A: Vercel Postgres (Easiest)
1. In your Vercel project, go to "Storage" tab
2. Click "Create Database" → Select "Postgres"
3. Vercel will automatically add the `POSTGRES_URL` environment variable

#### Option B: Supabase (Free tier available)
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get your database connection string from Settings → Database
4. Use it as `DATABASE_URL` in Vercel

#### Option C: Railway (Free tier available)
1. Go to [https://railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Get the connection string and use it in Vercel

### Step 4: Configure Environment Variables

In your Vercel project settings, add these environment variables:

```
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_SECRET=generate_a_random_secret_key_here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 5: Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or `npm run build`)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`

### Step 6: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your app
3. Once deployed, you'll get a URL like: `https://versityrooms.vercel.app`

### Step 7: Run Database Migrations

After first deployment, you need to run migrations:

1. Go to your Vercel project → Settings → Functions
2. Or use Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel link
npx prisma migrate deploy
```

### Step 8: Seed Database (Optional)

To populate with OWU buildings, you can:
1. Use Vercel CLI to run seed:
```bash
vercel env pull .env.local
npx prisma db seed
```

Or add a one-time API route to seed (for admin use only).

## 🔄 Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy every push to `main` branch
- Create preview deployments for pull requests
- Run builds automatically

## 📝 Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Test authentication flow
- [ ] Test room booking flow
- [ ] Verify admin panel works
- [ ] Check mobile responsiveness

## 🌐 Custom Domain (Optional)

1. Go to your Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 📊 Monitoring

Vercel provides:
- Analytics dashboard
- Function logs
- Performance metrics
- Error tracking

---

## Alternative: Deploy to Netlify

Netlify also supports Next.js:

1. Go to [https://netlify.com](https://netlify.com)
2. Import from GitHub
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables similar to Vercel

---

## Alternative: Deploy to Railway

Railway can host both your app and database:

1. Go to [https://railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Add Node.js service
5. Connect to GitHub repository
6. Railway will auto-deploy

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment

