import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function MoviesPage() {
  const supabase = await createClient();
  const { data: movies } = await supabase.from('movies').select('*').order('created_at', { ascending: false });

  return (
    <div className="flex flex-col min-h-screen px-6 py-8 bg-[#121212] pb-32">
      <h1 className="text-3xl font-serif font-bold mb-8 text-white">All Movies</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {movies?.map((movie) => (
          <Link href={`/movies/${movie.id}`} key={movie.id} className="group flex flex-col">
            <div className="bg-gray-800 aspect-[2/3] rounded-2xl mb-3 overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium text-sm p-4 text-center">
                {movie.title}
              </div>
            </div>
            <h2 className="text-sm font-bold text-gray-200 group-hover:text-red-500 transition-colors truncate">{movie.title}</h2>
            <p className="text-xs text-gray-500">{movie.duration_mins} mins</p>
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
