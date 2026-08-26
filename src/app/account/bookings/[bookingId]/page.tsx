import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

export default async function BookingDetailPage({ params, searchParams }: { params: { bookingId: string }, searchParams: { success?: string } }) {
  const supabase = await createClient();
  const { bookingId } = await params;
  const { success } = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *, 
      shows(
        start_time, 
        movies(title, duration_mins),
        auditoriums(name, theatres(name, location))
      ),
      booking_items(price, seats(row_identifier, seat_number))
    `)
    .eq('id', bookingId)
    .eq('profile_id', user.id)
    .single();

  if (!booking) notFound();

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8 text-green-700">
          <p className="font-bold">Payment Successful!</p>
          <p>Your seats are confirmed. Please find your digital ticket below.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-gray-900 text-white p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Movie Ticket</p>
              <h1 className="text-3xl font-bold">{booking.shows?.movies?.title}</h1>
            </div>
            <div className={`px-4 py-1 rounded-full text-sm font-bold ${
              booking.status === 'CONFIRMED' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
            }`}>
              {booking.status}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
            <div>
              <p className="text-gray-400">Date & Time</p>
              <p className="font-semibold text-lg">{new Date(booking.shows?.start_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400">Duration</p>
              <p className="font-semibold text-lg">{booking.shows?.movies?.duration_mins} mins</p>
            </div>
            <div>
              <p className="text-gray-400">Theatre</p>
              <p className="font-semibold">{booking.shows?.auditoriums?.theatres?.name}</p>
              <p className="text-gray-400 text-xs">{booking.shows?.auditoriums?.theatres?.location}</p>
            </div>
            <div>
              <p className="text-gray-400">Auditorium</p>
              <p className="font-semibold">{booking.shows?.auditoriums?.name}</p>
            </div>
          </div>
        </div>

        {/* Seats and Barcode */}
        <div className="p-8 bg-gray-50 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-4">Your Seats</h3>
            <div className="grid grid-cols-2 gap-4">
              {booking.booking_items?.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-gray-500 text-xs uppercase mb-1">Row / Seat</p>
                  <p className="text-2xl font-bold text-gray-900">{item.seats?.row_identifier}{item.seats?.seat_number}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-48 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200 pt-8 md:pt-0 md:pl-8">
            {/* Dummy Barcode */}
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="80" height="80" fill="black"/>
                <rect x="20" y="20" width="10" height="10" fill="white"/>
                <rect x="40" y="20" width="10" height="10" fill="white"/>
                <rect x="60" y="20" width="10" height="10" fill="white"/>
                <rect x="20" y="40" width="30" height="10" fill="white"/>
                <rect x="60" y="40" width="10" height="10" fill="white"/>
                <rect x="20" y="60" width="10" height="10" fill="white"/>
                <rect x="40" y="60" width="30" height="10" fill="white"/>
              </svg>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">{booking.id.split('-')[0]}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/movies" className="text-blue-600 hover:underline font-medium">
          ← Browse more movies
        </Link>
      </div>
    </div>
  );
}
