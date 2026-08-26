# Project Development Phases

## Phase 1: Foundation & Authentication
- Setup Next.js, Tailwind, shadcn/ui, and TypeScript configurations.
- Integrate Supabase client.
- Implement user authentication (Sign up, Login, Session management).
- Setup CI/CD and linting rules.

## Phase 2: Database Schema & Admin API
- Create PostgreSQL schema (Theatres, Screens, Movies, Showtimes, Seats).
- Implement RLS policies.
- Build internal API/service functions for data retrieval.
- (Optional) Minimal admin interface for configuring a theatre and showtime.

## Phase 3: Booking Engine Logic (Headless)
- Implement seat locking mechanism (temporary hold).
- Implement final booking transaction.
- Create Vitest unit tests for concurrency and double-booking scenarios.
- Implement Supabase Realtime broadcasts for seat status changes.

## Phase 4: 3D Engine & Viewer
- Setup React Three Fiber canvas.
- Load simple 3D models (Seat, Room).
- Map database seat coordinates to 3D space.
- Implement camera controls (pan, zoom, click-to-focus on seat).
- Add visual indicators for seat states (Available, Locked, Booked).

## Phase 5: Integration & User Flow
- Build 2D UI overlays (Movie selection, Showtime selection, Checkout modal).
- Connect Zustand store with 3D interactions and booking API.
- Implement accessibility fallback (2D standard seat map).

## Phase 6: Polish, Performance & E2E Testing
- Optimize 3D assets and rendering (InstancedMesh).
- Write Playwright E2E tests covering the complete booking flow.
- Finalize mobile responsive styles and touch controls for the 3D viewer.
