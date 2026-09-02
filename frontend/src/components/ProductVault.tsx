import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Team, Product } from '../types';
import { ProductImage } from './ProductImage';
import { morphAudio } from '../utils/audio';
import {
  Lock,
  Unlock,
  Key,
  Boxes,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  FileText,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  X,
  Play,
  Info,
  ChevronLeft,
  Tag,
} from 'lucide-react';

interface ProductVaultProps {
  team: Team;
}

export const ProductVault: React.FC<ProductVaultProps> = ({ team }) => {
  const {
    roundConfig,
    products,
    teams,
    submitPuzzleAnswer,
    selectVaultProduct,
    getRound2Leaderboard,
  } = useEvent();

  // Local view toggle: 'info' | 'play'
  const [activeTab, setActiveTab] = useState<'info' | 'play'>('info');

  const [puzzleInput, setPuzzleInput] = useState('');
  const [puzzleError, setPuzzleError] = useState<string | null>(null);

  // Product Selection Modal
  const [selectedCandidate, setSelectedCandidate] = useState<Product | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isSubmittingSelection, setIsSubmittingSelection] = useState(false);

  const leaderboard = getRound2Leaderboard();

  const claimedProductNames = new Set(
    teams
      .map((t) => t.product)
      .filter((name): name is string => Boolean(name && name !== '—'))
  );
  const claimedProductIds = new Set(
    teams
      .map((t) => t.productId)
      .filter((id): id is string => Boolean(id))
  );

  const availableProducts = products.filter(
    (p) =>
      p.status === 'AVAILABLE' &&
      !p.takenByTeamId &&
      !claimedProductNames.has(p.name) &&
      !claimedProductIds.has(p.id)
  );

  const isInfoReleased = !!roundConfig.infoReleased;
  const isRoundActive = roundConfig.roundStatus === 'ACTIVE';
  const isRoundCompleted = roundConfig.roundStatus === 'COMPLETED';

  const isPuzzleSolved = !!team.puzzleSolved;
  const hasSelectedProduct = team.product && team.product !== '—';

  // Handle Puzzle Submission
  const handlePuzzleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPuzzleError(null);
    if (!puzzleInput.trim()) return;

    morphAudio.playClick();
    const res = submitPuzzleAnswer(team.id, puzzleInput);
    if (res.success) {
      morphAudio.playSuccess();
      setPuzzleInput('');
    } else {
      morphAudio.playError();
      setPuzzleError(res.error || 'INCORRECT ANSWER');
    }
  };

  // Handle Product Confirm
  const handleConfirmProductSelection = () => {
    if (!selectedCandidate) return;
    setIsSubmittingSelection(true);
    setSelectionError(null);

    morphAudio.playClick();
    const res = selectVaultProduct(team.id, selectedCandidate.id);
    setIsSubmittingSelection(false);

    if (res.success) {
      morphAudio.playSuccess();
      setSelectedCandidate(null);
    } else {
      morphAudio.playError();
      setSelectionError(res.error || 'PRODUCT NO LONGER AVAILABLE');
    }
  };

  // 1. STATE: NO INFO RELEASED / NO ACTIVE ROUND
  if (!isInfoReleased && !isRoundActive && !isRoundCompleted) {
    return (
      <div className="chrome-panel p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden" id="round-locked-state">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="w-16 h-16 bg-slate-900/90 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-mono font-black text-xl text-white uppercase tracking-widest mb-2">
          NO ACTIVE ROUND
        </h3>
        <p className="text-xs text-slate-400 font-mono max-w-md mx-auto uppercase tracking-wider">
          WAITING FOR ADMIN BROADCAST
        </p>
        <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-300 mt-6 bg-purple-950/40 px-4 py-2 rounded-full border border-purple-800/60 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          Live link synced with command terminal
        </div>
      </div>
    );
  }

  // 2. STATE: ROUND COMPLETED
  if (isRoundCompleted) {
    const teamRankItem = leaderboard.find((l) => l.teamId === team.id);

    return (
      <div className="space-y-6" id="round-completed-state">
        {/* Completed Banner */}
        <div className="chrome-panel p-6 shadow-2xl border border-blue-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-300 border border-blue-600/50 shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">ROUND 2 RESULTS</span>
                <h3 className="text-xl font-mono font-black text-white tracking-wide">ROUND COMPLETE — WAITING FOR NEXT ROUND</h3>
              </div>
            </div>
            <div className="text-xs font-mono text-blue-300 bg-blue-950/60 px-3.5 py-1.5 rounded-lg border border-blue-800 self-start sm:self-auto uppercase tracking-wider">
              Vault & Puzzle Closed
            </div>
          </div>
        </div>

        {/* Team Result Summary Card */}
        <div className="chrome-panel p-6">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-extrabold tracking-wider mb-4">Your Team Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 shadow-inner">
              <div className="text-xs text-slate-400 font-mono uppercase">Claimed Product</div>
              <div className="text-lg font-black font-mono text-emerald-400 mt-1">
                {team.product !== '—' ? team.product : 'None Claimed'}
              </div>
            </div>
            <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 shadow-inner">
              <div className="text-xs text-slate-400 font-mono uppercase">Product Selected At</div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {team.productSelectedAt || '—'}
              </div>
            </div>
            <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 shadow-inner">
              <div className="text-xs text-slate-400 font-mono uppercase">Round 2 Completion Rank</div>
              <div className="text-lg font-black font-mono text-amber-400 mt-1">
                {teamRankItem && teamRankItem.position > 0 ? `#${teamRankItem.position}` : 'Unranked'}
              </div>
            </div>
          </div>
        </div>

        {/* Product Reveal Final Completion Standings */}
        <div className="chrome-panel p-6">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-extrabold tracking-wider mb-4">
            PRODUCT REVEAL — COMPLETION ORDER
          </h4>
          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase bg-slate-950/80 tracking-wider">
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Product Claimed</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/40">
                {leaderboard.map((item) => (
                  <tr key={item.teamId} className={item.teamId === team.id ? 'bg-purple-950/30 font-bold' : ''}>
                    <td className="py-3 px-4 font-bold text-white">
                      {item.position > 0 ? `#${item.position}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white">{item.teamNumber}</span>
                      {item.teamId === team.id && <span className="ml-2 text-purple-400 font-extrabold tracking-wide">(YOU)</span>}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{item.productName}</td>
                    <td className="py-3 px-4 text-slate-400">{item.productSelectedAt || 'PENDING'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. ROUND INFORMATION PAGE (When tab === 'info' or when round is not yet in active play)
  if (activeTab === 'info') {
    return (
      <div className="space-y-6" id="round-information-page">
        {/* Header Banner */}
        <div className="chrome-panel p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-40 bg-purple-500/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  ROUND 2
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  INFORMATION & RULES
                </span>
              </div>
              <h2 className="text-3xl font-black font-mono text-white tracking-tight">
                PRODUCT REVEAL
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {isRoundActive ? (
                <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-600/80 px-4 py-2 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-extrabold text-emerald-300 uppercase tracking-wider">ROUND ACTIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-950/90 border border-white/10 px-4 py-2 rounded-xl">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono text-amber-300 uppercase tracking-wider">INFO RELEASED</span>
                </div>
              )}
            </div>
          </div>

          {/* Core Information Grid */}
          <div className="space-y-6">
            {/* Objective */}
            <div className="bg-slate-950/80 border border-white/5 rounded-xl p-5 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-extrabold tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                OBJECTIVE
              </div>
              <p className="text-sm font-mono text-slate-200 leading-relaxed">
                {roundConfig.objective || 'Solve the riddle puzzle to unlock the Vault and claim 1 exclusive product lot for your team.'}
              </p>
            </div>

            {/* Rules */}
            <div className="bg-slate-950/80 border border-white/5 rounded-xl p-5 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400 font-extrabold tracking-wider mb-3">
                <FileText className="w-4 h-4" />
                RULES
              </div>
              <div className="text-sm font-mono text-slate-300 space-y-2 whitespace-pre-line leading-relaxed">
                {roundConfig.rules || (
                  `1. All teams start simultaneously once Admin activates the round.\n2. Submit the secret passcode or riddle answer to unlock vault access.\n3. Fast fingers: First-come, first-served selection for available items.\n4. Once selected, your product lot is locked and cannot be swapped.`
                )}
              </div>
            </div>

            {/* Time Limit & Important Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/80 border border-white/5 rounded-xl p-5 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-purple-400 font-extrabold tracking-wider mb-2">
                  <Clock className="w-4 h-4" />
                  TIME LIMIT
                </div>
                <p className="text-lg font-black font-mono text-white">
                  {roundConfig.timeLimit || '15 Minutes'}
                </p>
              </div>

              <div className="bg-slate-950/80 border border-white/5 rounded-xl p-5 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 font-extrabold tracking-wider mb-2">
                  <Info className="w-4 h-4" />
                  IMPORTANT NOTES
                </div>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  {roundConfig.importantNotes || roundConfig.instructions || 'Only 1 member per team needs to enter the answer. Instant live sync across devices.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-slate-400">
              {!isRoundActive ? (
                <span className="text-amber-400 flex items-center gap-2 font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  WAITING FOR ADMIN TO START ROUND
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-2 font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  ROUND IS LIVE — YOU MAY ENTER GAMEPLAY
                </span>
              )}
            </div>

            {/* PLAY ROUND BUTTON */}
            {isRoundActive ? (
              <button
                id="btn-play-round"
                type="button"
                onClick={() => {
                  morphAudio.playConfirm();
                  setActiveTab('play');
                }}
                className="btn-chrome-primary w-full sm:w-auto px-8 py-3.5 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                PLAY ROUND
              </button>
            ) : (
              <button
                id="btn-play-round-disabled"
                type="button"
                disabled
                className="w-full sm:w-auto bg-slate-900/60 border border-white/10 text-slate-500 font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                PLAY ROUND (LOCKED)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. INTERACTIVE GAMEPLAY MODE (When activeTab === 'play')
  return (
    <div className="space-y-8" id="product-vault-active-view">
      {/* Top Banner with Toggle Back to Round Info */}
      <div className="chrome-panel p-6 shadow-2xl" id="round-2-banner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-700/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                LIVE ROUND
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">ROUND 2</span>
            </div>
            <h2 className="text-2xl font-black font-mono text-white tracking-tight">
              PRODUCT REVEAL
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-view-round-info"
              type="button"
              onClick={() => {
                morphAudio.playClick();
                setActiveTab('info');
              }}
              className="btn-chrome-secondary text-xs px-4 py-2 flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-purple-400" />
              VIEW ROUND INFO
            </button>

            <div className="flex items-center gap-2 bg-slate-950/90 border border-white/10 px-3.5 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">ROUND LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* PUZZLE SOLVING SECTION */}
      <div className="chrome-panel p-6 shadow-2xl" id="puzzle-solver-box">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono font-extrabold text-lg text-white uppercase tracking-wider">SOLVE THE PUZZLE</h3>
          </div>
          {isPuzzleSolved ? (
            <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded border border-emerald-700/60 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-4 h-4" />
              PUZZLE SOLVED ({team.puzzleSolvedAt})
            </span>
          ) : (
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-3 py-1 rounded border border-amber-800/60 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              VAULT LOCKED
            </span>
          )}
        </div>

        {!isPuzzleSolved ? (
          <div className="space-y-4">
            {/* Clue Prompt */}
            {roundConfig.puzzle?.text && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 text-sm font-mono text-slate-200 shadow-inner leading-relaxed">
                {roundConfig.puzzle.text}
              </div>
            )}

            {/* Puzzle Image (if configured) */}
            {roundConfig.puzzle?.imageUrl && (
              <div className="bg-slate-950/80 p-2 rounded-xl border border-white/5 flex items-center justify-center max-h-72 overflow-hidden shadow-inner">
                <img
                  src={roundConfig.puzzle.imageUrl}
                  alt="Puzzle Clue"
                  className="max-h-64 max-w-full object-contain rounded-lg"
                />
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handlePuzzleSubmit} className="space-y-3 pt-2">
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                ENTER ANSWER / DECRYPT CODE:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="puzzle-answer-input"
                  type="text"
                  required
                  value={puzzleInput}
                  onChange={(e) => {
                    setPuzzleInput(e.target.value);
                    if (puzzleError) setPuzzleError(null);
                  }}
                  placeholder="Enter code or answer..."
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold tracking-widest uppercase focus:outline-none focus:border-purple-500 transition shadow-inner"
                />
                <button
                  id="btn-submit-puzzle-answer"
                  type="submit"
                  className="btn-chrome-primary text-xs uppercase tracking-wider px-6 py-2.5 flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  SUBMIT ANSWER
                </button>
              </div>

              {puzzleError && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 font-mono text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{puzzleError} — Please verify your solution and try again.</span>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 flex items-center justify-center text-emerald-400 border border-emerald-700 shadow-inner">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono font-bold text-white text-sm">PUZZLE SOLVED — VAULT UNLOCKED</div>
                <div className="text-xs text-slate-400 font-mono">Solved at: {team.puzzleSolvedAt}</div>
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-800 uppercase tracking-wider font-bold">
              Access Granted to Product Vault
            </div>
          </div>
        )}
      </div>

      {/* THE VAULT SECTION */}
      <div className="chrome-panel p-6 shadow-2xl" id="the-vault-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-400" />
              <h3 className="font-mono font-black text-xl text-white tracking-wider">THE VAULT</h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {isPuzzleSolved
                ? hasSelectedProduct
                  ? 'Your team has locked in a product.'
                  : `Browse and claim 1 product for your team. ${availableProducts.length} items available.`
                : 'Locked. Solve the puzzle above to reveal available products.'}
            </p>
          </div>

          {isPuzzleSolved && !hasSelectedProduct && (
            <div className="text-xs font-mono text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800 uppercase tracking-wider">
              1 Selection Limit • Speed Determines Rank
            </div>
          )}
        </div>

        {/* VAULT LOCKED STATE */}
        {!isPuzzleSolved ? (
          <div className="bg-slate-950/60 border border-dashed border-white/10 rounded-2xl p-12 text-center shadow-inner">
            <div className="w-16 h-16 bg-slate-900/90 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600 border border-white/5 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="font-mono font-extrabold text-base text-slate-300 uppercase tracking-wider mb-1">
              THE VAULT IS LOCKED
            </h4>
            <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
              Solve the puzzle in the section above to unlock real-time product selection.
            </p>
          </div>
        ) : hasSelectedProduct ? (
          /* TEAM ALREADY SELECTED A PRODUCT */
          <div className="bg-slate-950/80 border border-emerald-800/80 rounded-2xl p-6 shadow-inner">
            <div className="text-xs font-mono uppercase text-emerald-400 font-extrabold mb-3 flex items-center gap-2 tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              YOUR TEAM CLAIMED PRODUCT
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-slate-900 rounded-xl overflow-hidden border border-emerald-700/60 flex items-center justify-center shrink-0 shadow-lg relative">
                {(() => {
                  const p = products.find((prod) => prod.id === team.productId || prod.name === team.product);
                  return p ? (
                    <ProductImage src={p.image} alt={p.name} name={p.name} category={p.category} />
                  ) : (
                    <span className="font-mono font-bold text-2xl text-emerald-400">{team.product}</span>
                  );
                })()}
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                {(() => {
                  const p = products.find((prod) => prod.id === team.productId || prod.name === team.product);
                  return p?.category ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider bg-purple-950/50 border border-purple-800/60 px-2.5 py-1 rounded-lg">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{p.category}</span>
                    </div>
                  ) : null;
                })()}

                <h4 className="text-2xl font-black font-mono text-white tracking-wider">
                  {team.product}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {products.find((p) => p.id === team.productId || p.name === team.product)?.shortDescription || 'Confirmed Vault selection.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="text-xs font-mono text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-white/10">
                    Selected at: <span className="font-bold text-white">{team.productSelectedAt || '—'}</span>
                  </div>
                  <div className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800 uppercase tracking-wider font-extrabold">
                    Status: LOCKED IN
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VAULT UNLOCKED & READY FOR SELECTION */
          <div className="space-y-4">
            {availableProducts.length === 0 ? (
              <div className="bg-slate-950/80 p-8 rounded-xl text-center text-slate-400 font-mono text-xs border border-white/5">
                All vault products have been claimed by other teams.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="chrome-panel p-4 flex flex-col justify-between transition duration-300 hover:border-purple-500/50 group"
                  >
                    <div>
                      <div className="relative w-full aspect-square bg-slate-950 rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-white/5">
                        <ProductImage
                          src={prod.image}
                          alt={prod.name}
                          name={prod.name}
                          category={prod.category}
                        />
                        <span className="absolute top-2 right-2 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded tracking-wider uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                          AVAILABLE
                        </span>
                      </div>

                      {prod.category && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-1 line-clamp-1">
                          <Tag className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>{prod.category}</span>
                        </div>
                      )}

                      <h4 className="font-mono font-bold text-sm text-white tracking-wider mb-1">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3 font-mono">
                        {prod.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <button
                        id={`btn-select-product-${prod.id}`}
                        type="button"
                        onClick={() => {
                          morphAudio.playClick();
                          setSelectionError(null);
                          setSelectedCandidate(prod);
                        }}
                        className="btn-chrome-primary w-full py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        SELECT
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRODUCT REVEAL — COMPLETION ORDER */}
      <div className="chrome-panel p-6 shadow-2xl" id="round-completion-live-standings">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="font-mono font-black text-base text-white flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-5 h-5 text-emerald-400" />
              PRODUCT REVEAL — COMPLETION ORDER
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Completion order for Product Reveal only (independent of the main MORPH leaderboard).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/5">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase bg-slate-950/80 tracking-wider">
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Product Claimed</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/40">
              {leaderboard.map((item) => {
                const isCompleted = item.position > 0;
                const isCurrentTeam = item.teamId === team.id;
                return (
                  <tr
                    key={item.teamId}
                    className={`transition ${
                      isCurrentTeam ? 'bg-purple-950/30 font-bold' : isCompleted ? 'bg-emerald-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      {isCompleted ? (
                        <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-white/10 shadow-inner">
                          #{item.position}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-bold">{item.teamNumber}</span>
                      {isCurrentTeam && <span className="ml-2 text-purple-400 font-extrabold tracking-wider">(YOU)</span>}
                    </td>
                    <td className="py-3 px-4">
                      {item.productName !== '—' ? (
                        <span className="text-emerald-400 font-bold">{item.productName}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.productSelectedAt || 'PENDING'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isCompleted ? (
                        <span className="text-emerald-400 font-extrabold tracking-wider">COMPLETED</span>
                      ) : item.puzzleSolved ? (
                        <span className="text-amber-400 font-bold tracking-wider">CHOOSING</span>
                      ) : (
                        <span className="text-slate-500">PENDING</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL: SELECT PRODUCT */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chrome-panel border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl font-mono relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-lg text-white uppercase tracking-wider">CONFIRM PRODUCT</h3>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setSelectedCandidate(null);
                  setSelectionError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-4">
              <div className="w-28 h-28 bg-slate-950 rounded-2xl overflow-hidden mx-auto mb-3 border border-white/10 flex items-center justify-center shadow-inner relative">
                <ProductImage
                  src={selectedCandidate.image}
                  alt={selectedCandidate.name}
                  name={selectedCandidate.name}
                  category={selectedCandidate.category}
                />
              </div>

              {selectedCandidate.category && (
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider bg-purple-950/50 border border-purple-800/60 px-2.5 py-1 rounded-lg mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{selectedCandidate.category}</span>
                </div>
              )}

              <h4 className="text-xl font-black text-white tracking-wider mb-1">
                {selectedCandidate.name}
              </h4>
              <p className="text-xs text-slate-400 px-4">
                {selectedCandidate.shortDescription}
              </p>
            </div>

            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 my-3 text-xs text-amber-300">
              ⚠️ <strong>Single Selection Rule:</strong> Each team can only select ONE product. Once confirmed, this selection cannot be modified or traded.
            </div>

            {selectionError && (
              <div className="bg-red-950/60 border border-red-800 rounded-xl p-3 my-3 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{selectionError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setSelectedCandidate(null);
                  setSelectionError(null);
                }}
                className="btn-chrome-secondary text-xs px-4 py-2.5"
              >
                GO BACK
              </button>
              <button
                id="btn-confirm-product-selection"
                type="button"
                disabled={isSubmittingSelection}
                onClick={handleConfirmProductSelection}
                className="btn-chrome-primary text-xs uppercase tracking-wider px-5 py-2.5 disabled:opacity-50"
              >
                {isSubmittingSelection ? 'CONFIRMING...' : 'CONFIRM SELECTION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
