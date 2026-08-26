'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SeatSelector } from '@/components/booking/SeatSelector';
import { useBookingStore } from '@/store/useBookingStore';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function BookingClient({ show, initialSeats, userProfile }: any) {
  const [isHolding, setIsHolding] = useState(false);
  const router = useRouter();
  const { selectedSeatIds, startTimer } = useBookingStore();
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

      await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      });
      startTimer();
      router.push(`/checkout/${booking.id}`);
    } catch (error: any) {
      alert(`Could not hold seats: ${error.message}`);
      setIsHolding(false);
    }
  };

  const showDate = new Date(show.start_time);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-12 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <Link href={`/movies/${show.movie_id}`} className="w-12 h-12 border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">{show.movies?.title}</h1>
          <p className="text-gray-400 mt-1">
            {show.auditoriums?.theatres?.name} • {show.auditoriums?.name} • {showDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
        {/* Left: Seat Map */}
        <div className="w-full lg:w-3/4 bg-[#1e1e1e] rounded-3xl p-6 border border-gray-800 shadow-xl overflow-hidden relative">
          <SeatSelector showId={show.id} initialSeats={initialSeats} userId={userProfile.id} />
        </div>

        {/* Right: Booking Summary Panel */}
        <div className="w-full lg:w-1/4 bg-[#1e1e1e] rounded-3xl p-8 border border-gray-800 shadow-xl sticky top-8">
          <h3 className="text-2xl text-white font-serif font-bold mb-6">Booking Summary</h3>
          
          <div className="flex justify-between text-gray-400 mb-2">
            <span>Selected Seats</span>
            <span className="text-white font-bold">{selectedSeatIds.length}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedSeatDetails.map((seat: any) => (
              <span key={seat.id} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-md text-sm border border-gray-700">
                {seat.row_identifier}{seat.seat_number}
              </span>
            ))}
            {selectedSeatIds.length === 0 && <span className="text-sm text-gray-600 italic">None selected</span>}
          </div>

          <div className="border-t border-gray-700 my-6 pt-6">
            <div className="flex justify-between items-end mb-8">
              <span className="text-gray-400 text-lg">Total Amount</span>
              <span className="text-4xl font-bold text-white">${totalAmount.toFixed(2)}</span>
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
              {isHolding ? 'Holding Seats...' : `Checkout`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
