import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';

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
        <Navbar />
        <main className="min-h-screen w-full relative">
          {children}
        </main>
      </body>
    </html>
  );
}
