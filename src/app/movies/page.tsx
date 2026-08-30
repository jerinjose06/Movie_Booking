import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function MoviesPage() {
  const supabase = await createClient();
  const { data: movies } = await supabase.from('movies').select('*').order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 min-h-screen pb-32">
      <h1 className="text-3xl font-serif font-bold mb-8 text-white">All Movies</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
        {movies?.map((movie) => (
          <Link href={`/movies/${movie.id}`} key={movie.id} className="flex flex-col group">
            <div className="ticket-cutout-top bg-gradient-to-b from-red-600 to-red-500 rounded-3xl overflow-hidden relative shadow-xl transform transition-transform group-hover:scale-[1.02] md:group-hover:scale-105 duration-300">
              <div className="aspect-[4/5] bg-gray-800 relative">
                <img 
                  src={movie.poster_url || "/inception-poster.jpg"}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 md:p-6 text-center bg-gradient-to-b from-red-500 to-red-700">
                <h3 className="font-serif font-bold text-lg md:text-xl mb-1 md:mb-2 truncate text-white">{movie.title}</h3>
                <div className="flex items-center justify-center gap-3 text-red-100 text-xs md:text-sm">
                  <span>{movie.category || 'Action/Drama'}</span>
                  <span>{movie.duration_mins} mins</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {(!movies || movies.length === 0) && (
          <div className="col-span-full text-center py-12 text-gray-500 italic">
            No movies currently showing.
          </div>
        )}
      </div>
    </div>
  );
}
