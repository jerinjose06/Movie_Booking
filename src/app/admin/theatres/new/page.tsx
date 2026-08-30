'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTheatre } from '../../actions';

export default function NewTheatrePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await createTheatre(formData);
      router.push('/admin/theatres/' + res.theatreId);
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/admin/theatres" className="text-red-500 hover:text-red-400 text-sm mb-4 inline-block font-medium">
        &larr; Back to Theatres
      </Link>
      <h1 className="text-3xl font-serif font-bold mb-6 text-white">Add New Theatre</h1>
      
      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Theatre Name</label>
          <input required type="text" name="name" placeholder="e.g. AMC Lincoln Square" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
          <input required type="text" name="location" placeholder="e.g. New York, NY" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
        </div>

        <div className="pt-4">
          <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50">
            {loading ? "Creating..." : "Save Theatre"}
          </button>
        </div>
      </form>
    </div>
  );
}
