'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';

export function CheckoutClient({ booking }: { booking: any }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { clearSelection, clearTimer } = useBookingStore();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Clear local store before redirecting to Stripe
        clearSelection();
        clearTimer();
        window.location.href = data.url;
      }
    } catch (error: any) {
      alert(`Payment setup failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl max-w-xl mx-auto text-white">
      <h2 className="text-xl md:text-2xl font-serif font-bold mb-6">Payment Summary</h2>
      <div className="bg-[#121212] p-4 md:p-5 rounded-xl mb-6 border border-gray-800">
        <div className="flex justify-between items-center text-lg font-bold">
          <span className="text-gray-300">Total Amount</span>
          <span className="text-green-400 text-2xl font-mono">₹{booking.total_amount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        <button 
          type="submit" 
          disabled={isProcessing}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-xl font-serif font-bold text-lg mt-6 transition-all shadow-lg shadow-red-950/30 flex justify-center items-center"
        >
          {isProcessing ? (
            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            `Proceed to Pay (₹${booking.total_amount.toFixed(2)})`
          )}
        </button>
      </form>
    </div>
  );
}
