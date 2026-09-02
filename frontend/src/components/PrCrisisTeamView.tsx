import React from 'react';
import { useEvent } from '../context/EventContext';
import {
  AlertTriangle,
  FileText,
  Clock,
  Send,
  ShieldAlert,
  HelpCircle,
  Users,
  Paperclip,
  Hourglass,
  Sparkles,
  Award,
  Coins,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const PrCrisisTeamView: React.FC = () => {
  const { prCrisisConfig, getAuthenticatedTeam, getRoundJudgingState } = useEvent();
  const currentTeam = getAuthenticatedTeam();

  const isRoundActive = prCrisisConfig.roundStatus === 'ACTIVE';
  const isRoundCompleted = prCrisisConfig.roundStatus === 'COMPLETED';

  // Judging & Score state for this team
  const judgingState = getRoundJudgingState('PR_CRISIS');
  const teamScoreRec = currentTeam ? judgingState.teamScores[currentTeam.id] : null;
  const isGlobalReleased = judgingState.isScoresReleased ?? judgingState.scoresReleased ?? false;
  const isTeamScoreReleased = teamScoreRec?.isReleased ?? isGlobalReleased;
  const isScoreVisible = isTeamScoreReleased && teamScoreRec?.isConfirmed;

  return (
    <div id="pr-crisis-team-view" className="space-y-6 font-mono max-w-5xl mx-auto">
      {/* 1. HEADER & STATUS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>ROUND 6 // EMERGENCY CRISIS MANAGEMENT</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              {prCrisisConfig.roundName || 'PR CRISIS'}
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              {prCrisisConfig.objective}
            </p>
          </div>

          {/* STATUS PILL */}
          <div className="flex-shrink-0">
            {isRoundActive ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider shadow-lg animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>ROUND ACTIVE</span>
              </div>
            ) : isRoundCompleted ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-black uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                <span>ROUND COMPLETED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Hourglass className="w-4 h-4 text-amber-400 animate-spin" />
                <span>WAITING FOR ROUND TO START</span>
              </div>
            )}
          </div>
        </div>

        {/* TEAM SPLIT NOTICE */}
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <Users className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-black uppercase tracking-wide block">STRATEGIC TEAM SPLIT</span>
            <span className="text-neutral-300">
              <strong>2 Members:</strong> Emergency PR Crisis strategy, press statement & presentation. | <strong>1 Member:</strong> MORPH Market strategic capital allocation desk.
            </span>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL SCORECARD (WHEN RELEASED) OR PENDING STATE */}
      {isScoreVisible ? (
        <div className="bg-neutral-900 border-2 border-purple-500/50 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  OFFICIAL EVALUATION SCORECARD
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mt-1">
                  PR CRISIS EVALUATION RESULTS
                </h3>
              </div>
            </div>

            {/* AWARDED COINS PILL */}
            <div className="p-3 bg-amber-950/40 border border-amber-500/50 rounded-xl flex items-center gap-3">
              <Coins className="w-6 h-6 text-amber-400" />
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Morph Coins Awarded</span>
                <span className="text-xl font-black text-amber-300">
                  +₹{(teamScoreRec?.morphCoinsEarned || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* CRITERIA BREAKDOWN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {judgingState.criteria.map((c) => {
              const rawScore = teamScoreRec?.scores[c.id] ?? 0;
              const criterionContribution = ((rawScore * c.weightage) / 100);

              return (
                <div key={c.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-200 truncate" title={c.name}>
                      {c.name}
                    </span>
                    <span className="text-[10px] text-purple-400 font-bold">{c.weightage}%</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xl font-black text-white">{rawScore}</span>
                    <span className="text-[10px] text-neutral-500">/ 100</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 border-t border-neutral-800/80 pt-1">
                    Contrib: <strong className="text-purple-300">+{criterionContribution.toFixed(1)} pts</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TOTAL SCORE SUMMARY */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-neutral-300">
                Official Score Computed: <strong className="text-purple-300">{teamScoreRec?.weightedScore.toFixed(1)} / 100</strong>
              </span>
            </div>
            <span className="text-neutral-400">
              Formula: {teamScoreRec?.weightedScore.toFixed(1)} × 100 ={' '}
              <strong className="text-amber-300">₹{(teamScoreRec?.morphCoinsEarned || 0).toLocaleString()} Coins Credited to Vault</strong>
            </span>
          </div>
        </div>
      ) : isRoundCompleted ? (
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-purple-500/10 text-purple-400 mb-1">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            JUDGING & EVALUATION IN PROGRESS
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            The panel is reviewing crisis strategies and presentations. Official scorecards and Morph Coin allocations will appear here once released.
          </p>
        </div>
      ) : null}

      {/* 3. CASE / SITUATION (PROMINENT HIGHLIGHT) */}
      <div className="bg-neutral-900 border-2 border-red-500/40 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 text-red-400">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-sm md:text-base font-black uppercase tracking-widest text-red-400">
            CASE / SITUATION
          </h2>
        </div>

        <div className="bg-neutral-950/80 border border-red-500/20 rounded-xl p-5 md:p-6 text-neutral-100 text-sm leading-relaxed whitespace-pre-line font-mono">
          {prCrisisConfig.crisisCaseText}
        </div>

        {prCrisisConfig.attachmentUrl && (
          <div className="pt-2">
            <a
              href={prCrisisConfig.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-300 rounded-lg text-xs font-bold transition"
            >
              <Paperclip className="w-4 h-4 text-amber-400" />
              <span>VIEW ATTACHED CASE DOSSIER: {prCrisisConfig.attachmentName || 'Download Document'}</span>
            </a>
          </div>
        )}
      </div>

      {/* 4. DELIVERABLES & SUBMISSION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DELIVERABLES */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>DELIVERABLES</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
            {prCrisisConfig.deliverables}
          </div>
        </div>

        {/* SUBMISSION METHOD */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Send className="w-4 h-4" />
            <span>SUBMISSION METHOD</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
            {prCrisisConfig.submissionMethod}
          </div>
        </div>
      </div>

      {/* 5. DEADLINE & RULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TIME / DEADLINE */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-black uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>TIME / DEADLINE</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 text-sm font-bold text-white">
            {prCrisisConfig.submissionDeadline}
          </div>
        </div>

        {/* RULES */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>RULES</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 text-xs text-neutral-300 whitespace-pre-line leading-relaxed">
            {prCrisisConfig.rules}
          </div>
        </div>
      </div>

      {/* ADDITIONAL INSTRUCTIONS IF PRESENT */}
      {prCrisisConfig.additionalInstructions && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-2">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>ADDITIONAL INSTRUCTIONS</span>
          </div>
          <p className="text-xs text-neutral-400 whitespace-pre-line leading-relaxed">
            {prCrisisConfig.additionalInstructions}
          </p>
        </div>
      )}
    </div>
  );
};
