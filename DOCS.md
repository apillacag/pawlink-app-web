# PawLink — Documentation

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Internationalization (i18n)](#6-internationalization-i18n)
7. [Segment Views — How Each User Role Interacts](#7-segment-views--how-each-user-role-interacts)
8. [API Endpoints](#8-api-endpoints)
9. [How to Run & Test](#9-how-to-run--test)
10. [Test Accounts](#10-test-accounts)
11. [Seed Data Details](#11-seed-data-details)
12. [FAQ & Troubleshooting](#12-faq--troubleshooting)

---

## 1. Architecture Overview

PawLink is a **multi-sided SaaS marketplace** built with **Next.js 16** using the **App Router**. It connects three user segments:

| Segment | Role | Needs |
|---------|------|-------|
| **Pet Owners** | `OWNER` | Book walks, manage pets, find specialists |
| **Dog Walkers** | `WALKER` | Manage walks, track earnings |
| **Behavior Specialists** | `SPECIALIST` | Manage consultations, build reputation |
| **Admins** | `ADMIN` | Oversee platform, manage users & bookings |

### Data Flow

```
Browser → Next.js Proxy (auth check) → Server Component / API Route → Prisma → SQLite
                                        ↕
                                   Client Component
                                   (useI18n / fetch)
```

- **Server Components** render HTML directly, fetching data from Prisma.
- **Client Components** (`"use client"`) handle interactivity and call API routes.
- **API Routes** handle mutations (create, update, delete) and auth.
- **Proxy** (formerly Middleware) checks JWT cookies and redirects unauthenticated users.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Database** | SQLite (via Prisma 7) |
| **ORM** | Prisma 7 with `@prisma/adapter-better-sqlite3` |
| **Auth** | JWT (jsonwebtoken) + bcryptjs, httpOnly cookies |
| **Icons** | Lucide React |
| **Validation** | Zod |
| **i18n** | Custom React Context + JSON dictionaries |

---

## 3. Project Structure

```
pawlink-app-web/
├── prisma/
│   ├── schema.prisma          # Database models
│   ├── seed.ts                # Dummy data seeder
│   ├── migrations/            # Migration files
│   └── dev.db                 # SQLite database file
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (client) with I18nProvider
│   │   ├── page.tsx           # Landing page (client)
│   │   ├── proxy.ts           # Auth proxy (replaces middleware)
│   │   ├── globals.css        # Tailwind v4 styles
│   │   ├── (auth)/            # Login & Register pages
│   │   ├── dashboard/         # Dashboard pages (all segments)
│   │   │   ├── layout.tsx     # Dashboard layout + nav
│   │   │   ├── page.tsx       # Dashboard overview
│   │   │   ├── owner/         # Pet owner pages
│   │   │   ├── walker/        # Dog walker pages
│   │   │   └── specialist/    # Specialist pages
│   │   ├── admin/             # Admin panel pages
│   │   ├── walkers/           # Public walker listing
│   │   ├── specialists/       # Public specialist listing
│   │   ├── about/             # About page
│   │   └── api/               # REST API routes
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   ├── ui/                # Button, Input, Card, Badge, etc.
│   │   └── maps/              # (Future) Walk tracker map
│   ├── i18n/
│   │   ├── config.ts          # Locale definitions
│   │   ├── context.tsx        # I18nProvider + useI18n hook (client)
│   │   ├── server.ts          # getServerTranslations (server)
│   │   └── dictionaries/      # en.json, es.json
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # Auth helpers (hash, verify, getSession)
│   │   ├── jwt.ts             # JWT helpers (no prisma dependency)
│   │   ├── utils.ts           # cn(), formatCurrency(), etc.
│   │   └── validations.ts     # Zod schemas
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── prisma.config.ts           # Prisma 7 config
├── .env                       # Environment variables
├── DOCS.md                    # This file
└── package.json
```

---

## 4. Database Schema

### Entity Relationship Diagram (Text)

```
User ──1:1──> WalkerProfile ──1:N──> Availability
  │                                  └── WalkerPhoto
  │
  ├──1:N──> Pet
  │
  ├──1:N──> Booking (as owner)
  │         ├──> WalkUpdate (1:N)
  │         ├──> Review (1:1)
  │         └──> Payment (1:1)
  │
  ├──1:N──> Booking (as walker)
  ├──1:N──> Booking (as specialist)
  ├──1:N──> Notification
  └──1:N──> Payment
```

### Key Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **User** | email, passwordHash, role (OWNER/WALKER/SPECIALIST/ADMIN), isVerified, isPremium | Central identity |
| **Pet** | name, species, breed, age, weight, ownerId | Pets registered by owners |
| **WalkerProfile** | userId, ratePerWalk, rating, reviewCount, latitude, longitude, isFeatured | Walker professional info |
| **SpecialistProfile** | userId, ratePerSession, specialties, rating | Specialist professional info |
| **Availability** | walkerId, dayOfWeek, startTime, endTime | Walker's available hours |
| **Booking** | ownerId, walkerId, petId, specialistId, status, scheduledAt, duration, totalAmount | Service booking |
| **WalkUpdate** | bookingId, type (LOCATION/PHOTO/NOTE), latitude, longitude | Real-time walk tracking |
| **Review** | bookingId, rating (1-5), comment | Post-service review |
| **Payment** | bookingId, amount, status, stripePaymentId | Payment tracking |
| **Notification** | userId, type, title, message, read | User notifications |

### Booking Statuses

| Status | Meaning |
|--------|---------|
| `PENDING` | Awaiting walker confirmation |
| `CONFIRMED` | Walker accepted |
| `IN_PROGRESS` | Walk is currently happening |
| `COMPLETED` | Walk finished successfully |
| `CANCELLED` | Booking cancelled |

---

## 5. Authentication & Authorization

### How Auth Works

1. **Registration** (`POST /api/auth/register`): Creates user + optional profile (WalkerProfile or SpecialistProfile). Returns JWT set as httpOnly cookie.
2. **Login** (`POST /api/auth/login`): Verifies credentials. Returns JWT cookie.
3. **Logout** (`GET /api/auth/logout`): Clears cookie, redirects to `/`.
4. **Proxy** (`src/proxy.ts`): Runs on every request. Checks JWT cookie, redirects to `/login` if missing, blocks non-admin from `/admin`.

### Cookie

- Name: `pawlink_token`
- httpOnly (not accessible to JavaScript)
- Expires: 7 days
- Path: `/`

### Role-Based Access

| Route | Allowed Roles | Notes |
|-------|--------------|-------|
| `/` | All | Public |
| `/login`, `/register` | All | Redirect to `/dashboard` if already logged in |
| `/dashboard` | OWNER, WALKER, SPECIALIST | Shows role-specific content |
| `/dashboard/owner/*` | OWNER | Pets, bookings, find walkers |
| `/dashboard/walker/*` | WALKER | Walks, earnings, profile |
| `/dashboard/specialist/*` | SPECIALIST | Consultations, profile |
| `/admin` | ADMIN | User/booking management |

---

## 6. Internationalization (i18n)

### Architecture

- **Client Components**: Use `useI18n()` hook from `@/i18n/context`
  ```tsx
  "use client"
  import { useI18n } from "@/i18n/context"
  function MyComponent() {
    const { t } = useI18n()
    return <h1>{t("home.heroTitle")}</h1>
  }
  ```

- **Server Components**: Use `getServerTranslations()` from `@/i18n/server`
  ```tsx
  import { getServerTranslations } from "@/i18n/server"
  async function MyPage() {
    const { t } = await getServerTranslations()
    return <h1>{t("dashboard.title")}</h1>
  }
  ```

### Adding a New Language

1. Create `src/i18n/dictionaries/fr.json`
2. Add `"fr"` to `locales` array in `src/i18n/config.ts`
3. Add locale name to `localeNames` and `localeLabels`
4. All dictionary keys must match the structure in `en.json`

### Toggle

The **EN/ES** toggle button is in the Navbar (both desktop & mobile). It sets a `pawlink_locale` cookie (1-year expiry) and switches the dictionary on the fly.

---

## 7. Segment Views — How Each User Role Interacts

### 👤 Pet Owner (`OWNER`)

**Path**: `/dashboard/owner/*`

| Page | URL | Description |
|------|-----|-------------|
| Dashboard Overview | `/dashboard` | Stats: pets count, bookings, upcoming |
| My Pets | `/dashboard/owner/pets` | List of registered pets |
| Add Pet | `/dashboard/owner/pets/new` | Register a new pet |
| Pet Details | `/dashboard/owner/pets/[id]` | View pet info + walk history |
| My Bookings | `/dashboard/owner/bookings` | All bookings, filter by status |
| Find Walkers | `/dashboard/owner/walkers` | Browse available walkers → Book a walk |
| Specialists | `/dashboard/owner/specialists` | Browse behavior specialists → Book consultation |

**Flow**: Register → Add pet(s) → Browse walkers → Book walk → Track walk → Rate walker

### 🐕 Dog Walker (`WALKER`)

**Path**: `/dashboard/walker/*`

| Page | URL | Description |
|------|-----|-------------|
| Dashboard Overview | `/dashboard` | Stats: total walks, completed, earnings |
| My Walks | `/dashboard/walker/walks` | All assigned walks with status |
| Walk Details | `/dashboard/walker/walks/[id]` | Pet info, owner info, walk updates |
| Earnings | `/dashboard/walker/earnings` | Payment history + stats |
| Profile | `/dashboard/walker/profile` | Edit bio, rate, certifications, availability |

**Flow**: Register → Complete profile → Get booked → Walk dog → Receive payment → Get reviewed

### 🧪 Animal Behavior Specialist (`SPECIALIST`)

**Path**: `/dashboard/specialist/*`

| Page | URL | Description |
|------|-----|-------------|
| Dashboard Overview | `/dashboard` | Stats: sessions, completed |
| Consultations | `/dashboard/specialist/consultations` | All scheduled consultations |
| Profile | `/dashboard/specialist/profile` | Edit bio, credentials, rate, specialties |

### 🔧 Admin (`ADMIN`)

**Path**: `/admin/*`

| Page | URL | Description |
|------|-----|-------------|
| Admin Dashboard | `/admin` | Platform-wide stats: users, bookings, walkers, revenue |
| Manage Users | `/admin/users` | Table of all users with roles, verification status |
| Manage Bookings | `/admin/bookings` | Table of all bookings with status, amounts |

---

## 8. API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/auth/logout` | No | Clear session |
| GET | `/api/pets` | OWNER | List my pets |
| POST | `/api/pets` | OWNER | Create pet |
| GET | `/api/pets/[id]` | OWNER | Get pet details |
| DELETE | `/api/pets/[id]` | OWNER | Delete pet |
| GET | `/api/walkers` | No | List available walkers |
| GET | `/api/walkers/profile` | WALKER | Get my walker profile |
| PUT | `/api/walkers/profile` | WALKER | Update walker profile |
| GET | `/api/specialists` | No | List available specialists |
| GET | `/api/specialists/profile` | SPECIALIST | Get my specialist profile |
| PUT | `/api/specialists/profile` | SPECIALIST | Update specialist profile |
| GET | `/api/bookings` | Yes | List my bookings |
| POST | `/api/bookings` | OWNER | Create booking |
| GET | `/api/bookings/[id]` | Yes | Get booking details |
| PATCH | `/api/bookings/[id]` | Yes | Update booking status |
| POST | `/api/reviews` | OWNER | Create review |
| GET | `/api/walks` | WALKER | List my walks |
| POST | `/api/walks/[id]` | WALKER | Add walk update |
| GET | `/api/notifications` | Yes | List notifications |
| PATCH | `/api/notifications` | Yes | Mark all read |
| GET | `/api/dashboard/stats` | Yes | Dashboard statistics |
| GET | `/api/admin/stats` | ADMIN | Platform statistics |
| GET | `/api/users` | ADMIN | List all users |
| PATCH | `/api/users/[id]` | ADMIN | Update user |
| DELETE | `/api/users/[id]` | ADMIN | Delete user |

---

## 9. How to Run & Test

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Run database migration (creates SQLite database)
npx prisma migrate dev --name init

# 3. Seed the database with test data
npm run seed

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run seed` | Seed database with test data |
| `npm run reset` | Reset database + re-seed |
| `npm run lint` | Run ESLint |

### Testing the App

#### Test Each User Segment

1. **As a Pet Owner** — Login as `alice@pawlink.com` / `password123`
   - View dashboard → see 3 pets, bookings stats
   - Go to "My Pets" → see Max, Luna
   - Go to "Find Walkers" → see Daniel, Emma, Frank
   - Go to "My Bookings" → see walk history and upcoming walks

2. **As a Dog Walker** — Logout → login as `daniel@pawlink.com` / `password123`
   - View dashboard → total walks, earnings
   - Go to "My Walks" → see assigned walks
   - Go to "Earnings" → see payment history

3. **As a Specialist** — Logout → login as `grace@pawlink.com` / `password123`
   - View dashboard → sessions count
   - Go to "Consultations" → see consultations

4. **As an Admin** — Logout → login as `admin@pawlink.com` / `password123`
   - View admin dashboard → platform stats
   - Go to "Manage Users" → see all users
   - Go to "Manage Bookings" → see all bookings

#### Switching Users

The **logout icon** (red door icon) is always visible in the navbar when logged in. Click it to sign out, then sign in with a different account.

#### Internationalization

Click the **EN/ES** toggle in the navbar to switch between English and Spanish. All page content will update instantly.

---

## 10. Test Accounts

All accounts use password: **`password123`**

| Role | Email | Name | Notes |
|------|-------|------|-------|
| **Admin** | admin@pawlink.com | Admin User | Full platform access |
| **Owner** | alice@pawlink.com | Alice Johnson | 2 pets (Max, Luna), premium |
| **Owner** | bob@pawlink.com | Bob Williams | 2 pets (Charlie, Bella) |
| **Owner** | carol@pawlink.com | Carol Martinez | 1 pet (Rocky), premium |
| **Walker** | daniel@pawlink.com | Daniel Smith | 5★, $20/hr, featured, 340 walks |
| **Walker** | emma@pawlink.com | Emma Davis | 4.8★, $18/hr, featured, 210 walks |
| **Walker** | frank@pawlink.com | Frank Lopez | New, $15/hr, 45 walks |
| **Specialist** | grace@pawlink.com | Grace Taylor | PhD, $60/session, 520 sessions |
| **Specialist** | henry@pawlink.com | Henry Brown | CPDT-KA, $50/session, 310 sessions |

---

## 11. Seed Data Details

The seed creates:

| Entity | Count | Details |
|--------|-------|---------|
| Users | 9 | 1 admin, 3 owners, 3 walkers, 2 specialists |
| Pets | 5 | 4 dogs, 1 cat |
| Walker Profiles | 3 | With bio, rates, ratings, coordinates |
| Availabilities | 18 | Schedules for all 3 walkers |
| Specialist Profiles | 2 | With credentials, rates |
| Bookings | 9 | Mix of completed, confirmed, pending, in-progress |
| Walk Updates | 5 | GPS locations + notes for in-progress/completed walks |
| Reviews | 3 | 5-star reviews with comments |
| Payments | 5 | Completed payments |
| Notifications | 6 | Various types for different users |

### Unique Scenario: Booking with Specialists

Bookings `bkg-008` and `bkg-009` demonstrate consultation bookings. Note that `ownerId` and `walkerId` are set to the same user (the pet owner) since there's no "walker" for a consultation — the `specialistId` field holds the specialist. This is a current platform design consideration.

---

## 12. FAQ & Troubleshooting

### Q: I get "Database does not exist" when running the app
**A**: Run `npx prisma migrate dev --name init` then `npm run seed`.

### Q: I want to reset all data
**A**: Run `npm run reset` — this drops and recreates the database, then re-seeds.

### Q: How do I see my own user data?
**A**: Check the database directly with `npx prisma studio`.

### Q: The logout icon isn't working
**A**: It links to `/api/auth/logout`. Ensure the server is running. Check browser console for errors.

### Q: How do I add a new language?
**A**: See [Internationalization](#6-internationalization-i18n) section.

### Q: Can I change from SQLite to PostgreSQL?
**A**: Yes. Update `prisma/schema.prisma` datasource provider to `"postgresql"`, remove `@prisma/adapter-better-sqlite3`, install the appropriate Prisma adapter, update `prisma.config.ts` and `src/lib/prisma.ts`.
