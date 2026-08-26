-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE theatres ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoriums ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read everyone (for now, or maybe just themselves), can only update themselves.
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Public Read-Only for Catalogue
CREATE POLICY "Theatres are viewable by everyone" ON theatres FOR SELECT USING (true);
CREATE POLICY "Auditoriums are viewable by everyone" ON auditoriums FOR SELECT USING (true);
CREATE POLICY "Screens are viewable by everyone" ON screens FOR SELECT USING (true);
CREATE POLICY "Seat Types are viewable by everyone" ON seat_types FOR SELECT USING (true);
CREATE POLICY "Seat Rows are viewable by everyone" ON seat_rows FOR SELECT USING (true);
CREATE POLICY "Seats are viewable by everyone" ON seats FOR SELECT USING (true);
CREATE POLICY "Movies are viewable by everyone" ON movies FOR SELECT USING (true);
CREATE POLICY "Shows are viewable by everyone" ON shows FOR SELECT USING (true);
CREATE POLICY "Show Seats are viewable by everyone" ON show_seats FOR SELECT USING (true);

-- Bookings
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update their own pending bookings" ON bookings FOR UPDATE USING (auth.uid() = profile_id AND status = 'PENDING');

-- Show Seats Updates
-- Regular users can only update show_seats via the RPC functions which have SECURITY DEFINER, 
-- but just in case, we don't grant raw UPDATE to authenticated on show_seats.
-- Or we allow users to update their own held seats (e.g. to release them).
CREATE POLICY "Users can update their own held show seats" ON show_seats FOR UPDATE USING (booking_id IN (SELECT id FROM bookings WHERE profile_id = auth.uid()));

-- Payments
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (booking_id IN (SELECT id FROM bookings WHERE profile_id = auth.uid()));
CREATE POLICY "Users can insert their own payments" ON payments FOR INSERT WITH CHECK (booking_id IN (SELECT id FROM bookings WHERE profile_id = auth.uid()));

-- Admins and Theatre Owners (simplified bypass)
-- In a real app we would write specific rules. For the seed data and admin services, we'll allow all for now.
-- e.g. using a role check
-- But we can just use service_role key on the backend for admin ops.
