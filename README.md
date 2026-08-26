# ?? 3D Movie Theatre Booking App

A full-stack, real-time movie theatre ticket booking application with an immersive 3D seat selection experience, live multi-user seat availability updates, and a sleek dark cinema-themed UI.

---

## ? Features

- **3D Interactive Theatre** — Walk around the theatre in first-person, jump on seats to hold them, and see real-time availability in 3D
- **2D Seat Map** — Traditional overhead seat map with colour-coded availability
- **Real-Time Multi-User Sync** — When User A holds a seat, User B instantly sees it turn yellow — no page refresh required (powered by Supabase Realtime)
- **Secure Checkout** — Payment integration via Stripe (+ mock success webhook for development)
- **Admin Panel** — Manage theatres, auditoriums, movies, shows, and bookings
- **3D Theatre Editor** — Drag-and-drop seat layout editor built on React Three Fiber
- **Authentication** — Email/password auth with Supabase Auth
- **Booking History** — View and download e-tickets for past bookings
- **Race Condition Prevention** — Database-level seat locking via PostgreSQL functions; only one user can successfully book a seat

---

## ??? Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| 3D Engine | React Three Fiber + @react-three/drei |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Real-Time | Supabase Realtime (Postgres Changes) |
| Payments | Stripe |
| State Management | Zustand |
| Icons | Lucide React |

---

## ?? Getting Started

### Prerequisites

- Node.js v18+
- A Supabase project
- A Stripe account (for payment processing)

### 1. Clone the repository

```bash
git clone https://github.com/jerinjose06/Movie_Booking.git
cd Movie_Booking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the Database

Run the SQL migrations from the Supabase SQL Editor. The migrations set up:
- Tables: `profiles`, `movies`, `theatres`, `auditoriums`, `seats`, `seat_rows`, `seat_types`, `shows`, `show_seats`, `bookings`, `booking_seats`
- PostgreSQL functions: `hold_seats`, `checkout_held_seats`, `release_expired_holds`

### 5. Enable Supabase Realtime

In your Supabase dashboard, enable **Realtime** for the `show_seats` table.

### 6. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## ?? Project Structure

```
src/
+-- app/                    # Next.js App Router pages
¦   +-- admin/              # Admin management panel
¦   +-- booking/[showId]/   # Seat selection & booking flow
¦   +-- checkout/           # Payment checkout
¦   +-- movies/             # Movie listing & details
¦   +-- theatres/           # Theatre listing & details
¦   +-- tickets/            # E-ticket viewer
¦   +-- api/                # API routes (checkout, webhooks)
+-- components/
¦   +-- booking/            # SeatSelector, TwoDSeatMap, RealtimeSync
¦   +-- theatre3d/          # TheatreScene, SeatMesh, CameraController
¦   +-- ui/                 # Shared UI components
+-- hooks/                  # Custom React hooks
+-- store/                  # Zustand state stores
+-- utils/                  # Supabase client, seat mapping, helpers
```

---

## ?? Key User Flows

### Booking a Ticket
1. Browse movies on the home page
2. Click a movie ? view details and available shows
3. Select a show ? choose seats in 2D Map or 3D View
4. Seats are temporarily held while you complete checkout
5. Complete Stripe payment ? booking confirmed
6. View your e-ticket in Account ? Bookings

### Real-Time Seat Sync
- All users viewing the same show share live seat state via Supabase Realtime
- Held seats appear **yellow**, booked seats appear **dark/unavailable**
- If the connection drops, the app automatically reconnects and reconciles state

---

## ?? Testing Real-Time (Two Browsers)

1. Open the booking page for any show in **two separate browser windows**
2. In Window A, click a seat — it should immediately appear yellow in Window B
3. Attempt to book the same seat from both windows — only one will succeed

---

## ?? License

MIT
