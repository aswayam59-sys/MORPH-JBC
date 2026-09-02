import React from 'react';
import { useEvent } from '../context/EventContext';
import {
  TrendingUp,
  FileText,
  Clock,
  Send,
  ShieldAlert,
  HelpCircle,
  Paperclip,
  Hourglass,
  Sparkles,
  Award,
  Coins,
  CheckCircle2,
  Globe,
  DollarSign,
  Target,
  Trophy,
} from 'lucide-react';

export const FinalGrowthTeamView: React.FC = () => {
  const { finalGrowthConfig, getAuthenticatedTeam, getRoundJudgingState } = useEvent();
  const currentTeam = getAuthenticatedTeam();

  const isRoundActive = finalGrowthConfig.roundStatus === 'ACTIVE';
  const isRoundCompleted = finalGrowthConfig.roundStatus === 'COMPLETED';

  // Judging & Score state for this team
  const judgingState = getRoundJudgingState('FINAL_GROWTH');
  const teamScoreRec = currentTeam ? judgingState.teamScores[currentTeam.id] : null;
  const isGlobalReleased = judgingState.isScoresReleased ?? judgingState.scoresReleased ?? false;
  const isTeamScoreReleased = teamScoreRec?.isReleased ?? isGlobalReleased;
  const isScoreVisible = isTeamScoreReleased && teamScoreRec?.isConfirmed;

  return (
    <div id="final-growth-team-view" className="space-y-6 font-mono max-w-5xl mx-auto">
      {/* 1. HEADER & STATUS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>ROUND 8 // THE GRAND FINALE — SCALING & EXPANSION</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              {finalGrowthConfig.roundName || 'FINAL GROWTH EXPANSION'}
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              {finalGrowthConfig.objective}
            </p>
          </div>

          {/* STATUS PILL */}
          <div className="flex-shrink-0">
            {isRoundActive ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs font-black uppercase tracking-wider shadow-lg animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>GRAND FINALE ACTIVE</span>
              </div>
            ) : isRoundCompleted ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ROUND COMPLETED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Hourglass className="w-4 h-4 text-amber-400 animate-spin" />
                <span>AWAITING GRAND FINALE COMMENCEMENT</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL SCORECARD (WHEN RELEASED) */}
      {isScoreVisible ? (
        <div className="bg-neutral-900 border-2 border-purple-500 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  GRAND FINALE SCORECARD
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mt-1">
                  FINAL GROWTH EXPANSION RESULTS
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
              <strong className="text-amber-300">₹{(teamScoreRec?.morphCoinsEarned || 0).toLocaleString()} Coins Added to Final Vault</strong>
            </span>
          </div>
        </div>
      ) : isRoundCompleted ? (
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-purple-500/10 text-purple-400 mb-1">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            GRAND FINALE JUDGING IN PROGRESS
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            The grand jury is evaluating final pitch presentations and growth models. Final scorecard and Morph Coin distribution will be revealed shortly.
          </p>
        </div>
      ) : null}

      {/* 3. CASE DOSSIER */}
      <div className="bg-neutral-900 border-2 border-purple-500/40 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 text-purple-400">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-sm md:text-base font-black uppercase tracking-widest text-purple-300">
            STRATEGIC CASE DOSSIER // MARKET EXPANSION & SCALING
          </h2>
        </div>

        <div className="bg-neutral-950/80 border border-purple-500/20 rounded-xl p-5 md:p-6 text-neutral-100 text-sm leading-relaxed whitespace-pre-line font-mono">
          {finalGrowthConfig.caseStudyText}
        </div>

        {finalGrowthConfig.attachmentUrl && (
          <div className="pt-2">
            <a
              href={finalGrowthConfig.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-purple-300 rounded-lg text-xs font-bold transition"
            >
              <Paperclip className="w-4 h-4 text-purple-400" />
              <span>DOWNLOAD SUPPORTING FINANCIAL MODELS: {finalGrowthConfig.attachmentName || 'Case Materials'}</span>
            </a>
          </div>
        )}
      </div>

      {/* 4. DELIVERABLES & SUBMISSION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DELIVERABLES */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>FINAL PITCH DELIVERABLES</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
            {finalGrowthConfig.deliverables}
          </div>
        </div>

        {/* SUBMISSION METHOD */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-wider">
            <Send className="w-4 h-4" />
            <span>PRESENTATION & SUBMISSION METHOD</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
            {finalGrowthConfig.submissionMethod}
          </div>
        </div>
      </div>

      {/* 5. DEADLINE & RULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TIME / DEADLINE */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-black uppercase tracking-wider">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>PRESENTATION SCHEDULE / TIME</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 text-sm font-bold text-white">
            {finalGrowthConfig.submissionDeadline || finalGrowthConfig.timeLimit || '20 Minutes Pitch + 10 Minutes Q&A'}
          </div>
        </div>

        {/* RULES */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>JURY EVALUATION CRITERIA & RULES</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 text-xs text-neutral-300 whitespace-pre-line leading-relaxed">
            {finalGrowthConfig.rules}
          </div>
        </div>
      </div>

      {/* ADDITIONAL INSTRUCTIONS */}
      {finalGrowthConfig.additionalInstructions && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-2">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>ADDITIONAL GUIDELINES & INSTRUCTIONS</span>
          </div>
          <p className="text-xs text-neutral-400 whitespace-pre-line leading-relaxed">
            {finalGrowthConfig.additionalInstructions}
          </p>
        </div>
      )}
    </div>
  );
};
