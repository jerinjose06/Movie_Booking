-- Initial Schema

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'theatre_owner', 'admin');
CREATE TYPE seat_status AS ENUM ('AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Theatres
CREATE TABLE theatres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auditoriums
CREATE TABLE auditoriums (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    theatre_id UUID NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Screens
CREATE TABLE screens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auditorium_id BIGINT NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- Seat Types
CREATE TABLE seat_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0)
);

-- Seat Rows
CREATE TABLE seat_rows (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auditorium_id BIGINT NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
    row_name TEXT NOT NULL,
    UNIQUE(auditorium_id, row_name)
);

-- Seats
CREATE TABLE seats (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    row_id BIGINT NOT NULL REFERENCES seat_rows(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL,
    seat_type_id BIGINT NOT NULL REFERENCES seat_types(id),
    pos_x DOUBLE PRECISION,
    pos_y DOUBLE PRECISION,
    pos_z DOUBLE PRECISION,
    UNIQUE(row_id, seat_number)
);

-- Movies
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    duration_mins INTEGER NOT NULL CHECK (duration_mins > 0),
    description TEXT,
    release_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shows
CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    auditorium_id BIGINT NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    base_price_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    show_id UUID NOT NULL REFERENCES shows(id),
    status booking_status NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Show Seats (The intersection of Physical Seat and Show)
CREATE TABLE show_seats (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_id BIGINT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    status seat_status NOT NULL DEFAULT 'AVAILABLE',
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    hold_expires_at TIMESTAMPTZ,
    UNIQUE(show_id, seat_id)
);

CREATE INDEX idx_show_seats_show_id ON show_seats(show_id);
CREATE INDEX idx_show_seats_status ON show_seats(status);
CREATE INDEX idx_show_seats_expires ON show_seats(hold_expires_at) WHERE status = 'HELD';

-- Booking Items
CREATE TABLE booking_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    show_seat_id BIGINT NOT NULL REFERENCES show_seats(id) ON DELETE RESTRICT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Theatre Models
CREATE TABLE theatre_models (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    theatre_id UUID NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
    model_url TEXT NOT NULL
);

-- Seat View Configurations
CREATE TABLE seat_view_configurations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    seat_id BIGINT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    camera_pos_x DOUBLE PRECISION,
    camera_pos_y DOUBLE PRECISION,
    camera_pos_z DOUBLE PRECISION,
    camera_target_x DOUBLE PRECISION,
    camera_target_y DOUBLE PRECISION,
    camera_target_z DOUBLE PRECISION
);

-- Automatic updated_at triggers
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_theatres_modtime BEFORE UPDATE ON theatres FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
