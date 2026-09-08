'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide the navbar on all admin and login/auth pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3.5 bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-40">
        <Link href="/" className="text-lg font-serif font-bold tracking-tight text-white">
          Movie <span className="text-red-500">Fan</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar: always visible on md+, slide-in drawer on mobile */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Desktop title */}
        <div className="hidden md:flex p-6 border-b border-gray-800 justify-between items-center">
          <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-white">
            Movie <span className="text-red-500">Fan</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href='/' onClick={() => setIsOpen(false)} className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/10 hover:text-red-400 transition-all font-medium text-gray-300'>
            <span>Home</span>
          </Link>
          <Link href='/movies' onClick={() => setIsOpen(false)} className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/10 hover:text-red-400 transition-all font-medium text-gray-300'>
            <span>Movies</span>
          </Link>
          <Link href='/theatres' onClick={() => setIsOpen(false)} className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/10 hover:text-red-400 transition-all font-medium text-gray-300'>
            <span>Theatres</span>
          </Link>
          <Link href='/account/bookings' onClick={() => setIsOpen(false)} className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/10 hover:text-red-400 transition-all font-medium text-gray-300'>
            <span>Account</span>
          </Link>
          
          <div className="border-t border-gray-800 my-4 pt-4 space-y-1">
            <Link href='/admin' onClick={() => setIsOpen(false)} className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 hover:text-white transition-all font-medium text-gray-400'>
              <span>Admin Panel</span>
            </Link>

            {user ? (
              <button 
                onClick={() => { handleSignOut(); setIsOpen(false); }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/10 hover:text-red-400 transition-all font-medium text-gray-300"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span>Log Out</span>
              </button>
            ) : (
              <Link href='/login' onClick={() => setIsOpen(false)} className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/10 hover:text-red-400 transition-all font-medium text-gray-300'>
                <span>Log In</span>
              </Link>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
