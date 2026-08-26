import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold tracking-tight text-white">Movie Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Dashboard</Link>
          <Link href="/admin/theatres" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Theatres</Link>
          <Link href="/admin/movies" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Movies</Link>
          <Link href="/admin/shows" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Shows</Link>
          <Link href="/admin/bookings" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Bookings</Link>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
