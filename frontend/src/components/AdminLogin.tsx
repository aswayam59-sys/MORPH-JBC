import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { MorphLogo } from './MorphLogo';
import { SoundToggle } from './SoundToggle';
import { LiquidChromeCanvas } from './LiquidChromeCanvas';
import { morphAudio } from '../utils/audio';
import { ShieldCheck, Lock, AlertCircle, KeyRound } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, navigate } = useEvent();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter your admin email and password or passcode.');
      morphAudio.playError();
      return;
    }

    setLoading(true);

    const success = await loginAdmin(cleanEmail, cleanPassword);
    if (success) morphAudio.playSuccess();
    else {
      setError('Invalid admin credentials.');
      morphAudio.playError();
    }
    setLoading(false);
  };

  return (
    <main
      id="admin-login-page"
      className="min-h-screen bg-chrome-canvas text-neutral-100 flex flex-col justify-between items-center p-6 relative overflow-hidden select-none font-mono"
    >
      <LiquidChromeCanvas intensity="medium" />

      <header className="w-full max-w-5xl flex items-center justify-between z-10 py-2">
        <button
          id="admin-login-brand-btn"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            navigate('landing');
          }}
          className="flex items-center gap-3 cursor-pointer text-slate-400 hover:text-white transition"
        >
          <MorphLogo size={32} idPrefix="admin-login-header" />
          <span className="text-xs tracking-widest font-black uppercase text-slate-200">
            EVENT CONTROL
          </span>
        </button>

        <SoundToggle variant="pill" id="admin-login-sound-toggle" />
      </header>

      <div className="w-full max-w-md z-10 my-auto">
        <div className="chrome-panel p-8 md:p-10 relative overflow-hidden border border-purple-400/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center mx-auto mb-4 text-purple-300 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h1 className="text-xl md:text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
              ADMIN LOGIN
            </h1>

            <p className="text-xs text-slate-400 mt-1.5 tracking-wide">
              Restricted to event controllers, hosts, and organizers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="admin-email-input"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between"
              >
                <span>Admin Email:</span>
                <ShieldCheck className="w-3 h-3 text-purple-400" />
              </label>

              <input
                id="admin-email-input"
                type="email"
                placeholder="Enter admin email..."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className="w-full chrome-input px-4 py-3.5 text-sm rounded-xl text-slate-100 tracking-wider font-bold"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between"
              >
                <span>Admin Password / Passcode:</span>
                <Lock className="w-3 h-3 text-purple-400" />
              </label>

              <input
                id="admin-password-input"
                type="password"
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full chrome-input px-4 py-3.5 text-sm rounded-xl text-slate-100 tracking-wider font-bold"
                autoComplete="current-password"
              />
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span className="text-slate-300">Admin Passcode:</span>
              </div>
              <button
                id="admin-autofill-passcode-btn"
                type="button"
                onClick={() => setError('Use the admin credentials configured in PostgreSQL.')}
                className="px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/50 font-mono text-purple-300 font-bold tracking-wider cursor-pointer transition text-[11px]"
                title="Click to auto-fill credentials"
              >
                DATABASE AUTHENTICATION
              </button>
            </div>

            {error && (
              <div
                id="admin-login-error"
                className="p-3.5 rounded-xl border border-red-800/80 bg-red-950/70 text-red-300 text-xs flex items-center gap-2 font-bold"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                id="admin-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-4 btn-chrome-primary rounded-xl text-xs font-black tracking-[0.25em] uppercase cursor-pointer shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>
                  {loading ? 'AUTHENTICATING...' : 'ENTER ADMIN DASHBOARD'}
                </span>
              </button>

              <button
                id="admin-back-btn"
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  navigate('landing');
                }}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 tracking-wider transition cursor-pointer"
              >
                ← CANCEL & RETURN
              </button>
            </div>

          </form>
        </div>
      </div>

      <footer className="w-full text-center z-10 py-3 font-mono">
        <div className="text-[11px] text-slate-400 tracking-[0.25em] uppercase font-bold">
          THE JOSEPHITE BUSINESS CLUB
        </div>
      </footer>
    </main>
  );
};
