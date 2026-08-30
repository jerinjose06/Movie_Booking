'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Film } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export function HomeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'All';

  const [searchText, setSearchText] = useState(currentSearch);
  const [activeCategory, setActiveCategory] = useState(currentCategory);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Action', 'Drama', 'Comedy', 'Family', 'Sci-Fi', 'Horror', 'Thriller', 'Romance'];

  // Fetch all movies for client-side search autocomplete/suggestions
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('movies')
      .select('id, title, poster_url, category')
      .order('title', { ascending: true })
      .then(({ data }) => {
        if (data) setAllMovies(data);
      });
  }, []);

  // Sync state if URL changes externally (e.g. back/forward browser buttons)
  useEffect(() => {
    // Only overwrite local state if the user isn't currently typing in the input
    if (document.activeElement?.getAttribute('name') !== 'search-input') {
      setSearchText(searchParams.get('search') || '');
    }
    setActiveCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search update to URL
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchText) {
        params.set('search', searchText);
      } else {
        params.delete('search');
      }
      router.push(`/?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat && cat !== 'All') {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  // Filter movies for suggestions list
  const suggestions = searchText.trim()
    ? allMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  return (
    <>
      {/* Search Banner */}
      <div className="relative ticket-cutout bg-gradient-to-r from-red-600 to-red-500 p-6 md:p-12 rounded-2xl md:rounded-3xl mb-8 md:mb-12 shadow-lg shadow-red-900/20 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        <h2 className="text-2xl md:text-3xl font-serif text-white leading-snug text-center md:text-left w-full md:w-auto">
          Which movie are you going<br className="hidden md:block"/>to show today?
        </h2>
        
        {/* Search input container with suggestions */}
        <div className="relative w-full max-w-md" ref={containerRef}>
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            name="search-input"
            placeholder="Search Here.." 
            value={searchText}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowSuggestions(true);
            }}
            className="w-full bg-white text-black rounded-full py-3 md:py-4 pl-12 pr-6 outline-none text-sm md:text-base font-sans relative z-10"
          />

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto space-y-1">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-3 py-1.5 border-b border-gray-850 mb-1">
                Suggested Movies
              </div>
              {suggestions.map((movie) => (
                <Link 
                  href={`/movies/${movie.id}`} 
                  key={movie.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-850 transition-colors group text-left"
                  onClick={() => setShowSuggestions(false)}
                >
                  {movie.poster_url ? (
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title} 
                      className="w-8 h-10 object-cover rounded-lg bg-gray-900 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Film className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white group-hover:text-red-500 transition-colors truncate">
                      {movie.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {movie.category || 'Movie'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 md:gap-4 mb-8 md:mb-10 justify-center">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-6 md:px-8 py-2 md:py-3 rounded-full font-medium text-sm md:text-base transition-colors ${
                isActive 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md' 
                  : 'bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </>
  );
}
