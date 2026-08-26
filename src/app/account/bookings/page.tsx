import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function BookingsListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, shows(start_time, movies(title))')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      <div className="space-y-4">
        {bookings?.map((booking) => {
          const date = new Date(booking.shows?.start_time);
          return (
            <Link 
              key={booking.id} 
              href={`/account/bookings/${booking.id}`}
              className="block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{booking.shows?.movies?.title}</h2>
                  <p className="text-gray-500">{date.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${booking.total_amount.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                    booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {(!bookings || bookings.length === 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
            You have no booking history.
          </div>
        )}
      </div>
    </div>
  );
}
