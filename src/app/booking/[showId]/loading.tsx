import React from 'react';

export default function BookingLoading() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-8 md:py-12 min-h-screen pb-32 lg:pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-full shrink-0"></div>
        <div className="flex flex-col gap-2">
          <div className="w-48 md:w-64 h-8 md:h-10 bg-gray-800 rounded-lg"></div>
          <div className="w-64 md:w-96 h-4 md:h-5 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 items-start">
        {/* Left: Seat Map Skeleton */}
        <div className="w-full lg:w-3/4 bg-[#1e1e1e] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-800 shadow-xl h-[600px] flex flex-col items-center justify-center gap-8">
          <div className="w-full max-w-sm h-8 bg-gray-800 rounded-md"></div>
          <div className="flex flex-col gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-2">
                {[...Array(12)].map((_, j) => (
                  <div key={j} className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-md"></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Booking Summary Skeleton */}
        <div className="w-full lg:w-1/4 bg-[#1e1e1e] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800 shadow-xl lg:sticky lg:top-8 h-[400px] flex flex-col">
          <div className="w-40 h-8 bg-gray-800 rounded-lg mb-8"></div>
          
          <div className="flex justify-between mb-4">
            <div className="w-24 h-5 bg-gray-800 rounded-lg"></div>
            <div className="w-8 h-5 bg-gray-800 rounded-lg"></div>
          </div>
          
          <div className="w-full h-24 bg-gray-800 rounded-xl mb-8"></div>
          
          <div className="mt-auto border-t border-gray-700 pt-6">
            <div className="flex justify-between items-end mb-8">
              <div className="w-24 h-6 bg-gray-800 rounded-lg"></div>
              <div className="w-32 h-10 bg-gray-800 rounded-lg"></div>
            </div>
            <div className="w-full h-14 bg-gray-800 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
