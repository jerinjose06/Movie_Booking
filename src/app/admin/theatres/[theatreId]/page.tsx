import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function TheatreDetailsPage({ params }: { params: { theatreId: string } }) {
  const supabase = await createClient();
  const { data: theatre } = await supabase.from('theatres').select('*').eq('id', params.theatreId).single();
  const { data: auditoriums } = await supabase.from('auditoriums').select('*').eq('theatre_id', params.theatreId).order('name');

  if (!theatre) return <div className="p-8">Theatre not found</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/theatres" className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
          &larr; Back to Theatres
        </Link>
        <h1 className="text-3xl font-bold">{theatre.name}</h1>
        <p className="text-gray-400">{theatre.location}</p>
      </div>

      <div className="flex justify-between items-center mb-6 mt-12">
        <h2 className="text-2xl font-bold">Auditoriums</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Create Auditorium
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {auditoriums?.map((aud: any) => (
              <tr key={aud.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{aud.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${aud.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {aud.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/auditoriums/${aud.id}`} className="text-blue-400 hover:text-blue-300">
                    Configure
                  </Link>
                </td>
              </tr>
            ))}
            {auditoriums?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-400">
                  No auditoriums found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
