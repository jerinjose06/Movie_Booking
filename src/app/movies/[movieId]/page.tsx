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
    .gte('shows.start_time', new Date().toISOString())
    .single();

  if (!movie) notFound();

  // Fake data for demo
  const posterUrl = movie.poster_url || "/inception-poster.jpg";
  const trailerUrl = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80"; // Cinematic trailer placeholder
  const actors = [
    { name: "Leonardo D.", role: "Cobb", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" },
    { name: "Joseph G.", role: "Arthur", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
    { name: "Ellen P.", role: "Ariadne", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" },
    { name: "Tom H.", role: "Eames", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
      
      {/* Left Column: Poster */}
      <div className="w-full md:w-1/3 relative rounded-3xl overflow-hidden shadow-2xl">
        <div className="aspect-[2/3] bg-gray-800 relative">
          <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Right Column: Details & Booking */}
      <div className="w-full md:w-2/3 flex flex-col">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 md:mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Movies
        </Link>
        
        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-white">{movie.title}</h1>
        
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8 text-gray-400 font-medium text-sm md:text-lg">
          <span className="px-3 md:px-4 py-1 md:py-1.5 border border-gray-700 rounded-full">Action</span>
          <span className="px-3 md:px-4 py-1 md:py-1.5 border border-gray-700 rounded-full">{movie.duration_mins} mins</span>
          <span className="px-3 md:px-4 py-1 md:py-1.5 border border-gray-700 rounded-full">★ 4.8</span>
        </div>
        
        <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 md:mb-10 max-w-3xl">
          {movie.description || 'A brilliant scientist discovers a way to communicate with the past, but changing history has devastating consequences for the future.'}
        </p>

        {/* Trailer Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6 text-white">Trailer</h2>
          <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-gray-800 max-w-2xl">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/YoHD9XEInc0" 
              title="Movie Trailer" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Cast Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6 text-white">Starring</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {actors.map((actor, i) => (
              <div key={i} className="flex flex-col items-center shrink-0 group">
                <div className="w-20 h-20 bg-gray-700 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-red-600 transition-all">
                  <img src={actor.img} alt={actor.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-gray-300">{actor.name}</span>
                <span className="text-xs text-gray-500">{actor.role}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Shows Section / Booking Button */}
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6 text-white">Available Shows</h2>
          <MovieShows shows={movie.shows} />
        </div>
      </div>
    </div>
  );
}

