import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54021';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function holdSeats(showId: string, seatIds: number[], userId: string, bookingId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('hold_seats', {
    p_show_id: showId,
    p_seat_ids: seatIds,
    p_user_id: userId,
    p_booking_id: bookingId
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function confirmBooking(bookingId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('confirm_booking', {
    p_booking_id: bookingId
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
