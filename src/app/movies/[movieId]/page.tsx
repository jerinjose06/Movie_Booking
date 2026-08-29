import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Play, ArrowLeft } from 'lucide-react';

export default async function MovieDetails({ params }: { params: { movieId: string } }) {
  const { movieId } = await params;
  const supabase = await createClient();
  const { data: movie } = await supabase
    .from('movies')
    .select(`
      *,
      shows (
        id,
        start_time,
        auditoriums (
          name,
          theatres (
            name
          )
        )
      )
    `)
    .eq('id', movieId)
    .single();

  if (!movie) notFound();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
      
      {/* Left Column: Poster & Play Button */}
      <div className="w-full md:w-1/3 relative rounded-3xl overflow-hidden shadow-2xl">
        <div className="aspect-[2/3] bg-gray-800 relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium text-lg text-center px-4">
            {movie.title}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent flex items-center justify-center">
          <button className="w-16 h-16 md:w-20 md:h-20 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-110 transition-transform backdrop-blur-sm">
            <Play className="w-6 h-6 md:w-8 md:h-8 ml-1 md:ml-2" />
          </button>
        </div>
      </div>

      {/* Right Column: Details & Booking */}
      <div className="w-full md:w-2/3 flex flex-col">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 md:mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Movies
        </Link>
        
        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-white">{movie.title}</h1>
        
        <div className="flex gap-4 mb-8 text-gray-400 font-medium text-lg">
          <span className="px-4 py-1.5 border border-gray-700 rounded-full">Action</span>
          <span className="px-4 py-1.5 border border-gray-700 rounded-full">{movie.duration_mins} mins</span>
          <span className="px-4 py-1.5 border border-gray-700 rounded-full">⭐ 4.8</span>
        </div>
        
        <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-3xl">
          {movie.description || 'A brilliant scientist discovers a way to communicate with the past, but changing history has devastating consequences for the future.'}
        </p>

        {/* Cast Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6 text-white">Starring</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center shrink-0 group">
                <div className="w-20 h-20 bg-gray-700 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-red-600 transition-all">
                  <div className="w-full h-full bg-gradient-to-tr from-gray-600 to-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-300">Actor {i}</span>
                <span className="text-xs text-gray-500">Character</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Shows Section / Booking Button */}
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6 text-white">Available Shows</h2>
          {movie.shows && movie.shows.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {movie.shows.map((show: any) => (
                <Link
                  key={show.id}
                  href={`/booking/${show.id}`}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-500 px-6 py-4 rounded-xl transition-all shadow-sm flex flex-col items-start gap-1 group"
                >
                  <span className="font-bold text-white group-hover:text-red-400 transition-colors">
                    {new Date(show.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(show.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-gray-500 mt-2">
                    {show.auditoriums?.theatres?.name} • {show.auditoriums?.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No shows scheduled yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
