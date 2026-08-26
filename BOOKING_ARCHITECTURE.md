# Booking Concurrency Architecture

## The Problem
Multiple users may attempt to book the exact same seat simultaneously. The system must prevent double booking and ensure a fair "first-come, first-served" holding mechanism during checkout.

## State Machine
A seat in a specific showtime can be:
1. **Available**: Free to book.
2. **Held**: Temporarily locked for a user (e.g., 5 minutes) during checkout.
3. **Booked**: Successfully purchased.

## Database Strategy
- **Hold Seat RPC**: A Supabase Postgres RPC function `hold_seat(p_showtime_id, p_seat_id, p_user_id)`.
  - Begins a transaction.
  - Checks if an active hold exists (status = 'Held' and `held_until` > NOW()) OR status = 'Booked'.
  - If yes, throws an error / returns false.
  - If no, inserts/updates the record to 'Held' with `held_until` = NOW() + 5 minutes.
  - Commits transaction.

## Realtime Updates
- The frontend subscribes to Supabase Realtime on the `booking_seats` table for the current `showtime_id`.
- When a seat transitions to 'Held' or 'Booked', the 3D viewer instantly updates to show the seat as unavailable.

## Expiration Handling
- A background cron job (or Postgres `pg_cron`) cleans up expired holds, OR the RPC simply treats expired holds as 'Available' and overwrites them.

## Final Checkout
- Verifies the hold is still valid.
- Charges the user.
- Updates the status to 'Booked'.
