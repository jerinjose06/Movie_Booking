import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { BookingClient } from './BookingClient';

export default async function BookingPage({ params }: { params: Promise<{ showId: string }> }) {
  const supabase = await createClient();
  const { showId } = await params;

  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/booking/${showId}`);
  }

  // Fetch profile, show details, and show seats concurrently in parallel
  const [profileRes, showRes, seatsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('shows').select('*, movies(*), auditoriums(*, theatres(*))').eq('id', showId).single(),
    supabase.from('show_seats').select(`
      id, show_id, seat_id, status, held_by,
      seats (
        id, seat_number, pos_x, pos_y, pos_z,
        seat_rows ( id, row_name ),
        seat_types ( id, name, base_price )
      )
    `).eq('show_id', showId)
  ]);

  const show = showRes.data;
  const profile = profileRes.data;
  const seats = seatsRes.data;

  if (!show) {
    notFound();
  }

  if (new Date(show.start_time) < new Date()) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">Show Unavailable</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">This show has already ended or is no longer available for booking.</p>
        <a href="/" className="bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20">Back to Home</a>
      </div>
    );
  }

  // Flatten seat data for client
  const baseMultiplier = show.base_price_multiplier || 1;
  const flattenedSeats = seats?.map(s => {
    const seatData: any = Array.isArray(s.seats) ? s.seats[0] : s.seats;
    const rowData = Array.isArray(seatData?.seat_rows) ? seatData?.seat_rows[0] : seatData?.seat_rows;
    const typeData = Array.isArray(seatData?.seat_types) ? seatData?.seat_types[0] : seatData?.seat_types;
    
    const basePrice = typeData?.base_price || 10.00;
    const price = basePrice * baseMultiplier;
    
    return {
      id: s.seat_id,
      seat_id: s.seat_id,
      show_seat_id: s.id,
      row_id: rowData?.id || 1,
      row_identifier: rowData?.row_name || 'A',
      seat_number: seatData?.seat_number,
      pos_x: seatData?.pos_x,
      pos_y: seatData?.pos_y,
      pos_z: seatData?.pos_z,
      type_id: typeData?.id || 1,
      status: s.status,
      held_by: s.held_by,
      price: price
    };
  }) || [];

  return (
    <BookingClient show={show} initialSeats={flattenedSeats} userProfile={profile} />
  );
}
