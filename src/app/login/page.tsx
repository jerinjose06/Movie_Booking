'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { signInUser, signUpUser } from './actions';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

function LoginContent() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = activeTab === 'login' 
        ? await signInUser(formData) 
        : await signUpUser(formData);

      if (res.error) {
        setError(res.error);
        setShake(true);
        setLoading(false);
        setTimeout(() => setShake(false), 500);
      } else {
        router.push(next);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setShake(true);
      setLoading(false);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 py-12">
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
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">
              Movie <span className="text-red-500">Fan</span>
            </h1>
            <p className="text-gray-400 text-sm">Join the experience to book your tickets</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#121212] p-1 rounded-xl mb-6 border border-gray-850">
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'login' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'signup' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Animated Error Box */}
          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm mb-6 flex items-center gap-2.5 animate-pulse">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input 
                  required 
                  type="text" 
                  name="fullName" 
                  placeholder="e.g. Jerin Jose"
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input 
                required 
                type="email" 
                name="email" 
                placeholder="you@example.com"
                className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <div className="relative">
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  placeholder="••••••••"
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 pr-10 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50 text-sm"
              >
                {loading ? "Please wait..." : activeTab === 'login' ? "Log In" : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
