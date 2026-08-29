import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Bell, Search, MoreHorizontal } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  
  // Require authentication right on the homepage
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/');
  }

  // Get user profile
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

  const { data: movies } = await supabase.from('movies').select('*').order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 md:mb-12">
        <div>
          <p className="text-gray-400 text-sm md:text-lg mb-1">Welcome back,</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight font-serif text-white">{profile?.full_name || 'Guest'}</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6 bg-[#1e1e1e] p-2 pr-4 md:pr-6 rounded-full border border-gray-800">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-600 rounded-full overflow-hidden flex items-center justify-center font-bold text-base md:text-lg">
             {profile?.full_name?.charAt(0) || 'G'}
          </div>
          <button className="p-1">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>
      </header>

      {/* Search Banner */}
      <div className="relative ticket-cutout bg-gradient-to-r from-red-600 to-red-500 p-6 md:p-12 rounded-2xl md:rounded-3xl mb-8 md:mb-12 shadow-lg shadow-red-900/20 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        <h2 className="text-2xl md:text-3xl font-serif text-white leading-snug text-center md:text-left w-full md:w-auto">
          Which movie are you going<br className="hidden md:block"/>to show today?
        </h2>
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search Here.." 
            className="w-full bg-white text-black rounded-full py-3 md:py-4 pl-12 pr-6 outline-none text-sm md:text-base font-sans"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 md:gap-4 mb-8 md:mb-10 justify-center">
        <button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-medium text-sm md:text-base shadow-md">
          All
        </button>
        <button className="bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-6 md:px-8 py-2 md:py-3 rounded-full font-medium text-sm md:text-base transition-colors">
          Horror
        </button>
        <button className="bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-6 md:px-8 py-2 md:py-3 rounded-full font-medium text-sm md:text-base transition-colors">
          Action
        </button>
        <button className="bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-6 md:px-8 py-2 md:py-3 rounded-full font-medium text-sm md:text-base transition-colors">
          Drama
        </button>
      </div>

      {/* Recommended Section */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">Recommended</h2>
        <button className="p-2 -mr-2 md:mr-0">
          <MoreHorizontal className="w-6 h-6 md:w-8 md:h-8 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>

      {/* Grid Movies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 pb-12">
        {movies?.map((movie) => (
            <Link href={`/movies/${movie.id}`} key={movie.id} className="flex flex-col group">
            <div className="ticket-cutout-top bg-gradient-to-b from-red-600 to-red-500 rounded-3xl overflow-hidden relative shadow-xl transform transition-transform group-hover:scale-[1.02] md:group-hover:scale-105 duration-300">
              <div className="aspect-[4/5] bg-gray-800 relative">
                <img 
                  src="/inception-poster.jpg"
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
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
        ))}
        {movies?.length === 0 && (
          <div className="text-gray-500 italic py-10 w-full col-span-full text-center">No movies available</div>
        )}
      </div>
    </div>
  );
}
