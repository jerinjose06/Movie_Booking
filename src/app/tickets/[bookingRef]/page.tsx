import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

export default async function TicketPage({ params }: { params: { bookingRef: string } }) {
  const supabase = await createClient();
  const { bookingRef } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      shows(
        start_time,
        movies(title, duration_mins),
        auditoriums(
          name,
          theatres(name, location)
        )
      ),
      booking_items(
        price,
        show_seats(
          seats(
            seat_number,
            seat_rows(row_name)
          )
        )
      )
    `)
    .eq('booking_reference', bookingRef)
    .eq('profile_id', user.id)
    .single();

  if (error || !booking) {
    notFound();
  }

  // Formatting helpers
  const showDate = new Date(booking.shows.start_time).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const showTime = new Date(booking.shows.start_time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  const seatLabels = booking.booking_items.map((item: any) => 
    `${item.show_seats.seats.seat_rows.row_name}${item.show_seats.seats.seat_number}`
  ).join(', ');

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl w-full">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-3xl font-bold mb-1">Booking Confirmed!</h1>
          <p className="text-blue-100">Thank you for your purchase.</p>
        </div>
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Movie</p>
              <h2 className="text-2xl font-bold text-gray-900">{booking.shows.movies.title}</h2>
              <p className="text-gray-600 mt-1">{booking.shows.movies.duration_mins} mins</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Booking Ref</p>
              <p className="text-xl font-mono font-bold text-gray-900">{booking.booking_reference}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">Theatre</p>
              <p className="font-bold text-gray-900">{booking.shows.auditoriums.theatres.name}</p>
              <p className="text-gray-600">{booking.shows.auditoriums.theatres.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">Screen</p>
              <p className="font-bold text-gray-900">{booking.shows.auditoriums.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">Date & Time</p>
              <p className="font-bold text-gray-900">{showDate}</p>
              <p className="text-gray-600">{showTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">Seats ({booking.booking_items.length})</p>
              <p className="font-bold text-blue-600 text-lg">{seatLabels}</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-lg">
            <p className="font-bold text-gray-700">Total Amount Paid</p>
            <p className="text-2xl font-bold text-green-600">${booking.total_amount.toFixed(2)}</p>
          </div>

          <div className="text-center space-x-4">
            <Link 
              href="/"
              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
            <Link 
              href={`/account/bookings`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              View All Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
