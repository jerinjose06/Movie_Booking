import { describe, it, expect, beforeAll } from 'vitest';
import { holdSeats, confirmBooking } from './booking.service';
import { createClient } from '@supabase/supabase-js';

// We will use the service role key for testing to bypass RLS initially, 
// or simulate an authenticated user if needed.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54021';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Booking Service', () => {
  let showId: string;
  let seatId: number;
  let userId: string;

  beforeAll(async () => {
    // Fetch the seeded show and seat
    const { data: shows } = await supabase.from('shows').select('id').limit(1);
    if (shows && shows.length > 0) showId = shows[0].id;

    const { data: seats } = await supabase.from('show_seats').select('seat_id').eq('show_id', showId).eq('status', 'AVAILABLE').limit(1);
    if (seats && seats.length > 0) seatId = seats[0].seat_id;
    
    userId = 'd5d9c72e-0f0e-4340-81f7-e4620f4c2c62';
  });

  it('should successfully hold an available seat', async () => {
    expect(showId).toBeDefined();
    expect(seatId).toBeDefined();

    const bookingId = crypto.randomUUID();
    
    // Create the booking first
    await supabase.from('bookings').insert({
      id: bookingId,
      profile_id: userId,
      show_id: showId,
      status: 'PENDING',
      total_amount: 0
    });

    const success = await holdSeats(showId, [seatId], userId, bookingId);
    expect(success).toBe(true);

    // Verify it is held in DB
    const { data } = await supabase.from('show_seats').select('status, booking_id').eq('show_id', showId).eq('seat_id', seatId).single();
    expect(data?.status).toBe('HELD');
    expect(data?.booking_id).toBe(bookingId);
  });

  it('should fail to hold an already held seat (prevent double booking)', async () => {
    const anotherBookingId = crypto.randomUUID();
    
    await supabase.from('bookings').insert({
      id: anotherBookingId,
      profile_id: userId,
      show_id: showId,
      status: 'PENDING',
      total_amount: 0
    });
    
    // We expect this to throw an error since the seat is already held from previous test
    await expect(holdSeats(showId, [seatId], userId, anotherBookingId)).rejects.toThrow('One or more seats are not available');
  });

  it('should confirm a booking successfully', async () => {
    // Get the booking_id we just created in the first test
    const { data: seatData } = await supabase.from('show_seats').select('booking_id').eq('show_id', showId).eq('seat_id', seatId).single();
    const bookingId = seatData?.booking_id;
    
    const confirmed = await confirmBooking(bookingId);
    expect(confirmed).toBe(true);

    const { data } = await supabase.from('show_seats').select('status').eq('show_id', showId).eq('seat_id', seatId).single();
    expect(data?.status).toBe('BOOKED');
  });
});
