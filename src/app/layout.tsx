
import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: '3D Movie Theatre',
  description: 'Book your seats in 3D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${inter.variable} ${playfair.variable} dark`}>
      <body className='min-h-screen bg-[#121212] text-white antialiased font-sans'>
        <nav className='border-b border-gray-800 bg-[#1a1a1a] p-6 flex items-center justify-between'>
          <div className="flex gap-8 items-center">
            <Link href='/' className='font-serif font-bold text-2xl text-red-500'>Movie Fan</Link>
            <Link href='/movies' className='text-gray-300 hover:text-white transition-colors'>Movies</Link>
            <Link href='/theatres' className='text-gray-300 hover:text-white transition-colors'>Theatres</Link>
          </div>
          <div className="flex gap-6 items-center">
            <Link href='/account' className='text-gray-300 hover:text-white transition-colors'>Account</Link>
            <Link href='/admin' className='text-gray-300 hover:text-white transition-colors'>Admin</Link>
          </div>
        </nav>
        <main className="min-h-screen w-full relative">
          {children}
        </main>
      </body>
    </html>
  );
}

