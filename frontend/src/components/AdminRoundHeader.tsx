import React from 'react';
import { Eye, EyeOff, Play, Pause, CheckCircle2, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';
import { morphAudio } from '../utils/audio';

export interface AdminRoundHeaderProps {
  roundBadge?: string; // e.g. "ROUND 1", "ROUND 2", "ROUND 3", "ROUND 4"
  roundNumber?: number; // e.g. 6 -> "ROUND 6"
  roundName?: string; // e.g. "BRAND AUCTION", "PRODUCT REVEAL", "MORPH CARDS", "PRODUCT CREATION"
  roundTitle?: string; // alias for roundName
  description?: string;
  infoReleased: boolean;
  roundStatus: 'LOCKED' | 'INACTIVE' | 'ACTIVE' | 'COMPLETED' | string;
  showInfoReleaseControls?: boolean; // Set false if round does not have a separate info release step
  
  // Action Handlers
  onReleaseInfo?: () => void;
  onHideInfo?: () => void;
  onReleaseRound: () => void;
  onPauseRound?: () => void;
  onCompleteRound: () => void;
  onReopenRound?: () => void;
  onReset?: () => void;
  onResetRound?: () => void; // alias for onReset
  
  // Custom Labels & Flags
  releaseRoundLabel?: string; // Default: "RELEASE ROUND"
  pauseRoundLabel?: string; // Default: "PAUSE ROUND"
  completeRoundLabel?: string; // Default: "COMPLETE ROUND"
  resetLabel?: string; // Default: "RESET ROUND"
  hasReset?: boolean;
  extraStatusBadges?: React.ReactNode;
  extraActionButtons?: React.ReactNode;
  children?: React.ReactNode;
  idPrefix?: string;
}

export const AdminRoundHeader: React.FC<AdminRoundHeaderProps> = ({
  roundBadge,
  roundNumber,
  roundName,
  roundTitle,
  description = 'Manage round release status, participant information visibility, and stage execution.',
  infoReleased,
  roundStatus,
  showInfoReleaseControls = true,
  onReleaseInfo,
  onHideInfo,
  onReleaseRound,
  onPauseRound,
  onCompleteRound,
  onReopenRound,
  onReset,
  onResetRound,
  releaseRoundLabel = 'RELEASE ROUND',
  pauseRoundLabel = 'PAUSE ROUND',
  completeRoundLabel = 'COMPLETE ROUND',
  resetLabel = 'RESET ROUND',
  hasReset = true,
  extraStatusBadges,
  extraActionButtons,
  children,
  idPrefix = 'admin-round',
}) => {
  const displayBadge = roundBadge || (typeof roundNumber === 'number' ? `ROUND ${roundNumber}` : undefined);
  const displayName = roundName || roundTitle || 'ROUND';
  const handleReset = onReset || onResetRound;
  const isRoundActive = roundStatus === 'ACTIVE';
  const isRoundCompleted = roundStatus === 'COMPLETED';
  const isRoundLocked = roundStatus === 'LOCKED' || roundStatus === 'INACTIVE';

  return (
    <div className="chrome-panel p-6 shadow-2xl font-mono relative overflow-hidden border border-white/10" id={`${idPrefix}-control-header`}>
      {/* Background chromatic glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {displayBadge && (
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-purple-300 font-extrabold bg-purple-950/70 border border-purple-800/80 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                {displayBadge}
              </span>
            )}
            <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-mono uppercase">
              {displayName}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Unified Granular Status Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Info Status Pill */}
          {showInfoReleaseControls && (
            <div className="flex items-center gap-2 bg-slate-950/90 border border-white/10 px-3 py-2 rounded-xl shadow-inner">
              <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">INFO:</span>
              <span
                id={`${idPrefix}-info-status-pill`}
                className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                  infoReleased
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                    : 'bg-red-950/80 text-red-400 border border-red-800/80'
                }`}
              >
                {infoReleased ? 'RELEASED' : 'HIDDEN'}
              </span>
            </div>
          )}

          {/* Round Activity Status Pill */}
          <div className="flex items-center gap-2 bg-slate-950/90 border border-white/10 px-3 py-2 rounded-xl shadow-inner">
            <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">STAGE:</span>
            <span
              id={`${idPrefix}-round-status-pill`}
              className={`text-[11px] font-mono font-extrabold px-3 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1.5 ${
                isRoundActive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse'
                  : isRoundCompleted
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-700/80'
                  : 'bg-red-950/80 text-red-400 border border-red-800/80'
              }`}
            >
              {isRoundActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              {isRoundActive
                ? 'ACTIVE'
                : isRoundCompleted
                ? 'COMPLETED'
                : 'LOCKED'}
            </span>
          </div>

          {/* Extra Status Badges if any */}
          {extraStatusBadges}
        </div>
      </div>

      {/* ADMIN ACTION BUTTONS ROW */}
      <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Step 1: RELEASE INFO / HIDE INFO */}
          {showInfoReleaseControls && onReleaseInfo && onHideInfo && (
            !infoReleased ? (
              <button
                id={`${idPrefix}-btn-release-info`}
                type="button"
                onClick={() => {
                  morphAudio.playConfirm();
                  onReleaseInfo();
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                RELEASE INFO
              </button>
            ) : (
              <button
                id={`${idPrefix}-btn-hide-info`}
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  onHideInfo();
                }}
                className="flex items-center gap-2 btn-chrome-secondary text-amber-300 font-mono font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl border border-amber-900/50 transition cursor-pointer"
              >
                <EyeOff className="w-4 h-4" />
                HIDE INFO
              </button>
            )
          )}

          {/* Step 2: RELEASE ROUND / PAUSE ROUND */}
          {!isRoundActive ? (
            <button
              id={`${idPrefix}-btn-release-round`}
              type="button"
              onClick={() => {
                morphAudio.playRoundRelease();
                onReleaseRound();
              }}
              className="flex items-center gap-2 btn-chrome-primary text-slate-950 font-mono font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {releaseRoundLabel}
            </button>
          ) : (
            onPauseRound && (
              <button
                id={`${idPrefix}-btn-pause-round`}
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  onPauseRound();
                }}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current" />
                {pauseRoundLabel}
              </button>
            )
          )}

          {/* Step 3: COMPLETE ROUND / REOPEN ROUND */}
          {!isRoundCompleted ? (
            <button
              id={`${idPrefix}-btn-complete-round`}
              type="button"
              onClick={() => {
                morphAudio.playConfirm();
                onCompleteRound();
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(37,99,235,0.25)] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {completeRoundLabel}
            </button>
          ) : (
            onReopenRound && (
              <button
                id={`${idPrefix}-btn-reopen-round`}
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  onReopenRound();
                }}
                className="flex items-center gap-2 btn-chrome-secondary text-slate-300 font-mono font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                REOPEN ROUND
              </button>
            )
          )}

          {/* Any extra round-specific action buttons */}
          {extraActionButtons}
        </div>

        {/* RESET BUTTON */}
        {hasReset && handleReset && (
          <div className="flex items-center gap-3">
            <button
              id={`${idPrefix}-btn-reset-round`}
              type="button"
              onClick={() => {
                morphAudio.playClick();
                handleReset();
              }}
              className="flex items-center gap-2 btn-chrome-danger font-mono font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer"
              title="Reset round progress"
            >
              <RotateCcw className="w-4 h-4" />
              {resetLabel}
            </button>
          </div>
        )}
      </div>

      {/* Render optional child elements */}
      {children}
    </div>
  );
};

