import React from 'react';
import { Film } from 'lucide-react';

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <Film className="w-12 h-12 text-red-600 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full animate-pulse"></div>
      </div>
      <p className="text-gray-400 font-serif font-medium tracking-widest animate-pulse">LOADING...</p>
    </div>
  );
}
