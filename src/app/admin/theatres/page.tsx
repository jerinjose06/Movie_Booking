import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function TheatresPage() {
  const supabase = await createClient();
  const { data: theatres, error } = await supabase.from('theatres').select('*').order('name');

  if (error) {
    console.error(error);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Theatres</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Create Theatre
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {theatres?.map((theatre: any) => (
              <tr key={theatre.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{theatre.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{theatre.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/theatres/${theatre.id}`} className="text-blue-400 hover:text-blue-300">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {theatres?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-400">
                  No theatres found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
