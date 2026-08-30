'use client';

import { useState } from 'react';
import { adminLogin } from './actions';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await adminLogin(formData);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
      setShake(true);
      setLoading(false);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 pt-16">
      {/* Inject custom shake keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .shake-anim {
          animation: shake 0.4s ease-in-out;
        }
      `}} />

      <div className={`max-w-md w-full ticket-cutout bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-350 ${shake ? 'shake-anim border-red-500/50' : ''}`}>
        <div className="h-2 bg-gradient-to-r from-red-600 to-red-500 w-full" />
        
        <div className="p-8 relative">
          <Link href="/" className="absolute top-4 left-4 text-gray-500 hover:text-red-500 transition-colors inline-flex items-center gap-1.5 text-xs font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>

          <div className="text-center mb-8 mt-4">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">
              Movie <span className="text-red-500">Admin</span>
            </h1>
            <p className="text-gray-400 text-sm">Please log in to manage your theatre</p>
          </div>

          {/* Animated Error Box */}
          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm mb-6 flex items-center gap-2.5 animate-pulse">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
              <input 
                required 
                type="text" 
                name="username" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input 
                required 
                type="password" 
                name="password" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
              />
            </div>

            <div className="pt-4">
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
