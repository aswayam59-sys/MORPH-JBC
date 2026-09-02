import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { AuctionTeamView } from './AuctionTeamView';
import { ProductVault } from './ProductVault';
import { MorphCardsTeamStore } from './MorphCardsTeamStore';
import { ProductCreationTeamView } from './ProductCreationTeamView';
import { CelebrityRevealTeamView } from './CelebrityRevealTeamView';
import { PrCrisisTeamView } from './PrCrisisTeamView';
import { MorphMarketTeamView } from './MorphMarketTeamView';
import { FinalGrowthTeamView } from './FinalGrowthTeamView';
import { TeamBrandConflictBanner } from './TeamBrandConflictBanner';
import { MorphLogo } from './MorphLogo';
import { SoundToggle } from './SoundToggle';
import { AnimatedNumber } from './AnimatedNumber';
import { LiquidChromeCanvas } from './LiquidChromeCanvas';
import { morphAudio } from '../utils/audio';
import {
  Gavel,
  X,
  Trophy,
  Sparkles,
  CreditCard,
  Box,
  Hammer,
  DollarSign,
  Flame,
  TrendingUp,
  Wallet,
  Hash,
  Award,
  Shield,
  Shuffle,
  Eye,
  Zap,
} from 'lucide-react';

export const TeamDashboard: React.FC = () => {
  const {
    getAuthenticatedTeam,
    getTeamMarketPortfolio,
    teams,
    celebrities,
    roundConfig,
    cardRoundConfig,
    productCreationConfig,
    celebrityRoundConfig,
    prCrisisConfig,
    marketRoundConfig,
    finalGrowthConfig,
    prCrisisScoresReleased,
    finalGrowthScoresReleased,
    auctionStatus,
    logout,
  } = useEvent();

  const team = getAuthenticatedTeam();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'auction'
    | 'product-vault'
    | 'morph-cards'
    | 'product-creation'
    | 'celebrity-reveal'
    | 'pr-crisis'
    | 'morph-market'
    | 'final-growth'
  >('overview');
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);

  if (!team) {
    return (
      <main className="min-h-screen bg-[#050409] text-slate-100 flex flex-col justify-center items-center p-6 font-mono relative overflow-hidden">
        <LiquidChromeCanvas intensity="subtle" />
        <div className="chrome-panel border border-purple-500/20 p-8 text-center max-w-md rounded-2xl shadow-2xl relative z-10">
          <p className="text-rose-400 text-sm mb-4 font-bold">No active team session found.</p>
          <button
            onClick={logout}
            className="px-6 py-3 btn-chrome-primary text-xs font-black uppercase rounded-xl cursor-pointer"
          >
            RETURN TO LOGIN
          </button>
        </div>
      </main>
    );
  }

  const port = getTeamMarketPortfolio(team.id);
  const rankDisplay = team.rank !== undefined ? `#${team.rank}` : '—';
  const hasBrand = Boolean(team.brand && team.brand !== '—');
  const hasProduct = Boolean(team.product && team.product !== '—');
  const hasCards = Boolean((team.cards || []).length > 0);
  const hasCelebrity = Boolean(team.celebrityId);
  const teamCelebrity = team.celebrityId ? celebrities.find((c) => c.id === team.celebrityId) : null;

  // STRICT ROUND RELEASE CHECKS: The team only sees tabs for rounds that have been released by Admin!
  const isRound1Released = auctionStatus === 'ACTIVE' || auctionStatus === 'COMPLETED';

  const isRound2Released =
    roundConfig.infoReleased ||
    roundConfig.roundStatus === 'ACTIVE' ||
    roundConfig.roundStatus === 'COMPLETED';

  const isCardsRoundReleased =
    cardRoundConfig.infoReleased ||
    cardRoundConfig.roundStatus === 'ACTIVE' ||
    cardRoundConfig.roundStatus === 'COMPLETED';

  const isProductCreationReleased =
    Boolean(productCreationConfig?.infoReleased) ||
    productCreationConfig?.roundStatus === 'ACTIVE' ||
    productCreationConfig?.roundStatus === 'COMPLETED';

  const isCelebrityRoundReleased =
    Boolean(celebrityRoundConfig?.infoReleased) ||
    celebrityRoundConfig?.roundStatus === 'ACTIVE' ||
    celebrityRoundConfig?.roundStatus === 'COMPLETED';

  const isPrCrisisReleased =
    Boolean(prCrisisConfig?.infoReleased) ||
    prCrisisConfig?.roundStatus === 'ACTIVE' ||
    prCrisisConfig?.roundStatus === 'COMPLETED';

  const isMarketReleased =
    Boolean(marketRoundConfig?.infoReleased) ||
    marketRoundConfig?.roundStatus === 'ACTIVE' ||
    marketRoundConfig?.roundStatus === 'COMPLETED';

  const isFinalGrowthReleased =
    Boolean(finalGrowthConfig?.infoReleased) ||
    finalGrowthConfig?.roundStatus === 'ACTIVE' ||
    finalGrowthConfig?.roundStatus === 'COMPLETED';

  // Strict score release: scores are hidden until judging results are published by Admin
  const isScoresReleased = Boolean(prCrisisScoresReleased || finalGrowthScoresReleased);

  // Sorted teams for leaderboard modal
  const sortedTeams = [...teams].sort((a, b) => {
    const rankA = typeof a.rank === 'number' ? a.rank : 999;
    const rankB = typeof b.rank === 'number' ? b.rank : 999;
    if (rankA !== rankB) return rankA - rankB;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  const handleTabChange = (tab: any) => {
    morphAudio.playClick();
    setActiveTab(tab);
  };

  return (
    <main
      id="team-dashboard-page"
      className="min-h-screen bg-chrome-canvas text-slate-100 p-4 md:p-8 font-mono relative overflow-x-hidden selection:bg-purple-900/50"
    >
      {/* 60fps Liquid Chrome Atmosphere */}
      <LiquidChromeCanvas intensity="subtle" />

      <div className="max-w-6xl w-full mx-auto space-y-6 relative z-10">
        
        {/* Top Header */}
        <header className="chrome-panel border border-purple-500/20 p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-4">
            <MorphLogo size={36} idPrefix="team-dash" />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-base md:text-lg font-black tracking-widest text-slate-100 uppercase font-serif">
                  MORPH TERMINAL
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-purple-950/80 border border-purple-500/70 text-purple-300">
                  {team.teamNumber}
                </span>
              </div>
              <p
                id="team-dashboard-team-name"
                className="text-xs text-slate-400 mt-0.5 tracking-wider uppercase font-semibold"
              >
                {team.teamName !== team.teamNumber ? team.teamName : 'Official Contender'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <SoundToggle />

            {/* Prominent Leaderboard Button */}
            <button
              id="btn-view-leaderboard-top"
              type="button"
              onClick={() => {
                morphAudio.playSuccess();
                setShowLeaderboardModal(true);
              }}
              className="px-3.5 py-2 btn-chrome-secondary text-amber-300 hover:text-amber-200 text-xs font-black tracking-wider uppercase cursor-pointer transition flex items-center gap-2 rounded-xl shadow-md"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>LEADERBOARD</span>
            </button>

            <button
              id="team-logout-btn"
              type="button"
              onClick={logout}
              className="px-3 py-2 btn-chrome-secondary text-slate-400 hover:text-white text-xs font-bold tracking-wider transition cursor-pointer rounded-xl"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* Tab Navigation for Team - Only shows released rounds */}
        <nav className="flex chrome-panel border border-purple-500/20 overflow-x-auto text-xs font-bold rounded-2xl p-1.5 gap-1.5 shadow-lg scrollbar-none">
          <button
            id="tab-team-overview"
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <span>OVERVIEW</span>
          </button>

          {/* Round 1: AUCTION - ONLY VISIBLE IF RELEASED BY ADMIN */}
          {isRound1Released && (
            <button
              id="tab-team-auction"
              type="button"
              onClick={() => handleTabChange('auction')}
              className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'auction'
                  ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Gavel className="w-3.5 h-3.5 text-amber-400" />
              <span>ROUND 1: AUCTION</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                  auctionStatus === 'ACTIVE'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 animate-pulse'
                    : 'bg-purple-950/80 text-purple-300 border border-purple-700/80'
                }`}
              >
                {auctionStatus === 'ACTIVE' ? 'LIVE' : 'COMPLETED'}
              </span>
            </button>
          )}

          {/* Round 2: Product Reveal - ONLY VISIBLE IF INFO RELEASED */}
          {isRound2Released && (
            <button
              id="tab-team-product-vault"
              type="button"
              onClick={() => handleTabChange('product-vault')}
              className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'product-vault'
                  ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-emerald-400" />
              <span>ROUND 2: PRODUCTS</span>
            </button>
          )}

          {/* Round 3: MORPH CARDS - ONLY VISIBLE IF INFO RELEASED */}
          {isCardsRoundReleased && (
            <button
              id="tab-team-morph-cards"
              type="button"
              onClick={() => handleTabChange('morph-cards')}
              className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'morph-cards'
                  ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-400" />
              <span>ROUND 3: CARDS</span>
            </button>
          )}

          {/* Round 4: PRODUCT CREATION - ONLY VISIBLE IF INFO RELEASED */}
          {isProductCreationReleased && (
            <button
              id="tab-team-product-creation"
              type="button"
              onClick={() => handleTabChange('product-creation')}
              className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'product-creation'
                  ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Hammer className="w-3.5 h-3.5 text-purple-400" />
              <span>ROUND 4: CREATION</span>
            </button>
          )}

          {/* Round 5: CELEBRITY REVEAL - ONLY VISIBLE IF INFO RELEASED */}
          {isCelebrityRoundReleased && (
            <button
              id="tab-team-celebrity-reveal"
              type="button"
              onClick={() => handleTabChange('celebrity-reveal')}
              className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'celebrity-reveal'
                  ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>ROUND 5: CELEBRITY</span>
            </button>
          )}

          {/* Round 6: PR CRISIS - ONLY VISIBLE IF INFO RELEASED */}
          {isPrCrisisReleased && (
            <button
              id="tab-team-pr-crisis"
              type="button"
              onClick={() => handleTabChange('pr-crisis')}
              className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'pr-crisis'
                  ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>ROUND 6: PR CRISIS</span>
            </button>
          )}

          {/* Round 7: MORPH MARKET - ONLY VISIBLE IF INFO RELEASED */}
          {isMarketReleased && (
            <button
              id="tab-team-morph-market"
              type="button"
              onClick={() => handleTabChange('morph-market')}
              className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'morph-market'
                  ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>ROUND 7: MARKET</span>
            </button>
          )}

          {/* Round 8: FINAL GROWTH EXPANSION - ONLY VISIBLE IF INFO RELEASED */}
          {isFinalGrowthReleased && (
            <button
              id="tab-team-final-growth"
              type="button"
              onClick={() => handleTabChange('final-growth')}
              className={`py-2.5 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'final-growth'
                  ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span>ROUND 8: GROWTH</span>
            </button>
          )}
        </nav>

        {/* Persistent Quick Overview Header (Keeps stats firmly visible above all round panels) */}
        {activeTab !== 'overview' && (
          <div className="chrome-panel border border-purple-500/20 p-4 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">TEAM:</span>
                <span className="px-2 py-0.5 text-xs font-black uppercase rounded bg-purple-950 border border-purple-500 text-purple-200">
                  {team.teamNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">BALANCE:</span>
                <span className="text-sm font-black text-purple-200">
                  ₹<AnimatedNumber value={team.morphCoins} />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">RANK:</span>
                <span className="text-sm font-black text-amber-300">
                  {rankDisplay}
                </span>
              </div>
              {hasBrand && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">BRAND:</span>
                  <span className="text-xs font-bold text-amber-300">
                    {team.brand}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleTabChange('overview')}
              className="text-xs font-bold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg btn-chrome-secondary cursor-pointer"
            >
              ← VIEW FULL OVERVIEW
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW (HOME) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Active Brand Conflict Banner if team is involved in a tiebreaker */}
            <TeamBrandConflictBanner team={team} />

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              
              {/* 1. Team Identifier */}
              <div id="stat-card-team" className="chrome-panel border border-purple-500/20 p-5 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
                  <span className="font-bold">REGISTERED SQUAD</span>
                  <Hash className="w-4 h-4 text-purple-400" />
                </div>
                <div
                  id="team-overview-number"
                  className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight"
                >
                  {team.teamNumber}
                </div>
                <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold truncate">
                  {team.teamName !== team.teamNumber ? team.teamName : 'Official Contender'}
                </span>
              </div>

              {/* 2. Liquid Morph Coins (Always Shown) */}
              <div id="stat-card-coins" className="chrome-panel border border-purple-500/20 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
                  <span className="font-bold">MORPH COINS</span>
                  <Wallet className="w-4 h-4 text-purple-400" />
                </div>
                <div
                  id="team-morph-coins"
                  className="text-2xl sm:text-3xl font-black text-purple-200 tracking-tight"
                >
                  ₹<AnimatedNumber value={team.morphCoins} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                  Active liquid capital
                </span>
              </div>

              {/* 3. Current Rank (Always Shown) */}
              <div id="stat-card-rank" className="chrome-panel border border-purple-500/20 p-5 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
                  <span className="font-bold">CURRENT RANK</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div
                  id="team-current-rank"
                  className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight"
                >
                  {rankDisplay}
                </div>
                <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                  Live leaderboard standing
                </span>
              </div>

              {/* 4. Market Invested (ONLY SHOWN IF MORPH MARKET ROUND IS RELEASED) */}
              {isMarketReleased && (
                <div id="stat-card-invested" className="chrome-panel border border-purple-500/30 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-purple-400/90 mb-1.5 font-bold">
                    <span>MARKET INVESTED</span>
                    {port.totalInvested > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${port.netGainLoss >= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                        {port.netGainLoss >= 0 ? '+' : ''}{port.netGainLossPercent}%
                      </span>
                    )}
                  </div>
                  <div
                    id="team-invested-value"
                    className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight"
                  >
                    ₹<AnimatedNumber value={port.totalCurrentValue} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                    Principal: ₹{port.totalInvested.toLocaleString()}
                  </span>
                </div>
              )}

              {/* 5. Total Portfolio (ONLY SHOWN IF MORPH MARKET ROUND IS RELEASED) */}
              {isMarketReleased && (
                <div id="stat-card-portfolio" className="chrome-panel border border-amber-400/30 bg-gradient-to-br from-amber-950/20 via-slate-900/40 to-purple-950/20 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-amber-300 font-bold mb-1.5">
                    <span>TOTAL PORTFOLIO</span>
                    <span className="text-[9px] bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black tracking-widest">
                      STANDINGS
                    </span>
                  </div>
                  <div
                    id="team-total-portfolio-value"
                    className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight"
                  >
                    ₹<AnimatedNumber value={port.totalPortfolioValue} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                    Cash + Market Equities
                  </span>
                </div>
              )}

              {/* 6. Score Card (ONLY SHOWN IF JUDGING SCORES ARE RELEASED BY ADMIN) */}
              {isScoresReleased && team.score > 0 && (
                <div id="stat-card-score" className="chrome-panel border border-emerald-500/30 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-emerald-400 mb-1.5 font-bold">
                    <span>JUDGING SCORE</span>
                    <Award className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div id="team-score" className="text-2xl sm:text-3xl font-black text-slate-100">
                    {team.score}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                    Official confirmed score
                  </span>
                </div>
              )}

            </div>

            {/* OWNED ASSETS SECTION */}
            {(hasBrand || hasProduct || hasCards || hasCelebrity) && (
              <section id="team-owned-assets-section" className="space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-bold px-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>ACQUIRED ASSETS & INVENTORY</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {/* Brand Asset Card */}
                  {hasBrand && (
                    <div id="stat-card-brand" className="chrome-panel border border-amber-500/35 p-5 rounded-2xl shadow-xl relative overflow-hidden">
                      <span className="block text-[11px] uppercase tracking-wider text-amber-400/90 mb-1.5 font-bold">
                        CORPORATE BRAND
                      </span>
                      <div
                        id="team-brand"
                        className="text-xl font-black truncate text-amber-300"
                      >
                        {team.brand}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                        {team.winningBid ? `Won for ₹${team.winningBid.toLocaleString()}` : 'Assigned Enterprise'}
                      </span>
                    </div>
                  )}

                  {/* Product Asset Card */}
                  {hasProduct && (
                    <div id="stat-card-product" className="chrome-panel border border-emerald-500/35 p-5 rounded-2xl shadow-xl relative overflow-hidden">
                      <span className="block text-[11px] uppercase tracking-wider text-emerald-400/90 mb-1.5 font-bold">
                        PRODUCT CATEGORY
                      </span>
                      <div
                        id="team-product"
                        className="text-xl font-black truncate text-emerald-300"
                      >
                        {team.product}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                        Vault Allocation Completed
                      </span>
                    </div>
                  )}

                  {/* Morph Cards */}
                  {hasCards && (
                    <div id="stat-card-cards" className="chrome-panel border border-purple-500/35 p-5 rounded-2xl shadow-xl relative overflow-hidden">
                      <span className="block text-[11px] uppercase tracking-wider text-purple-300 mb-1.5 font-bold">
                        ACTIVE MORPH CARDS ({team.cards!.length})
                      </span>
                      <div
                        id="team-cards-count"
                        className="text-sm font-bold text-purple-300 flex flex-wrap gap-1.5 mt-1.5"
                      >
                        {team.cards!.map((cName, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2.5 py-0.5 bg-purple-950/80 border border-purple-600/70 text-[10px] text-purple-200 rounded-md font-bold"
                          >
                            {cName}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                        Tactical Advantage Inventory
                      </span>
                    </div>
                  )}

                  {/* Celebrity */}
                  {hasCelebrity && (
                    <div id="stat-card-celebrity" className="chrome-panel border border-purple-500/35 p-5 rounded-2xl shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                      <span className="block text-[11px] uppercase tracking-wider text-purple-300 mb-1.5 font-bold">
                        CELEBRITY ENDORSEMENT
                      </span>
                      <div
                        id="team-celebrity-name"
                        className="text-xl font-black truncate text-purple-200"
                      >
                        {team.celebrityRevealed && teamCelebrity
                          ? teamCelebrity.name
                          : `MYSTERY CARD #${team.celebrityMysteryNumber || (teamCelebrity?.celebrityNumber ?? '?')}`}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                        {team.celebrityRevealed && teamCelebrity
                          ? `${teamCelebrity.domain} • Verified Partner`
                          : '🔒 Identity locked until stage reveal'}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Team Members List */}
            <section id="team-members-section" className="chrome-panel border border-purple-500/20 p-5 md:p-6 rounded-2xl shadow-lg">
              <span className="block text-xs uppercase tracking-wider text-slate-400 border-b border-white/10 pb-3 mb-4 font-bold">
                AUTHORIZED TEAM OPERATORS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#0C0A14] border border-purple-500/15 p-3.5 rounded-xl">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Strategist 1</span>
                  <span className="font-bold text-slate-200">{team.member1}</span>
                </div>
                <div className="bg-[#0C0A14] border border-purple-500/15 p-3.5 rounded-xl">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Strategist 2</span>
                  <span className="font-bold text-slate-200">{team.member2}</span>
                </div>
                <div className="bg-[#0C0A14] border border-purple-500/15 p-3.5 rounded-xl">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Strategist 3</span>
                  <span className="font-bold text-slate-200">{team.member3}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB: ROUND 1 AUCTION PAGE */}
        {activeTab === 'auction' && isRound1Released && (
          <AuctionTeamView team={team} />
        )}

        {/* TAB 2: ROUND 2 PRODUCT REVEAL */}
        {activeTab === 'product-vault' && isRound2Released && (
          <ProductVault team={team} />
        )}

        {/* TAB 3: MORPH CARDS STORE */}
        {activeTab === 'morph-cards' && isCardsRoundReleased && (
          <MorphCardsTeamStore team={team} />
        )}

        {/* TAB 4: PRODUCT CREATION / OVERNIGHT BUILD */}
        {activeTab === 'product-creation' && isProductCreationReleased && (
          <ProductCreationTeamView team={team} />
        )}

        {/* TAB 5: CELEBRITY REVEAL / ENDORSEMENTS */}
        {activeTab === 'celebrity-reveal' && isCelebrityRoundReleased && (
          <CelebrityRevealTeamView />
        )}

        {/* TAB 6: PR CRISIS BRIEFING */}
        {activeTab === 'pr-crisis' && isPrCrisisReleased && (
          <PrCrisisTeamView />
        )}

        {/* TAB 7: MORPH MARKET INVESTMENT DESK */}
        {activeTab === 'morph-market' && isMarketReleased && (
          <MorphMarketTeamView />
        )}

        {/* TAB 8: FINAL GROWTH EXPANSION */}
        {activeTab === 'final-growth' && isFinalGrowthReleased && (
          <FinalGrowthTeamView />
        )}

        {/* Minimal department tag without ChatGPT footer */}
        <footer className="w-full text-center py-3 font-mono">
          <div className="text-[11px] text-slate-500 tracking-[0.25em] uppercase font-bold">
            THE JOSEPHITE BUSINESS CLUB
          </div>
        </footer>

      </div>

      {/* LEADERBOARD MODAL */}
      {showLeaderboardModal && (
        <div
          id="leaderboard-modal-overlay"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-4 pt-10 overflow-y-auto"
        >
          <div
            id="leaderboard-modal-container"
            className="chrome-panel border border-purple-500/30 rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl space-y-5 font-mono relative"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black tracking-wider uppercase bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                    EVENT LEADERBOARD
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live standings of all 15 competing squads.
                  </p>
                </div>
              </div>
              <button
                id="btn-close-leaderboard-modal"
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setShowLeaderboardModal(false);
                }}
                className="w-8 h-8 rounded-xl btn-chrome-secondary flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Team</th>
                    <th className="py-3 px-3 text-right">Coins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedTeams.map((t, idx) => {
                    const isMyTeam = t.id === team.id;
                    const r = t.rank !== undefined ? t.rank : idx + 1;

                    return (
                      <tr
                        key={t.id}
                        className={`transition ${
                          isMyTeam
                            ? 'bg-purple-950/60 font-bold text-white border-l-2 border-purple-400'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black ${
                              r === 1
                                ? 'bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
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
                        <td className="py-3 px-3 font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{t.teamNumber}</span>
                            {t.teamName !== t.teamNumber && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                ({t.teamName})
                              </span>
                            )}
                            {isMyTeam && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500 text-slate-950 font-black">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-purple-300">
                          ₹{t.morphCoins.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
