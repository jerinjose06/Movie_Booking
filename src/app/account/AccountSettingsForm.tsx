'use client';

import { useState } from 'react';
import { updateProfile, updatePassword } from './actions';
import { User, Phone, Key, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';

interface AccountSettingsFormProps {
  profile: any;
  email: string;
}

export function AccountSettingsForm({ profile, email }: AccountSettingsFormProps) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateProfile(formData);
      if (res && res.error) {
        setProfileMsg({ type: 'error', text: res.error });
      } else {
        setProfileMsg({ type: 'success', text: "Profile updated successfully!" });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || "An unexpected error occurred" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updatePassword(formData);
      if (res && res.error) {
        setPasswordMsg({ type: 'error', text: res.error });
      } else {
        setPasswordMsg({ type: 'success', text: "Password updated successfully!" });
        e.currentTarget.reset();
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || "An unexpected error occurred" });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-gray-800 pb-px">
        <Link href="/account/bookings" className="text-gray-400 hover:text-white pb-3 text-sm font-semibold transition-colors">
          My Bookings
        </Link>
        <Link href="/account" className="text-red-500 border-b-2 border-red-500 pb-3 text-sm font-semibold transition-colors">
          Account Settings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings Card */}
        <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-white mb-1">Personal Details</h2>
            <p className="text-gray-400 text-xs">Update your display name and contact phone number.</p>
          </div>

          {profileMsg && (
            <div className={`p-3 rounded-xl text-sm flex items-center gap-2.5 animate-pulse ${
              profileMsg.type === 'success' 
                ? 'bg-green-950/40 border border-green-500/30 text-green-400' 
                : 'bg-red-950/40 border border-red-500/30 text-red-400'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address (Read-only)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  disabled 
                  value={email}
                  className="w-full bg-[#121212]/50 border border-gray-800/80 rounded-xl p-3 pl-10 text-gray-500 outline-none text-sm font-sans cursor-not-allowed" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  required 
                  type="text" 
                  name="fullName" 
                  defaultValue={profile?.full_name || ''}
                  placeholder="Your full name"
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 pl-10 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  defaultValue={profile?.phone_number || ''}
                  placeholder="e.g. +1 555-0199"
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 pl-10 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                disabled={profileLoading} 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-950/20 disabled:opacity-50 text-sm"
              >
                {profileLoading ? "Saving..." : "Save Details"}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-white mb-1">Security</h2>
            <p className="text-gray-400 text-xs">Update your sign in password security credentials.</p>
          </div>

          {passwordMsg && (
            <div className={`p-3 rounded-xl text-sm flex items-center gap-2.5 animate-pulse ${
              passwordMsg.type === 'success' 
                ? 'bg-green-950/40 border border-green-500/30 text-green-400' 
                : 'bg-red-950/40 border border-red-500/30 text-red-400'
            }`}>
              {passwordMsg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                  <Key className="w-4 h-4" />
                </div>
                <input 
                  required 
                  type="password" 
                  name="newPassword" 
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 pl-10 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                  <Key className="w-4 h-4" />
                </div>
                <input 
                  required 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="Re-type new password"
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 pl-10 text-white outline-none focus:border-red-500/50 transition-all text-sm font-sans" 
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                disabled={passwordLoading} 
                type="submit" 
                className="w-full bg-[#121212] border border-gray-800 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
