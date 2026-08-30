import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Calendar, Film } from 'lucide-react';

export default async function BookingsListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login?next=/account/bookings');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, shows(start_time, movies(title, poster_url))')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-screen pb-32">
      <h1 className="text-3xl font-serif font-bold mb-8 text-white">My Account</h1>
      
      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-gray-800 pb-px mb-8">
        <Link href="/account/bookings" className="text-red-500 border-b-2 border-red-500 pb-3 text-sm font-semibold transition-colors">
          My Bookings
        </Link>
        <Link href="/account" className="text-gray-400 hover:text-white pb-3 text-sm font-semibold transition-colors">
          Account Settings
        </Link>
      </div>

      <div className="space-y-4">
        {bookings?.map((booking) => {
          const date = new Date(booking.shows?.start_time);
          return (
            <Link 
              key={booking.id} 
              href={`/account/bookings/${booking.id}`}
              className="block bg-[#1a1a1a] hover:bg-gray-800/10 p-6 rounded-2xl border border-gray-800 hover:border-red-500/30 shadow-lg transition-all group"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  {booking.shows?.movies?.poster_url ? (
                    <img 
                      src={booking.shows.movies.poster_url} 
                      alt={booking.shows.movies.title} 
                      className="w-12 h-16 object-cover rounded-lg bg-gray-900 border border-gray-800"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center">
                      <Film className="w-6 h-6 text-gray-700" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors font-serif">{booking.shows?.movies?.title}</h2>
                    <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-800/50 sm:border-0">
                  <p className="font-bold text-white text-lg">₹{booking.total_amount.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                    booking.status === 'CONFIRMED' ? 'bg-green-950/40 border border-green-800/40 text-green-400' :
                    booking.status === 'PENDING' ? 'bg-yellow-950/40 border border-yellow-800/40 text-yellow-400' :
                    'bg-red-950/40 border border-red-800/40 text-red-400'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {(!bookings || bookings.length === 0) && (
          <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-gray-800 text-gray-500 italic">
            You have no booking history.
          </div>
        )}
      </div>
    </div>
  );
}
