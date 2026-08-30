import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { MapPin, Film } from 'lucide-react';

export default async function TheatresPage() {
  const supabase = await createClient();
  
  // Get theatres with their auditoriums (screens) count
  const { data: theatres } = await supabase
    .from('theatres')
    .select('*, auditoriums(id)')
    .order('name');

  return (
    <div className="min-h-screen bg-[#121212] pt-24 px-4 md:px-8 pb-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 text-center md:text-left">
          Our <span className="text-red-500">Theatres</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {theatres?.map((theatre: any) => (
            <Link 
              href={`/theatres/${theatre.id}`} 
              key={theatre.id}
              className="group relative flex flex-col ticket-cutout bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-black/40"
            >
              {/* Decorative top red strip */}
              <div className="h-2 bg-gradient-to-r from-red-600 to-red-500 w-full" />
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white group-hover:text-red-500 transition-colors mb-2">
                    {theatre.name}
                  </h2>
                  <div className="flex items-center text-gray-400 text-sm gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{theatre.location}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-800/80 pt-4 mt-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-gray-500" />
                    <span>{theatre.auditoriums?.length || 0} Screens</span>
                  </div>
                  <span className="text-red-500 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    View Shows &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {(!theatres || theatres.length === 0) && (
            <div className="col-span-full text-center text-gray-500 py-20 font-serif italic">
              No theatres listed at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
