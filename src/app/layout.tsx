import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { ToasterProvider } from '@/components/layout/ToasterProvider';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: '3D Movie Theatre',
  description: 'Book your seats in 3D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${inter.variable} ${playfair.variable} dark`}>
      <body className='min-h-screen bg-[#121212] text-white antialiased font-sans flex flex-col md:flex-row'>
        <ToasterProvider />
        <Navbar />
        <main className="flex-1 overflow-auto min-w-0 min-h-screen relative bg-[#121212]">
          {children}
        </main>
      </body>
    </html>
  );
}
