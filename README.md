# University Room Booking System

A production-ready room booking web application for universities built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Features

- 🎨 Modern, clean design system with light/dark mode support
- 📱 Responsive layout with mobile navigation
- 🎭 Smooth animations with Framer Motion
- 🎯 Type-safe with TypeScript
- 🗄️ Database-ready with Prisma ORM
- 🧩 Reusable UI components with shadcn/ui

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **ORM**: Prisma
- **Database**: PostgreSQL

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (local or remote)

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/university_room_booking?schema=public"
```

### 3. Set Up Database

Generate Prisma Client:

```bash
npm run db:generate
```

Push the schema to your database (for development):

```bash
npm run db:push
```

Or run migrations (for production):

```bash
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── rooms/             # Rooms listing page
│   ├── requests/          # Booking requests page
│   ├── calendar/          # Calendar view page
│   ├── admin/             # Admin panel (role-based)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects to dashboard)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Layout components (nav, sidebar)
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/                   # Utility functions
│   ├── utils.ts          # Utility functions
│   └── prisma.ts         # Prisma client instance
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
├── docs/                 # Documentation
│   ├── architecture.md   # Architecture overview
│   ├── api.md            # API endpoints documentation
│   └── ui.md             # UI screens documentation
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (dev)
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Design System

The application uses a consistent design system with:

- **Colors**: Semantic color tokens for light/dark themes
- **Spacing**: Consistent spacing scale
- **Typography**: Inter font family
- **Shadows**: Soft, subtle shadows for depth
- **Border Radius**: Rounded corners (0.5rem default)
- **Animations**: Smooth transitions and hover states

## Documentation

See the `/docs` folder for detailed documentation:

- `architecture.md` - High-level architecture overview
- `api.md` - API endpoints and data structures
- `ui.md` - UI screens and user flows

## Next Steps

This is a scaffolded project. To implement the full booking system:

1. Set up authentication (NextAuth.js recommended)
2. Implement room listing and search
3. Build booking request flow
4. Add approval workflow for admins
5. Create calendar view with availability
6. Add email notifications
7. Implement user management

## License

MIT

