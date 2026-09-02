import React, { useEffect } from 'react';
import { useEvent } from '../context/EventContext';
import { MorphLogo } from './MorphLogo';
import { SoundToggle } from './SoundToggle';
import { LiquidChromeCanvas } from './LiquidChromeCanvas';
import { morphAudio } from '../utils/audio';
import { ShieldCheck, Users } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useEvent();

  useEffect(() => {
    // Play light intro chime on initial load
    const timer = setTimeout(() => {
      morphAudio.playClick();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      id="landing-page"
      className="min-h-screen bg-chrome-canvas text-neutral-100 flex flex-col justify-between items-center p-6 relative overflow-hidden select-none"
    >
      {/* 60fps Liquid Chrome Atmosphere (Obsidian + Metallic Purple Caustics) */}
      <LiquidChromeCanvas intensity="medium" />

      {/* Top Header Toolbar */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_#c084fc]" />
          <span className="tracking-[0.2em] uppercase text-[11px] text-purple-300 font-bold">
            EVENT SYSTEM ONLINE
          </span>
        </div>
        <SoundToggle variant="pill" id="landing-sound-toggle" />
      </header>

      {/* Hero Center Liquid Chrome Vessel */}
      <div className="w-full max-w-md z-10 my-auto">
        <div className="chrome-panel p-8 md:p-10 text-center relative overflow-hidden border border-purple-400/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
          {/* Specular Liquid Light Reflection on Vessel */}
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-gradient-to-br from-purple-400/25 via-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-gradient-to-tl from-purple-600/20 via-fuchsia-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Morph Logo & Emblem */}
          <div className="mb-8 relative z-10">
            <MorphLogo size="hero" showSubtitle={true} idPrefix="landing" />
          </div>

          {/* Access Navigation Controls */}
          <div className="space-y-4 pt-2 relative z-10">
            <button
              id="admin-access-btn"
              type="button"
              onClick={() => {
                morphAudio.playClick();
                navigate('admin-login');
              }}
              className="w-full py-4 px-6 btn-chrome-secondary flex items-center justify-center gap-3 font-mono font-bold text-xs md:text-sm tracking-[0.25em] uppercase rounded-xl cursor-pointer group"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition" />
              <span>ADMIN ACCESS</span>
            </button>

            <button
              id="team-access-btn"
              type="button"
              onClick={() => {
                morphAudio.playClick();
                navigate('team-login');
              }}
              className="w-full py-4 px-6 btn-chrome-primary flex items-center justify-center gap-3 font-mono font-black text-xs md:text-sm tracking-[0.25em] uppercase rounded-xl cursor-pointer group shadow-xl"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span>TEAM ACCESS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom status */}
      <footer className="w-full text-center z-10 py-3 font-mono">
        <div className="text-[11px] text-slate-400 tracking-[0.25em] uppercase font-bold">
          THE JOSEPHITE BUSINESS CLUB
        </div>
      </footer>
    </main>
  );
};
