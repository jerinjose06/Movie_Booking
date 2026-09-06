import { createClient } from '@/utils/supabase/server';
import { Calendar, IndianRupee } from 'lucide-react';
import { BookingsFilter } from './BookingsFilter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BookingsPage({ searchParams }: { searchParams: { date?: string } }) {
  const { date } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from('bookings')
    .select('*, profiles(full_name), shows!inner(start_time, movies(title), auditoriums(name, theatres(name)))')
    .order('created_at', { ascending: false });

  if (date && date !== 'all') {
    const startDate = new Date(`${date}T00:00:00`);
    const endDate = new Date(`${date}T23:59:59.999`);
    
    query = query
      .gte('shows.start_time', startDate.toISOString())
      .lte('shows.start_time', endDate.toISOString());
  }

  const { data: bookings } = await query;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Global Bookings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Always-open Calendar Filter */}
        <div className="w-full lg:w-auto flex-shrink-0 z-10">
          <BookingsFilter />
        </div>
        
        <div className="w-full flex-1 min-w-0">
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {bookings?.map((booking: any) => (
              <div key={booking.id} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{booking.shows?.movies?.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{booking.shows?.auditoriums?.theatres?.name} - {booking.shows?.auditoriums?.name}</p>
                  </div>
                  <span className={`flex-shrink-0 ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'CONFIRMED' ? 'bg-green-950/40 text-green-400 border border-green-800/40' : 
                    booking.status === 'PENDING' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/40' : 'bg-red-950/40 text-red-400 border border-red-800/40'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-800/50 pt-3">
                  <div>
                    <span className="text-gray-500">Customer: </span>
                    <span className="text-white font-medium">{booking.profiles?.full_name || 'Guest'}</span>
                  </div>
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
              <div className="text-center py-8 bg-[#1a1a1a] rounded-2xl border border-gray-800 text-gray-500 italic font-serif">
                No bookings found.
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-[#222222]">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Movie / Show</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {bookings?.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{booking.profiles?.full_name || 'Guest'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{booking.shows?.movies?.title}</div>
                        <div className="text-xs text-gray-400">
                          {booking.shows?.auditoriums?.theatres?.name} - {booking.shows?.auditoriums?.name}
                        </div>
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
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
