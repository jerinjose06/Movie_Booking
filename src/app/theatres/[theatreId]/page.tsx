import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Clock } from 'lucide-react';

export default async function TheatreDetailPage({ params }: { params: Promise<{ theatreId: string }> }) {
  const { theatreId } = await params;
  const supabase = await createClient();

  // Get theatre details
  const { data: theatre } = await supabase
    .from('theatres')
    .select('*')
    .eq('id', theatreId)
    .single();

  if (!theatre) {
    notFound();
  }

  // Fetch shows playing in this theatre's auditoriums
  const { data: shows } = await supabase
    .from('shows')
    .select('*, movies(*), auditoriums(*)')
    .eq('auditoriums.theatre_id', theatreId)
    .order('start_time');

  const activeShows = shows?.filter((show: any) => show.auditoriums !== null && show.movies !== null) || [];

  // Group shows by Movie
  const moviesMap: { [key: string]: { movie: any; shows: any[] } } = {};
  activeShows.forEach((show: any) => {
    if (!moviesMap[show.movie_id]) {
      moviesMap[show.movie_id] = {
        movie: show.movies,
        shows: []
      };
    }
    moviesMap[show.movie_id].shows.push(show);
  });

  return (
    <div className="min-h-screen bg-[#121212] pt-24 px-4 md:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Link href="/theatres" className="text-red-500 hover:text-red-400 text-sm mb-4 inline-block">
          &larr; Back to Theatres
        </Link>

        {/* Header */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">{theatre.name}</h1>
          <div className="flex items-center text-gray-400 gap-2 text-sm md:text-base">
            <MapPin className="w-5 h-5 text-red-500" />
            <span>{theatre.location}</span>
          </div>
        </div>

        {/* Shows playing */}
        <h2 className="text-2xl font-serif font-bold text-white mb-6">Now Showing</h2>
        
        <div className="space-y-6">
          {Object.values(moviesMap).map(({ movie, shows }) => (
            <div key={movie.id} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col md:flex-row gap-6 p-6">
              {movie.poster_url && (
                <div className="w-full md:w-32 h-48 md:h-auto relative rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                  <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">{movie.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">{movie.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Showtimes</h4>
                  <div className="flex flex-wrap gap-3">
                    {shows.map((show: any) => (
                      <Link 
                        key={show.id}
                        href={`/booking/${show.id}`}
                        className="bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(show.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] text-gray-400 bg-black/45 px-1.5 py-0.5 rounded ml-1">{show.auditoriums?.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {Object.keys(moviesMap).length === 0 && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-12 text-center text-gray-500 italic font-serif">
              No active shows scheduled at this theatre. Check back soon!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
