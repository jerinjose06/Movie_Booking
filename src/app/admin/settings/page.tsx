'use client';

import { useState } from 'react';
import { changeAdminPassword } from '../actions';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await changeAdminPassword(formData);
      if (res.success) {
        toast.success("Password updated successfully!");
        (e.target as HTMLFormElement).reset();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-white mb-6">
        Admin <span className="text-red-500">Settings</span>
      </h1>
      
      <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-serif font-bold text-white mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
            <input 
              required 
              type="password" 
              name="old_password" 
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
            <input 
              required 
              type="password" 
              name="new_password" 
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
            />
          </div>

          <div className="pt-2">
            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
