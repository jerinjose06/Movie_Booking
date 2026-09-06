'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function BookingsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDateParam = searchParams.get('date');
  
  // State for the calendar view (which month we are looking at)
  const [viewDate, setViewDate] = useState(() => {
    if (currentDateParam && currentDateParam !== 'all') {
      return new Date(`${currentDateParam}T12:00:00`);
    }
    return new Date();
  });

  // Default to today's date if no parameter is provided
  useEffect(() => {
    if (!currentDateParam) {
      const today = new Date();
      // Get local date string YYYY-MM-DD
      const localDateStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      router.replace(`/admin/bookings?date=${localDateStr}`);
    }
  }, [currentDateParam, router]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Previous month's trailing days
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false
      });
    }
    
    // Current month's days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true
      });
    }
    
    // Next month's leading days (to fill 42 cells = 6 rows)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        month: currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateClick = (day: number, month: number, year: number) => {
    // Format to YYYY-MM-DD
    const d = new Date(year, month, day, 12, 0, 0);
    const dateStr = d.toISOString().split('T')[0];
    router.push(`/admin/bookings?date=${dateStr}`);
    // Update view if clicking outside current month
    if (month !== currentMonth) {
      setViewDate(new Date(year, month, 1));
    }
  };

  const clearFilter = () => {
    router.push(`/admin/bookings?date=all`);
  };

  const isSelected = (day: number, month: number, year: number) => {
    if (!currentDateParam || currentDateParam === 'all') return false;
    const d = new Date(year, month, day, 12, 0, 0);
    return d.toISOString().split('T')[0] === currentDateParam;
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl p-5 max-w-sm w-full mx-auto md:mx-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex-1">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex items-center gap-2">
          {currentDateParam && currentDateParam !== 'all' && (
            <button 
              onClick={clearFilter}
              className="text-xs flex items-center gap-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          <button 
            onClick={() => setViewDate(new Date())}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
          >
            Today
          </button>
          <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-700 text-gray-300 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-700 text-gray-300 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {calendarDays.map((dateObj, i) => {
          const selected = isSelected(dateObj.day, dateObj.month, dateObj.year);
          const today = isToday(dateObj.day, dateObj.month, dateObj.year);
          
          return (
            <button
              key={i}
              onClick={() => handleDateClick(dateObj.day, dateObj.month, dateObj.year)}
              className={`
                aspect-square flex items-center justify-center rounded-full text-sm transition-all
                ${!dateObj.isCurrentMonth ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:bg-gray-800'}
                ${today && !selected ? 'border border-red-500/50 text-red-400 font-bold' : ''}
                ${selected ? 'bg-red-600 text-white font-bold hover:bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : ''}
              `}
            >
              {dateObj.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
