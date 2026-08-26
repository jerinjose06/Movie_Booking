# Testing Strategy

## 1. Unit Testing (Vitest)
Focuses on isolated business logic and utility functions.
- **Booking State Logic**: Testing Zustand reducers and state transitions.
- **Math/3D Helpers**: Validating coordinate transformations and distance calculations.
- **Validation**: Testing form schemas and data formatters.

## 2. Integration Testing (Vitest + Supabase Local)
- Testing Postgres RPC functions and RLS policies using a local Supabase instance.
- Verifying concurrent seat locking behavior (simulating race conditions in tests).

## 3. End-to-End Testing (Playwright)
Validates the complete user journey in a real browser.
- **Happy Path**: Select movie -> Enter 3D view -> Select Seat -> Checkout -> Success.
- **Concurrency Path**: Two headless browsers attempting to select the same seat simultaneously.
- **Accessibility Fallback**: Navigating the 2D fallback view and completing a booking.

## 4. Visual / 3D Testing
- Automated testing of WebGL canvas is difficult.
- Use Playwright screenshot comparisons for the 2D UI overlay.
- Keep 3D logic simple and rely on manual QA for visual anomalies in the 3D space, or use specialized visual regression tools if budget permits.
