import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Team, BrandConflict } from '../types';
import { AlertTriangle, Key, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TeamBrandConflictBannerProps {
  team: Team;
}

export const TeamBrandConflictBanner: React.FC<TeamBrandConflictBannerProps> = ({ team }) => {
  const { brandConflicts, submitConflictAnswer } = useEvent();
  const [answerInput, setAnswerInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Find active conflict involving this team
  const activeConflict = brandConflicts.find(
    (c) => c.status === 'ACTIVE' && c.conflictingTeamIds.includes(team.id)
  );

  if (!activeConflict) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim()) {
      setFeedback({ message: 'Please enter a decryption answer.', isError: true });
      return;
    }

    const res = submitConflictAnswer(activeConflict.id, team.id, answerInput.trim());
    if (res.success && res.isWinner) {
      setFeedback({
        message: `🏆 CONGRATULATIONS! Decryption Key Accepted! You have officially claimed ${activeConflict.brandName}!`,
        isError: false,
      });
      setAnswerInput('');
    } else {
      setFeedback({
        message: res.error || 'Incorrect decryption answer. Try again.',
        isError: true,
      });
    }
  };

  return (
    <section
      id="team-active-conflict-banner"
      className="border-2 border-red-600 bg-red-950/40 p-5 font-mono shadow-lg animate-pulse-slow space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-900 border border-red-600 text-white rounded">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-red-200 uppercase flex items-center gap-2">
              <span>⚔ BRAND CONFLICT IN PROGRESS</span>
              <span className="text-[10px] bg-red-900 px-2 py-0.5 border border-red-500 text-white font-bold">
                PRIORITY TIEBREAKER
              </span>
            </h2>
            <p className="text-xs text-red-300/90 mt-0.5">
              Contested Brand: <strong>{activeConflict.brandName}</strong> (Opponents: {activeConflict.conflictingTeamNumbers.join(' vs ')})
            </p>
          </div>
        </div>
      </div>

      {/* Riddle Challenge */}
      <div className="bg-neutral-950 border border-red-800/80 p-4 space-y-2">
        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
          DECIPHER RIDDLE TO CLAIM BRAND:
        </span>
        <p className="text-sm text-neutral-100 font-sans leading-relaxed">
          {activeConflict.puzzleText}
        </p>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Type your decryption answer here..."
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            className="w-full bg-neutral-950 border border-red-700 text-neutral-100 px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-400 font-mono uppercase"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Key className="w-4 h-4" />
          SUBMIT KEY
        </button>
      </form>

      {feedback && (
        <div
          className={`p-3 border text-xs font-semibold ${
            feedback.isError
              ? 'border-red-800 bg-red-950/80 text-red-300'
              : 'border-emerald-700 bg-emerald-950 text-emerald-200'
          }`}
        >
          {feedback.message}
        </div>
      )}
    </section>
  );
};
