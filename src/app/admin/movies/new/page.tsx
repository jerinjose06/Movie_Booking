'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createMovie } from '../../actions';
import { CustomSelect } from '@/components/admin/CustomSelect';

export default function NewMoviePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createMovie(formData);
      router.push('/admin/movies');
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/admin/movies" className="text-red-500 hover:text-red-400 text-sm mb-4 inline-block font-medium">
        &larr; Back to Movies
      </Link>
      <h1 className="text-3xl font-serif font-bold mb-6 text-white">Add New Movie</h1>
      
      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
          <input required type="text" name="title" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Duration (mins)</label>
            <input required type="number" min="1" name="duration_mins" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Release Date</label>
            <input required type="date" name="release_date" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
          <CustomSelect 
            name="category" 
            placeholder="Select categories..." 
            options={["Action", "Drama", "Comedy", "Family", "Sci-Fi", "Horror", "Thriller", "Romance"]} 
            multiple={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
          <textarea required name="description" rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all"></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Poster Image</label>
          <input type="file" name="poster" accept="image/*" className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-650 file:text-white hover:file:bg-red-700" />
        </div>

        <div className="pt-4">
          <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50">
            {loading ? "Creating..." : "Save Movie"}
          </button>
        </div>
      </form>
    </div>
  );
}
