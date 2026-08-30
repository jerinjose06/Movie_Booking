import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function TheatreDetailsPage({ params }: { params: Promise<{ theatreId: string }> }) {
  const { theatreId } = await params;
  const supabase = await createClient();
  const { data: theatre } = await supabase.from('theatres').select('*').eq('id', theatreId).single();
  const { data: auditoriums } = await supabase.from('auditoriums').select('*').eq('theatre_id', theatreId).order('name');

  if (!theatre) return <div className="p-4 md:p-8 text-center font-serif text-gray-500">Theatre not found</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href="/admin/theatres" className="text-red-500 hover:text-red-400 text-sm mb-2 inline-block font-medium">
          &larr; Back to Theatres
        </Link>
        <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">{theatre.name}</h1>
        <p className="text-gray-400 text-sm">{theatre.location}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-8 md:mt-12">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Screens</h2>
        <Link href={`/admin/theatres/${theatreId}/auditoriums/new`} className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-950/20 text-sm whitespace-nowrap">
          Create Screen
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {auditoriums?.map((aud: any) => (
          <Link key={aud.id} href={`/admin/auditoriums/${aud.id}`} className="block bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-lg hover:border-red-500/30 transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">{aud.name}</h3>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${aud.is_published ? 'bg-green-950/40 text-green-400 border border-green-800/40' : 'bg-gray-800 text-gray-400 border border-gray-700/40'}`}>
                {aud.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="text-right mt-3">
              <span className="text-red-500 text-xs font-medium">Configure →</span>
            </div>
          </Link>
        ))}
        {auditoriums?.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic font-serif">No screens found.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#222222]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {auditoriums?.map((aud: any) => (
                <tr key={aud.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{aud.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${aud.is_published ? 'bg-green-950/40 text-green-400 border border-green-800/40' : 'bg-gray-800 text-gray-400 border border-gray-700/40'}`}>
                      {aud.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/auditoriums/${aud.id}`} className="text-red-500 hover:text-red-400 font-medium">
                      Configure
                    </Link>
                  </td>
                </tr>
              ))}
              {auditoriums?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500 italic font-serif">
                    No screens found.
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
