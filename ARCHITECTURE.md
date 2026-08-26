# 3D Movie Theatre Booking - Architecture

## System Overview
The platform is a 3D interactive movie theatre seat booking system. It leverages modern web technologies to provide a rich, immersive booking experience on desktop, with responsive and accessible fallbacks for mobile or non-3D users.

### Tech Stack
- **Frontend Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **3D Engine**: React Three Fiber, Three.js, Drei
- **State Management**: Zustand
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime)
- **Testing**: Playwright (E2E), Vitest (Unit)

## Core Principles
- **Modularity**: Separation between presentation, domain logic, data access, 3D rendering, and booking logic.
- **Independence**: The 3D engine is a visualization layer; the booking engine operates independently.
- **Scalability & Concurrency**: The system is designed to handle high concurrency, ensuring no double bookings.
- **Security**: Strict Row Level Security (RLS) in Supabase. Never expose service-role credentials.

## Folder Structure
```
/
├── src/
│   ├── app/                # Next.js App Router (Pages & API routes)
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui generic components
│   │   ├── 3d/             # R3F components (Auditorium, Seat, Avatar, CameraControls)
│   │   └── domain/         # Domain-specific components (TheatreSelector, Checkout)
│   ├── lib/                # Shared utilities, Supabase client
│   ├── store/              # Zustand stores (e.g., bookingStore, sceneStore)
│   ├── services/           # API/Service boundaries (Data access, external APIs)
│   └── types/              # TypeScript interfaces and type definitions
├── supabase/
│   ├── migrations/         # PostgreSQL schema and migrations
│   └── seed.sql            # Dummy data for development
├── tests/
│   ├── e2e/                # Playwright tests
│   └── unit/               # Vitest tests
```

## API / Service Boundaries
1. **Auth Service**: Manages user sessions, login, and registration via Supabase Auth.
2. **Theatre Service**: Fetches theatres, screens, layouts, and movies. Read-heavy.
3. **Booking Service**: Handles seat reservations, checkout, and confirmations. Write-heavy, requires strict concurrency control.
4. **Realtime Service**: Subscribes to Supabase Realtime to push live seat status updates (Available, Locked, Booked) to connected clients.
