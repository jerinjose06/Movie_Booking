'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createShow } from '../../actions';
import toast from 'react-hot-toast';

const PRESET_TIMES = ['07:00', '08:30', '09:15', '10:00', '13:00', '16:00', '19:00', '22:00'];

// Helper to format 24h to 12h for UI
const formatTime12h = (time24: string) => {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export default function NewShowPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [date, setDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState('');

  useEffect(() => {
    fetch('/api/shows/options').then(r => r.json()).then(data => {
      setMovies(data.movies || []);
      setTheatres(data.theatres || []);
    });
  }, []);

  const toggleTime = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time].sort()
    );
  };

  const handleAddCustomTime = () => {
    if (customTime && !selectedTimes.includes(customTime)) {
      setSelectedTimes(prev => [...prev, customTime].sort());
      setCustomTime('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedTimes.length === 0) {
      toast("Please select at least one show time.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      // createShow action expects start_date and end_date. Since we changed to single date:
      formData.set('start_date', date);
      formData.set('end_date', date);
      formData.set('show_times', selectedTimes.join(','));
      
      await createShow(formData);
      router.push('/admin/shows');
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/admin/shows" className="text-red-500 hover:text-red-400 text-sm mb-4 inline-block font-medium">
        &larr; Back to Shows
      </Link>
      <h1 className="text-3xl font-serif font-bold mb-6 text-white">Schedule New Show</h1>
      
      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
            <input 
              required 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-1/2 bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Show Times</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_TIMES.map(time => {
                const isSelected = selectedTimes.includes(time);
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleTime(time)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${isSelected ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    {formatTime12h(time)}
                  </button>
                );
              })}
              {/* Render custom times that were added but aren't in preset list */}
              {selectedTimes.filter(t => !PRESET_TIMES.includes(t)).map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleTime(time)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border bg-red-600 border-red-500 text-white"
                >
                  {formatTime12h(time)}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800/50">
              <input 
                type="time" 
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm outline-none focus:border-red-500/50"
              />
              <button 
                type="button" 
                onClick={handleAddCustomTime}
                disabled={!customTime}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Custom Time
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50">
            {loading ? "Scheduling..." : "Schedule Show"}
          </button>
        </div>
      </form>
    </div>
  );
}
