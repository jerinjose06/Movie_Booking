'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, MapPin, Calendar, Armchair, Ticket, QrCode, X, Sparkles } from 'lucide-react';

interface TicketCardClientProps {
  booking: any;
  seatList: string[];
  qrCodeDataUrl: string;
  showDate: string;
  showTime: string;
  isScannedDirectly?: boolean;
}

export function TicketCardClient({
  booking,
  seatList,
  qrCodeDataUrl,
  showDate,
  showTime,
  isScannedDirectly = false
}: TicketCardClientProps) {
  const [showModal, setShowModal] = useState(isScannedDirectly);

  useEffect(() => {
    // If URL has ?scanned=true or isScannedDirectly, pop open the modal automatically
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('scanned') === 'true') {
        setShowModal(true);
      }
    }
  }, []);

  const seatLabels = seatList.length > 0 ? seatList.join(', ') : 'Seats Confirmed';

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 flex justify-center min-h-screen">
      {/* SEATS POPUP MODAL (When QR code is scanned or clicked) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border-2 border-red-500/60 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(220,38,38,0.4)] relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600/20 text-red-500 rounded-full mb-3 border border-red-500/40 shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">
                Seat Verification
              </h2>
              <p className="text-gray-400 text-xs md:text-sm font-mono text-red-400 font-semibold">
                {booking.booking_reference} • {booking.shows?.movies?.title}
              </p>
            </div>

            {/* SEAT NUMBERS HIGHLIGHT BOX */}
            <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 text-center mb-6">
              <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2">
                Your Confirmed Seats ({seatList.length})
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 my-3">
                {seatList.map((seat, index) => (
                  <span
                    key={index}
                    className="px-5 py-3 bg-gradient-to-br from-red-600 to-red-700 text-white font-serif font-bold text-2xl md:text-3xl rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/40 transform hover:scale-105 transition-transform"
                  >
                    {seat}
                  </span>
                ))}
              </div>
              <p className="text-xs text-green-400 font-medium mt-3 flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Admission Verified & Active
              </p>
            </div>

            {/* Details Snapshot */}
            <div className="space-y-2 text-xs md:text-sm text-gray-300 bg-gray-900/60 p-4 rounded-xl border border-gray-800/80 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Theatre:</span>
                <span className="font-semibold text-white">{booking.shows?.auditoriums?.theatres?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Auditorium / Screen:</span>
                <span className="font-semibold text-white">{booking.shows?.auditoriums?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Show Time:</span>
                <span className="font-semibold text-white">{showDate} at {showTime}</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-950/30 text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MAIN TICKET PASS CARD */}
      <div className="bg-[#1a1a1a] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden max-w-2xl w-full h-fit">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 md:p-8 text-white text-center">
          <CheckCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-white/90" />
          <h1 className="text-2xl md:text-3xl font-bold font-serif mb-1">Booking Confirmed!</h1>
          <p className="text-red-100 text-sm">Thank you for your purchase.</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Movie & Ref */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-800">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Movie</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">{booking.shows?.movies?.title}</h2>
              <p className="text-gray-400 mt-1 text-sm">{booking.shows?.movies?.duration_mins} mins</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Booking Ref</p>
              <p className="text-xl md:text-2xl font-mono font-bold text-red-500 tracking-wider">{booking.booking_reference}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-800">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Theatre</p>
                <p className="font-semibold text-white text-base">{booking.shows?.auditoriums?.theatres?.name}</p>
                <p className="text-gray-400 text-sm">{booking.shows?.auditoriums?.theatres?.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Ticket className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Screen</p>
                <p className="font-semibold text-white text-base">{booking.shows?.auditoriums?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Date & Time</p>
                <p className="font-semibold text-white text-base">{showDate}</p>
                <p className="text-gray-400 text-sm">{showTime}</p>
              </div>
            </div>

            {/* SEATS DISPLAY */}
            <div className="flex items-start gap-3">
              <Armchair className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                  Seats ({seatList.length})
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {seatList.map((seat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-600/20 text-red-400 font-mono font-bold text-base md:text-lg rounded-lg border border-red-500/40"
                    >
                      {seat}
                    </span>
                  ))}
                  {seatList.length === 0 && (
                    <span className="text-gray-400 font-mono font-semibold">{seatLabels}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PLAIN QR CODE ONLY */}
          <div className="flex justify-center my-6 md:my-8">
            <div 
              onClick={() => setShowModal(true)}
              className="bg-white p-4 rounded-2xl shadow-xl border border-gray-200 cursor-pointer transform hover:scale-105 transition-transform"
            >
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Booking QR Code" 
                  className="w-44 h-44 md:w-48 md:h-48 object-contain rounded-lg block"
                />
              ) : (
                <div className="w-44 h-44 md:w-48 md:h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-mono">
                  Loading QR...
                </div>
              )}
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center mb-6 md:mb-8 bg-[#121212] p-4 rounded-xl border border-gray-800">
            <p className="font-bold text-gray-300 text-sm">Total Amount Paid</p>
            <p className="text-xl md:text-2xl font-bold text-green-400">₹{booking.total_amount?.toFixed(2)}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
            <Link 
              href="/"
              className="text-center bg-[#121212] hover:bg-gray-800 border border-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
            >
              Back to Home
            </Link>
            <Link 
              href="/account/bookings"
              className="text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm shadow-lg shadow-red-950/20"
            >
              View All Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
