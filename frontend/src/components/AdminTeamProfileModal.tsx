import React from 'react';
import { Team, MorphCard } from '../types';
import { useEvent } from '../context/EventContext';
import {
  Shield,
  Shuffle,
  Zap,
  Sparkles,
  CreditCard,
  X,
  Trophy,
  Coins,
  Gavel,
  Box,
  Key,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface AdminTeamProfileModalProps {
  team: Team | null;
  onClose: () => void;
}

export const AdminTeamProfileModal: React.FC<AdminTeamProfileModalProps> = ({ team, onClose }) => {
  const { cards, logs, cardTransactions, celebrities } = useEvent();

  if (!team) return null;

  const teamCards = team.cards || [];
  const hasSafe = teamCards.some((c) => c.toUpperCase() === 'SAFE');
  const hasSwap = teamCards.some((c) => c.toUpperCase() === 'SWAP');
  const hasBoost = teamCards.some((c) => c.toUpperCase() === 'BOOST');
  const hasIntel = teamCards.some((c) => c.toUpperCase() === 'INTEL');

  const teamCelebrity = team.celebrityId ? celebrities.find((c) => c.id === team.celebrityId) : null;

  const teamLogs = logs.filter((l) => l.teamId === team.id);
  const teamCardTxs = cardTransactions.filter((tx) => tx.teamId === team.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl max-h-[90vh] flex flex-col font-mono shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-950/60 border border-amber-700 flex items-center justify-center text-amber-400 font-bold text-lg">
              {team.teamNumber.replace('Team ', '')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-100 uppercase tracking-wider">
                  {team.teamNumber} — {team.teamName}
                </h3>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 font-bold uppercase">
                  CONFIDENTIAL ADMIN VIEW
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Full private telemetry, card holdings, credentials, and transactions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 bg-neutral-900 border border-neutral-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* Top Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-950 border border-neutral-800 p-3">
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Morph Coins</span>
              <span className="text-lg font-bold text-neutral-100">₹{team.morphCoins.toLocaleString()}</span>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 p-3">
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Current Rank</span>
              <span className="text-lg font-bold text-amber-300">#{team.rank ?? '—'}</span>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 p-3">
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Event Score</span>
              <span className="text-lg font-bold text-neutral-200">{team.score} pts</span>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 p-3">
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Access Code</span>
              <span className="text-lg font-bold text-emerald-400 tracking-wider">{team.accessCode}</span>
            </div>
          </div>

          {/* Roster & Members */}
          <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              TEAM ROSTER:
            </span>
            <div className="grid grid-cols-3 gap-2 text-neutral-200">
              <div className="bg-neutral-900 p-2 border border-neutral-850">
                <span className="text-[10px] text-neutral-500 block">Member 1:</span>
                {team.member1}
              </div>
              <div className="bg-neutral-900 p-2 border border-neutral-850">
                <span className="text-[10px] text-neutral-500 block">Member 2:</span>
                {team.member2}
              </div>
              <div className="bg-neutral-900 p-2 border border-neutral-850">
                <span className="text-[10px] text-neutral-500 block">Member 3:</span>
                {team.member3}
              </div>
            </div>
          </div>

          {/* Assigned Brand & Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-amber-400" />
                  WON BRAND:
                </span>
                <span className="text-[10px] text-neutral-500">
                  {team.winningBid ? `Bid: ₹${team.winningBid.toLocaleString()}` : 'No Bid'}
                </span>
              </div>
              <div className={`text-base font-bold ${team.brand !== '—' ? 'text-amber-300' : 'text-neutral-500'}`}>
                {team.brand}
              </div>
            </div>

            <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-emerald-400" />
                  VAULT PRODUCT:
                </span>
                <span className="text-[10px] text-neutral-500">
                  {team.productSelectedAt || 'Unselected'}
                </span>
              </div>
              <div className={`text-base font-bold ${team.product !== '—' ? 'text-emerald-400' : 'text-neutral-500'}`}>
                {team.product}
              </div>
            </div>
          </div>

          {/* Celebrity Ambassador */}
          <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                CELEBRITY AMBASSADOR (ROUND 5)
              </span>
              {teamCelebrity && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 font-bold uppercase rounded ${
                    team.celebrityRevealed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {team.celebrityRevealed ? 'REVEALED ON STAGE' : '🔒 MYSTERY LOCKED'}
                </span>
              )}
            </div>

            {teamCelebrity ? (
              <div className="flex items-start gap-3 pt-1">
                <img
                  src={teamCelebrity.imageUrl}
                  alt={teamCelebrity.name}
                  className="w-12 h-12 object-cover rounded-lg border border-purple-500/40"
                />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {teamCelebrity.name}
                    </span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.2 border border-purple-800 rounded">
                      Card #{teamCelebrity.celebrityNumber} • {teamCelebrity.domain}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>Youth: <strong className="text-pink-400">{teamCelebrity.ratings.youthAppeal}</strong></span>
                    <span>Trust: <strong className="text-amber-400">{teamCelebrity.ratings.legacyTrust}</strong></span>
                    <span>Social: <strong className="text-cyan-400">{teamCelebrity.ratings.socialEngagement}</strong></span>
                    <span>Risk: <strong className="text-red-400">{teamCelebrity.ratings.riskFactor}</strong></span>
                    <span>Global: <strong className="text-indigo-400">{teamCelebrity.ratings.globalReach}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 italic text-[11px]">
                No celebrity drawn yet. Awaiting spin authorization in Round 5.
              </p>
            )}
          </div>

          {/* Morph Cards Inventory & Powers */}
          <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                ACTIVE POWER CARDS ({teamCards.length})
              </span>
              <div className="flex items-center gap-2 text-[10px]">
                {hasSafe && <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">🛡 SAFE IMMUNITY</span>}
                {hasSwap && <span className="px-1.5 py-0.5 bg-blue-950 border border-blue-700 text-blue-300 font-bold">🔄 SWAP READY</span>}
                {hasBoost && <span className="px-1.5 py-0.5 bg-purple-950 border border-purple-700 text-purple-300 font-bold">⚡ BOOST HELD</span>}
                {hasIntel && <span className="px-1.5 py-0.5 bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">✨ INTEL HELD</span>}
              </div>
            </div>

            {teamCards.length === 0 ? (
              <p className="text-neutral-500 italic text-[11px]">This team does not currently own any Morph Cards.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {teamCards.map((cName, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-amber-300 font-bold text-xs"
                  >
                    {cName}
                  </span>
                ))}
              </div>
            )}

            {/* Used Cards */}
            {(team.usedCards || []).length > 0 && (
              <div className="pt-2 border-t border-neutral-850">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold block mb-1">
                  Exhausted / Consumed Cards:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {team.usedCards?.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-500 text-[11px] line-through">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity / Coin Log */}
          <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              FINANCIAL & STRATEGIC TRANSACTION LOGS:
            </span>

            {teamLogs.length === 0 && teamCardTxs.length === 0 ? (
              <p className="text-neutral-500 italic text-[11px]">No activity recorded yet for this team.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {teamLogs.map((l) => (
                  <div key={l.id} className="text-[11px] bg-neutral-900 p-2 border border-neutral-850 flex justify-between text-neutral-300">
                    <span>{l.note || `Balance updated: ₹${l.previousBalance.toLocaleString()} → ₹${l.newBalance.toLocaleString()}`}</span>
                    <span className="text-neutral-500 text-[10px]">{l.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            CLOSE PROFILE
          </button>
        </div>

      </div>
    </div>
  );
};
