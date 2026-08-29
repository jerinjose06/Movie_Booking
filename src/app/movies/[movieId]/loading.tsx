import React from 'react';

export default function MovieDetailsLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col md:flex-row gap-8 md:gap-12 items-start animate-pulse">
      
      {/* Left Column: Poster Skeleton */}
      <div className="w-full md:w-1/3 relative rounded-3xl overflow-hidden shadow-2xl aspect-[2/3] bg-gray-800">
      </div>

      {/* Right Column: Details & Booking Skeleton */}
      <div className="w-full md:w-2/3 flex flex-col">
        <div className="w-32 h-6 bg-gray-800 rounded-lg mb-4 md:mb-6"></div>
        
        <div className="w-3/4 h-12 md:h-16 bg-gray-800 rounded-xl mb-4"></div>
        
        <div className="flex gap-4 mb-8">
          <div className="w-20 h-8 bg-gray-800 rounded-full"></div>
          <div className="w-24 h-8 bg-gray-800 rounded-full"></div>
          <div className="w-16 h-8 bg-gray-800 rounded-full"></div>
        </div>
        
        <div className="w-full h-32 bg-gray-800 rounded-xl mb-10"></div>

        {/* Trailer Section */}
        <div className="mb-12">
          <div className="w-32 h-8 bg-gray-800 rounded-lg mb-6"></div>
          <div className="w-full max-w-2xl aspect-video bg-gray-800 rounded-2xl"></div>
        </div>

        {/* Cast Section */}
        <div className="mb-12">
          <div className="w-32 h-8 bg-gray-800 rounded-lg mb-6"></div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center shrink-0">
                <div className="w-20 h-20 bg-gray-800 rounded-full mb-3"></div>
                <div className="w-16 h-4 bg-gray-800 rounded-md mb-2"></div>
                <div className="w-12 h-3 bg-gray-800 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Shows Section */}
        <div>
          <div className="w-48 h-8 bg-gray-800 rounded-lg mb-6"></div>
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-40 h-28 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
