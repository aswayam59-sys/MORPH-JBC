import React, { useState, useEffect, useRef } from 'react';
import { useEvent } from '../context/EventContext';
import { morphAudio } from '../utils/audio';
import { AnimatedNumber } from './AnimatedNumber';
import { LiquidChromeCanvas } from './LiquidChromeCanvas';
import {
  ArrowLeft,
  Shuffle,
  Radio,
  Trophy,
  CheckCircle2,
  Sparkles,
  Users,
  Coins,
  Volume2,
  VolumeX,
  RotateCcw,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';

interface CelebritySpinWheelProps {
  onClose: () => void;
}

export const CelebritySpinWheel: React.FC<CelebritySpinWheelProps> = ({ onClose }) => {
  const {
    teams,
    celebrities,
    celebrityRoundConfig,
    spinAdminCelebrityWheel,
  } = useEvent();

  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedTeamResult, setSelectedTeamResult] = useState<{
    id: string;
    teamNumber: string;
    teamName: string;
    morphCoins: number;
    brand?: string;
    product?: string;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResultOverlay, setShowResultOverlay] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Eligible teams: teams that haven't claimed a celebrity yet
  const eligibleTeams = teams.filter((t) => !t.celebrityId);

  // Current selected team from state if any
  const currentSelectedTeam = celebrityRoundConfig.selectedTeamId
    ? teams.find((t) => t.id === celebrityRoundConfig.selectedTeamId)
    : null;

  // Wheel colors
  const segmentColors = [
    { bg: '#d97706', text: '#000000', border: '#f59e0b' }, // Amber
    { bg: '#1e1b4b', text: '#e0e7ff', border: '#4338ca' }, // Indigo
    { bg: '#0f172a', text: '#f8fafc', border: '#334155' }, // Slate dark
    { bg: '#b45309', text: '#ffffff', border: '#d97706' }, // Warm gold
    { bg: '#581c87', text: '#fae8ff', border: '#7e22ce' }, // Purple
    { bg: '#14532d', text: '#dcfce7', border: '#15803d' }, // Emerald
    { bg: '#7c2d12', text: '#ffedd5', border: '#c2410c' }, // Orange
    { bg: '#0369a1', text: '#e0f2fe', border: '#0284c7' }, // Sky
  ];

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 18;

    ctx.clearRect(0, 0, width, height);

    const teamList = eligibleTeams.length > 0 ? eligibleTeams : teams;
    const numSegments = Math.max(teamList.length, 1);
    const arc = (2 * Math.PI) / numSegments;

    // Draw outer golden glowing border
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.restore();

    // Outer dark rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Draw segments
    for (let i = 0; i < numSegments; i++) {
      const angle = i * arc;
      const t = teamList[i];
      const colorScheme = segmentColors[i % segmentColors.length];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.closePath();

      ctx.fillStyle = colorScheme.bg;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = colorScheme.border;
      ctx.stroke();

      // Text in segment
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = colorScheme.text;

      if (numSegments <= 8) {
        ctx.font = 'bold 20px monospace';
      } else if (numSegments <= 15) {
        ctx.font = 'bold 15px monospace';
      } else {
        ctx.font = 'bold 12px monospace';
      }

      const teamLabel = t ? `${t.teamNumber}` : `SLOT ${i + 1}`;
      ctx.fillText(teamLabel, radius - 25, 0);

      // Mini subtext if space allows
      if (numSegments <= 12 && t) {
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(t.teamName.slice(0, 10), radius - 95, 0);
      }

      ctx.restore();
      ctx.restore();
    }

    // Center Hub Outer
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 48, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Center Hub Inner
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 38);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fill();

    // Center Text
    ctx.font = '900 13px monospace';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MORPH', centerX, centerY - 5);
    ctx.font = 'bold 9px monospace';
    ctx.fillText('STAGE', centerX, centerY + 8);
    ctx.restore();
  }, [eligibleTeams, teams]);

  // Handle Spin Action
  const handleStartSpin = () => {
    if (isSpinning) return;
    if (eligibleTeams.length === 0) {
      alert('All teams have already acquired a celebrity card or no teams are eligible.');
      return;
    }

    morphAudio.playConfirm();
    setIsSpinning(true);
    setShowResultOverlay(false);
    setSelectedTeamResult(null);

    // Calculate rotation: multi-turns + random segment offset
    const fullTurns = 6 + Math.floor(Math.random() * 4); // 6 to 9 full spins
    const randomDeg = Math.floor(Math.random() * 360);
    const targetDeg = wheelRotation + fullTurns * 360 + randomDeg;

    setWheelRotation(targetDeg);

    // Beep sound effect synthesis if audio allowed
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        let tickCount = 0;
        const maxTicks = 20;
        const tickInterval = setInterval(() => {
          if (tickCount >= maxTicks) {
            clearInterval(tickInterval);
            return;
          }
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400 + tickCount * 25, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.08);
          tickCount++;
        }, 160);
      } catch {
        // Ignore audio errors in restricted environments
      }
    }

    setTimeout(() => {
      const result = spinAdminCelebrityWheel();
      setIsSpinning(false);

      if (result.success && result.selectedTeam) {
        setSelectedTeamResult({
          id: result.selectedTeam.id,
          teamNumber: result.selectedTeam.teamNumber,
          teamName: result.selectedTeam.teamName,
          morphCoins: result.selectedTeam.morphCoins,
          brand: result.selectedTeam.brand,
          product: result.selectedTeam.product,
        });
        setShowResultOverlay(true);
        morphAudio.playSuccess();
      }
    }, 3800);
  };

  const takenCardsCount = celebrities.filter((c) => c.status === 'TAKEN').length;

  return (
    <div
      id="full-page-spin-wheel-overlay"
      className="fixed inset-0 z-50 bg-[#030407] text-slate-100 flex flex-col justify-between font-mono overflow-y-auto"
    >
      <LiquidChromeCanvas intensity="medium" />
      {/* 1. TOP HEADER BAR */}
      <header className="border-b border-white/10 chrome-panel px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            id="btn-close-spin-wheel"
            onClick={() => {
              morphAudio.playClick();
              onClose();
            }}
            className="btn-chrome-secondary text-xs px-4 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>CLOSE / BACK TO DASHBOARD</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>ADMIN STAGE WHEEL</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              morphAudio.playClick();
              setSoundEnabled(!soundEnabled);
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-white/10 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span className="hidden md:inline text-[11px] font-bold">{soundEnabled ? 'SOUND ON' : 'MUTED'}</span>
          </button>

          {/* Quick Roster Status */}
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase">Eligible Teams</span>
            <span className="font-black text-amber-400 text-sm">
              {eligibleTeams.length} / {teams.length}
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN FULL-SCREEN WHEEL STAGE */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative min-h-[580px]">
        {/* Background Atmospheric Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Stage Title */}
        <div className="text-center space-y-1 mb-6 relative z-10">
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            STAGE CELEBRITY SPIN WHEEL
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Spin to select an eligible team. The selected team will be granted exclusive authorization to purchase an available Mystery Celebrity card.
          </p>
        </div>

        {/* WHEEL CONTAINER */}
        <div className="relative flex flex-col items-center justify-center my-2">
          
          {/* Top Indicator Pointer */}
          <div className="absolute -top-5 z-20 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(245,158,11,0.6)]" />
          </div>

          {/* Rotating Canvas */}
          <div
            className="relative rounded-full shadow-[0_0_60px_rgba(0,0,0,0.8)] border-4 border-white/20 p-1 bg-slate-950"
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none',
            }}
          >
            <canvas
              ref={canvasRef}
              width={480}
              height={480}
              className="w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] rounded-full cursor-pointer select-none"
            />
          </div>

          {/* SPIN ACTION BUTTON */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 z-10">
            <button
              id="btn-spin-wheel-action"
              onClick={handleStartSpin}
              disabled={isSpinning || eligibleTeams.length === 0}
              className={`px-10 py-4 rounded-xl font-mono font-black text-base sm:text-lg uppercase tracking-wider flex items-center gap-3 transition-all duration-300 shadow-2xl cursor-pointer ${
                isSpinning
                  ? 'btn-chrome-primary opacity-90 cursor-wait animate-pulse'
                  : eligibleTeams.length === 0
                  ? 'bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed'
                  : 'btn-chrome-primary text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.3)]'
              }`}
            >
              <Shuffle className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'SPINNING... SELECTING TEAM' : 'SPIN WHEEL'}</span>
            </button>

            {currentSelectedTeam && !isSpinning && (
              <div className="chrome-panel border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs shadow-lg">
                <span className="text-slate-400">Current Pick:</span>
                <span className="bg-amber-400 text-black font-black px-2 py-0.5 rounded font-mono">
                  {currentSelectedTeam.teamNumber}
                </span>
                <span className="text-white font-bold">{currentSelectedTeam.teamName}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. RESULT MODAL OVERLAY ON SELECTION */}
        {showResultOverlay && selectedTeamResult && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="chrome-panel border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
              
              {/* Close icon */}
              <button
                onClick={() => {
                  morphAudio.playClick();
                  setShowResultOverlay(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                  WHEEL SELECTION COMPLETED
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {selectedTeamResult.teamNumber}
                </h2>
                <p className="text-base font-bold text-slate-300">
                  {selectedTeamResult.teamName}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto pt-1">
                  <strong>{selectedTeamResult.teamNumber} HAS BEEN SELECTED</strong>. They have been authorized on their screen to choose from the available Mystery Celebrity cards.
                </p>
              </div>

              {/* Team Stats Summary */}
              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center text-xs shadow-inner">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Coins</span>
                  <span className="font-bold text-amber-300">₹{selectedTeamResult.morphCoins.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Brand</span>
                  <span className="font-bold text-purple-300 truncate block">{selectedTeamResult.brand || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Product</span>
                  <span className="font-bold text-emerald-300 truncate block">{selectedTeamResult.product || '—'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="btn-spin-continue-admin"
                  onClick={() => {
                    morphAudio.playClick();
                    setShowResultOverlay(false);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 btn-chrome-primary text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONTINUE TO DASHBOARD</span>
                </button>

                <button
                  onClick={() => {
                    morphAudio.playClick();
                    setShowResultOverlay(false);
                  }}
                  className="py-3 px-4 btn-chrome-secondary font-bold text-xs uppercase tracking-wider"
                >
                  <span>STAY ON WHEEL</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. BOTTOM ROSTER SUMMARY BAR */}
      <footer className="border-t border-white/10 chrome-panel px-6 py-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4 text-amber-400" />
            <span>
              Eligible for Next Spin ({eligibleTeams.length}):{' '}
              <strong className="text-white">
                {eligibleTeams.map((t) => t.teamNumber).join(', ') || 'None (All teams selected)'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Claimed Endorsements:{' '}
              <strong className="text-purple-300">{takenCardsCount} / 15 Teams</strong>
            </span>
            <button
              onClick={() => {
                morphAudio.playClick();
                onClose();
              }}
              className="text-amber-400 hover:underline font-bold cursor-pointer"
            >
              [ Return to Admin Control ]
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
