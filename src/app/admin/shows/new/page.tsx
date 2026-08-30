'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createShow } from '../../actions';

export default function NewShowPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/shows/options').then(r => r.json()).then(data => {
      setMovies(data.movies || []);
      setTheatres(data.theatres || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createShow(formData);
      router.push('/admin/shows');
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/admin/shows" className="text-red-500 hover:text-red-400 text-sm mb-4 inline-block font-medium">
        &larr; Back to Shows
      </Link>
      <h1 className="text-3xl font-serif font-bold mb-6 text-white">Schedule New Show</h1>
      
      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Movie</label>
          <select required name="movie_id" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all">
            <option value="">Select a movie...</option>
            {movies?.map((m: any) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Theatre & Screen</label>
          <select required name="auditorium_id" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all">
            <option value="">Select a screen...</option>
            {theatres?.map((t: any) => (
              <optgroup key={t.id} label={t.name} className="bg-gray-800 text-gray-400">
                {t.auditoriums?.map((a: any) => (
                  <option key={a.id} value={a.id} className="text-white">{a.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
            <input required type="datetime-local" name="start_time" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
            <input required type="datetime-local" name="end_time" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
          </div>
        </div>

        <div className="pt-4">
          <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50">
            {loading ? "Scheduling..." : "Schedule Show"}
          </button>
        </div>
      </form>
    </div>
  );
}
