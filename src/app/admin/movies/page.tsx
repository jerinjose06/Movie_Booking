import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default async function MoviesPage() {
  const supabase = await createClient();
  const { data: movies } = await supabase.from('movies').select('*').order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Movies</h1>
        <Link href="/admin/movies/new" className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-950/20 text-sm whitespace-nowrap">
          Add Movie
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {movies?.map((movie: any) => (
          <div key={movie.id} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex gap-4 items-start">
              {movie.poster_url ? (
                <div className="h-20 w-14 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                  <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-20 w-14 flex-shrink-0 bg-gray-900 rounded-lg flex items-center justify-center text-[10px] text-gray-500 border border-gray-800">No Image</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
                <span className="inline-block mt-1 bg-red-950/40 text-red-400 border border-red-800/40 px-2 py-0.5 rounded-full text-xs font-medium">
                  {movie.category || 'N/A'}
                </span>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>{movie.duration_mins} mins</span>
                  <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <Link href={`/admin/movies/${movie.id}/edit`} className="text-red-500 hover:text-red-400 font-medium text-sm flex-shrink-0 py-2">
                Edit
              </Link>
            </div>
          </div>
        ))}
        {(!movies || movies.length === 0) && (
          <div className="text-center py-8 text-gray-500 italic font-serif">No movies found.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#222222]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Poster</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Release Date</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {movies?.map((movie: any) => (
                <tr key={movie.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {movie.poster_url ? (
                      <div className="h-16 w-12 relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                        <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-16 w-12 bg-gray-900 rounded-lg flex items-center justify-center text-[10px] text-gray-500 border border-gray-850">No Image</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{movie.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="bg-red-950/40 text-red-400 border border-red-800/40 px-2.5 py-1 rounded-full text-xs font-medium">
                      {movie.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.duration_mins} mins</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/movies/${movie.id}/edit`} className="text-red-500 hover:text-red-400 font-medium">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {(!movies || movies.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 italic font-serif">
                    No movies found.
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
