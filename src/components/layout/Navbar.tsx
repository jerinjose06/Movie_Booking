'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className='border-b border-gray-800 bg-[#1a1a1a] p-4 md:p-6 relative z-50'>
      <div className="flex items-center justify-between">
        <div className="flex gap-8 items-center">
          <Link href='/' className='font-serif font-bold text-2xl text-red-500'>Movie Fan</Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link href='/movies' className='text-gray-300 hover:text-white transition-colors py-2'>Movies</Link>
            <Link href='/theatres' className='text-gray-300 hover:text-white transition-colors py-2'>Theatres</Link>
          </div>
        </div>
        
        <div className="hidden md:flex gap-6 items-center">
          <Link href='/account' className='text-gray-300 hover:text-white transition-colors py-2'>Account</Link>
          <Link href='/admin' className='text-gray-300 hover:text-white transition-colors py-2'>Admin</Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#1a1a1a] border-b border-gray-800 shadow-xl flex flex-col px-4 py-4 space-y-4">
          <Link href='/movies' onClick={() => setIsOpen(false)} className='text-xl text-gray-300 hover:text-white py-3 border-b border-gray-800/50'>Movies</Link>
          <Link href='/theatres' onClick={() => setIsOpen(false)} className='text-xl text-gray-300 hover:text-white py-3 border-b border-gray-800/50'>Theatres</Link>
          <Link href='/account' onClick={() => setIsOpen(false)} className='text-xl text-gray-300 hover:text-white py-3 border-b border-gray-800/50'>Account</Link>
          <Link href='/admin' onClick={() => setIsOpen(false)} className='text-xl text-gray-300 hover:text-white py-3'>Admin</Link>
        </div>
      )}
    </nav>
  );
}
