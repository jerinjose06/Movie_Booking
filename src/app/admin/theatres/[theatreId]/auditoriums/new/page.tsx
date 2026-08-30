'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAuditoriumLayout } from '../../../../actions';

export default function NewAuditoriumPage({ params }: { params: Promise<{ theatreId: string }> }) {
  const { theatreId } = React.use(params);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [name, setName] = useState('');
  const [rows, setRows] = useState(10);
  const [sections, setSections] = useState(3);
  const [columnsStr, setColumnsStr] = useState('4, 10, 4');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cols = columnsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (cols.length !== sections) {
        throw new Error(`You selected ${sections} sections, but provided ${cols.length} column values.`);
      }
      
      await createAuditoriumLayout(theatreId, name, rows, cols);
      router.push('/admin/theatres/' + theatreId);
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href={`/admin/theatres/${theatreId}`} className="text-red-500 hover:text-red-400 text-sm mb-4 inline-block font-medium">
        &larr; Back to Theatre
      </Link>
      <h1 className="text-3xl font-serif font-bold mb-6 text-white">Screen & Layout Builder</h1>
      
      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl space-y-6 shadow-xl text-white">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Screen Name</label>
          <input required type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Screen 1" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
        </div>
        
        <div className="border-t border-gray-800 pt-4">
          <h2 className="text-lg font-serif font-bold text-red-500 mb-4">Seating Arrangement</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Total Rows</label>
              <input required type="number" min="1" value={rows} onChange={e=>setRows(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Number of Sections</label>
              <input required type="number" min="1" max="10" value={sections} onChange={e=>setSections(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Columns per Section (Comma separated)</label>
            <input required type="text" value={columnsStr} onChange={e=>setColumnsStr(e.target.value)} placeholder="e.g. 4, 10, 4" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500/50 transition-all" />
            <p className="text-xs text-gray-500 mt-1">Must match the number of sections. E.g., for 3 sections: 4, 10, 4</p>
          </div>
        </div>

        <div className="bg-gray-900/60 p-4 rounded-xl text-sm text-gray-300 border border-gray-800">
          <strong>Preview:</strong> You are building a theatre with {rows} rows. 
          There will be {sections} sections of seats divided by aisles. 
          The 3D environment and projection screen will automatically scale to fit this layout!
        </div>

        <div className="pt-4">
          <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50">
            {loading ? "Generating Layout..." : "Generate Screen"}
          </button>
        </div>
      </form>
    </div>
  );
}
