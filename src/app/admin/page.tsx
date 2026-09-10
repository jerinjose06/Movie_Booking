import { checkAdmin } from './actions';
import { PromoteButton } from './PromoteButton';
import { createAdminClient } from '@/utils/supabase/admin';
import Link from 'next/link';
import { Users, IndianRupee, Calendar, Film } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const { isAuthorized } = await checkAdmin();

  if (!isAuthorized) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-white">Admin Access Required</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Your current account does not have administrator privileges. For development purposes, you can instantly upgrade your account using the button below.
        </p>
        <PromoteButton />
      </div>
    );
  }

  const adminClient = createAdminClient();

  // 1. Fetch live user count (all registered customer accounts)
  const { count: totalUsersCount } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .neq('full_name', 'Guest User');

  // 2. Fetch total and confirmed bookings count
  const { count: totalBookingsCount } = await adminClient
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  const { count: confirmedBookingsCount } = await adminClient
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'CONFIRMED');

  // 3. Fetch live revenue from confirmed bookings
  const { data: revenueData } = await adminClient
    .from('bookings')
    .select('total_amount')
    .eq('status', 'CONFIRMED');

  const totalRevenue = revenueData?.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) || 0;

  // 4. Fetch dynamic revenue & bookings breakdown per show
  const { data: showsRevenue } = await adminClient.rpc('get_shows_revenue');

  return (
    <div className="p-4 md:p-8 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
            Admin <span className="text-red-500">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Live database overview & performance metrics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-950/40 border border-green-800/40 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-green-400 text-xs font-medium">Live Data Synced</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total Users</p>
            <h3 className="text-3xl font-bold text-white">{totalUsersCount ?? 0}</h3>
            <p className="text-xs text-gray-500 mt-1">Registered customer accounts</p>
          </div>
          <div className="p-3 bg-red-950/40 border border-red-800/40 text-red-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total Bookings</p>
            <h3 className="text-3xl font-bold text-white">{totalBookingsCount ?? 0}</h3>
            <p className="text-xs text-green-400/80 mt-1">{confirmedBookingsCount ?? 0} Confirmed</p>
          </div>
          <div className="p-3 bg-red-950/40 border border-red-800/40 text-red-500 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total Revenue</p>
            <h3 className="text-3xl font-bold text-green-400">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-xs text-gray-500 mt-1">From confirmed payments</p>
          </div>
          <div className="p-3 bg-red-950/40 border border-red-800/40 text-red-500 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Section: Shows & Revenue Details */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-xl mb-10">
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#222]">
          <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            Show Revenue & Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-[#121212]/50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4 text-left">Movie Title</th>
                <th className="px-6 py-4 text-left">Location (Theatre & Screen)</th>
                <th className="px-6 py-4 text-left">Show Time</th>
                <th className="px-6 py-4 text-center">Confirmed Bookings</th>
                <th className="px-6 py-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
              {showsRevenue?.filter((show: any) => {
                const startTime = new Date(show.start_time).getTime();
                const now = Date.now();
                // Assume average duration of 3 hours (180 mins) if we don't have the exact movie duration in this RPC
                const endTime = startTime + 180 * 60 * 1000;
                return endTime > now;
              }).map((show: any) => (
                <tr key={show.show_id} className="hover:bg-gray-800/10 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{show.movie_title}</td>
                  <td className="px-6 py-4">
                    {show.theatre_name} — <span className="text-red-400">{show.screen_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(show.start_time).toLocaleDateString()} at{' '}
                    {new Date(show.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">{show.total_bookings}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-400">
                    ₹{Number(show.total_revenue).toFixed(2)}
                  </td>
                </tr>
              ))}
              {(!showsRevenue || showsRevenue.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    No scheduled shows or sales record found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <h2 className="text-lg md:text-xl font-serif font-bold mb-4 text-white">Quick Management</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Link href="/admin/theatres" className="bg-[#1a1a1a] hover:bg-gray-800/10 p-6 rounded-2xl border border-gray-800 hover:border-red-500/30 shadow-lg transition-all group">
          <h2 className="text-xl font-serif font-bold mb-2 text-white group-hover:text-red-500 transition-colors">Theatres & Screens</h2>
          <p className="text-gray-400 text-sm">Manage locations, screens, and edit seating layouts.</p>
        </Link>
        <Link href="/admin/movies" className="bg-[#1a1a1a] hover:bg-gray-800/10 p-6 rounded-2xl border border-gray-800 hover:border-red-500/30 shadow-lg transition-all group">
          <h2 className="text-xl font-serif font-bold mb-2 text-white group-hover:text-red-500 transition-colors">Movies & Schedules</h2>
          <p className="text-gray-400 text-sm">Add movies, upload poster artwork, and configure shows.</p>
        </Link>
        <Link href="/admin/bookings" className="bg-[#1a1a1a] hover:bg-gray-800/10 p-6 rounded-2xl border border-gray-800 hover:border-red-500/30 shadow-lg transition-all group">
          <h2 className="text-xl font-serif font-bold mb-2 text-white group-hover:text-red-500 transition-colors">Bookings & Sales</h2>
          <p className="text-gray-400 text-sm">Review user reservations, confirmation statuses, and seats.</p>
        </Link>
      </div>
    </div>
  );
}
