import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function AuditoriumConfigPage({ params }: { params: { auditoriumId: string } }) {
  const supabase = await createClient();
  const { data: auditorium } = await supabase.from('auditoriums').select('*, theatre:theatres(*)').eq('id', params.auditoriumId).single();

  if (!auditorium) return <div className="p-8">Auditorium not found</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/admin/theatres/${auditorium.theatre_id}`} className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
          &larr; Back to Theatre
        </Link>
        <h1 className="text-3xl font-bold">{auditorium.name}</h1>
        <p className="text-gray-400">Theatre: {auditorium.theatre?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Dimensions</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Room Width (m)</label>
                <input type="number" defaultValue={auditorium.room_width} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Room Depth (m)</label>
                <input type="number" defaultValue={auditorium.room_depth} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Room Height (m)</label>
                <input type="number" defaultValue={auditorium.room_height} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Screen Width (m)</label>
                <input type="number" defaultValue={auditorium.screen_width} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Screen Height (m)</label>
                <input type="number" defaultValue={auditorium.screen_height} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
              </div>
            </div>

            <button type="button" className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Save Dimensions
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">3D Model</h2>
            <p className="text-sm text-gray-400 mb-4">Upload a GLB or GLTF model to replace the standard walls/floor.</p>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:bg-gray-700/50 transition">
              <input type="file" accept=".glb,.gltf" className="hidden" id="model-upload" />
              <label htmlFor="model-upload" className="cursor-pointer text-blue-400 font-medium">
                Click to upload model
              </label>
              {auditorium.model_url && (
                <p className="text-sm text-green-400 mt-2">Current model uploaded.</p>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center justify-center border border-blue-500/30">
            <h2 className="text-xl font-bold mb-2">Seating Layout</h2>
            <p className="text-sm text-gray-400 mb-6 text-center">Visually position, rotate, and price seats in 3D space.</p>
            <Link 
              href={`/admin/auditoriums/${auditorium.id}/editor`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold w-full text-center shadow-lg shadow-blue-500/20"
            >
              Open 3D Layout Editor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
