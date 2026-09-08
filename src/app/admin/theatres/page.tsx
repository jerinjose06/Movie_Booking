import { createAdminClient } from '@/utils/supabase/admin';
import Link from 'next/link';
import { MapPin, Film } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TheatresPage() {
  const supabase = createAdminClient();
  const { data: theatres, error } = await supabase.from('theatres').select('*').order('name');

  if (error) {
    console.error(error);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Theatres</h1>
        <Link href="/admin/theatres/new" className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-950/20 text-sm whitespace-nowrap">
          Create Theatre
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {theatres?.map((theatre: any) => (
          <Link key={theatre.id} href={`/admin/theatres/${theatre.id}`} className="block bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-lg hover:border-red-500/30 transition-all">
            <h3 className="text-sm font-semibold text-white mb-1">{theatre.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="w-3 h-3 text-gray-500" />
              {theatre.location}
            </div>
            <div className="text-right mt-2">
              <span className="text-red-500 text-xs font-medium">Manage →</span>
            </div>
          </Link>
        ))}
        {theatres?.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic font-serif">No theatres found.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#222222]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {theatres?.map((theatre: any) => (
                <tr key={theatre.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{theatre.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{theatre.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/theatres/${theatre.id}`} className="text-red-500 hover:text-red-400 font-medium">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {theatres?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500 italic font-serif">
                    No theatres found.
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
