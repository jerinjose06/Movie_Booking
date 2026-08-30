import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShowsPage() {
  const supabase = await createClient();
  const { data: shows } = await supabase
    .from('shows')
    .select('*, movies(title), auditoriums(name, theatres(name))')
    .order('start_time', { ascending: false });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Shows</h1>
        <Link href="/admin/shows/new" className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-950/20 text-sm whitespace-nowrap">
          Schedule Show
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {shows?.map((show: any) => (
          <div key={show.id} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-white">{show.movies?.title}</h3>
              <Link href={`/admin/shows/${show.id}/bookings`} className="text-red-500 hover:text-red-400 font-medium text-xs flex-shrink-0 ml-2 py-1">
                View
              </Link>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="w-3 h-3 text-gray-500" />
              {show.auditoriums?.theatres?.name} - {show.auditoriums?.name}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-800/50 pt-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span>{new Date(show.start_time).toLocaleDateString()}</span>
                <span className="text-gray-600">•</span>
                <span>{new Date(show.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className="text-gray-500">→ {new Date(show.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {(!shows || shows.length === 0) && (
          <div className="text-center py-8 text-gray-500 italic font-serif">No shows scheduled.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#222222]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Movie</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Theatre & Screen</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">End Time</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {shows?.map((show: any) => (
                <tr key={show.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{show.movies?.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {show.auditoriums?.theatres?.name} - {show.auditoriums?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(show.start_time).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(show.end_time).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/shows/${show.id}/bookings`} className="text-red-500 hover:text-red-400 font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {(!shows || shows.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 italic font-serif">
                    No shows scheduled.
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
