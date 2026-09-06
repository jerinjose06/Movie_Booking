import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Bell, MoreHorizontal } from 'lucide-react';
import { redirect } from 'next/navigation';
import { HomeFilter } from './HomeFilter';
import { Suspense } from 'react';

export default async function Home({ searchParams }: { searchParams: Promise<{ search?: string; category?: string }> }) {
  const supabase = await createClient();
  
  // Require authentication right on the homepage
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/');
  }

  // Get user profile
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

  const { search, category } = await searchParams;
  let query = supabase
    .from('movies')
    .select('*, shows(start_time)')
    .order('created_at', { ascending: false });

  if (category && category !== 'All') {
    query = query.ilike('category', `%${category}%`);
  }
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: movies } = await query;

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 md:mb-12">
        <div>
          <p className="text-gray-400 text-sm md:text-lg mb-1">Welcome back,</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight font-serif text-white">{profile?.full_name || 'Guest'}</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6 bg-[#1e1e1e] p-2 pr-4 md:pr-6 rounded-full border border-gray-800">
          <Link 
            href="/account/bookings" 
            className="w-10 h-10 md:w-12 md:h-12 bg-gray-600 hover:bg-red-600 text-white rounded-full overflow-hidden flex items-center justify-center font-bold text-base md:text-lg transition-colors cursor-pointer"
            title="View Account Bookings"
          >
             {profile?.full_name?.charAt(0) || 'G'}
          </Link>
          <button className="p-1">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>
      </header>

      {/* Dynamic Search & Category Filtering */}
      <Suspense fallback={<div className="h-32 bg-gray-900 animate-pulse rounded-2xl mb-8" />}>
        <HomeFilter />
      </Suspense>

      {/* Recommended Section */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">Recommended</h2>
        <button className="p-2 -mr-2 md:mr-0">
          <MoreHorizontal className="w-6 h-6 md:w-8 md:h-8 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>

      {/* Grid Movies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 pb-12">
        {movies?.map((movie) => {
          // Check if movie has any upcoming shows
          const now = new Date().getTime();
          const hasUpcomingShows = movie.shows?.some((s: any) => new Date(s.start_time).getTime() > now);

          return (
            <Link href={`/movies/${movie.id}`} key={movie.id} className="flex flex-col group relative">
              <div className="ticket-cutout-top bg-gradient-to-b from-red-600 to-red-500 rounded-3xl overflow-hidden relative shadow-xl transform transition-transform group-hover:scale-[1.02] md:group-hover:scale-105 duration-300">
                <div className="aspect-[4/5] bg-gray-800 relative">
                  <img 
                    src={movie.poster_url || "/inception-poster.jpg"}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  {!hasUpcomingShows && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-full transform -rotate-12 border-2 border-white shadow-xl">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6 text-center bg-gradient-to-b from-red-500 to-red-700">
                  <h3 className="font-serif font-bold text-lg md:text-xl mb-1 md:mb-2 truncate text-white">{movie.title}</h3>
                  <div className="flex items-center justify-center gap-3 text-red-100 text-xs md:text-sm">
                    <span>Action/Drama</span>
                    <span>4.5</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {movies?.length === 0 && (
          <div className="text-gray-500 italic py-10 w-full col-span-full text-center">No movies available</div>
        )}
      </div>
    </div>
  );
}

