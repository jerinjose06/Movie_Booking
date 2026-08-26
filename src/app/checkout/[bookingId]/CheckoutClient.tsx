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
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Payment Summary</h2>
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount</span>
          <span>${booking.total_amount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        <button 
          type="submit" 
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg mt-6 transition-colors flex justify-center items-center"
        >
          {isProcessing ? (
            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            `Pay with Stripe ($${booking.total_amount.toFixed(2)})`
          )}
        </button>
      </form>
    </div>
  );
}
