'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Film, Clapperboard, Calendar, Ticket, Settings, LogOut, Menu, X, ArrowLeft } from 'lucide-react';

interface AdminSidebarProps {
  logoutAction: () => Promise<void>;
}

export function AdminSidebar({ logoutAction }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/theatres', label: 'Theatres', icon: Film },
    { href: '/admin/movies', label: 'Movies', icon: Clapperboard },
    { href: '/admin/shows', label: 'Shows', icon: Calendar },
    { href: '/admin/bookings', label: 'Bookings', icon: Ticket },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3.5 bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-40">
        <h2 className="text-lg font-serif font-bold tracking-tight text-white">
          Movie <span className="text-red-500">Admin</span>
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle admin menu"
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
          <h2 className="text-2xl font-serif font-bold tracking-tight text-white">
            Movie <span className="text-red-500">Admin</span>
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/10 hover:text-red-400 transition-all font-medium text-gray-300"
              >
                <Icon className="w-5 h-5 text-red-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="border-t border-gray-800 my-4 pt-4 space-y-1">
            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/10 hover:text-red-400 transition-all font-medium text-gray-300"
            >
              <Settings className="w-5 h-5 text-red-500" />
              <span>Change Password</span>
            </Link>

            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 hover:text-white transition-all font-medium text-gray-400"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <span>Back to Website</span>
            </Link>

            <form action={logoutAction} className="mt-2">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/10 hover:text-red-400 transition-all font-medium text-gray-300 text-left"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </nav>
      </aside>
    </>
  );
}
