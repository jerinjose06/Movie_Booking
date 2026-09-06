'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateMovie } from '../../../actions';

import { CustomSelect } from '@/components/admin/CustomSelect';
import toast from 'react-hot-toast';

interface EditMovieFormProps {
  movie: any;
}

export function EditMovieForm({ movie }: EditMovieFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateMovie(movie.id, formData);
      if (res && res.error) {
        toast.error(res.error);
        setLoading(false);
      } else {
        router.push('/admin/movies');
      }
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl space-y-4 shadow-xl text-white">
      <input type="hidden" name="existing_poster_url" value={movie.poster_url || ''} />

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
        <input defaultValue={movie.title} required type="text" name="title" className="w-full bg-gray-850 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Duration (mins)</label>
          <input defaultValue={movie.duration_mins} required type="number" min="1" name="duration_mins" className="w-full bg-gray-850 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Release Date</label>
          <input defaultValue={movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : ''} required type="date" name="release_date" className="w-full bg-gray-850 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
        <CustomSelect 
          name="category" 
          defaultValue={movie.category || ''}
          placeholder="Select categories..." 
          options={["Action", "Drama", "Comedy", "Family", "Sci-Fi", "Horror", "Thriller", "Romance"]} 
          multiple={true}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
        <textarea defaultValue={movie.description} required name="description" rows={4} className="w-full bg-gray-850 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all"></textarea>
      </div>

      <div className="flex gap-4 items-end">
        {movie.poster_url && (
          <div className="w-20 h-28 relative bg-gray-900 rounded-lg overflow-hidden border border-gray-850 flex-shrink-0">
            <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-1">Replace Poster Image</label>
          <input type="file" name="poster" accept="image/*" className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-650 file:text-white hover:file:bg-red-700" />
        </div>
      </div>

      <div className="pt-4">
        <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50">
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

