import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { MarketOpportunity } from '../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Lock,
  Unlock,
  Radio,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  HelpCircle,
  Users,
  CheckCircle2,
  AlertCircle,
  Wallet,
  PieChart,
  History,
  Sparkles,
  Info,
} from 'lucide-react';

export const MorphMarketTeamView: React.FC = () => {
  const {
    marketRoundConfig,
    marketOpportunities,
    marketNews,
    marketTransactions,
    getAuthenticatedTeam,
    getTeamMarketPortfolio,
    buyMarketOpportunity,
    sellMarketOpportunity,
  } = useEvent();

  const team = getAuthenticatedTeam();
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Buy / Sell modal states
  const [selectedOpp, setSelectedOpp] = useState<MarketOpportunity | null>(null);
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeAmount, setTradeAmount] = useState<number>(1);

  if (!team) return null;

  const port = getTeamMarketPortfolio(team.id);
  const isRoundActive = marketRoundConfig.roundStatus === 'ACTIVE';
  const isRoundCompleted = marketRoundConfig.roundStatus === 'COMPLETED';
  const isTradingOpen = isRoundActive && marketRoundConfig.tradingStatus === 'OPEN';

  // Filter released news
  const releasedNews = marketNews.filter((n) => n.status === 'RELEASED');
  const latestNews = releasedNews.length > 0 ? releasedNews[0] : null;

  // Filter team transactions
  const teamTransactions = marketTransactions.filter((tx) => tx.teamId === team.id);

  const showToast = (msg: string, isErr = false) => {
    setFeedback({ message: msg, isError: isErr });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenTrade = (opp: MarketOpportunity, mode: 'BUY' | 'SELL') => {
    if (!isTradingOpen) {
      showToast('Trading desk is currently closed by Admin.', true);
      return;
    }

    const pos = port.investments[opp.id];
    setSelectedOpp(opp);
    setTradeMode(mode);

    if (mode === 'BUY') {
      setTradeAmount(1);
    } else {
      const currentVal = pos ? (pos.quantity ?? (opp.currentValue > 0 ? pos.currentValue / opp.currentValue : 0)) : 0;
      setTradeAmount(currentVal);
    }
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    const amount = Number(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount greater than 0.', true);
      return;
    }

    if (tradeMode === 'BUY') {
      const res = buyMarketOpportunity(team.id, selectedOpp.id, amount);
      if (res.success) {
        showToast(`Successfully invested ₹${amount.toLocaleString()} in ${selectedOpp.name}!`);
        setSelectedOpp(null);
      } else {
        showToast(res.error || 'Failed to execute investment.', true);
      }
    } else {
      const pos = port.investments[selectedOpp.id];
      const maxSell = pos ? (pos.quantity ?? (selectedOpp.currentValue > 0 ? pos.currentValue / selectedOpp.currentValue : 0)) : 0;
      if (amount > maxSell) {
        showToast(`Cannot sell more than ${maxSell} units.`, true);
        return;
      }
      const res = sellMarketOpportunity(team.id, selectedOpp.id, amount);
      if (res.success) {
        showToast(`Successfully liquidated ₹${amount.toLocaleString()} from ${selectedOpp.name}!`);
        setSelectedOpp(null);
      } else {
        showToast(res.error || 'Failed to execute sale.', true);
      }
    }
  };

  return (
    <div id="morph-market-team-view" className="space-y-6 font-mono max-w-5xl mx-auto">
      {/* 1. HEADER & LIVE STATUS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
              <DollarSign className="w-4 h-4" />
              <span>ROUND 7 // STRATEGIC CAPITAL ALLOCATION</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              {marketRoundConfig.roundName || 'MORPH MARKET'}
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              {marketRoundConfig.objective}
            </p>
          </div>

          {/* STATUS PILL */}
          <div className="flex-shrink-0">
            {isRoundActive ? (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg ${
                  isTradingOpen
                    ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 animate-pulse'
                    : 'bg-amber-500/10 border border-amber-500/40 text-amber-300'
                }`}
              >
                {isTradingOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isTradingOpen ? 'TRADING DESK OPEN' : 'TRADING DESK PAUSED'}</span>
              </div>
            ) : isRoundCompleted ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                <span>MARKET ROUND COMPLETED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>WAITING FOR ROUND TO START</span>
              </div>
            )}
          </div>
        </div>

        {/* TEAM SPLIT BANNER */}
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <Users className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-black uppercase tracking-wide block">DESK ASSIGNMENT</span>
            <span className="text-neutral-300">
              <strong>1 Dedicated Member</strong> manages the Market Investment Desk here, while <strong>2 Members</strong> craft the PR Crisis response.
            </span>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg animate-in fade-in duration-200 ${
            feedback.isError
              ? 'bg-red-950/90 border border-red-700 text-red-300'
              : 'bg-emerald-950/90 border border-emerald-700 text-emerald-300'
          }`}
        >
          {feedback.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. REAL-TIME PORTFOLIO MATRIX (PROMINENT CASH + INVESTMENTS + TOTAL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Morph Coins (Liquid Cash) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-neutral-400" />
              AVAILABLE MORPH COINS
            </span>
            <span className="text-[10px] text-neutral-500 font-bold">LIQUID CASH</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white font-mono">
            ₹{team.morphCoins.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Free capital ready for immediate deployment.
          </p>
        </div>

        {/* Current Value of Investments */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <PieChart className="w-4 h-4" />
              INVESTED VALUE
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                port.netGainLoss >= 0
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-red-950 text-red-300 border border-red-800'
              }`}
            >
              {port.netGainLoss >= 0 ? '+' : ''}
              {port.netGainLossPercent}%
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-cyan-300 font-mono">
            ₹{port.totalCurrentValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>Principal: ₹{port.totalInvested.toLocaleString()}</span>
            <span className={port.netGainLoss >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {port.netGainLoss >= 0 ? '+' : ''}₹{port.netGainLoss.toLocaleString()}
            </span>
          </div>
        </div>

        {/* TOTAL MORPH PORTFOLIO VALUE (LEADERBOARD METRIC) */}
        <div className="bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400 text-xs uppercase tracking-wider mb-2 font-black">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              TOTAL MORPH PORTFOLIO VALUE
            </span>
            <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black">
              RANK METRIC
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono">
            ₹{port.totalPortfolioValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-300 mt-1">
            Cash (₹{team.morphCoins.toLocaleString()}) + Investments (₹{port.totalCurrentValue.toLocaleString()})
          </p>
        </div>
      </div>

      {/* 3. BREAKING NEWS TICKER / BANNER */}
      {latestNews && (
        <div className="bg-neutral-900 border-2 border-amber-500/40 rounded-2xl p-5 md:p-6 space-y-3 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <Radio className="w-4 h-4 text-red-400" />
              <span className="text-xs font-black uppercase tracking-widest text-red-400">
                BREAKING MARKET NEWS
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">
              RELEASED: {latestNews.releasedAt || 'JUST NOW'}
            </span>
          </div>

          <h3 className="text-base font-black text-white uppercase tracking-tight">
            {latestNews.headline}
          </h3>

          <p className="text-xs text-neutral-300 leading-relaxed font-mono whitespace-pre-line">
            {latestNews.fullText}
          </p>


        </div>
      )}

      {/* 4. MARKET BOARD — OPPORTUNITIES & INVESTMENT DESK */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              MORPH MARKET BOARD
            </h2>
            <p className="text-xs text-neutral-400">
              Deploy Morph Coins into promising sectors or liquidate positions back into liquid cash.
            </p>
          </div>

          {!isTradingOpen && isRoundActive && (
            <span className="text-[11px] text-red-400 bg-red-950/60 border border-red-800/80 px-3 py-1 rounded-lg font-bold uppercase">
              Trading Closed by Admin
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketOpportunities.map((opp) => {
            const pos = port.investments[opp.id] || {
              investedAmount: 0,
              currentValue: 0,
              gainLoss: 0,
              gainLossPercent: 0,
            };

            const hasPosition = pos.currentValue > 0 || pos.investedAmount > 0;
            const isGain = pos.gainLoss >= 0;
            const oppChangePct = opp.startingValue > 0
              ? Math.round(((opp.currentValue - opp.startingValue) / opp.startingValue) * 100)
              : 0;

            const isOppActive = opp.status === 'ACTIVE';

            return (
              <div
                key={opp.id}
                className={`bg-neutral-900 border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition relative overflow-hidden ${
                  hasPosition
                    ? 'border-amber-500/40 bg-gradient-to-b from-neutral-900 via-neutral-900 to-amber-950/10'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Sector Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold block mb-0.5">
                        SECTOR // OPPORTUNITY
                      </span>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">
                        {opp.name}
                      </h3>
                    </div>

                    {/* Sector Index & Market Change */}
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 uppercase block">Market Index</span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-sm font-black text-white font-mono">
                          ₹{opp.currentValue.toLocaleString()}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            oppChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {oppChangePct >= 0 ? '+' : ''}
                          {oppChangePct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                    {opp.description}
                  </p>
                </div>

                {/* Team's Current Position Box */}
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-850 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400 uppercase font-bold">YOUR HOLDING:</span>
                    {hasPosition ? (
                      <span
                        className={`font-mono font-bold flex items-center gap-1 ${
                          isGain ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isGain ? '+' : ''}
                        {pos.gainLossPercent}% ({isGain ? '+' : ''}₹{pos.gainLoss.toLocaleString()})
                      </span>
                    ) : (
                      <span className="text-neutral-500">NO ACTIVE HOLDING</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Invested</span>
                      <span className="text-neutral-300 font-bold">
                        ₹{pos.investedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 block uppercase">Current Value</span>
                      <span className="text-cyan-300 font-black text-sm">
                        ₹{pos.currentValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buy & Sell Action Controls */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    disabled={!isTradingOpen || !isOppActive || team.morphCoins <= 0}
                    onClick={() => handleOpenTrade(opp, 'BUY')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                      isTradingOpen && isOppActive && team.morphCoins > 0
                        ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg cursor-pointer'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>BUY / INVEST</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isTradingOpen || !hasPosition || pos.currentValue <= 0}
                    onClick={() => handleOpenTrade(opp, 'SELL')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                      isTradingOpen && hasPosition && pos.currentValue > 0
                        ? 'bg-neutral-800 hover:bg-neutral-700 border border-amber-500/40 text-amber-300 cursor-pointer'
                        : 'bg-neutral-950 border border-neutral-850 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>SELL / LIQUIDATE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. TRANSACTION AUDIT LOG FOR THIS TEAM */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            YOUR TEAM TRANSACTION RECORD
          </h3>
          <span className="text-[10px] text-neutral-500">
            {teamTransactions.length} ENTRIES
          </span>
        </div>

        {teamTransactions.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-500">
            No transactions made yet. Use BUY to deploy your Morph Coins into active sectors.
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {teamTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                        tx.type === 'BUY'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : tx.type === 'SELL'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {tx.type}
                    </span>
                    <span className="font-bold text-neutral-200">{tx.opportunityName}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">{tx.timestamp}</span>
                </div>

                <div className="text-right">
                  {tx.type === 'BUY' && (
                    <span className="text-cyan-400 font-bold">-₹{tx.amount.toLocaleString()}</span>
                  )}
                  {tx.type === 'SELL' && (
                    <span className="text-emerald-400 font-bold">+₹{tx.amount.toLocaleString()}</span>
                  )}
                  {tx.type === 'MARKET_UPDATE' && (
                    <span className={tx.profitOrLoss && tx.profitOrLoss >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {tx.changePercent !== undefined && `${tx.changePercent >= 0 ? '+' : ''}${tx.changePercent}%`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. RULES & INSTRUCTIONS */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-3">
        <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>MARKET GUIDELINES & VALUATION RULES</span>
        </div>
        <p className="text-xs text-neutral-400 whitespace-pre-line leading-relaxed">
          {marketRoundConfig.rules}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: BUY / SELL ORDER DESK */}
      {/* ========================================================================= */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold block">
                  ORDER DESK // {tradeMode}
                </span>
                <h3 className="text-base font-black text-white uppercase">
                  {selectedOpp.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                className="px-3 py-1 bg-neutral-800 text-neutral-300 hover:text-white rounded text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleExecuteTrade} className="space-y-4 text-xs">
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setTradeMode('BUY');
                    setTradeAmount(1);
                  }}
                  className={`py-2 text-xs font-black uppercase rounded-lg transition ${
                    tradeMode === 'BUY'
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  BUY / INVEST
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTradeMode('SELL');
                    const pos = port.investments[selectedOpp.id];
                    setTradeAmount(pos ? (pos.quantity ?? (selectedOpp.currentValue ? pos.currentValue / selectedOpp.currentValue : 0)) : 0);
                  }}
                  className={`py-2 text-xs font-black uppercase rounded-lg transition ${
                    tradeMode === 'SELL'
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  SELL / LIQUIDATE
                </button>
              </div>

              {/* Balance or Holding Info */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400 uppercase">
                  {tradeMode === 'BUY' ? 'Available Liquid Cash:' : 'Current Position Value:'}
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {tradeMode === 'BUY'
                    ? `₹${team.morphCoins.toLocaleString()}`
                    : `₹${(port.investments[selectedOpp.id]?.currentValue || 0).toLocaleString()}`}
                </span>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-neutral-300 uppercase">
                  {tradeMode === 'BUY' ? 'Units to Buy' : 'Units to Sell'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={
                      tradeMode === 'BUY'
                        ? Math.floor(team.morphCoins / selectedOpp.currentValue)
                        : (port.investments[selectedOpp.id]?.quantity ?? Math.floor((port.investments[selectedOpp.id]?.currentValue || 0) / selectedOpp.currentValue))
                    }
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-base focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Quick Chip Presets */}
              <div className="flex flex-wrap gap-2">
                {tradeMode === 'BUY' ? (
                  <>
                    {[1, 5, 10].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTradeAmount(Math.min(preset, Math.floor(team.morphCoins / selectedOpp.currentValue)))}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded text-[11px] font-mono"
                      >
                        +{preset} units
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTradeAmount(Math.floor(team.morphCoins / selectedOpp.currentValue))}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded text-[11px] font-bold"
                    >
                      MAX CASH
                    </button>
                  </>
                ) : (
                  <>
                    {[0.25, 0.5, 1.0].map((pct) => {
                      const posVal = port.investments[selectedOpp.id]?.quantity ?? Math.floor((port.investments[selectedOpp.id]?.currentValue || 0) / selectedOpp.currentValue);
                      const val = Math.floor(posVal * pct);
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTradeAmount(val)}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded text-[11px] font-mono"
                        >
                          {pct === 1.0 ? '100% (SELL ALL)' : `${pct * 100}%`}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Outcome Preview */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Projected Liquid Cash After:</span>
                  <span className="text-white font-mono font-bold">
                    ₹{tradeMode === 'BUY'
                      ? Math.max(0, team.morphCoins - Number(tradeAmount) * selectedOpp.currentValue).toLocaleString()
                      : (team.morphCoins + Number(tradeAmount) * selectedOpp.currentValue).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Portfolio Value:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    ₹{port.totalPortfolioValue.toLocaleString()} (Preserved)
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2.5 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg transition"
                >
                  Confirm {tradeMode}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
