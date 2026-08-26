import React, { useEffect, useState } from 'react';

interface Seat {
  id: number;
  row_identifier: string;
  seat_number: string;
  price: number;
}

interface BookingSummaryProps {
  selectedSeats: Seat[];
  holdExpiresAt: Date | null;
  onCheckout: () => void;
  isLoading: boolean;
}

export function BookingSummary({ selectedSeats, holdExpiresAt, onCheckout, isLoading }: BookingSummaryProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!holdExpiresAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = holdExpiresAt.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('EXPIRED');
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const total = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Booking Summary</h2>
      
      {timeLeft && timeLeft !== 'EXPIRED' && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 flex items-center justify-between">
          <span className="text-sm font-medium">Time to complete:</span>
          <span className="font-mono font-bold">{timeLeft}</span>
        </div>
      )}
      
      {timeLeft === 'EXPIRED' && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-6 text-center text-sm font-medium">
          Session Expired. Please reselect seats.
        </div>
      )}

      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
        {selectedSeats.length === 0 ? (
          <p className="text-gray-500 text-sm">No seats selected.</p>
        ) : (
          selectedSeats.map((seat) => (
            <div key={seat.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-600">Seat {seat.row_identifier}{seat.seat_number}</span>
              <span className="font-medium">${seat.price.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center text-lg font-bold mb-6 pt-4 border-t border-gray-200 text-gray-900">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button
        onClick={onCheckout}
        disabled={selectedSeats.length === 0 || timeLeft === 'EXPIRED' || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex justify-center items-center"
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          `Hold & Checkout (${selectedSeats.length})`
        )}
      </button>
    </div>
  );
}
