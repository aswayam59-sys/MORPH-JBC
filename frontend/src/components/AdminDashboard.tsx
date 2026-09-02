import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Team } from '../types';
import { AuctionManager } from './AuctionManager';
import { ProductRevealManager } from './ProductRevealManager';
import { MorphCardsManager } from './MorphCardsManager';
import { ProductCreationManager } from './ProductCreationManager';
import { CelebrityRevealManager } from './CelebrityRevealManager';
import { PrCrisisManager } from './PrCrisisManager';
import { MorphMarketManager } from './MorphMarketManager';
import { FinalGrowthManager } from './FinalGrowthManager';
import { AdminNotificationsDrawer } from './AdminNotificationsDrawer';
import { AdminTeamProfileModal } from './AdminTeamProfileModal';
import { MorphLogo } from './MorphLogo';
import { SoundToggle } from './SoundToggle';
import { AnimatedNumber } from './AnimatedNumber';
import { LiquidChromeCanvas } from './LiquidChromeCanvas';
import { morphAudio } from '../utils/audio';
import { Bell, Eye, AlertTriangle, Layers, TrendingUp, Trophy, ShieldAlert, Sparkles, UserCheck, RefreshCw, Users } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    teams,
    logs,
    roundConfig,
    cardRoundConfig,
    productCreationConfig,
    celebrityRoundConfig,
    prCrisisConfig,
    marketRoundConfig,
    finalGrowthConfig,
    auctionStatus,
    adminNotifications,
    brandConflicts,
    logout,
    updateTeamCoins,
    updateTeamProfile,
    resetAllData,
  } = useEvent();

  const [activeAdminTab, setActiveAdminTab] = useState<'ranking' | 'auction' | 'product-reveal' | 'cards' | 'creation' | 'celebrity' | 'pr-crisis' | 'market' | 'final-growth' | 'roster'>('ranking');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [inspectingTeam, setInspectingTeam] = useState<Team | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Money update form state
  const [selectedTeamId, setSelectedTeamId] = useState<string>('1');
  const [newBalanceInput, setNewBalanceInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Edit Team modal state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState<{
    teamName: string;
    member1: string;
    member2: string;
    member3: string;
    accessCode: string;
  }>({
    teamName: '',
    member1: '',
    member2: '',
    member3: '',
    accessCode: '',
  });

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const unreadNotifsCount = adminNotifications.filter((n) => !n.read).length;
  const activeConflictsCount = brandConflicts.filter((c) => c.status === 'ACTIVE').length;

  const handleUpdateCoins = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBalanceInput.trim()) {
      setFeedback({ message: 'Please enter a new balance amount.', isError: true });
      morphAudio.playClick();
      return;
    }

    const numValue = Number(newBalanceInput.replace(/,/g, ''));
    if (isNaN(numValue) || numValue < 0) {
      setFeedback({ message: 'Invalid balance: Coins cannot be negative or empty.', isError: true });
      morphAudio.playClick();
      return;
    }

    const result = updateTeamCoins(selectedTeamId, numValue);
    if (result.success) {
      morphAudio.playConfirm();
      setFeedback({
        message: `Successfully updated ${selectedTeam.teamNumber} to ${numValue.toLocaleString()} Morph Coins.`,
        isError: false,
      });
      setNewBalanceInput('');
    } else {
      morphAudio.playClick();
      setFeedback({ message: result.error || 'Failed to update balance.', isError: true });
    }
  };

  const openEditTeamModal = (team: Team) => {
    morphAudio.playClick();
    setEditingTeam(team);
    setEditForm({
      teamName: team.teamName,
      member1: team.member1,
      member2: team.member2,
      member3: team.member3,
      accessCode: team.accessCode,
    });
  };

  const handleSaveTeamEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    morphAudio.playConfirm();
    updateTeamProfile(editingTeam.id, editForm);
    setEditingTeam(null);
  };

  // Sort teams by rank for the main ranking table
  const sortedByRank = [...teams].sort((a, b) => {
    const rankA = typeof a.rank === 'number' ? a.rank : 999;
    const rankB = typeof b.rank === 'number' ? b.rank : 999;
    if (rankA !== rankB) return rankA - rankB;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  return (
    <main id="admin-dashboard-page" className="min-h-screen bg-chrome-canvas text-neutral-100 p-4 md:p-6 lg:p-8 font-mono relative overflow-x-hidden">
      <LiquidChromeCanvas intensity="subtle" />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Mission Control Top Header Bar */}
        <header className="chrome-panel p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <MorphLogo size="sm" idPrefix="admin-dash" />
            <div className="border-l border-white/10 pl-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                <h1 id="admin-main-heading" className="text-xl md:text-2xl font-black tracking-[0.15em] bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  MISSION CONTROL
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
                CENTRAL EVENT ORCHESTRATION TERMINAL
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <SoundToggle variant="compact" id="admin-header-sound" />

            {/* Live Notifications Bell */}
            <button
              id="admin-notifications-btn"
              type="button"
              onClick={() => {
                morphAudio.playClick();
                setShowNotifications(true);
              }}
              className="relative px-3.5 py-2 btn-chrome-secondary rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>LOGS</span>
              {unreadNotifsCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-bold animate-pulse shadow-sm">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <button
              id="admin-reset-btn"
              type="button"
              onClick={() => {
                morphAudio.playClick();
                setShowResetModal(true);
              }}
              className="px-3.5 py-2 btn-chrome-danger rounded-xl text-xs font-bold tracking-wider transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RESET ALL</span>
            </button>

            <button
              id="admin-logout-btn"
              type="button"
              onClick={() => {
                morphAudio.playClick();
                logout();
              }}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* Mission Control Navigation Pills Switcher */}
        <nav className="chrome-panel p-1.5 flex gap-1.5 overflow-x-auto text-xs font-bold border border-white/10 shadow-lg no-scrollbar">
          {[
            { id: 'ranking', label: '1. LEADERBOARD' },
            { id: 'auction', label: '2. AUCTION (R2)', status: auctionStatus },
            { id: 'product-reveal', label: '3. VAULT (R3)', status: roundConfig.roundStatus === 'ACTIVE' ? 'ACTIVE' : roundConfig.roundStatus === 'COMPLETED' ? 'COMPLETED' : 'LOCKED' },
            { id: 'cards', label: '4. CARDS (R4)', status: cardRoundConfig.roundStatus === 'ACTIVE' ? 'ACTIVE' : cardRoundConfig.purchaseStatus === 'OPEN' ? 'OPEN' : cardRoundConfig.roundStatus === 'COMPLETED' ? 'COMPLETED' : cardRoundConfig.infoReleased ? 'INFO' : 'LOCKED' },
            { id: 'creation', label: '5. CREATION', status: productCreationConfig?.roundStatus === 'ACTIVE' ? 'ACTIVE' : productCreationConfig?.roundStatus === 'COMPLETED' ? 'COMPLETED' : 'LOCKED' },
            { id: 'celebrity', label: '6. CELEB (R5)', status: celebrityRoundConfig?.roundStatus === 'ACTIVE' ? 'ACTIVE' : celebrityRoundConfig?.roundStatus === 'COMPLETED' ? 'COMPLETED' : 'LOCKED' },
            { id: 'pr-crisis', label: '7. PR CRISIS (R6)', status: prCrisisConfig?.roundStatus === 'ACTIVE' ? 'ACTIVE' : prCrisisConfig?.roundStatus === 'COMPLETED' ? 'COMPLETED' : 'LOCKED' },
            { id: 'market', label: '8. MARKET (R7)', status: marketRoundConfig?.tradingStatus === 'OPEN' ? 'TRADING' : marketRoundConfig?.roundStatus === 'ACTIVE' ? 'ACTIVE' : marketRoundConfig?.roundStatus === 'COMPLETED' ? 'COMPLETED' : 'LOCKED' },
            { id: 'final-growth', label: '9. FINAL (R8)', status: finalGrowthConfig?.roundStatus === 'ACTIVE' ? 'ACTIVE' : finalGrowthConfig?.roundStatus === 'COMPLETED' ? 'COMPLETED' : 'LOCKED' },
            { id: 'roster', label: '10. ROSTER' },
          ].map((tab) => {
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-admin-${tab.id}`}
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setActiveAdminTab(tab.id as any);
                }}
                className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
                  isActive
                    ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.status && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                      tab.status === 'LOCKED' || tab.status === 'INACTIVE'
                        ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                        : tab.status === 'ACTIVE' || tab.status === 'OPEN' || tab.status === 'TRADING'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : tab.status === 'COMPLETED'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {tab.status === 'INACTIVE' ? 'LOCKED' : tab.status}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* TAB 1: LEADERBOARD & COIN UPDATES */}
        {activeAdminTab === 'ranking' && (
          <div className="space-y-6">
            
            {/* Round 1 Kahoot Status Banner */}
            <section id="admin-round1-section" className="chrome-panel p-5 border border-white/10 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-200">
                    ROUND 1 — CAPITAL TEST
                  </h2>
                </div>
                <div className="text-xs text-slate-400">
                  Quiz Terminal: <span className="text-emerald-300 font-bold uppercase bg-emerald-950/80 px-2.5 py-0.5 border border-emerald-800/80 rounded">External (Kahoot)</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Kahoot quiz runs externally on the main projection screens. After quiz completion, enter each team&apos;s earned Morph Coin balance below to automatically calculate and broadcast live event standings.
              </p>
            </section>

            {/* Update Morph Coins Section */}
            <section id="admin-update-coins-section" className="chrome-panel p-5 border border-white/10 shadow-lg">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-200">
                  UPDATE MORPH COINS
                </h2>
              </div>

              <form onSubmit={handleUpdateCoins} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label htmlFor="team-select-dropdown" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Select Team:
                  </label>
                  <select
                    id="team-select-dropdown"
                    value={selectedTeamId}
                    onChange={(e) => {
                      setSelectedTeamId(e.target.value);
                      setFeedback(null);
                      morphAudio.playClick();
                    }}
                    className="w-full chrome-input px-3.5 py-3 text-sm rounded-xl text-slate-100 font-semibold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                        {t.teamNumber} ({t.teamName}) — {t.morphCoins.toLocaleString()} Coins
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Current Balance:
                  </label>
                  <div id="selected-team-current-balance" className="chrome-input px-3.5 py-3 text-sm font-black text-purple-300 rounded-xl flex items-center justify-between">
                    <span>
                      <AnimatedNumber value={selectedTeam ? selectedTeam.morphCoins : 10000} />
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">COINS</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="new-balance-input" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    New Balance:
                  </label>
                  <input
                    id="new-balance-input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 13500"
                    value={newBalanceInput}
                    onChange={(e) => setNewBalanceInput(e.target.value)}
                    className="w-full chrome-input px-3.5 py-3 text-sm rounded-xl text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <button
                    id="update-coins-btn"
                    type="submit"
                    className="w-full py-3 px-4 btn-chrome-primary rounded-xl text-xs font-black tracking-widest uppercase cursor-pointer shadow-md"
                  >
                    UPDATE BALANCE
                  </button>
                </div>
              </form>

              {feedback && (
                <div
                  id="coin-update-feedback"
                  className={`mt-4 p-3 rounded-xl border text-xs font-bold tracking-wider ${
                    feedback.isError
                      ? 'border-red-800/80 bg-red-950/70 text-red-300'
                      : 'border-emerald-800/80 bg-emerald-950/70 text-emerald-300'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              {/* Recent update log */}
              {logs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 text-xs flex items-center gap-2">
                  <span className="text-slate-500 uppercase tracking-wider font-bold">Latest Activity: </span>
                  <span className="text-slate-300 font-mono">
                    {logs[0].teamNumber}: {logs[0].previousBalance.toLocaleString()} → {logs[0].newBalance.toLocaleString()} ({logs[0].timestamp}) {logs[0].note ? `· ${logs[0].note}` : ''}
                  </span>
                </div>
              )}
            </section>

            {/* Live Team Ranking Table */}
            <section id="admin-team-ranking-section" className="chrome-panel p-5 md:p-6 border border-white/10 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h2 id="team-ranking-title" className="text-base font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    EVENT LEADERBOARD & ASSET REGISTRY
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Dynamic Standings Auto-Calculated by Morph Coins
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
                <table id="admin-ranking-table" className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider bg-white/5 font-bold">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-4">Morph Coins</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {sortedByRank.map((t) => {
                      const isTop1 = t.rank === 1;
                      const isTop2 = t.rank === 2;
                      const isTop3 = t.rank === 3;

                      return (
                        <tr
                          key={t.id}
                          id={`admin-row-team-${t.id}`}
                          className={`transition ${
                            isTop1
                              ? 'bg-amber-500/5 hover:bg-amber-500/10'
                              : isTop2
                              ? 'bg-slate-400/5 hover:bg-slate-400/10'
                              : isTop3
                              ? 'bg-amber-700/5 hover:bg-amber-700/10'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <td className="py-3 px-4 font-black">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                                isTop1
                                  ? 'bg-gradient-to-b from-amber-300 to-amber-600 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-200'
                                  : isTop2
                                  ? 'bg-gradient-to-b from-slate-200 to-slate-400 text-slate-950 shadow-[0_0_10px_rgba(203,213,225,0.4)] border border-white'
                                  : isTop3
                                  ? 'bg-gradient-to-b from-amber-600 to-amber-900 text-amber-100 shadow-[0_0_8px_rgba(180,83,9,0.3)] border border-amber-500/50'
                                  : 'text-slate-400 bg-white/5 border border-white/5'
                              }`}
                            >
                              #{t.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-100">
                            <div className="flex items-center gap-2">
                              <span>{t.teamNumber}</span>
                              {t.teamName !== t.teamNumber && (
                                <span className="text-slate-400 font-normal text-[11px]">
                                  ({t.teamName})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-black text-slate-100">
                            <span className="text-purple-300 font-bold">
                              ₹<AnimatedNumber value={t.morphCoins} />
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-200">
                            {typeof t.score === 'number' ? t.score : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  morphAudio.playClick();
                                  setInspectingTeam(t);
                                }}
                                className="px-2.5 py-1.5 rounded-lg btn-chrome-secondary text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                              >
                                PROFILE
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditTeamModal(t)}
                                className="px-2.5 py-1.5 rounded-lg btn-chrome-secondary text-slate-300 hover:text-white text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                              >
                                EDIT
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: BRAND AUCTION STAGE */}
        {activeAdminTab === 'auction' && <AuctionManager />}

        {/* TAB 3: PRODUCT REVEAL / VAULT ROUND */}
        {activeAdminTab === 'product-reveal' && <ProductRevealManager />}

        {/* TAB 4: MORPH CARDS */}
        {activeAdminTab === 'cards' && <MorphCardsManager />}

        {/* TAB 5: PRODUCT CREATION / OVERNIGHT BUILD */}
        {activeAdminTab === 'creation' && <ProductCreationManager />}

        {/* TAB 6: CELEBRITY REVEAL / ENDORSEMENTS */}
        {activeAdminTab === 'celebrity' && <CelebrityRevealManager />}

        {/* TAB 7: PR CRISIS BRIEFING */}
        {activeAdminTab === 'pr-crisis' && <PrCrisisManager />}

        {/* TAB 8: MORPH MARKET (INVESTMENT GAME) */}
        {activeAdminTab === 'market' && <MorphMarketManager />}

        {/* TAB 9: FINAL GROWTH EXPANSION (ROUND 8) */}
        {activeAdminTab === 'final-growth' && <FinalGrowthManager />}

        {/* TAB 10: TEAM ROSTER & CODES */}
        {activeAdminTab === 'roster' && (
          <section id="admin-team-directory-section" className="chrome-panel p-6 md:p-8 border border-white/10 rounded-3xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h2 className="text-base font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>TEAM ROSTER & ACCESS CODES (ADMIN REFERENCE)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Team members and unique access codes. Each team only has access to its assigned code.
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-slate-300 shadow-inner">
                Total Teams: <span className="font-black text-purple-300">{teams.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((t) => (
                <div
                  key={t.id}
                  id={`admin-roster-card-${t.id}`}
                  className="p-4 md:p-5 text-xs space-y-3 bg-slate-950/80 border border-white/10 shadow-lg rounded-2xl hover:border-white/20 transition group shadow-inner"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                    <span className="font-extrabold text-white text-sm tracking-wide">{t.teamNumber}</span>
                    <span className="text-purple-300 bg-purple-950/80 px-2.5 py-1 border border-purple-700/60 font-mono text-[11px] font-black rounded-lg shadow-sm">
                      CODE: {t.accessCode}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Name:</span>{' '}
                    <span className="font-semibold text-slate-200">{t.teamName}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Members:</span>{' '}
                    <span className="text-slate-300">{t.member1}, {t.member2}, {t.member3}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Brand Asset:</span>{' '}
                    <span className={t.brand !== '—' ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                      {t.brand} {t.winningBid ? `(₹${t.winningBid.toLocaleString()})` : ''}
                    </span>
                  </div>
                  <div className="pt-2.5 flex justify-end gap-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        morphAudio.playClick();
                        setInspectingTeam(t);
                      }}
                      className="px-3 py-1.5 btn-chrome-secondary rounded-xl text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditTeamModal(t)}
                      className="px-3 py-1.5 btn-chrome-primary text-slate-950 rounded-xl text-[10px] font-black tracking-wider uppercase cursor-pointer shadow-md"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Department footer */}
        <footer className="w-full text-center py-4 font-mono">
          <div className="text-[11px] text-slate-500 tracking-[0.25em] uppercase font-bold">
            THE JOSEPHITE BUSINESS CLUB
          </div>
        </footer>
      </div>

      {/* Admin Notifications Drawer */}
      <AdminNotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Confidential Admin Team Profile Modal */}
      <AdminTeamProfileModal
        team={inspectingTeam}
        onClose={() => setInspectingTeam(null)}
      />

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-white/20 shadow-2xl w-full max-w-md p-6 space-y-4 font-mono rounded-2xl">
            <div className="border-b border-white/10 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-widest">
                EDIT {editingTeam.teamNumber} CREDENTIALS
              </h3>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setEditingTeam(null);
                }}
                className="text-slate-400 hover:text-white text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeamEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Team Display Name:</label>
                <input
                  type="text"
                  value={editForm.teamName}
                  onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })}
                  className="w-full chrome-input p-2.5 rounded-xl text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Member 1:</label>
                <input
                  type="text"
                  value={editForm.member1}
                  onChange={(e) => setEditForm({ ...editForm, member1: e.target.value })}
                  className="w-full chrome-input p-2.5 rounded-xl text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Member 2:</label>
                <input
                  type="text"
                  value={editForm.member2}
                  onChange={(e) => setEditForm({ ...editForm, member2: e.target.value })}
                  className="w-full chrome-input p-2.5 rounded-xl text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Member 3:</label>
                <input
                  type="text"
                  value={editForm.member3}
                  onChange={(e) => setEditForm({ ...editForm, member3: e.target.value })}
                  className="w-full chrome-input p-2.5 rounded-xl text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Access Code:</label>
                <input
                  type="text"
                  value={editForm.accessCode}
                  onChange={(e) => setEditForm({ ...editForm, accessCode: e.target.value.toUpperCase() })}
                  className="w-full chrome-input p-2.5 rounded-xl text-purple-300 font-mono font-bold uppercase tracking-widest"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 btn-chrome-primary rounded-xl font-extrabold uppercase tracking-wider cursor-pointer shadow-md text-xs"
                >
                  SAVE CHANGES
                </button>
                <button
                  type="button"
                  onClick={() => {
                    morphAudio.playClick();
                    setEditingTeam(null);
                  }}
                  className="py-3 px-4 btn-chrome-secondary rounded-xl text-slate-300 hover:text-white cursor-pointer text-xs font-bold"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master Reset All Confirmation Modal */}
      {showResetModal && (
        <div
          id="admin-reset-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="chrome-panel max-w-md w-full p-6 border border-red-500/40 rounded-2xl shadow-2xl space-y-5 bg-slate-950 font-mono">
            <div className="flex items-center gap-3 text-red-400 border-b border-red-500/20 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  RESET ALL EVENT DATA
                </h3>
                <p className="text-[11px] text-red-400/80">Permanent Master Reset</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will reset all <span className="text-white font-bold">15 teams back to 10,000 Morph Coins</span>, restore default brand catalog, set all event rounds to <span className="text-red-400 font-bold">LOCKED</span>, clear all card purchases, market portfolios, scores, and wipe audit logs.
            </p>

            <div className="bg-red-950/40 border border-red-900/50 p-3.5 rounded-xl text-[11px] text-red-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-300">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>IRREVERSIBLE ACTION</span>
              </div>
              <p className="text-red-300/80">
                All connected team screens and tabs will be immediately re-synced to the fresh initial state.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                id="cancel-reset-modal-btn"
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setShowResetModal(false);
                }}
                className="flex-1 py-3 px-4 btn-chrome-secondary rounded-xl text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                CANCEL
              </button>
              <button
                id="confirm-reset-modal-btn"
                type="button"
                onClick={() => {
                  morphAudio.playConfirm();
                  resetAllData();
                  setShowResetModal(false);
                  setFeedback({ message: 'All event data, teams, and rounds successfully reset to initial state.', isError: false });
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/50 cursor-pointer border border-red-400/40"
              >
                YES, RESET ALL
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
