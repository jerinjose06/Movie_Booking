import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { BookingClient } from './BookingClient';

export default async function BookingPage({ params }: { params: { showId: string } }) {
  const supabase = await createClient();
  const { showId } = await params;

  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login'); // We need auth for booking
  }

  // Get profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Get show
  const { data: show } = await supabase
    .from('shows')
    .select('*, movies(*), auditoriums(*, theatres(*))')
    .eq('id', showId)
    .single();

  if (!show) {
    notFound();
  }

  // Get seats
  const { data: seats } = await supabase
    .from('show_seats')
    .select(`
      id, show_id, seat_id, status, held_by,
      seats (
        id, seat_number,
        seat_rows ( id, row_name ),
        seat_types ( id, name, base_price )
      )
    `)
    .eq('show_id', showId);

  // Flatten seat data for the client
  const flattenedSeats = seats?.map(s => {
    // Supabase types might infer s.seats as an array depending on the join
    const seatData: any = Array.isArray(s.seats) ? s.seats[0] : s.seats;
    const rowData = Array.isArray(seatData?.seat_rows) ? seatData?.seat_rows[0] : seatData?.seat_rows;
    const typeData = Array.isArray(seatData?.seat_types) ? seatData?.seat_types[0] : seatData?.seat_types;
    
    // Calculate price
    const basePrice = typeData?.base_price || 10.00;
    const price = basePrice * (show.base_price_multiplier || 1);
    
    return {
      id: s.seat_id, // We use the physical seat ID for the UI
      seat_id: s.seat_id,
      show_seat_id: s.id,
      row_id: rowData?.id || 1,
      row_identifier: rowData?.row_name || 'A',
      seat_number: seatData?.seat_number,
      type_id: typeData?.id || 1,
      status: s.status,
      held_by: s.held_by,
      price: price
    };
  }) || [];

  return (
    <>
      <BookingClient show={show} initialSeats={flattenedSeats} userProfile={profile} />
    </>
  );
}
