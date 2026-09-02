import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Team, MorphCard } from '../types';
import { morphAudio } from '../utils/audio';
import {
  CreditCard,
  Shield,
  Shuffle,
  Eye,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShoppingBag,
  Coins,
  Sparkles,
  Trophy,
  Users,
  Filter,
  Check,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface MorphCardsTeamStoreProps {
  team: Team;
}

export const MorphCardsTeamStore: React.FC<MorphCardsTeamStoreProps> = ({ team }) => {
  const { cards, cardRoundConfig, purchaseCard, teams } = useEvent();
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [selectedCardForDetail, setSelectedCardForDetail] = useState<MorphCard | null>(null);
  const [confirmingCard, setConfirmingCard] = useState<MorphCard | null>(null);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'with_cards' | 'safe' | 'swap'>('all');
  const [activeTab, setActiveTab] = useState<'market' | 'leaderboard'>('market');

  const getCardIcon = (name: string, size = 'w-5 h-5') => {
    const upper = name.toUpperCase();
    if (upper.includes('SAFE')) return <Shield className={`${size} text-emerald-400`} />;
    if (upper.includes('SWAP')) return <Shuffle className={`${size} text-blue-400`} />;
    if (upper.includes('INTEL')) return <Eye className={`${size} text-amber-400`} />;
    if (upper.includes('BOOST')) return <Zap className={`${size} text-purple-400`} />;
    return <CreditCard className={`${size} text-neutral-300`} />;
  };

  const getCardBadgeColor = (name: string) => {
    const upper = name.toUpperCase();
    if (upper.includes('SAFE')) return 'border-emerald-700 text-emerald-300 bg-emerald-950/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
    if (upper.includes('SWAP')) return 'border-blue-700 text-blue-300 bg-blue-950/60 shadow-[0_0_8px_rgba(59,130,246,0.15)]';
    if (upper.includes('INTEL')) return 'border-amber-700 text-amber-300 bg-amber-950/60 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
    if (upper.includes('BOOST')) return 'border-purple-700 text-purple-300 bg-purple-950/60 shadow-[0_0_8px_rgba(168,85,247,0.15)]';
    return 'border-neutral-700 text-neutral-300 bg-neutral-900';
  };

  const handleBuy = (card: MorphCard) => {
    morphAudio.playClick();
    if (cardRoundConfig.purchaseStatus !== 'OPEN') {
      morphAudio.playDanger();
      setFeedback({
        message: 'CARD PURCHASES ARE CURRENTLY LOCKED BY ADMIN.',
        isError: true,
      });
      return;
    }

    const isSoldOut = card.maxAvailable !== null && card.purchasedCount >= card.maxAvailable;
    if (isSoldOut) {
      morphAudio.playDanger();
      setFeedback({
        message: `CARD SOLD OUT: "${card.name}" has reached its maximum fixed limit (${card.purchasedCount}/${card.maxAvailable} claimed).`,
        isError: true,
      });
      return;
    }

    if (team.morphCoins < card.price) {
      morphAudio.playDanger();
      setFeedback({
        message: `INSUFFICIENT FUNDS: You need ₹${card.price.toLocaleString()} Morph Coins, but your current balance is ₹${team.morphCoins.toLocaleString()}.`,
        isError: true,
      });
      return;
    }

    setConfirmingCard(card);
  };

  const executePurchase = () => {
    if (!confirmingCard) return;

    const result = purchaseCard(team.id, confirmingCard.id);
    if (result.success) {
      morphAudio.playSuccess();
      setFeedback({
        message: `SUCCESS: ${confirmingCard.name} acquired for ₹${confirmingCard.price.toLocaleString()} Morph Coins!`,
        isError: false,
      });
    } else {
      morphAudio.playDanger();
      setFeedback({
        message: result.error || 'Failed to purchase card.',
        isError: true,
      });
    }
    setConfirmingCard(null);
  };

  const cardList: string[] = team.cards || [];
  const ownedCardCounts: Record<string, number> = {};
  for (const cardName of cardList) {
    ownedCardCounts[cardName] = (ownedCardCounts[cardName] || 0) + 1;
  }

  // Sorted teams for Round 3 leaderboard
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.rank !== undefined && b.rank !== undefined) {
      return Number(a.rank) - Number(b.rank);
    }
    return b.morphCoins - a.morphCoins;
  });

  const filteredTeams = sortedTeams.filter((t) => {
    const tCards = t.cards || [];
    if (leaderboardFilter === 'with_cards') {
      return tCards.length > 0;
    }
    if (leaderboardFilter === 'safe') {
      return tCards.some((c) => c.toUpperCase().includes('SAFE'));
    }
    if (leaderboardFilter === 'swap') {
      return tCards.some((c) => c.toUpperCase().includes('SWAP'));
    }
    return true;
  });

  const totalHeldCards = teams.reduce((acc, t) => acc + (t.cards?.length || 0), 0);
  const totalSafeShields = teams.filter((t) => (t.cards || []).some((c) => c.toUpperCase().includes('SAFE'))).length;
  const totalSwapArmed = teams.filter((t) => (t.cards || []).some((c) => c.toUpperCase().includes('SWAP'))).length;

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Header Banner */}
      <section className="chrome-panel p-5 md:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-950/60 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ROUND 3
                </span>
                <h2 className="text-base font-black tracking-widest text-white uppercase">
                  MORPH CARDS MARKET & SQUAD INTELLIGENCE
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Acquire fixed-supply strategic capability cards and monitor competing squad power card holdings in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-950/80 border border-white/10 px-3.5 py-2 rounded-xl text-right shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">YOUR BALANCE</span>
              <span className="text-sm font-black text-amber-300">
                ₹{team.morphCoins.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-white/10 px-3.5 py-2 rounded-xl text-right shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">CARDS HELD</span>
              <span className="text-sm font-black text-purple-300">
                {cardList.length} <span className="text-[10px] font-normal text-slate-500">Cards</span>
              </span>
            </div>

            <div className="bg-slate-950/80 border border-white/10 px-3.5 py-2 rounded-xl text-right shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">MARKET STATUS</span>
              <span
                className={`text-xs font-black uppercase flex items-center gap-1.5 ${
                  cardRoundConfig.purchaseStatus === 'OPEN'
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cardRoundConfig.purchaseStatus === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {cardRoundConfig.purchaseStatus === 'OPEN' ? 'OPEN' : 'LOCKED'}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 font-mono ${
              feedback.isError
                ? 'bg-red-950/80 border-red-800 text-red-200'
                : 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.isError ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              )}
              <span className="font-bold">{feedback.message}</span>
            </div>
            <button
              onClick={() => {
                morphAudio.playClick();
                setFeedback(null);
              }}
              className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Purchase Status Notice */}
        {cardRoundConfig.purchaseStatus !== 'OPEN' && (
          <div className="mt-4 p-3.5 bg-slate-950/80 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2.5 shadow-inner">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>MARKET CURRENTLY LOCKED:</strong> You can review card powers, coin prices, and live squad holdings. Live card purchasing will open when initiated by Admin.
            </span>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              morphAudio.playClick();
              setActiveTab('market');
            }}
            className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'market'
                ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>CARDS MARKETPLACE ({cards.length} AVAILABLE)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              morphAudio.playClick();
              setActiveTab('leaderboard');
            }}
            className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4 text-purple-400" />
            <span>POWER CARDS LEADERBOARD ({teams.length} SQUADS)</span>
          </button>
        </div>
      </section>

      {/* 2. MAIN VIEW: CARDS CATALOG */}
      {activeTab === 'market' && (
        <section className="chrome-panel p-5 md:p-6 shadow-2xl">
          <div className="border-b border-white/10 pb-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black tracking-widest text-white uppercase flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                FIXED SUPPLY MORPH CARDS INVENTORY
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Each power card has a strictly fixed maximum supply limit. Once exhausted, no further units can be acquired.
              </p>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Supply Synchronization</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
              const canAfford = team.morphCoins >= card.price;
              const isPurchaseOpen = cardRoundConfig.purchaseStatus === 'OPEN';
              const ownedQuantity = ownedCardCounts[card.name] || 0;
              const isFixedLimit = card.maxAvailable !== null;
              const remaining = isFixedLimit ? Math.max(0, card.maxAvailable - card.purchasedCount) : null;
              const isSoldOut = isFixedLimit && card.purchasedCount >= card.maxAvailable;
              const percentClaimed = isFixedLimit ? Math.min(100, Math.round((card.purchasedCount / card.maxAvailable) * 100)) : 0;

              return (
                <div
                  key={card.id}
                  id={`card-market-item-${card.id}`}
                  className={`chrome-panel p-4 flex flex-col justify-between space-y-4 relative transition-all duration-200 ${
                    isSoldOut
                      ? 'border-red-900/40 bg-slate-950/70 opacity-90'
                      : 'hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl shadow-inner">
                        {getCardIcon(card.name, 'w-6 h-6')}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${getCardBadgeColor(card.name)}`}>
                          {card.name}
                        </span>
                        {ownedQuantity > 0 && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            YOU OWN: {ownedQuantity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Price & Power */}
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Coin Price:</span>
                        <span className="text-base font-black text-amber-300">
                          ₹{card.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Fixed Stock Quota & Progress Bar */}
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-white/5 space-y-1.5 shadow-inner">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-400 uppercase">Available Supply:</span>
                          {isFixedLimit ? (
                            <span className={isSoldOut ? 'text-red-400 font-black' : remaining! <= 3 ? 'text-amber-400 font-black' : 'text-emerald-400 font-black'}>
                              {isSoldOut ? 'SOLD OUT' : `${remaining} / ${card.maxAvailable} LEFT`}
                            </span>
                          ) : (
                            <span className="text-cyan-400">UNLIMITED</span>
                          )}
                        </div>

                        {isFixedLimit && (
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isSoldOut
                                  ? 'bg-red-500'
                                  : percentClaimed > 75
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${percentClaimed}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Power Description */}
                      <div className="mt-2 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">
                          Strategic Power:
                        </span>
                        <p className="text-xs text-slate-200 font-medium leading-relaxed">
                          {card.power}
                        </p>
                      </div>

                      <div className="mt-1">
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">
                          Function:
                        </span>
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-3">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <div className="pt-3 border-t border-white/10">
                    <button
                      id={`buy-card-btn-${card.id}`}
                      type="button"
                      disabled={!isPurchaseOpen || !canAfford || isSoldOut}
                      onClick={() => handleBuy(card)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                        isSoldOut
                          ? 'bg-red-950/40 border border-red-900/60 text-red-400 opacity-60 cursor-not-allowed'
                          : !isPurchaseOpen
                          ? 'bg-slate-900 border border-white/10 text-slate-500 opacity-60 cursor-not-allowed'
                          : !canAfford
                          ? 'bg-slate-900 border border-red-900/40 text-red-400 opacity-70 cursor-not-allowed'
                          : 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                      }`}
                    >
                      {isSoldOut ? (
                        <span>SOLD OUT (SUPPLY EXHAUSTED)</span>
                      ) : !isPurchaseOpen ? (
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" /> MARKET LOCKED
                        </span>
                      ) : !canAfford ? (
                        <span>INSUFFICIENT COINS</span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-950" /> ACQUIRE CARD (₹{card.price.toLocaleString()})
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. ROUND 3 POWER CARDS LEADERBOARD & SQUAD INTEL */}
      {activeTab === 'leaderboard' && (
        <section className="chrome-panel p-5 md:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black tracking-widest text-white uppercase">
                  ROUND 3 POWER CARDS SQUAD LEADERBOARD
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tactical matrix showing all 15 competing squads, coin standings, and active power cards in vault.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-slate-400">Total Cards Held: </span>
                <span className="font-bold text-purple-300">{totalHeldCards}</span>
              </div>
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <span className="text-slate-400">🛡️ SAFE Shields: </span>
                <span className="font-bold text-emerald-400">{totalSafeShields}</span>
              </div>
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-blue-500/30">
                <span className="text-slate-400">🔄 SWAP Armed: </span>
                <span className="font-bold text-blue-400">{totalSwapArmed}</span>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs font-mono">
            <span className="text-slate-500 uppercase text-[10px] font-bold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => {
                morphAudio.playClick();
                setLeaderboardFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                leaderboardFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              ALL SQUADS ({teams.length})
            </button>
            <button
              type="button"
              onClick={() => {
                morphAudio.playClick();
                setLeaderboardFilter('with_cards');
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                leaderboardFilter === 'with_cards'
                  ? 'bg-purple-500 text-slate-950 border-purple-500 font-black'
                  : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              HOLDING POWER CARDS ({teams.filter((t) => (t.cards || []).length > 0).length})
            </button>
            <button
              type="button"
              onClick={() => {
                morphAudio.playClick();
                setLeaderboardFilter('safe');
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                leaderboardFilter === 'safe'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                  : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              🛡️ SAFE SHIELD ACTIVE ({totalSafeShields})
            </button>
            <button
              type="button"
              onClick={() => {
                morphAudio.playClick();
                setLeaderboardFilter('swap');
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                leaderboardFilter === 'swap'
                  ? 'bg-blue-500 text-slate-950 border-blue-500 font-black'
                  : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              🔄 SWAP ARMED ({totalSwapArmed})
            </button>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-3">Rank</th>
                  <th className="py-3.5 px-3">Team</th>
                  <th className="py-3.5 px-3">Brand</th>
                  <th className="py-3.5 px-3">Active Power Cards</th>
                  <th className="py-3.5 px-3">Tactical Status</th>
                  <th className="py-3.5 px-3 text-right">Coins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTeams.map((t, idx) => {
                  const isMyTeam = t.id === team.id;
                  const r = t.rank !== undefined ? t.rank : idx + 1;
                  const tCards = t.cards || [];
                  const hasSafe = tCards.some((c) => c.toUpperCase().includes('SAFE'));
                  const hasSwap = tCards.some((c) => c.toUpperCase().includes('SWAP'));
                  const hasBoost = tCards.some((c) => c.toUpperCase().includes('BOOST'));
                  const hasIntel = tCards.some((c) => c.toUpperCase().includes('INTEL'));

                  return (
                    <tr
                      key={t.id}
                      className={`transition ${
                        isMyTeam
                          ? 'bg-purple-950/60 font-bold text-white border-l-2 border-purple-400'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-3 font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                            r === 1
                              ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                              : r === 2
                              ? 'bg-slate-300 text-slate-950'
                              : r === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          #{r}
                        </span>
                      </td>

                      {/* Team Name */}
                      <td className="py-3 px-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{t.teamNumber}</span>
                          {t.teamName !== t.teamNumber && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                              ({t.teamName})
                            </span>
                          )}
                          {isMyTeam && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500 text-slate-950 font-black">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-3 text-slate-300">
                        {t.brand && t.brand !== '—' ? (
                          <span className="text-amber-300 font-bold">{t.brand}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Power Cards */}
                      <td className="py-3 px-3">
                        {tCards.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {tCards.map((cName, cIdx) => {
                              const upper = cName.toUpperCase();
                              let badgeClass = 'border-purple-800 bg-purple-950/80 text-purple-200';
                              let icon = <CreditCard className="w-3 h-3 text-purple-400" />;
                              if (upper.includes('SAFE')) {
                                badgeClass = 'border-emerald-700 bg-emerald-950/80 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
                                icon = <Shield className="w-3 h-3 text-emerald-400" />;
                              } else if (upper.includes('SWAP')) {
                                badgeClass = 'border-blue-700 bg-blue-950/80 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.2)]';
                                icon = <Shuffle className="w-3 h-3 text-blue-400" />;
                              } else if (upper.includes('INTEL')) {
                                badgeClass = 'border-amber-700 bg-amber-950/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
                                icon = <Eye className="w-3 h-3 text-amber-400" />;
                              } else if (upper.includes('BOOST')) {
                                badgeClass = 'border-purple-600 bg-purple-950/90 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.2)]';
                                icon = <Zap className="w-3 h-3 text-purple-400" />;
                              }
                              return (
                                <span
                                  key={cIdx}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}
                                  title={`Held Power Card: ${cName}`}
                                >
                                  {icon}
                                  <span>{cName}</span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">No cards owned</span>
                        )}
                      </td>

                      {/* Tactical Status */}
                      <td className="py-3 px-3 text-[11px]">
                        <div className="flex flex-wrap gap-1">
                          {hasSafe && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
                              <Shield className="w-2.5 h-2.5" /> SAFE Shielded
                            </span>
                          )}
                          {hasSwap && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-700/80 text-blue-300 text-[10px] font-bold inline-flex items-center gap-1">
                              <Shuffle className="w-2.5 h-2.5" /> SWAP Armed
                            </span>
                          )}
                          {hasBoost && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-700/80 text-purple-300 text-[10px] font-bold inline-flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" /> BOOST Ready
                            </span>
                          )}
                          {!hasSafe && !hasSwap && !hasBoost && (
                            <span className="text-slate-600 text-[10px]">Standard Standing</span>
                          )}
                        </div>
                      </td>

                      {/* Coins */}
                      <td className="py-3 px-3 text-right font-black text-purple-200">
                        ₹{t.morphCoins.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CONFIRMATION PURCHASE MODAL */}
      {confirmingCard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chrome-panel border border-white/20 rounded-2xl w-full max-w-md p-6 space-y-4 font-mono shadow-2xl relative overflow-hidden">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCardIcon(confirmingCard.name, 'w-5 h-5')}
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                  CONFIRM CARD PURCHASE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setConfirmingCard(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[10px]">Selected Card:</span>
                  <span className="font-black text-white text-sm">{confirmingCard.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[10px]">Price:</span>
                  <span className="font-black text-amber-300">₹{confirmingCard.price.toLocaleString()} Coins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[10px]">Remaining Balance:</span>
                  <span className="font-bold text-emerald-400">
                    ₹{(team.morphCoins - confirmingCard.price).toLocaleString()} Coins
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-300/90 leading-relaxed">
                ⚠️ <strong>Note:</strong> Card purchases are immediate and non-refundable. The acquired power card will be placed in your team vault immediately.
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={executePurchase}
                className="flex-1 py-2.5 btn-chrome-primary text-slate-950 font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                CONFIRM & ACQUIRE
              </button>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setConfirmingCard(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};