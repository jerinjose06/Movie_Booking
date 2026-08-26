# Database Design

## Entities

### `theatres`
- `id` (UUID, PK)
- `name` (String)
- `location` (String)

### `screens`
- `id` (UUID, PK)
- `theatre_id` (UUID, FK)
- `name` (String)
- `model_url` (String, optional 3D room model)

### `movies`
- `id` (UUID, PK)
- `title` (String)
- `duration_mins` (Integer)

### `showtimes`
- `id` (UUID, PK)
- `movie_id` (UUID, FK)
- `screen_id` (UUID, FK)
- `start_time` (Timestamp)

### `seats`
- `id` (UUID, PK)
- `screen_id` (UUID, FK)
- `row_identifier` (String)
- `seat_number` (Integer)
- `type` (Enum: Standard, VIP, Accessible)
- `price` (Decimal)
- `pos_x`, `pos_y`, `pos_z` (Float - 3D coordinates)

### `bookings`
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `showtime_id` (UUID, FK)
- `status` (Enum: Pending, Confirmed, Cancelled)
- `created_at` (Timestamp)

### `booking_seats` (Junction Table)
- `booking_id` (UUID, FK, PK)
- `seat_id` (UUID, FK, PK)
- `status` (Enum: Held, Booked)
- `held_until` (Timestamp)

## Security & Row Level Security (RLS)
- **Public**: Can read theatres, screens, movies, showtimes, seats, and seat statuses.
- **Authenticated Users**: Can insert `bookings` and `booking_seats` for themselves. Can read their own bookings.
- **Admins**: Bypass RLS or have specific roles to manage layout and schedules.

## Concurrency
- Use unique constraints on `(showtime_id, seat_id)` for booked seats.
- Use PostgreSQL transactional functions (RPC) to handle "Hold Seat" logic, checking if a seat is currently held by someone else before allowing a lock.
