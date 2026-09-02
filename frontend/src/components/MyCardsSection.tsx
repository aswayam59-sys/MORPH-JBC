import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Team, MorphCard } from '../types';
import {
  CreditCard,
  Shield,
  Shuffle,
  Eye,
  Zap,
  Sparkles,
  Info,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface MyCardsSectionProps {
  team: Team;
}

export const MyCardsSection: React.FC<MyCardsSectionProps> = ({ team }) => {
  const { cards, teams, executeSwapCard, useBoostCard } = useEvent();
  const [selectedCard, setSelectedCard] = useState<MorphCard | null>(null);

  // SWAP Modal state
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [selectedTargetTeamId, setSelectedTargetTeamId] = useState<string>('');
  const [swapFeedback, setSwapFeedback] = useState<{ message: string; isError: boolean; isBlocked?: boolean } | null>(null);

  // BOOST Modal state
  const [showBoostModal, setShowBoostModal] = useState<boolean>(false);
  const [boostFeedback, setBoostFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const getCardIcon = (name: string, size = 'w-4 h-4') => {
    const upper = name.toUpperCase();
    if (upper.includes('SAFE')) return <Shield className={`${size} text-emerald-400`} />;
    if (upper.includes('SWAP')) return <Shuffle className={`${size} text-blue-400`} />;
    if (upper.includes('INTEL')) return <Eye className={`${size} text-amber-400`} />;
    if (upper.includes('BOOST')) return <Zap className={`${size} text-purple-400`} />;
    return <CreditCard className={`${size} text-neutral-300`} />;
  };

  const getCardBadgeColor = (name: string) => {
    const upper = name.toUpperCase();
    if (upper.includes('SAFE')) return 'border-emerald-800 text-emerald-300 bg-emerald-950/40';
    if (upper.includes('SWAP')) return 'border-blue-800 text-blue-300 bg-blue-950/40';
    if (upper.includes('INTEL')) return 'border-amber-800 text-amber-300 bg-amber-950/40';
    if (upper.includes('BOOST')) return 'border-purple-800 text-purple-300 bg-purple-950/40';
    return 'border-neutral-700 text-neutral-300 bg-neutral-900';
  };

  const teamCardNames = team.cards || [];
  const hasSafeCard = teamCardNames.some((c) => c.toUpperCase() === 'SAFE');
  const hasSwapCard = teamCardNames.some((c) => c.toUpperCase() === 'SWAP');
  const hasBoostCard = teamCardNames.some((c) => c.toUpperCase() === 'BOOST');
  const hasIntelCard = teamCardNames.some((c) => c.toUpperCase() === 'INTEL');

  // Group owned cards by name and match with catalog card definitions
  const ownedCardsDetailed = teamCardNames.map((cardName, idx) => {
    const matched = cards.find((c) => c.name.toLowerCase() === cardName.toLowerCase()) || {
      id: `custom-${idx}`,
      name: cardName,
      price: 0,
      power: 'Custom Morph Power',
      description: 'Strategic action card owned by your team.',
    };
    return { ...matched, uniqueInstanceId: `${matched.id}-${idx}` };
  });

  // Teams eligible for SWAP (teams other than current team that have a brand)
  const eligibleSwapTargetTeams = teams.filter(
    (t) => t.id !== team.id && t.brand && t.brand !== '—'
  );

  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetTeamId) {
      setSwapFeedback({ message: 'Please select a target team to swap with.', isError: true });
      return;
    }

    const res = executeSwapCard(team.id, selectedTargetTeamId);
    if (res.success) {
      setSwapFeedback({
        message: 'Tactical SWAP successfully executed! Brand assets exchanged.',
        isError: false,
      });
      setTimeout(() => {
        setShowSwapModal(false);
        setSwapFeedback(null);
      }, 1500);
    } else {
      setSwapFeedback({
        message: res.error || 'Failed to execute SWAP.',
        isError: true,
        isBlocked: res.blockedBySafe,
      });
    }
  };

  const handleExecuteBoost = () => {
    const res = useBoostCard(team.id);
    if (res.success) {
      setBoostFeedback({
        message: '⚡ BOOST Activated! +₹3,000 Morph Coins added to team balance.',
        isError: false,
      });
      setTimeout(() => {
        setShowBoostModal(false);
        setBoostFeedback(null);
      }, 1500);
    } else {
      setBoostFeedback({
        message: res.error || 'Failed to activate BOOST.',
        isError: true,
      });
    }
  };

  return (
    <section id="team-my-cards-section" className="border border-neutral-800 bg-neutral-900 p-5 font-mono shadow-sm">
      <div className="border-b border-neutral-800 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-neutral-950 border border-neutral-800 rounded text-amber-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-200">
              MY CARDS INVENTORY ({teamCardNames.length})
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {hasSafeCard && (
            <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              SAFE SHIELD ACTIVE
            </span>
          )}
          <span className="text-neutral-400">
            {teamCardNames.length > 0 ? `${teamCardNames.length} active` : 'No cards'}
          </span>
        </div>
      </div>

      {/* QUICK POWER ACTIONS BAR */}
      {(hasSwapCard || hasBoostCard) && (
        <div className="mb-4 p-3 bg-neutral-950 border border-neutral-800 flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            TACTICAL ACTIONS:
          </span>
          {hasSwapCard && (
            <button
              id="btn-use-swap-card"
              type="button"
              onClick={() => {
                setSelectedTargetTeamId(eligibleSwapTargetTeams[0]?.id || '');
                setSwapFeedback(null);
                setShowSwapModal(true);
              }}
              className="px-3 py-1.5 bg-blue-950/70 border border-blue-700 hover:bg-blue-900 text-blue-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-sm"
            >
              <Shuffle className="w-3.5 h-3.5 text-blue-400" />
              USE SWAP CARD
            </button>
          )}
          {hasBoostCard && (
            <button
              id="btn-use-boost-card"
              type="button"
              onClick={() => {
                setBoostFeedback(null);
                setShowBoostModal(true);
              }}
              className="px-3 py-1.5 bg-purple-950/70 border border-purple-700 hover:bg-purple-900 text-purple-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              ACTIVATE BOOST (+₹3,000 COINS)
            </button>
          )}
        </div>
      )}

      {teamCardNames.length === 0 ? (
        <div className="bg-neutral-950 border border-neutral-850 p-6 text-center text-xs text-neutral-400 space-y-2">
          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-neutral-300 font-semibold">No Morph Cards owned yet.</p>
          <p className="text-neutral-500 max-w-md mx-auto">
            Acquire strategic cards (SAFE, SWAP, INTEL, BOOST) during the Morph Cards round using your Morph Coins.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ownedCardsDetailed.map((card) => (
            <div
              key={card.uniqueInstanceId}
              id={`my-card-item-${card.uniqueInstanceId}`}
              onClick={() => setSelectedCard(card)}
              className="border border-neutral-800 bg-neutral-950 p-3.5 flex flex-col justify-between space-y-2.5 hover:border-neutral-700 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-900 border border-neutral-800 rounded">
                      {getCardIcon(card.name)}
                    </div>
                    <span className="font-bold text-sm text-neutral-100">{card.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 border ${getCardBadgeColor(card.name)}`}>
                    OWNED
                  </span>
                </div>

                <div className="mt-2.5 text-xs space-y-1">
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold">
                    Power:
                  </span>
                  <p className="text-neutral-300 font-medium line-clamp-2">
                    {card.power}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="hover:text-neutral-200">View Details</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USED / EXHAUSTED CARDS LEDGER */}
      {(team.usedCards || []).length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <span className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider block mb-2">
            Exhausted / Used Cards ({team.usedCards?.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {team.usedCards?.map((cName, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-neutral-950 border border-neutral-800 text-neutral-500 text-xs line-through"
              >
                {cName} (Used)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SWAP CARD MODAL */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-6 space-y-4 font-mono">
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
                  EXECUTE TACTICAL SWAP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSwapModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSwap} className="space-y-4 text-xs">
              <div className="bg-neutral-950 border border-neutral-800 p-3 space-y-1">
                <span className="text-neutral-400 uppercase tracking-wider block text-[10px]">
                  YOUR TEAM BRAND:
                </span>
                <span className="text-sm font-bold text-amber-300">
                  {team.brand !== '—' ? team.brand : 'No Brand (Cannot Swap)'}
                </span>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5 uppercase font-semibold">
                  Select Target Team & Brand:
                </label>
                {eligibleSwapTargetTeams.length === 0 ? (
                  <p className="text-neutral-500 italic bg-neutral-950 p-3 border border-neutral-800">
                    No other teams currently hold a brand to swap with.
                  </p>
                ) : (
                  <select
                    value={selectedTargetTeamId}
                    onChange={(e) => setSelectedTargetTeamId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-neutral-100 p-2.5 focus:outline-none focus:border-neutral-400 text-xs"
                  >
                    {eligibleSwapTargetTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamNumber} ({t.teamName}) — Holds Brand: {t.brand}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-neutral-950 border border-amber-900/40 p-3 text-[11px] text-amber-300/80 leading-relaxed">
                ⚠️ <strong>Note:</strong> If the target team possesses an active <strong>SAFE card</strong>, the swap will be automatically blocked and your SWAP card will remain preserved.
              </div>

              {swapFeedback && (
                <div
                  className={`p-3 border text-xs font-semibold ${
                    swapFeedback.isBlocked
                      ? 'border-amber-800 bg-amber-950/60 text-amber-300'
                      : swapFeedback.isError
                      ? 'border-red-800 bg-red-950/60 text-red-300'
                      : 'border-emerald-800 bg-emerald-950/60 text-emerald-300'
                  }`}
                >
                  {swapFeedback.message}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={team.brand === '—' || eligibleSwapTargetTeams.length === 0}
                  className="flex-1 py-2.5 bg-blue-950 border border-blue-700 hover:bg-blue-900 text-blue-100 font-bold uppercase tracking-wider transition disabled:opacity-40 cursor-pointer"
                >
                  CONFIRM SWAP
                </button>
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="py-2.5 px-4 border border-neutral-700 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOST CARD CONFIRMATION MODAL */}
      {showBoostModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-6 space-y-4 font-mono">
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
                  ACTIVATE BOOST CARD
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBoostModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to activate your <strong>BOOST</strong> card? This will permanently consume the card and instantly grant <strong>+₹3,000 Morph Coins</strong> to your team balance.
            </p>

            {boostFeedback && (
              <div
                className={`p-3 border text-xs font-semibold ${
                  boostFeedback.isError
                    ? 'border-red-800 bg-red-950/60 text-red-300'
                    : 'border-emerald-800 bg-emerald-950/60 text-emerald-300'
                }`}
              >
                {boostFeedback.message}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleExecuteBoost}
                className="flex-1 py-2.5 bg-purple-950 border border-purple-700 hover:bg-purple-900 text-purple-100 font-bold uppercase tracking-wider transition cursor-pointer"
              >
                ACTIVATE NOW
              </button>
              <button
                type="button"
                onClick={() => setShowBoostModal(false)}
                className="py-2.5 px-4 border border-neutral-700 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OWNED CARD DETAIL MODAL */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-6 space-y-4 font-mono">
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-neutral-950 border border-neutral-800 rounded">
                  {getCardIcon(selectedCard.name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100 uppercase">
                    {selectedCard.name}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">
                    OFFICIALLY IN TEAM INVENTORY
                  </span>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 border ${getCardBadgeColor(selectedCard.name)}`}>
                ₹{selectedCard.price.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-neutral-400 font-semibold uppercase block mb-1">
                  Card Power / Function
                </span>
                <p className="text-neutral-200 bg-neutral-950 border border-neutral-800 p-3 leading-relaxed">
                  {selectedCard.power}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 font-semibold uppercase block mb-1">
                  Description & Effect
                </span>
                <p className="text-neutral-300 bg-neutral-950 border border-neutral-800 p-3 leading-relaxed">
                  {selectedCard.description}
                </p>
              </div>

              {selectedCard.name.toUpperCase() === 'SAFE' && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-[11px]">
                  🛡 <strong>Protection Active:</strong> Opposing teams attempting to target your brand with a SWAP card will be automatically deflected.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
