'use client';

// Removed useEffect
import * as React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { EditorScene } from '@/components/admin/editor/EditorScene';
import Link from 'next/link';

export default function EditorPage({ params }: { params: Promise<{ auditoriumId: string }> }) {
  const { auditoriumId } = React.use(params);
  const { mode, setMode, selectedSeatIds, duplicateSelected, deleteSelected, addSeat } = useEditorStore();

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-gray-900 text-white">
      {/* Sidebar Tool Panel */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col z-10 shadow-2xl">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">Layout Editor</h2>
          <Link href={`/admin/auditoriums/${auditoriumId}`} className="text-sm text-blue-400 hover:text-blue-300">
            &larr; Exit to Settings
          </Link>
        </div>

        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Tools */}
          <div>
            <h3 className="text-xs uppercase text-gray-500 font-bold mb-3">Tools</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setMode('SELECT')}
                className={`p-2 rounded text-left ${mode === 'SELECT' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Pointer
              </button>
              <button 
                onClick={() => setMode('MOVE')}
                className={`p-2 rounded text-left ${mode === 'MOVE' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Move
              </button>
              <button 
                onClick={() => setMode('ROTATE')}
                className={`p-2 rounded text-left ${mode === 'ROTATE' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Rotate
              </button>
            </div>
          </div>

          {/* Creation */}
          <div>
            <h3 className="text-xs uppercase text-gray-500 font-bold mb-3">Create</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => addSeat({
                  id: `seat-${Date.now()}`,
                  rowName: 'A',
                  seatNumber: 1,
                  typeId: 1,
                  x: 0, y: 0, z: 0,
                  rotX: 0, rotY: 0, rotZ: 0
                })}
                className="p-2 rounded text-left bg-gray-700 hover:bg-gray-600"
              >
                + Add Single Seat
              </button>
              <button 
                onClick={() => {
                  const count = parseInt(window.prompt('How many seats in this row?', '10') || '0');
                  const rowName = window.prompt('Row name (e.g. A)?', 'A') || 'A';
                  if (count > 0) {
                    for (let i = 0; i < count; i++) {
                      addSeat({
                        id: `seat-${Date.now()}-${i}`,
                        rowName: rowName,
                        seatNumber: i + 1,
                        typeId: 1,
                        x: (i - count/2) * 1.5, // 1.5 units spacing
                        y: 0,
                        z: 0,
                        rotX: 0, rotY: 0, rotZ: 0
                      });
                    }
                  }
                }}
                className="p-2 rounded text-left bg-gray-700 hover:bg-gray-600"
              >
                + Add Row
              </button>
            </div>
          </div>

          {/* Actions */}
          {selectedSeatIds.length > 0 && (
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-bold mb-3">Actions ({selectedSeatIds.length})</h3>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={duplicateSelected}
                  className="p-2 rounded text-left bg-gray-700 hover:bg-gray-600"
                >
                  Duplicate
                </button>
                <button 
                  onClick={deleteSelected}
                  className="p-2 rounded text-left bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded">
            Save Configuration
          </button>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="flex-1 relative">
        {/* Mode overlay */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={() => setMode(mode === 'PREVIEW' ? 'SELECT' : 'PREVIEW')}
            className={`px-4 py-2 rounded font-bold shadow-lg ${mode === 'PREVIEW' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {mode === 'PREVIEW' ? 'Exit Preview' : 'Preview Mode'}
          </button>
        </div>
        
        <EditorScene />
      </div>
    </div>
  );
}
