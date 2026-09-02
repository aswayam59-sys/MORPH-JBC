import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { morphAudio } from '../utils/audio';
import { AdminRoundHeader } from './AdminRoundHeader';
import { MarketOpportunity, MarketNews } from '../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Radio,
  Send,
  AlertCircle,
  Clock,
  Shield,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Eye,
  FileText,
  Percent,
  Sliders,
  History,
  Users,
} from 'lucide-react';

export const MorphMarketManager: React.FC = () => {
  const {
    marketRoundConfig,
    marketOpportunities,
    marketNews,
    marketTransactions,
    teams,
    releaseMarketInfo,
    hideMarketInfo,
    releaseMarketRound,
    pauseMarketRound,
    completeMarketRound,
    resetMarketRound,
    updateMarketRoundConfig,
    openTrading,
    closeTrading,
    addMarketOpportunity,
    updateMarketOpportunity,
    deleteMarketOpportunity,
    toggleMarketOpportunityStatus,
    addMarketNews,
    updateMarketNews,
    deleteMarketNews,
    releaseMarketNews,
    releaseMarketNewsPrice,
    getTeamMarketPortfolio,
    resetMarketRoundActivity,
  } = useEvent();

  const [activeTab, setActiveTab] = useState<'monitor' | 'opportunities' | 'news' | 'ledger' | 'config'>('monitor');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Modal / Form states for Opportunities
  const [showOppModal, setShowOppModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState<MarketOpportunity | null>(null);
  const [oppForm, setOppForm] = useState({
    name: '',
    description: '',
    startingValue: 100,
    currentValue: 100,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  // Modal / Form states for News
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<MarketNews | null>(null);
  const [newsForm, setNewsForm] = useState({
    headline: '',
    fullText: '',
    additionalEffects: '',
    affectedOpportunities: [] as { opportunityId: string; opportunityName: string; changePercent: number }[],
  });

  // Team detail breakdown modal
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const showToast = (msg: string, isErr = false) => {
    setFeedback({ message: msg, isError: isErr });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Opportunity Handlers
  const handleOpenAddOpp = () => {
    morphAudio.playClick();
    setEditingOpp(null);
    setOppForm({
      name: '',
      description: '',
      startingValue: 100,
      currentValue: 100,
      status: 'ACTIVE',
    });
    setShowOppModal(true);
  };

  const handleOpenEditOpp = (opp: MarketOpportunity) => {
    morphAudio.playClick();
    setEditingOpp(opp);
    setOppForm({
      name: opp.name,
      description: opp.description,
      startingValue: opp.startingValue,
      currentValue: opp.currentValue,
      status: opp.status,
    });
    setShowOppModal(true);
  };

  const handleSaveOpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppForm.name.trim()) {
      showToast('Opportunity name is required.', true);
      return;
    }

    morphAudio.playSuccess();
    if (editingOpp) {
      updateMarketOpportunity(editingOpp.id, {
        name: oppForm.name.trim(),
        description: oppForm.description.trim(),
        startingValue: Number(oppForm.startingValue),
        currentValue: Number(oppForm.currentValue),
        status: oppForm.status,
      });
      showToast(`Updated opportunity: ${oppForm.name}`);
    } else {
      addMarketOpportunity({
        name: oppForm.name.trim(),
        description: oppForm.description.trim(),
        startingValue: Number(oppForm.startingValue),
        currentValue: Number(oppForm.currentValue),
        status: oppForm.status,
        changePercent: 0,
      });
      showToast(`Added new opportunity: ${oppForm.name}`);
    }
    setShowOppModal(false);
  };

  // News Handlers
  const handleOpenAddNews = () => {
    morphAudio.playClick();
    setEditingNews(null);
    setNewsForm({
      headline: '',
      fullText: '',
      additionalEffects: '',
      affectedOpportunities: marketOpportunities.map((o) => ({
        opportunityId: o.id,
        opportunityName: o.name,
        changePercent: 0,
      })),
    });
    setShowNewsModal(true);
  };

  const handleOpenEditNews = (newsItem: MarketNews) => {
    morphAudio.playClick();
    setEditingNews(newsItem);
    // Ensure all current opportunities exist in form
    const currentMap = new Map(newsItem.affectedOpportunities.map((a) => [a.opportunityId, a]));
    const fullAffected = marketOpportunities.map((o) => {
      if (currentMap.has(o.id)) {
        return currentMap.get(o.id)!;
      }
      return {
        opportunityId: o.id,
        opportunityName: o.name,
        changePercent: 0,
      };
    });

    setNewsForm({
      headline: newsItem.headline,
      fullText: newsItem.fullText,
      additionalEffects: newsItem.additionalEffects || '',
      affectedOpportunities: fullAffected,
    });
    setShowNewsModal(true);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.headline.trim()) {
      showToast('News headline is required.', true);
      return;
    }

    morphAudio.playSuccess();
    const filteredAffected = newsForm.affectedOpportunities.filter(
      (a) => a.changePercent !== 0 && !isNaN(a.changePercent)
    );

    if (editingNews) {
      updateMarketNews(editingNews.id, {
        headline: newsForm.headline.trim(),
        fullText: newsForm.fullText.trim(),
        additionalEffects: newsForm.additionalEffects.trim(),
        affectedOpportunities: filteredAffected,
      });
      showToast(`Updated news event: "${newsForm.headline.slice(0, 30)}..."`);
    } else {
      addMarketNews({
        headline: newsForm.headline.trim(),
        fullText: newsForm.fullText.trim(),
        additionalEffects: newsForm.additionalEffects.trim(),
        affectedOpportunities: filteredAffected,
      });
      showToast(`Added new draft news event.`);
    }
    setShowNewsModal(false);
  };

  const handleReleaseNewsItem = (newsId: string) => {
    const target = marketNews.find((n) => n.id === newsId);
    if (!target) return;
    if (
      window.confirm(
        `RELEASE NEWS FLASH: "${target.headline}"?\n\nThis makes the news visible. Sector prices remain unchanged until you release each price separately.`
      )
    ) {
      morphAudio.playConfirm();
      const res = releaseMarketNews(newsId);
      if (res.success) {
        morphAudio.playSuccess();
        showToast(`Released news: "${target.headline.slice(0, 40)}..."`);
      } else {
        morphAudio.playDanger();
        showToast(res.error || 'Failed to release news.', true);
      }
    }
  };

  const handleReleasePrice = (newsId: string, opportunityId: string) => {
    const res = releaseMarketNewsPrice(newsId, opportunityId);
    if (res.success) {
      morphAudio.playSuccess();
      showToast('Released sector price and recalculated affected portfolios.');
    } else {
      morphAudio.playDanger();
      showToast(res.error || 'Failed to release price.', true);
    }
  };

  const isTradingOpen = marketRoundConfig.tradingStatus === 'OPEN';

  return (
    <div id="morph-market-admin-module" className="space-y-6 font-mono">
      {/* 1. MASTER UNIFIED ROUND HEADER */}
      <AdminRoundHeader
        roundNumber={7}
        roundTitle="MORPH MARKET (INVESTMENT GAME)"
        infoReleased={marketRoundConfig.infoReleased}
        roundStatus={marketRoundConfig.roundStatus}
        onReleaseInfo={releaseMarketInfo}
        onHideInfo={hideMarketInfo}
        onReleaseRound={releaseMarketRound}
        onPauseRound={pauseMarketRound}
        onCompleteRound={completeMarketRound}
        onResetRound={resetMarketRound}
        idPrefix="market"
      />

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

      {/* 2. TRADING DESK CONTROL & QUICK STATS BAR */}
      <div className="chrome-panel border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              isTradingOpen
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 animate-pulse'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}
          >
            {isTradingOpen ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                MARKET TRADING DESK:
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider ${
                  isTradingOpen
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
                    : 'bg-red-950/80 text-red-400 border border-red-600/50'
                }`}
              >
                {isTradingOpen ? '🟢 TRADING OPEN (TEAMS CAN BUY/SELL)' : '🔴 TRADING CLOSED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isTradingOpen
                ? 'Teams can actively allocate cash or liquidate positions in real-time.'
                : 'Transactions are paused. Portfolios and live valuations remain viewable.'}
            </p>
          </div>
        </div>

        {/* TRADING TOGGLE BUTTONS */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isTradingOpen ? (
            <button
              type="button"
              onClick={() => {
                morphAudio.playDanger();
                closeTrading();
              }}
              className="w-full md:w-auto px-5 py-2.5 bg-red-900/60 hover:bg-red-800/80 border border-red-700 text-red-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-lg"
            >
              <Lock className="w-4 h-4" />
              <span>CLOSE TRADING DESK</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                morphAudio.playConfirm();
                openTrading();
              }}
              className="w-full md:w-auto px-6 py-2.5 btn-chrome-primary text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-xl"
            >
              <Unlock className="w-4 h-4" />
              <span>OPEN TRADING DESK</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              morphAudio.playClick();
              if (
                window.confirm(
                  'RESET MARKET ACTIVITY?\n\nThis will reset all team investments, restore opportunity values to base, and clear market transaction logs.\n(Market configs & draft news will NOT be deleted).'
                )
              ) {
                morphAudio.playDanger();
                resetMarketRoundActivity();
                showToast('Market round activity has been reset.');
              }
            }}
            className="btn-chrome-secondary px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5"
            title="Reset active investments & prices back to start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET ACTIVITY</span>
          </button>
        </div>
      </div>

      {/* 3. INNER TAB NAVIGATION */}
      <nav className="flex border border-white/10 chrome-panel overflow-x-auto text-xs font-bold rounded-2xl p-1.5 gap-1.5 shadow-lg">
        <button
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('monitor');
          }}
          className={`py-2 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'monitor'
              ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>1. LIVE PORTFOLIO MONITOR ({teams.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('opportunities');
          }}
          className={`py-2 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'opportunities'
              ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>2. MARKET SECTORS / OPPORTUNITIES ({marketOpportunities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('news');
          }}
          className={`py-2 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'news'
              ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>3. BREAKING NEWS & PRICE EVENTS ({marketNews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('ledger');
          }}
          className={`py-2 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>4. TRANSACTION LEDGER ({marketTransactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('config');
          }}
          className={`py-2 px-4 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'config'
              ? 'btn-chrome-primary text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>5. ROUND GUIDELINES & RULES</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE TEAM PORTFOLIO MONITOR */}
      {/* ========================================================================= */}
      {activeTab === 'monitor' && (
        <div className="space-y-4">
          <div className="border border-white/10 chrome-panel rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  REAL-TIME PORTFOLIO VALUATION MATRIX
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total Morph Portfolio Value = Available Cash + Live Valued Investments. Main Event Rankings derive directly from this metric.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase bg-slate-950/50">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Team</th>
                    <th className="py-3 px-3 text-right">Available Cash</th>
                    <th className="py-3 px-3 text-right">Invested Value</th>
                    <th className="py-3 px-3 text-right font-black text-amber-400">Total Portfolio Value</th>
                    <th className="py-3 px-3 text-right">Net Return</th>
                    <th className="py-3 px-3 text-center">Positions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teams.map((team) => {
                    const port = getTeamMarketPortfolio(team.id);
                    const positionsCount = Object.keys(port.investments || {}).filter(
                      (k) => port.investments[k].currentValue > 0
                    ).length;
                    const isPositive = port.netGainLoss >= 0;

                    return (
                      <tr key={team.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-3 font-bold text-amber-400">
                          #{team.rank ?? '—'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-200">{team.teamNumber}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {team.teamName}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-200">
                          ₹{team.morphCoins.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-cyan-300">
                          ₹{port.totalCurrentValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-amber-400 text-sm">
                          ₹{port.totalPortfolioValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {port.totalInvested > 0 ? (
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${
                                isPositive ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {isPositive ? '+' : ''}
                              ₹{port.netGainLoss.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              morphAudio.playClick();
                              setSelectedTeamId(team.id);
                            }}
                            className="btn-chrome-secondary px-2.5 py-1 text-[10px] font-bold uppercase"
                          >
                            {positionsCount > 0 ? `${positionsCount} ASSETS` : 'VIEW'}
                          </button>
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

      {/* ========================================================================= */}
      {/* TAB 2: MARKET OPPORTUNITIES CATALOG & ADMIN CRUD */}
      {/* ========================================================================= */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="border border-white/10 chrome-panel rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  MARKET SECTORS & OPPORTUNITIES
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create, price, and toggle availability of investment sectors. Prices update automatically when breaking news is released.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddOpp}
                className="btn-chrome-primary text-slate-950 font-black text-xs uppercase px-4 py-2 flex items-center gap-2 shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>ADD OPPORTUNITY</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketOpportunities.map((opp) => {
                const isGain = opp.currentValue >= opp.startingValue;
                const changePct = opp.startingValue > 0
                  ? Math.round(((opp.currentValue - opp.startingValue) / opp.startingValue) * 100)
                  : 0;

                return (
                  <div
                    key={opp.id}
                    className={`bg-slate-950/70 border rounded-2xl p-5 flex flex-col justify-between space-y-3 transition shadow-inner ${
                      opp.status === 'ACTIVE'
                        ? 'border-white/10 hover:border-white/20'
                        : 'border-red-900/40 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-black text-white uppercase tracking-wide">
                          {opp.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
                            opp.status === 'ACTIVE'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-600/50'
                              : 'bg-red-950/80 text-red-400 border border-red-600/50'
                          }`}
                        >
                          {opp.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {opp.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Current Index / Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-white font-mono">
                            ₹{opp.currentValue.toLocaleString()}
                          </span>
                          <span
                            className={`text-[10px] font-bold font-mono ${
                              changePct >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {changePct >= 0 ? '+' : ''}
                            {changePct}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            morphAudio.playClick();
                            toggleMarketOpportunityStatus(opp.id);
                          }}
                          className="btn-chrome-secondary p-2 text-xs"
                          title={opp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          {opp.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditOpp(opp)}
                          className="btn-chrome-secondary p-2 text-amber-400 text-xs"
                          title="Edit Opportunity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            morphAudio.playClick();
                            if (window.confirm(`Delete opportunity "${opp.name}"?`)) {
                              deleteMarketOpportunity(opp.id);
                              showToast(`Deleted ${opp.name}`);
                            }
                          }}
                          className="btn-chrome-secondary p-2 text-red-400 text-xs hover:border-red-500"
                          title="Delete Opportunity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BREAKING NEWS & MANUAL PRICE MOVEMENT EVENTS */}
      {/* ========================================================================= */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="border border-white/10 chrome-panel rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  MARKET NEWS FLASH & VOLATILITY ENGINE
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Author breaking news items with defined percentage price impacts. Releasing a news item immediately updates sector values and all team investments.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddNews}
                className="btn-chrome-primary text-slate-950 font-black text-xs uppercase px-4 py-2 flex items-center gap-2 shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE NEWS EVENT</span>
              </button>
            </div>

            <div className="space-y-4">
              {marketNews.map((item) => {
                const isReleased = item.status === 'RELEASED';

                return (
                  <div
                    key={item.id}
                    className={`bg-slate-950/70 border rounded-2xl p-5 space-y-4 transition shadow-inner ${
                      isReleased
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                              isReleased
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
                                : 'bg-slate-900 text-slate-400 border border-white/10'
                            }`}
                          >
                            {isReleased ? `LIVE (${item.releasedAt || 'RELEASED'})` : 'DRAFT'}
                          </span>
                          <span className="text-[11px] text-slate-500 uppercase">
                            ID: {item.id}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white uppercase">
                          {item.headline}
                        </h4>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isReleased ? (
                          <button
                            type="button"
                            onClick={() => handleReleaseNewsItem(item.id)}
                            className="btn-chrome-primary text-slate-950 font-black text-xs uppercase px-4 py-2 flex items-center gap-1.5 shadow-xl"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>RELEASE NEWS</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReleaseNewsItem(item.id)}
                            className="btn-chrome-secondary px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-1.5"
                            title="Re-trigger price adjustment calculation"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                            <span>RE-APPLY</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditNews(item)}
                          className="btn-chrome-secondary p-2 text-amber-400 text-xs"
                          title="Edit News"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            morphAudio.playClick();
                            if (window.confirm(`Delete news item "${item.headline}"?`)) {
                              deleteMarketNews(item.id);
                              showToast('Deleted news item.');
                            }
                          }}
                          className="btn-chrome-secondary p-2 text-red-400 text-xs hover:border-red-500"
                          title="Delete News"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-white/5">
                      {item.fullText}
                    </p>

                    {/* Affected Sectors & independently released prices */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        AFFECTED SECTOR / RELEASE PRICE:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.affectedOpportunities.map((aff) => {
                          const isPos = aff.changePercent >= 0;
                          return (
                            <div
                              key={aff.opportunityId}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
                                isPos
                                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                                  : 'bg-red-950/40 border-red-600/50 text-red-300'
                              }`}
                            >
                              <span>{aff.opportunityName}</span>
                              <span className="font-black">
                                {isPos ? '+' : ''}
                                {aff.changePercent}%
                              </span>
                              {isReleased && !aff.priceReleased && (
                                <button
                                  type="button"
                                  onClick={() => handleReleasePrice(item.id, aff.opportunityId)}
                                  className="ml-1 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase"
                                >
                                  Release Price
                                </button>
                              )}
                              {aff.priceReleased && <span className="text-[10px] text-emerald-300 uppercase">Price Live</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRANSACTION LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="border border-white/10 chrome-panel rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  MARKET AUDIT & TRANSACTION LOGS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable record of all BUY orders, SELL liquidations, and News Impact adjustments.
                </p>
              </div>
            </div>

            {marketTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No market transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase bg-slate-950/50 sticky top-0">
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Team</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Sector</th>
                      <th className="py-2.5 px-3 text-right">Amount / Impact</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {marketTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 font-mono">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {tx.timestamp}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-200">
                          {tx.teamNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              tx.type === 'BUY'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : tx.type === 'SELL'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {tx.opportunityName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          {tx.type === 'BUY' && <span className="text-cyan-400">₹{tx.amount.toLocaleString()}</span>}
                          {tx.type === 'SELL' && <span className="text-amber-400">+₹{tx.amount.toLocaleString()}</span>}
                          {tx.type === 'MARKET_UPDATE' && (
                            <span className={tx.profitOrLoss && tx.profitOrLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {tx.changePercent !== undefined && `${tx.changePercent >= 0 ? '+' : ''}${tx.changePercent}%`}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                          {tx.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ROUND GUIDELINES & RULES CONFIG */}
      {/* ========================================================================= */}
      {activeTab === 'config' && (
        <div className="border border-white/10 chrome-panel rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            MORPH MARKET ROUND CONTENT CONFIGURATION
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">
                Round Display Name
              </label>
              <input
                type="text"
                value={marketRoundConfig.roundName}
                onChange={(e) => updateMarketRoundConfig({ roundName: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">
                Objective
              </label>
              <textarea
                rows={2}
                value={marketRoundConfig.objective}
                onChange={(e) => updateMarketRoundConfig({ objective: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">
                Instructions
              </label>
              <textarea
                rows={4}
                value={marketRoundConfig.instructions}
                onChange={(e) => updateMarketRoundConfig({ instructions: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">
                Rules & Constraints
              </label>
              <textarea
                rows={4}
                value={marketRoundConfig.rules}
                onChange={(e) => updateMarketRoundConfig({ rules: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT OPPORTUNITY */}
      {/* ========================================================================= */}
      {showOppModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="chrome-panel border border-white/15 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3">
              {editingOpp ? 'EDIT MARKET SECTOR' : 'ADD NEW MARKET SECTOR'}
            </h3>

            <form onSubmit={handleSaveOpp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">
                  Sector / Opportunity Name
                </label>
                <input
                  type="text"
                  value={oppForm.name}
                  onChange={(e) => setOppForm({ ...oppForm, name: e.target.value })}
                  placeholder="e.g. MARKET EXPANSION"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={oppForm.description}
                  onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                  placeholder="Strategic description of this sector..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">
                    Starting Value (Index)
                  </label>
                  <input
                    type="number"
                    value={oppForm.startingValue}
                    onChange={(e) => setOppForm({ ...oppForm, startingValue: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={oppForm.currentValue}
                    onChange={(e) => setOppForm({ ...oppForm, currentValue: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">
                  Status
                </label>
                <select
                  value={oppForm.status}
                  onChange={(e) => setOppForm({ ...oppForm, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE (Open for investments)</option>
                  <option value="INACTIVE">INACTIVE (Frozen / Hidden from trading)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    morphAudio.playClick();
                    setShowOppModal(false);
                  }}
                  className="btn-chrome-secondary px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-chrome-primary text-slate-950 px-5 py-2 text-xs font-black uppercase shadow-xl"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT NEWS EVENT */}
      {/* ========================================================================= */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono overflow-y-auto">
          <div className="chrome-panel border border-white/15 rounded-3xl w-full max-w-2xl p-6 space-y-4 shadow-2xl my-8 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3">
              {editingNews ? 'EDIT BREAKING NEWS EVENT' : 'CREATE BREAKING NEWS EVENT'}
            </h3>

            <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">
                  News Headline
                </label>
                <input
                  type="text"
                  value={newsForm.headline}
                  onChange={(e) => setNewsForm({ ...newsForm, headline: e.target.value })}
                  placeholder="e.g. Government announces sweeping export tax incentives"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">
                  Full News Text / Release Briefing
                </label>
                <textarea
                  rows={4}
                  value={newsForm.fullText}
                  onChange={(e) => setNewsForm({ ...newsForm, fullText: e.target.value })}
                  placeholder="Detailed news release copy..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              {/* Editable sector release prices (expressed as a % move) */}
              <div className="p-4 bg-slate-950/80 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Percent className="w-4 h-4" />
                    AFFECTED SECTOR — RELEASE PRICE (+ / - %)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    This price remains hidden until its RELEASE PRICE action
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {newsForm.affectedOpportunities.map((aff, idx) => (
                    <div
                      key={aff.opportunityId}
                      className="p-2.5 bg-slate-900 rounded-xl border border-white/5 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {aff.opportunityName}
                      </span>
                      <div className="flex items-center gap-1 w-28 flex-shrink-0">
                        <input
                          type="number"
                          value={aff.changePercent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...newsForm.affectedOpportunities];
                            updated[idx].changePercent = val;
                            setNewsForm({ ...newsForm, affectedOpportunities: updated });
                          }}
                          className={`w-full bg-slate-950 border rounded-lg px-2 py-1 text-right text-xs font-mono font-bold focus:outline-none ${
                            aff.changePercent > 0
                              ? 'border-emerald-600 text-emerald-400'
                              : aff.changePercent < 0
                              ? 'border-red-600 text-red-400'
                              : 'border-white/10 text-slate-400'
                          }`}
                        />
                        <span className="text-slate-500 font-mono">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    morphAudio.playClick();
                    setShowNewsModal(false);
                  }}
                  className="btn-chrome-secondary px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-chrome-primary text-slate-950 px-5 py-2 text-xs font-black uppercase shadow-xl"
                >
                  Save News Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TEAM POSITION BREAKDOWN */}
      {/* ========================================================================= */}
      {selectedTeamId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="chrome-panel border border-white/15 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            {(() => {
              const team = teams.find((t) => t.id === selectedTeamId);
              const port = getTeamMarketPortfolio(selectedTeamId);
              if (!team) return null;

              return (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase">
                        {team.teamNumber} — {team.teamName}
                      </h3>
                      <p className="text-xs text-slate-400">Detailed Portfolio Breakdown</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        morphAudio.playClick();
                        setSelectedTeamId(null);
                      }}
                      className="btn-chrome-secondary px-3 py-1 text-xs"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-4 rounded-2xl border border-white/10 text-center shadow-inner">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Cash</span>
                      <span className="text-xs font-bold text-slate-200">
                        ₹{team.morphCoins.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Invested</span>
                      <span className="text-xs font-bold text-cyan-400">
                        ₹{port.totalCurrentValue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Total</span>
                      <span className="text-xs font-black text-amber-400">
                        ₹{port.totalPortfolioValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.values(port.investments || {}).map((inv) => (
                      <div
                        key={inv.opportunityId}
                        className="bg-slate-950/80 p-3.5 rounded-xl border border-white/10 flex items-center justify-between text-xs shadow-inner"
                      >
                        <div>
                          <div className="font-bold text-white uppercase">{inv.opportunityName}</div>
                          <div className="text-[10px] text-slate-500">
                            Principal: ₹{inv.investedAmount.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono text-cyan-300">
                            ₹{inv.currentValue.toLocaleString()}
                          </div>
                          <div
                            className={`text-[10px] font-bold font-mono ${
                              inv.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {inv.gainLoss >= 0 ? '+' : ''}
                            {inv.gainLossPercent}% (₹{inv.gainLoss.toLocaleString()})
                          </div>
                        </div>
                      </div>
                    ))}
                    {Object.keys(port.investments || {}).length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No active sector positions. 100% in Morph Cash.
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
