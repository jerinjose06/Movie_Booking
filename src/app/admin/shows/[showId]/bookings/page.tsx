import { createClient } from '@/utils/supabase/server';
import { Calendar, IndianRupee, ArrowLeft, Armchair } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShowBookingsPage({ params }: { params: Promise<{ showId: string }> }) {
  const supabase = await createClient();
  const { showId } = await params;

  // First fetch the show details to display in the header
  const { data: showInfo } = await supabase
    .from('shows')
    .select('movies(title), auditoriums(name, theatres(name))')
    .eq('id', showId)
    .single();

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *, 
      profiles(full_name, email),
      show_seats(
        seats(
          seat_number,
          seat_rows(row_name)
        )
      )
    `)
    .eq('show_id', showId)
    .order('created_at', { ascending: false });

  // Helper to format seats
  const getSeatsList = (booking: any) => {
    if (!booking.show_seats) return '-';
    const seats = booking.show_seats.map((ss: any) => {
      const seatData = Array.isArray(ss.seats) ? ss.seats[0] : ss.seats;
      const rowData = Array.isArray(seatData?.seat_rows) ? seatData?.seat_rows[0] : seatData?.seat_rows;
      return `${rowData?.row_name || ''}${seatData?.seat_number || ''}`;
    }).filter(Boolean);
    return seats.join(', ') || '-';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href="/admin/shows" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Shows
        </Link>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Bookings</h1>
        {showInfo && (
          <p className="text-gray-400 mt-2 text-sm">
            <strong className="text-white">{(showInfo.movies as any)?.title}</strong> @ {(showInfo.auditoriums as any)?.theatres?.name} - {(showInfo.auditoriums as any)?.name} <br />
            
          </p>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {bookings?.map((booking: any) => (
          <div key={booking.id} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{booking.profiles?.full_name || 'Guest'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{booking.profiles?.email}</p>
              </div>
              <span className={`flex-shrink-0 ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                booking.status === 'CONFIRMED' ? 'bg-green-950/40 text-green-400 border border-green-800/40' : 
                booking.status === 'PENDING' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/40' : 'bg-red-950/40 text-red-400 border border-red-800/40'
              }`}>
                {booking.status}
              </span>
            </div>
            <div className="text-xs text-gray-300 flex gap-1.5 items-start">
              <Armchair className="w-3.5 h-3.5 text-gray-500 mt-0.5" />
              <span>{getSeatsList(booking)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-800/50 pt-3">
              <div className="flex items-center gap-1 text-white font-semibold">
                <IndianRupee className="w-3 h-3 text-green-400" />
                {booking.total_amount.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(booking.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {(!bookings || bookings.length === 0) && (
          <div className="text-center py-8 text-gray-500 italic font-serif">No bookings for this show.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#222222]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Seats</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {bookings?.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{booking.profiles?.full_name || 'Guest'}</div>
                    <div className="text-xs text-gray-400">{booking.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                    {getSeatsList(booking)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ₹{booking.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'CONFIRMED' ? 'bg-green-950/40 text-green-400 border border-green-800/40' : 
                      booking.status === 'PENDING' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/40' : 'bg-red-950/40 text-red-400 border border-red-800/40'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(booking.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!bookings || bookings.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 italic font-serif">
                    No bookings for this show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
