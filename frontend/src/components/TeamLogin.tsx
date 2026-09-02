import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { MorphLogo } from './MorphLogo';
import { SoundToggle } from './SoundToggle';
import { LiquidChromeCanvas } from './LiquidChromeCanvas';
import { morphAudio } from '../utils/audio';
import { Lock, Users, AlertCircle, ArrowRight } from 'lucide-react';

export const TeamLogin: React.FC = () => {
  const { loginTeam, navigate, teams } = useEvent();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => teams[0]?.id || '1');
  const [accessCode, setAccessCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Keep selectedTeamId in sync if teams load dynamically
  React.useEffect(() => {
    if (teams.length > 0 && !teams.some((t) => t.id === selectedTeamId)) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessCode.trim()) {
      setError('Please enter your team access code.');
      morphAudio.playError();
      return;
    }

    const success = await loginTeam(selectedTeamId, accessCode.trim());
    if (!success) {
      setError('Invalid access code. Please check your assigned team code.');
      morphAudio.playError();
    } else {
      morphAudio.playSuccess();
    }
  };

  return (
    <main
      id="team-login-page"
      className="min-h-screen bg-chrome-canvas text-neutral-100 flex flex-col justify-between items-center p-6 relative overflow-hidden select-none font-mono"
    >
      <LiquidChromeCanvas intensity="medium" />

      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 py-2">
        <button
          id="team-login-brand-btn"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            navigate('landing');
          }}
          className="flex items-center gap-3 cursor-pointer text-slate-400 hover:text-white transition"
        >
          <MorphLogo size={32} idPrefix="team-login-header" />
          <span className="text-xs tracking-widest font-black uppercase text-slate-200">
            EVENT PORTAL
          </span>
        </button>
        <SoundToggle variant="pill" id="team-login-sound-toggle" />
      </header>

      {/* Main Login Card */}
      <div className="w-full max-w-md z-10 my-auto">
        <div className="chrome-panel p-8 md:p-10 relative overflow-hidden border border-purple-400/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center mx-auto mb-4 text-purple-300 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
              TEAM LOGIN
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 tracking-wide">
              Select your registered team and enter confidential access code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="team-select"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2"
              >
                Select Team:
              </label>
              <select
                id="team-select"
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setError(null);
                  morphAudio.playClick();
                }}
                className="w-full chrome-input px-4 py-3.5 text-sm rounded-xl text-slate-100 cursor-pointer font-semibold"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id} className="bg-slate-900 text-white">
                    {team.teamNumber} {team.teamName !== team.teamNumber ? `(${team.teamName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="team-access-code-input"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between"
              >
                <span>Confidential Access Code:</span>
                <Lock className="w-3 h-3 text-purple-400" />
              </label>
              <input
                id="team-access-code-input"
                type="password"
                placeholder="e.g. MORPH-T01-XXXX"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError(null);
                }}
                className="w-full chrome-input px-4 py-3.5 text-sm rounded-xl text-slate-100 tracking-wider font-bold"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                id="team-login-error"
                className="p-3.5 rounded-xl border border-red-800/80 bg-red-950/70 text-red-300 text-xs flex items-center gap-2 font-bold"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                id="team-submit-btn"
                type="submit"
                className="w-full py-4 btn-chrome-primary rounded-xl text-xs font-black tracking-[0.25em] uppercase cursor-pointer shadow-xl flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-slate-950" />
                <span>ENTER TEAM DASHBOARD</span>
              </button>

              <button
                id="team-back-btn"
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
