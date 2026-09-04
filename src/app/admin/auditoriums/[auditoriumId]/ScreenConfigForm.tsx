'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateScreenConfig } from '../../actions';

interface ScreenConfigFormProps {
  auditoriumId: string;
  currentName: string;
  currentRows: number;
  currentSections: number;
  currentColumnsStr: string;
}

export function ScreenConfigForm({ 
  auditoriumId, 
  currentName, 
  currentRows,
  currentSections,
  currentColumnsStr
}: ScreenConfigFormProps) {
  const [name, setName] = useState(currentName);
  const [rows, setRows] = useState(currentRows || 10);
  const [sections, setSections] = useState(currentSections || 3);
  const [columnsStr, setColumnsStr] = useState(currentColumnsStr || '4, 10, 4');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Dynamic capacity calculation
  const cols = columnsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const seatsPerRow = cols.reduce((a, b) => a + b, 0);
  const calculatedTotalSeats = isNaN(rows) || isNaN(seatsPerRow) ? 0 : rows * seatsPerRow;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (cols.length !== sections) {
        throw new Error(`You selected ${sections} sections, but provided ${cols.length} column values.`);
      }

      const result = await updateScreenConfig(auditoriumId, name, rows, cols);
      if (result.error) {
        throw new Error(result.error);
      }
      
      alert("Configuration saved successfully!");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl space-y-6 shadow-xl text-white">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Screen Name</label>
        <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
      </div>

      <div className="border-t border-gray-800 pt-4">
        <h2 className="text-lg font-serif font-bold text-red-500 mb-4">Seating Arrangement (2D Config)</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Total Rows</label>
            <input required type="number" min="1" value={rows} onChange={e=>setRows(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Number of Sections</label>
            <input required type="number" min="1" max="10" value={sections} onChange={e=>setSections(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Columns per Section (Comma separated)</label>
          <input required type="text" value={columnsStr} onChange={e=>setColumnsStr(e.target.value)} placeholder="e.g. 4, 10, 4" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
          <p className="text-xs text-gray-500 mt-1">Must match the number of sections. E.g., for 3 sections: 4, 10, 4</p>
        </div>
      </div>

      <div className="bg-gray-900 p-4 rounded text-sm text-gray-300">
        <strong>Seating Preview:</strong> {rows || 0} rows × {seatsPerRow || 0} seats per row = <span className="text-red-500 font-bold">{calculatedTotalSeats} total seats</span>.
      </div>

      <div className="bg-yellow-900/10 border border-yellow-800/30 p-4 rounded text-sm text-yellow-300">
        <strong>Warning:</strong> Saving changes will regenerate all seat rows and positions in the database. The 3D layout will update automatically to match.
      </div>

      <div className="pt-2">
        <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50">
          {loading ? "Saving Configuration..." : "Save Configuration"}
        </button>
      </div>
    </form>
  );
}
