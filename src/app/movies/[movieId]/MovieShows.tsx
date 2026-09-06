'use client';
import { useState } from 'react';
import Link from 'next/link';

export function MovieShows({ shows }: { shows: any[] }) {
  // Extract unique dates from shows
  const showDates = Array.from(new Set(shows.map(s => {
    // Keep local timezone date string instead of UTC
    const d = new Date(s.start_time);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  }))).sort();
  const [selectedDate, setSelectedDate] = useState(showDates[0] || '');

  if (!shows || shows.length === 0) {
    return <p className="text-gray-500 italic">No shows scheduled yet.</p>;
  }

  // Filter shows by selected date
  const filteredShows = shows.filter(s => {
    const d = new Date(s.start_time);
    const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return dateStr === selectedDate;
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Group filtered shows by Theatre
  const theatres = Array.from(new Set(filteredShows.map(s => s.auditoriums?.theatres?.name)));

  return (
    <div>
      {/* Horizontal Date Picker */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {showDates.map(dateStr => {
          // parse the local date string safely
          const [year, month, day] = dateStr.split('-');
          const d = new Date(Number(year), Number(month) - 1, Number(day));
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
          const dayNum = d.toLocaleDateString('en-US', { day: '2-digit' });
          const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center justify-center shrink-0 w-20 h-24 rounded-2xl transition-all font-medium border ${isSelected ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/50' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600'}`}
            >
              <span className="text-xs mb-1">{dayName}</span>
              <span className="text-xl font-bold">{dayNum}</span>
              <span className="text-xs mt-1">{monthName}</span>
            </button>
          );
        })}
      </div>

      {/* Shows grouped by Theatre */}
      <div className="space-y-6">
        {theatres.map(theatreName => {
          const theatreShows = filteredShows.filter(s => s.auditoriums?.theatres?.name === theatreName);
          return (
            <div key={theatreName} className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
              <h3 className="text-xl font-serif font-bold text-white mb-4">{theatreName}</h3>
              <div className="flex flex-wrap gap-4">
                {theatreShows.map(show => (
                  <Link
                    key={show.id}
                    href={`/booking/${show.id}`}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-500 px-6 py-3 rounded-xl transition-all shadow-sm flex flex-col items-center justify-center min-w-[100px]"
                  >
                    <span className="font-bold text-white">
                      {new Date(show.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">{show.auditoriums?.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
        {theatres.length === 0 && (
          <p className="text-gray-500 italic">No shows available for this date.</p>
        )}
      </div>
    </div>
  );
}
