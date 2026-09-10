'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SeatSelector } from '@/components/booking/SeatSelector';
import { useBookingStore } from '@/store/useBookingStore';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export function BookingClient({ show, initialSeats, userProfile, upcomingShows = [] }: any) {
  const [isHolding, setIsHolding] = useState(false);
  const router = useRouter();
  
  const { selectedSeatIds, startTimer, clearSelection } = useBookingStore();
  
  React.useEffect(() => {
    // Clear selection when show ID changes
    clearSelection();
  }, [show.id]);

  // Date and Time Grouping
  const showDatesMap = new Map();
  upcomingShows.forEach((s: any) => {
    const d = new Date(s.start_time);
    const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    if (!showDatesMap.has(dateStr)) showDatesMap.set(dateStr, []);
    showDatesMap.get(dateStr).push(s);
  });
  const showDates = Array.from(showDatesMap.keys()).sort();
  
  const activeDateObj = new Date(show.start_time);
  const activeDateStr = new Date(activeDateObj.getTime() - activeDateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(activeDateStr);
  
  const timesForSelectedDate = showDatesMap.get(selectedDate) || [];

  const supabase = createClient();

  const selectedSeatDetails = initialSeats.filter((s: any) => selectedSeatIds.includes(s.id));
  const totalAmount = selectedSeatDetails.reduce((sum: number, s: any) => sum + s.price, 0);

  const handleCheckout = async () => {
    if (selectedSeatIds.length === 0) return;
    setIsHolding(true);

    try {
      const bookingReference = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          profile_id: userProfile.id,
          show_id: show.id,
          status: 'PENDING',
          total_amount: totalAmount,
          booking_reference: bookingReference
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { error: seatError, data: seatUpdatedCount } = await supabase.rpc('checkout_held_seats', {
        p_show_id: show.id,
        p_user_id: userProfile.id,
        p_booking_id: booking.id,
        p_seat_ids: selectedSeatIds
      });

      if (seatError || !seatUpdatedCount || seatUpdatedCount !== selectedSeatIds.length) {
        throw new Error(seatError?.message || 'Failed to confirm seat holds.');
      }

      // Also insert booking_items so seats are explicitly linked
      const itemsToInsert = selectedSeatDetails.map((seat: any) => ({
        booking_id: booking.id,
        show_seat_id: seat.show_seat_id,
        price: seat.price
      }));
      await supabase.from('booking_items').insert(itemsToInsert);

      await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      });
      startTimer();
      router.push(`/checkout/${booking.id}`);
    } catch (error: any) {
      toast.error(`Could not hold seats: ${error.message}`);
      setIsHolding(false);
    }
  };

  const showDate = new Date(show.start_time);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-8 md:py-12 min-h-screen pb-32 lg:pb-12">
      {/* Header & Date/Time Selectors */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/movies/${show.movie_id}`} className="w-10 h-10 border border-gray-700/50 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white">{show.movies?.title}</h1>
        </div>
        
        {/* Date Carousel */}
        {showDates.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {showDates.map(dateStr => {
              const [year, month, day] = dateStr.split('-');
              const d = new Date(Number(year), Number(month) - 1, Number(day));
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              const dayNum = d.toLocaleDateString('en-US', { day: '2-digit' });
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-2xl transition-all font-medium ${isSelected ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-white/10 border border-white/5 text-gray-400 hover:bg-white/20'}`}
                >
                  <span className="text-[10px] mb-1 uppercase tracking-wider">{dayName}</span>
                  <span className="text-xl font-bold">{dayNum}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Time Pills */}
        {timesForSelectedDate.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {timesForSelectedDate.map((s: any) => {
              const isSelectedShow = s.id === show.id;
              const timeStr = new Date(s.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              return (
                <button
                  key={s.id}
                  onClick={() => router.push(`/booking/${s.id}`)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all text-sm font-medium ${isSelectedShow ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-white/10 border border-white/5 text-gray-300 hover:bg-white/20'}`}
                >
                  <span>{timeStr}</span>
                  <span className="text-[10px] opacity-75 bg-black/20 px-2 py-0.5 rounded-full">{s.auditoriums?.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 items-start">
        {/* Left: Seat Map */}
        <div className="w-full lg:w-3/4 bg-[#1e1e1e] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-800 shadow-xl overflow-hidden relative">
          <SeatSelector showId={show.id} initialSeats={initialSeats} userId={userProfile.id} />
        </div>

        {/* Right: Booking Summary Panel (Desktop) / Bottom Flow (Mobile) */}
        <div className="w-full lg:w-1/4 bg-[#1e1e1e] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800 shadow-xl lg:sticky lg:top-8 mb-8 lg:mb-0">
          <h3 className="text-xl md:text-2xl text-white font-serif font-bold mb-4 md:mb-6">Booking Summary</h3>
          
          <div className="flex justify-between text-gray-400 mb-2">
            <span>Selected Seats</span>
            <span className="text-white font-bold">{selectedSeatIds.length}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            {selectedSeatDetails.map((seat: any) => (
              <span key={seat.id} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-md text-sm border border-gray-700">
                {seat.row_identifier}{seat.seat_number}
              </span>
            ))}
            {selectedSeatIds.length === 0 && <span className="text-sm text-gray-600 italic">None selected</span>}
          </div>

          <div className="border-t border-gray-700 my-4 md:my-6 pt-4 md:pt-6 hidden lg:block">
            <div className="flex justify-between items-end mb-8">
              <span className="text-gray-400 text-lg">Total Amount</span>
              <span className="text-4xl font-bold text-white">₹{totalAmount.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={selectedSeatIds.length === 0 || isHolding}
              className={`w-full py-4 rounded-full font-serif font-bold text-xl transition-all ${
                selectedSeatIds.length > 0 
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_5px_20px_rgba(220,38,38,0.4)] hover:scale-105' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isHolding ? 'Holding...' : `Checkout`}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1a1a1a] border-t border-gray-800 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-40 flex items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">Total ({selectedSeatIds.length} seats)</p>
          <p className="text-2xl font-bold text-white">₹{totalAmount.toFixed(2)}</p>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={selectedSeatIds.length === 0 || isHolding}
          className={`px-8 py-3 rounded-full font-serif font-bold text-lg transition-all ${
            selectedSeatIds.length > 0 
            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg' 
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isHolding ? 'Holding...' : `Checkout`}
        </button>
      </div>
    </div>
  );
}
