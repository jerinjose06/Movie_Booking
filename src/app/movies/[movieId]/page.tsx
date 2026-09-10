import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Play, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { MovieShows } from './MovieShows';

export default async function MovieDetails({ params }: { params: { movieId: string } }) {
  const { movieId } = await params;
  const supabase = await createClient();
  const { data: movie } = await supabase
    .from('movies')
    .select(`
      *,
      shows (
        id,
        start_time
      )
    `)
    .eq('id', movieId)
    .gte('shows.start_time', new Date().toISOString())
    .single();

  if (!movie) notFound();

  // Sort upcoming shows
  const upcomingShows = (movie.shows || []).sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const firstShowId = upcomingShows.length > 0 ? upcomingShows[0].id : null;

  const posterUrl = movie.poster_url || "/inception-poster.jpg";

  return (
    <div className="relative min-h-screen bg-[#121212] overflow-hidden flex flex-col">
      {/* Background Poster with Gradient Fade */}
      <div className="absolute top-0 left-0 w-full h-[60vh] md:h-[80vh] z-0">
        <Image 
          src={posterUrl} 
          alt={movie.title} 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/30 via-[#121212]/60 to-[#121212]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 flex flex-col flex-grow">
        {/* Top Navbar Area */}
        <div className="flex items-center justify-between mb-auto">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-md">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>

        {/* Bottom Details Area */}
        <div className="mt-[30vh] md:mt-[40vh] flex flex-col items-center text-center">
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">
            {movie.title}
          </h1>
          
          {/* Reviews/Rating */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className="text-yellow-500 text-xl">★</span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-gray-300 font-medium text-sm md:text-base mb-12">
            <span>2026</span>
            <span>|</span>
            <span>{movie.duration_mins} min</span>
            <span>|</span>
            <span>Action, Sci-fi</span>
          </div>

          {/* Book Ticket Button */}
          <div className="w-full max-w-sm mx-auto mt-auto mb-8">
            {firstShowId ? (
              <Link 
                href={`/booking/${firstShowId}`}
                className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-full text-lg shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] transition-all hover:scale-105 active:scale-95"
              >
                Buy ticket
              </Link>
            ) : (
              <button 
                disabled
                className="w-full bg-gray-700 text-gray-400 font-bold py-4 rounded-full text-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

