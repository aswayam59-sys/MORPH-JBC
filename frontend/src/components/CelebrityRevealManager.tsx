import React, { useState, useEffect } from 'react';
import { useEvent } from '../context/EventContext';
import { AdminRoundHeader } from './AdminRoundHeader';
import { CelebritySpinWheel } from './CelebritySpinWheel';
import { CelebrityImage } from './CelebrityImage';
import { CelebrityCard, CelebrityRatingCategory } from '../types';
import { morphAudio } from '../utils/audio';
import {
  Sparkles,
  Users,
  Eye,
  EyeOff,
  RotateCcw,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shuffle,
  Clock,
  Layers,
  Save,
  Check,
  X,
  Radio,
  Award,
  Flame,
  Globe,
  Coins,
  TrendingUp,
  Shield,
  ShoppingBag,
  Maximize2,
} from 'lucide-react';

export const CelebrityRevealManager: React.FC = () => {
  const {
    teams,
    brands,
    celebrities,
    celebrityRoundConfig,
    releaseCelebrityInfo,
    hideCelebrityInfo,
    releaseCelebrityRound,
    pauseCelebrityRound,
    completeCelebrityRound,
    resetCelebrityRound,
    updateCelebrityRoundConfig,
    spinAdminCelebrityWheel,
    purchaseMysteryCelebrityForTeam,
    revealCelebrityForTeam,
    resetTeamCelebrityPurchase,
    addCelebrity,
    updateCelebrity,
    deleteCelebrity,
    restoreDefaultCelebrities,
  } = useEvent();

  const [activeTab, setActiveTab] = useState<'workflow' | 'deck' | 'settings'>('workflow');
  const [deckFilter, setDeckFilter] = useState<'ALL' | 'AVAILABLE' | 'TAKEN' | 'REVEALED'>('ALL');

  // Full-Page Dedicated Spin Wheel State (Admin Only)
  const [showFullSpinWheel, setShowFullSpinWheel] = useState(false);

  // Mini Spin Wheel State (Inline fallback)
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<{ teamNumber: string; teamName: string } | null>(null);

  // Modals & Feedback
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showManualAssignModal, setShowManualAssignModal] = useState<string | null>(null); // teamId
  const [selectedCardForAssign, setSelectedCardForAssign] = useState<string>('');
  const [unveiledCelebrityModal, setUnveiledCelebrityModal] = useState<{
    teamNumber: string;
    teamName: string;
    card: CelebrityCard;
  } | null>(null);

  // Editable Card Form State (ratings 0-10)
  const [cardForm, setCardForm] = useState<{
    celebrityNumber: number;
    name: string;
    domain: string;
    imageUrl: string;
    price: number;
    personalityRating: number;
    popularityRating: number;
    businessRelevanceRating: number;
    publicAppealRating: number;
    additionalRating: number;
    additionalRatingLabel: string;
    description: string;
  }>({
    celebrityNumber: 21,
    name: '',
    domain: 'Bollywood & Cinema',
    imageUrl: '',
    price: 3000,
    personalityRating: 8.5,
    popularityRating: 9.0,
    businessRelevanceRating: 8.5,
    publicAppealRating: 8.0,
    additionalRating: 8.5,
    additionalRatingLabel: 'Social Engagement',
    description: '',
  });

  // Round Configuration State
  const [roundName, setRoundName] = useState(celebrityRoundConfig.roundName || 'CELEBRITY REVEAL');
  const [objective, setObjective] = useState(celebrityRoundConfig.objective || '');
  const [instructions, setInstructions] = useState(celebrityRoundConfig.instructions || '');
  const [rules, setRules] = useState(celebrityRoundConfig.rules || '');
  const [regulations, setRegulations] = useState(celebrityRoundConfig.regulations || '');
  const [timeLimit, setTimeLimit] = useState(celebrityRoundConfig.timeLimit || '15 Minutes');
  const [additionalInfo, setAdditionalInfo] = useState(celebrityRoundConfig.additionalInfo || '');
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    setRoundName(celebrityRoundConfig.roundName || 'CELEBRITY REVEAL');
    setObjective(celebrityRoundConfig.objective || '');
    setInstructions(celebrityRoundConfig.instructions || '');
    setRules(celebrityRoundConfig.rules || '');
    setRegulations(celebrityRoundConfig.regulations || '');
    setTimeLimit(celebrityRoundConfig.timeLimit || '15 Minutes');
    setAdditionalInfo(celebrityRoundConfig.additionalInfo || '');
  }, [celebrityRoundConfig]);

  const showSuccess = (msg: string) => {
    morphAudio.playSuccess();
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    morphAudio.playDanger();
    setActionErrorMessage(msg);
    setTimeout(() => setActionErrorMessage(null), 5000);
  };

  // Metrics
  const availableCount = celebrities.filter((c) => c.status === 'AVAILABLE').length;
  const takenCount = celebrities.filter((c) => c.status === 'TAKEN').length;
  const revealedCount = celebrities.filter((c) => c.isIdentityRevealed).length;
  const mysteryCount = takenCount - revealedCount;

  // Teams eligible for spin (do not have a celebrity yet)
  const eligibleTeams = teams.filter((t) => !t.celebrityId);

  // Handle Admin Spin
  const handleAdminSpin = () => {
    if (isSpinning) return;
    if (eligibleTeams.length === 0) {
      showError('All teams have already acquired a celebrity card or no teams are eligible.');
      return;
    }

    morphAudio.playConfirm();
    setIsSpinning(true);
    setSpinResult(null);

    // Random rotations for the wheel animation
    const extraTurns = 5 + Math.floor(Math.random() * 4); // 5 to 8 turns
    const targetDeg = wheelRotation + extraTurns * 360 + Math.floor(Math.random() * 360);
    setWheelRotation(targetDeg);

    setTimeout(() => {
      const res = spinAdminCelebrityWheel();
      setIsSpinning(false);
      if (res.success && res.selectedTeam) {
        setSpinResult({
          teamNumber: res.selectedTeam.teamNumber,
          teamName: res.selectedTeam.teamName,
        });
        showSuccess(`SPIN COMPLETED! Selected: ${res.selectedTeam.teamNumber} (${res.selectedTeam.teamName})`);
      } else if (res.error) {
        showError(res.error);
      }
    }, 3500);
  };

  // Handle Card Save
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.name.trim()) {
      showError('Celebrity name is required.');
      return;
    }

    const imgToUse =
      cardForm.imageUrl.trim() ||
      `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="#1e1b4b"/><text x="100" y="110" font-family="sans-serif" font-weight="900" font-size="32" fill="#a5b4fc" text-anchor="middle">★</text><text x="100" y="150" font-family="sans-serif" font-weight="700" font-size="12" fill="#c7d2fe" text-anchor="middle">${cardForm.name.toUpperCase()}</text></svg>`
      )}`;

    if (editingCardId) {
      updateCelebrity(editingCardId, {
        celebrityNumber: Number(cardForm.celebrityNumber),
        name: cardForm.name.trim().toUpperCase(),
        domain: cardForm.domain.trim(),
        imageUrl: imgToUse,
        price: Number(cardForm.price) || 3000,
        personalityRating: Number(cardForm.personalityRating) || 8,
        popularityRating: Number(cardForm.popularityRating) || 8,
        businessRelevanceRating: Number(cardForm.businessRelevanceRating) || 8,
        publicAppealRating: Number(cardForm.publicAppealRating) || 8,
        additionalRating: Number(cardForm.additionalRating) || 8,
        additionalRatingLabel: cardForm.additionalRatingLabel.trim() || 'Special Metric',
        description: cardForm.description.trim(),
      });
      showSuccess(`Celebrity card "${cardForm.name}" updated successfully!`);
    } else {
      addCelebrity({
        celebrityNumber: Number(cardForm.celebrityNumber),
        name: cardForm.name.trim().toUpperCase(),
        domain: cardForm.domain.trim(),
        imageUrl: imgToUse,
        price: Number(cardForm.price) || 3000,
        personalityRating: Number(cardForm.personalityRating) || 8,
        popularityRating: Number(cardForm.popularityRating) || 8,
        businessRelevanceRating: Number(cardForm.businessRelevanceRating) || 8,
        publicAppealRating: Number(cardForm.publicAppealRating) || 8,
        additionalRating: Number(cardForm.additionalRating) || 8,
        additionalRatingLabel: cardForm.additionalRatingLabel.trim() || 'Special Metric',
        description: cardForm.description.trim(),
        status: 'AVAILABLE',
        isIdentityRevealed: false,
      });
      showSuccess(`New celebrity card #${cardForm.celebrityNumber} "${cardForm.name}" created!`);
    }
    setShowAddEditModal(false);
  };

  const handleOpenAddModal = () => {
    morphAudio.playClick();
    const nextNum = Math.max(0, ...celebrities.map((c) => c.celebrityNumber || 0)) + 1;
    setEditingCardId(null);
    setCardForm({
      celebrityNumber: nextNum,
      name: '',
      domain: 'Bollywood & Cinema',
      imageUrl: '',
      price: 3000,
      personalityRating: 8.5,
      popularityRating: 9.0,
      businessRelevanceRating: 8.5,
      publicAppealRating: 8.0,
      additionalRating: 8.5,
      additionalRatingLabel: 'Social Engagement',
      description: '',
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (card: CelebrityCard) => {
    morphAudio.playClick();
    setEditingCardId(card.id);
    setCardForm({
      celebrityNumber: card.celebrityNumber,
      name: card.name,
      domain: card.domain || 'Entertainment',
      imageUrl: card.imageUrl || card.image || '',
      price: card.price || 3000,
      personalityRating: card.personalityRating ?? (card.ratings?.personalityRating || 8.5),
      popularityRating: card.popularityRating ?? (card.ratings?.popularityRating || 9.0),
      businessRelevanceRating: card.businessRelevanceRating ?? (card.ratings?.businessRelevanceRating || 8.5),
      publicAppealRating: card.publicAppealRating ?? (card.ratings?.publicAppealRating || 8.0),
      additionalRating: card.additionalRating ?? (card.ratings?.additionalRating || 8.5),
      additionalRatingLabel: card.additionalRatingLabel || 'Social Engagement',
      description: card.description || '',
    });
    setShowAddEditModal(true);
  };

  // Save Round Config
  const handleSaveRoundConfig = (e: React.FormEvent) => {
    e.preventDefault();
    morphAudio.playClick();
    updateCelebrityRoundConfig({
      roundName,
      objective,
      instructions,
      rules,
      regulations,
      timeLimit,
      additionalInfo,
    });
    setConfigSaved(true);
    showSuccess('Celebrity Reveal round details saved successfully!');
    setTimeout(() => setConfigSaved(false), 3000);
  };

  // Manual Assign for Admin
  const handleExecuteManualAssign = () => {
    if (!showManualAssignModal || !selectedCardForAssign) return;
    morphAudio.playClick();
    const res = purchaseMysteryCelebrityForTeam(showManualAssignModal, selectedCardForAssign);
    if (res.success) {
      showSuccess(`Assigned Mystery Celebrity to team!`);
      setShowManualAssignModal(null);
      setSelectedCardForAssign('');
    } else {
      showError(res.error || 'Failed to assign celebrity.');
    }
  };

  // Filtered Cards
  const filteredCards = celebrities.filter((c) => {
    if (deckFilter === 'AVAILABLE') return c.status === 'AVAILABLE';
    if (deckFilter === 'TAKEN') return c.status === 'TAKEN' && !c.isIdentityRevealed;
    if (deckFilter === 'REVEALED') return c.isIdentityRevealed;
    return true;
  });

  const selectedTeamObj = celebrityRoundConfig.selectedTeamId
    ? teams.find((t) => t.id === celebrityRoundConfig.selectedTeamId)
    : null;

  if (showFullSpinWheel) {
    return <CelebritySpinWheel onClose={() => setShowFullSpinWheel(false)} />;
  }

  return (
    <div id="celebrity-reveal-management-module" className="space-y-6 font-mono">
      {/* 1. MASTER ROUND HEADER */}
      <AdminRoundHeader
        roundBadge="ROUND 5"
        roundName={celebrityRoundConfig.roundName || 'CELEBRITY REVEAL'}
        description="Admin-controlled endorsement acquisition engine. Operate the exclusive stage Spin Wheel to select teams, monitor mystery card purchases, and officially unveil celebrity identities."
        infoReleased={celebrityRoundConfig.infoReleased}
        roundStatus={celebrityRoundConfig.roundStatus}
        onReleaseInfo={releaseCelebrityInfo}
        onHideInfo={hideCelebrityInfo}
        onReleaseRound={releaseCelebrityRound}
        onPauseRound={pauseCelebrityRound}
        onCompleteRound={completeCelebrityRound}
        onReset={() => {
          morphAudio.playDanger();
          setShowResetModal(true);
        }}
        idPrefix="celebrity-reveal"
      />

      {/* TOP ACTION BAR: DEDICATED FULL-PAGE SPIN WHEEL TRIGGER */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl chrome-panel border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)] relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Shuffle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              ADMIN STAGE SPIN WHEEL
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow">
                EXCLUSIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Open the dedicated full-page screen to run random team selections on the stage projector.
            </p>
          </div>
        </div>

        <button
          id="btn-open-full-spin-wheel"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setShowFullSpinWheel(true);
          }}
          className="btn-chrome-primary text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3 flex items-center gap-2 relative z-10 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
        >
          <Maximize2 className="w-4 h-4" />
          <span>OPEN SPIN WHEEL</span>
        </button>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {actionSuccessMessage && (
        <div className="bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionErrorMessage && (
        <div className="bg-red-950/80 border border-red-700/80 text-red-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{actionErrorMessage}</span>
          </div>
          <button onClick={() => setActionErrorMessage(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. KPI SUMMARY BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="chrome-panel rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Deck</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{celebrities.length}</div>
          <div className="text-xs text-slate-500 mt-1">20 Curated Endorsers</div>
        </div>

        <div className="chrome-panel rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Available</span>
            <Shuffle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{availableCount}</div>
          <div className="text-xs text-slate-500 mt-1">Ready for Purchase</div>
        </div>

        <div className="chrome-panel rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Mystery Acquired</span>
            <EyeOff className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{mysteryCount}</div>
          <div className="text-xs text-slate-500 mt-1">Identity Locked</div>
        </div>

        <div className="chrome-panel rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Officially Revealed</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{revealedCount}</div>
          <div className="text-xs text-slate-500 mt-1">Unveiled on Stage</div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="chrome-panel p-1.5 flex gap-1.5 overflow-x-auto text-xs font-bold border border-white/10 shadow-lg no-scrollbar">
        <button
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('workflow');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeTab === 'workflow'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>Spin Wheel & Team Roster ({takenCount}/15)</span>
        </button>

        <button
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('deck');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeTab === 'deck'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Celebrity Deck ({celebrities.length} Cards)</span>
        </button>

        <button
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('settings');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeTab === 'settings'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>Round Information & Rules</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ADMIN SPIN WHEEL & TEAM ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          {/* SECTION A: ADMIN SPIN WHEEL CONSOLE */}
          <div className="chrome-panel p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Left Column: Wheel Info & Trigger */}
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  ADMIN ONLY • STAGE SPIN WHEEL
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  RANDOM TEAM SELECTION WHEEL
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Press <strong>[ SPIN WHEEL ]</strong> to randomly select ONE team. The chosen team will be authorized on their screen to choose and purchase an available Mystery Celebrity card.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <button
                    id="admin-btn-spin-wheel"
                    onClick={handleAdminSpin}
                    disabled={isSpinning || eligibleTeams.length === 0}
                    className={`px-8 py-3.5 rounded-xl font-mono font-black text-sm uppercase tracking-wider flex items-center gap-3 transition-all shadow-xl cursor-pointer ${
                      isSpinning
                        ? 'btn-chrome-primary opacity-90 cursor-wait animate-pulse'
                        : eligibleTeams.length === 0
                        ? 'bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed'
                        : 'btn-chrome-primary text-slate-950 shadow-[0_0_25px_rgba(255,255,255,0.25)]'
                    }`}
                  >
                    <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                    {isSpinning ? 'SPINNING... SELECTING TEAM' : 'SPIN WHEEL'}
                  </button>

                  <div className="text-xs text-slate-400">
                    Eligible Teams: <span className="font-bold text-amber-400">{eligibleTeams.length} / 15</span>
                  </div>
                </div>

                {/* SELECTED TEAM STATUS BANNER */}
                {selectedTeamObj && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border-2 border-amber-500/60 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                          CURRENTLY SELECTED TEAM
                        </div>
                        <div className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                          <span className="bg-amber-400 text-black px-2 py-0.5 rounded text-sm font-mono font-black">
                            {selectedTeamObj.teamNumber}
                          </span>
                          <span>{selectedTeamObj.teamName}</span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                          <span>
                            Coins: <strong className="text-amber-300 font-mono">₹{selectedTeamObj.morphCoins.toLocaleString()}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Brand: <strong className="text-purple-300">{selectedTeamObj.brand || '—'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Product: <strong className="text-cyan-300">{selectedTeamObj.product || '—'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          onClick={() => {
                            morphAudio.playClick();
                            setSelectedCardForAssign('');
                            setShowManualAssignModal(selectedTeamObj.id);
                          }}
                          className="btn-chrome-secondary text-xs px-3.5 py-2 font-bold"
                          title="Assign card to this team directly from Admin panel"
                        >
                          Manual Assign
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Visual Rotating Wheel */}
              <div className="relative flex-shrink-0 flex items-center justify-center p-4">
                {/* Pointer Top Needle */}
                <div className="absolute -top-1 z-30 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.9)]" />
                </div>

                {/* Outer Glow Ring */}
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2 bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-cyan-500/20 border-2 border-white/20 shadow-2xl flex items-center justify-center relative">
                  {/* Rotating Wheel */}
                  <div
                    className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3500ms] ease-out shadow-inner"
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      boxShadow: 'inset 0 0 25px rgba(0,0,0,0.8)',
                    }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {Array.from({ length: 15 }, (_, i) => i + 1).map((tNum, idx) => {
                        const angle = 360 / 15;
                        const startAngle = idx * angle;
                        const endAngle = (idx + 1) * angle;
                        const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                        const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                        const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                        const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                        const colors = [
                          '#d97706', '#7c3aed', '#0891b2', '#059669', '#dc2626',
                          '#db2777', '#2563eb', '#ea580c', '#9333ea', '#0d9488',
                          '#ca8a04', '#4f46e5', '#16a34a', '#e11d48', '#0284c7',
                        ];

                        return (
                          <g key={tNum}>
                            <path
                              d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                              fill={colors[idx % colors.length]}
                              stroke="#0f172a"
                              strokeWidth="0.8"
                            />
                            <text
                              x={50 + 35 * Math.cos((Math.PI * (startAngle + angle / 2)) / 180)}
                              y={50 + 35 * Math.sin((Math.PI * (startAngle + angle / 2)) / 180)}
                              fill="#ffffff"
                              fontSize="4.5"
                              fontWeight="900"
                              fontFamily="monospace"
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              T{tNum < 10 ? `0${tNum}` : tNum}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Wheel Center Cap */}
                    <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-2xl z-20">
                      <Sparkles className={`w-5 h-5 text-amber-400 ${isSpinning ? 'animate-spin' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SPIN HISTORY TABLE (LAST 5 SPINS) */}
            {celebrityRoundConfig.spinHistory && celebrityRoundConfig.spinHistory.length > 0 && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Spin Selection History
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Total Spins: {celebrityRoundConfig.spinHistory.length}
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-white/5 rounded-xl overflow-x-auto shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 border-b border-white/5 font-mono uppercase font-bold">
                        <th className="px-3.5 py-2.5">Spin #</th>
                        <th className="px-3.5 py-2.5">Selected Team</th>
                        <th className="px-3.5 py-2.5">Timestamp</th>
                        <th className="px-3.5 py-2.5">Purchase Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {celebrityRoundConfig.spinHistory
                        .slice()
                        .reverse()
                        .map((item) => {
                          const t = teams.find((tm) => tm.id === item.teamId);
                          const card = t?.celebrityId ? celebrities.find((c) => c.id === t.celebrityId) : null;
                          return (
                            <tr key={item.id} className="hover:bg-white/5 transition">
                              <td className="px-3.5 py-2.5 text-amber-400 font-bold">#{item.spinNumber}</td>
                              <td className="px-3.5 py-2.5 text-white">
                                <span className="font-bold">{item.teamNumber}</span> - {item.teamName}
                              </td>
                              <td className="px-3.5 py-2.5 text-slate-400">{item.timestamp}</td>
                              <td className="px-3.5 py-2.5">
                                {card ? (
                                  card.isIdentityRevealed ? (
                                    <span className="text-emerald-400 font-bold">
                                      Revealed: {card.name} (#{card.celebrityNumber})
                                    </span>
                                  ) : (
                                    <span className="text-amber-400 font-bold">
                                      Purchased Mystery #{card.celebrityNumber} (₹{card.price.toLocaleString()})
                                    </span>
                                  )
                                ) : (
                                  <span className="text-slate-500 italic">Pending Card Selection...</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: TEAM LIVE ROSTER & REVEAL MANAGEMENT */}
          <div className="chrome-panel rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950/80 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  TEAM ENDORSEMENT ROSTER & STAGE REVEAL CONTROLLER
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Teams acquire mystery cards via their screen after wheel selection. Click <strong>"Reveal Celebrity"</strong> to unveil their ambassador live!
                </p>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Purchased: <strong className="text-amber-300 font-black">{takenCount}</strong> / 15 | Revealed: <strong className="text-emerald-300 font-black">{revealedCount}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-400 border-b border-white/10 uppercase tracking-wider font-bold">
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Assigned Brand & Product</th>
                    <th className="px-4 py-3">Acquired Mystery Card</th>
                    <th className="px-4 py-3">Reveal Status</th>
                    <th className="px-4 py-3 text-right">Admin Stage Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teams.map((team) => {
                    const card = team.celebrityId ? celebrities.find((c) => c.id === team.celebrityId) : null;
                    const isSelectedByWheel = celebrityRoundConfig.selectedTeamId === team.id;
                    const hasPurchased = !!team.celebrityId;
                    const isRevealed = !!team.celebrityRevealed;

                    return (
                      <tr
                        key={team.id}
                        className={`hover:bg-white/5 transition-colors ${
                          isSelectedByWheel && !hasPurchased ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        {/* Team Details */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-950 text-amber-400 font-black px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                              {team.teamNumber}
                            </span>
                            <span className="text-white font-bold">{team.teamName}</span>
                            {isSelectedByWheel && !hasPurchased && (
                              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow animate-pulse">
                                SELECTED
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 font-bold">
                            Coins: <span className="text-amber-300">₹{team.morphCoins.toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Brand & Product */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1">
                            <span className="text-purple-300 font-bold">{team.brand || '—'}</span>
                            <span className="text-cyan-300 text-[11px]">{team.product || '—'}</span>
                          </div>
                        </td>

                        {/* Acquired Mystery Card */}
                        <td className="px-4 py-3.5">
                          {hasPurchased && card ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex-shrink-0 flex items-center justify-center shadow-inner">
                                <img
                                  src={card.imageUrl || card.image}
                                  alt={card.name}
                                  className={`w-full h-full object-cover ${!isRevealed ? 'filter blur-sm opacity-60' : ''}`}
                                />
                              </div>
                              <div>
                                <div className="text-amber-300 font-extrabold">
                                  Mystery Card #{card.celebrityNumber}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Price: ₹{(card.price || 3000).toLocaleString()} • Admin: {card.name}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">No Card Purchased Yet</span>
                          )}
                        </td>

                        {/* Status Pill */}
                        <td className="px-4 py-3.5">
                          {!hasPurchased ? (
                            isSelectedByWheel ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-700/80 text-[11px] font-black shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                CHOOSING CARD
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-950 text-slate-500 text-[11px] border border-white/5">
                                NOT SELECTED
                              </span>
                            )
                          ) : isRevealed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 text-[11px] font-black shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              REVEALED ({card?.name})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-700/80 text-[11px] font-bold">
                              <EyeOff className="w-3.5 h-3.5" />
                              MYSTERY LOCKED
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasPurchased ? (
                              <>
                                {!isRevealed ? (
                                  <button
                                    onClick={() => {
                                      morphAudio.playSuccess();
                                      const res = revealCelebrityForTeam(team.id);
                                      if (res.success) {
                                        if (card) {
                                          setUnveiledCelebrityModal({
                                            teamNumber: team.teamNumber,
                                            teamName: team.teamName,
                                            card: { ...card, isIdentityRevealed: true },
                                          });
                                        }
                                        showSuccess(`OFFICIAL STAGE REVEAL: ${card?.name} unveiled for ${team.teamNumber}!`);
                                      } else {
                                        showError(res.error || 'Failed to reveal.');
                                      }
                                    }}
                                    className="btn-chrome-primary text-slate-950 font-black text-xs uppercase tracking-wider px-3.5 py-2 flex items-center gap-1.5 shadow-lg"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    REVEAL CELEBRITY
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        if (card) {
                                          setUnveiledCelebrityModal({
                                            teamNumber: team.teamNumber,
                                            teamName: team.teamName,
                                            card,
                                          });
                                        }
                                      }}
                                      className="text-emerald-400 hover:text-emerald-300 text-xs font-black mr-1 flex items-center gap-1 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30"
                                      title="View Stage Card"
                                    >
                                      <Eye className="w-3 h-3" />
                                      REVEALED ✓
                                    </button>
                                  </div>
                                )}

                                <button
                                  onClick={() => {
                                    morphAudio.playDanger();
                                    if (
                                      confirm(
                                        `Cancel & refund celebrity purchase for ${team.teamNumber}? The card will be returned to the available deck and ₹${(
                                          card?.price || 0
                                        ).toLocaleString()} refunded to the team.`
                                      )
                                    ) {
                                      const res = resetTeamCelebrityPurchase(team.id);
                                      if (res.success) {
                                        showSuccess(`Refunded and cleared celebrity for ${team.teamNumber}`);
                                      }
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-white/10 transition cursor-pointer"
                                  title="Cancel and refund purchase"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  morphAudio.playClick();
                                  setSelectedCardForAssign('');
                                  setShowManualAssignModal(team.id);
                                }}
                                className="btn-chrome-secondary text-xs px-3 py-1.5 font-bold"
                                title="Admin manual assign"
                              >
                                Assign Card
                              </button>
                            )}
                          </div>
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
      {/* TAB 2: CELEBRITY DECK (20 CARDS WITH 0-10 RATINGS & PRICES) */}
      {/* ========================================================================= */}
      {activeTab === 'deck' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 chrome-panel p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono uppercase font-bold">Filter:</span>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10">
                <button
                  onClick={() => {
                    morphAudio.playClick();
                    setDeckFilter('ALL');
                  }}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                    deckFilter === 'ALL' ? 'btn-chrome-primary text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({celebrities.length})
                </button>
                <button
                  onClick={() => {
                    morphAudio.playClick();
                    setDeckFilter('AVAILABLE');
                  }}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                    deckFilter === 'AVAILABLE' ? 'btn-chrome-primary text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Available ({availableCount})
                </button>
                <button
                  onClick={() => {
                    morphAudio.playClick();
                    setDeckFilter('TAKEN');
                  }}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                    deckFilter === 'TAKEN' ? 'btn-chrome-primary text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mystery ({mysteryCount})
                </button>
                <button
                  onClick={() => {
                    morphAudio.playClick();
                    setDeckFilter('REVEALED');
                  }}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                    deckFilter === 'REVEALED' ? 'btn-chrome-primary text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Revealed ({revealedCount})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => {
                  morphAudio.playClick();
                  if (window.confirm('Reset the entire celebrity deck to the official 20 celebrities (CarryMinati, Puneet Superstar, Rakhi Sawant, Karan Johar, Diljit Dosanjh, Virat Kohli, Neeraj Chopra, Urfi Javed, Baba Ramdev, Kanye West, Donald Trump, Keanu Reeves, Dwayne Johnson, Ryan Reynolds, MrBeast, Snoop Dogg, Gordon Ramsay, Rihanna, Jack Black, Elon Musk)?')) {
                    restoreDefaultCelebrities();
                    showSuccess('Celebrity Deck successfully restored to official 20 celebrities!');
                  }
                }}
                className="btn-chrome-secondary text-xs font-bold px-3 py-2.5 flex items-center gap-1.5 shadow"
                title="Restore default official 20 celebrities"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                RESTORE OFFICIAL 20
              </button>
              <button
                onClick={handleOpenAddModal}
                className="btn-chrome-primary text-slate-950 text-xs font-black px-4 py-2.5 flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                ADD CARD
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCards.map((card) => {
              const isAssigned = card.status === 'TAKEN';
              const assignedTeam = isAssigned && card.assignedTeamId ? teams.find((t) => t.id === card.assignedTeamId) : null;

              const pRating = card.personalityRating ?? (card.ratings?.personalityRating || 8.5);
              const popRating = card.popularityRating ?? (card.ratings?.popularityRating || 9.0);
              const bizRating = card.businessRelevanceRating ?? (card.ratings?.businessRelevanceRating || 8.5);
              const appRating = card.publicAppealRating ?? (card.ratings?.publicAppealRating || 8.0);
              const addRating = card.additionalRating ?? (card.ratings?.additionalRating || 8.5);

              return (
                <div
                  key={card.id}
                  className={`chrome-panel rounded-2xl transition-all duration-300 overflow-hidden flex flex-col hover:border-white/30 shadow-xl ${
                    isAssigned
                      ? card.isIdentityRevealed
                        ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        : 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : 'border-white/10'
                  }`}
                >
                  {/* Card Image Banner */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden group">
                    <CelebrityImage
                      src={card.imageUrl || card.image || ''}
                      alt={card.name}
                      name={card.name}
                      domain={card.domain}
                      celebrityNumber={card.celebrityNumber}
                      isMystery={false}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/70" />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 font-mono font-black text-xs border border-amber-500/30 shadow">
                        #{card.celebrityNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-950/80 backdrop-blur-md text-purple-300 text-[10px] font-bold border border-purple-500/30">
                        {card.domain || 'Celebrity'}
                      </span>
                    </div>

                    {/* Price & Status Badge */}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-black shadow-md">
                        ₹{(card.price || 3000).toLocaleString()}
                      </span>
                      {isAssigned ? (
                        card.isIdentityRevealed ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/90 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                            {assignedTeam?.teamNumber || card.assignedTeamNumber || 'Claimed'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/90 text-amber-300 text-[10px] font-black border border-amber-500/40">
                            {assignedTeam?.teamNumber || card.assignedTeamNumber} (Mystery)
                          </span>
                        )
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-black/80 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                          AVAILABLE
                        </span>
                      )}
                    </div>

                    {/* Name Overlay */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <h4 className="text-white font-black text-base leading-tight drop-shadow-md">
                        {card.name}
                      </h4>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-mono">
                      {card.description}
                    </p>

                    {/* Ratings on 0-10 Scale */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Flame className="w-3.5 h-3.5 text-pink-400" /> Personality Rating:
                        </span>
                        <span className="font-bold text-white font-mono">{pRating.toFixed(1)} / 10</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Award className="w-3.5 h-3.5 text-amber-400" /> Popularity Rating:
                        </span>
                        <span className="font-bold text-white font-mono">{popRating.toFixed(1)} / 10</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Business Relevance:
                        </span>
                        <span className="font-bold text-white font-mono">{bizRating.toFixed(1)} / 10</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" /> Public Appeal:
                        </span>
                        <span className="font-bold text-white font-mono">{appRating.toFixed(1)} / 10</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400 truncate max-w-[140px]">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" /> {card.additionalRatingLabel || 'Special'}:
                        </span>
                        <span className="font-bold text-white font-mono">{addRating.toFixed(1)} / 10</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="text-[11px] text-slate-400">
                        {isAssigned ? (
                          <span>
                            Owned by <strong className="text-amber-400 font-bold">{assignedTeam?.teamNumber || card.assignedTeamNumber}</strong>
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold">Ready in Pool</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(card)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Edit Card"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            morphAudio.playDanger();
                            if (confirm(`Delete card #${card.celebrityNumber} (${card.name})?`)) {
                              deleteCelebrity(card.id);
                              showSuccess(`Deleted celebrity card "${card.name}"`);
                            }
                          }}
                          disabled={isAssigned}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title={isAssigned ? 'Cannot delete assigned card' : 'Delete Card'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROUND INFORMATION & EDITABLE SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveRoundConfig} className="chrome-panel p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                EDIT ROUND 5 INFORMATION & RULES
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize the round name, objective, rules, and guidance visible to teams when Round Info is released.
              </p>
            </div>
            <button
              type="submit"
              className="btn-chrome-primary text-xs uppercase tracking-wider px-5 py-2.5 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              SAVE CONFIGURATION
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">Round Name / Title</label>
              <input
                type="text"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-xs font-mono focus:border-purple-400 focus:outline-none shadow-inner"
                placeholder="CELEBRITY REVEAL"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">Time Limit / Duration</label>
              <input
                type="text"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-xs font-mono focus:border-purple-400 focus:outline-none shadow-inner"
                placeholder="15 Minutes"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">Round Objective</label>
            <textarea
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-xs font-mono focus:border-purple-400 focus:outline-none leading-relaxed shadow-inner"
              placeholder="State the core goal for participants in this round..."
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">Round Instructions</label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-xs font-mono focus:border-purple-400 focus:outline-none leading-relaxed shadow-inner"
              placeholder="Step-by-step instructions on wheel selection, card browsing, and purchase..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">Rules</label>
              <textarea
                rows={4}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-xs font-mono focus:border-purple-400 focus:outline-none leading-relaxed shadow-inner"
                placeholder="Mandatory round rules..."
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">Regulations & Constraints</label>
              <textarea
                rows={4}
                value={regulations}
                onChange={(e) => setRegulations(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-xs font-mono focus:border-purple-400 focus:outline-none leading-relaxed shadow-inner"
                placeholder="Evaluation rubrics and penalty constraints..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1 uppercase">Additional Information / Scoring System</label>
            <textarea
              rows={3}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-xs font-mono focus:border-purple-400 focus:outline-none leading-relaxed shadow-inner"
              placeholder="Details on 0-10 metric evaluations..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-chrome-primary text-xs uppercase tracking-wider px-6 py-3 shadow-xl"
            >
              <Save className="w-4 h-4" />
              SAVE CONFIGURATION
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CELEBRITY CARD */}
      {/* ========================================================================= */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="chrome-panel border border-white/20 w-full max-w-2xl p-6 rounded-2xl space-y-4 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {editingCardId ? `EDIT CARD #${cardForm.celebrityNumber}` : 'ADD NEW CELEBRITY CARD'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">CARD NUMBER (1-20)</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={cardForm.celebrityNumber}
                    onChange={(e) => setCardForm({ ...cardForm, celebrityNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">CELEBRITY NAME</label>
                  <input
                    type="text"
                    required
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono uppercase shadow-inner"
                    placeholder="e.g. VIRAT KOHLI"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">FIXED PRICE (COINS)</label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    required
                    value={cardForm.price}
                    onChange={(e) => setCardForm({ ...cardForm, price: parseInt(e.target.value) || 3000 })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-amber-300 font-bold font-mono shadow-inner"
                    placeholder="3000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">DOMAIN / INDUSTRY</label>
                  <input
                    type="text"
                    required
                    value={cardForm.domain}
                    onChange={(e) => setCardForm({ ...cardForm, domain: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono shadow-inner"
                    placeholder="e.g. Bollywood & Cinema"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">PHOTO / IMAGE URL</label>
                  <input
                    type="text"
                    value={cardForm.imageUrl}
                    onChange={(e) => setCardForm({ ...cardForm, imageUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono shadow-inner"
                    placeholder="https://... (or leave blank for generated avatar)"
                  />
                </div>
              </div>

              {/* 5 RATINGS ON 0.0 - 10.0 SCALE */}
              <div className="p-4 bg-slate-950/80 border border-white/10 rounded-xl space-y-3 shadow-inner">
                <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                  CELEBRITY RATINGS (0.0 TO 10.0 SCALE)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-bold">Personality (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={cardForm.personalityRating}
                      onChange={(e) => setCardForm({ ...cardForm, personalityRating: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-bold">Popularity (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={cardForm.popularityRating}
                      onChange={(e) => setCardForm({ ...cardForm, popularityRating: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-bold">Business Relevance (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={cardForm.businessRelevanceRating}
                      onChange={(e) => setCardForm({ ...cardForm, businessRelevanceRating: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-bold">Public Appeal (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={cardForm.publicAppealRating}
                      onChange={(e) => setCardForm({ ...cardForm, publicAppealRating: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-bold">Special Metric (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={cardForm.additionalRating}
                      onChange={(e) => setCardForm({ ...cardForm, additionalRating: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-bold">Special Metric Label</label>
                    <input
                      type="text"
                      value={cardForm.additionalRatingLabel}
                      onChange={(e) => setCardForm({ ...cardForm, additionalRatingLabel: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                      placeholder="e.g. Fan Loyalty"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">DESCRIPTION / CLUE / BIO</label>
                <textarea
                  rows={3}
                  value={cardForm.description}
                  onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono leading-relaxed shadow-inner"
                  placeholder="Key traits, market impact, and strategic brand alignment clues..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="btn-chrome-secondary text-xs px-4 py-2"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-chrome-primary text-xs px-5 py-2.5"
                >
                  {editingCardId ? 'UPDATE CELEBRITY' : 'CREATE CELEBRITY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANUAL ASSIGN CELEBRITY TO TEAM */}
      {/* ========================================================================= */}
      {showManualAssignModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-white/20 w-full max-w-md p-6 rounded-2xl space-y-4 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                MANUAL CELEBRITY CARD ASSIGNMENT
              </h3>
              <button
                type="button"
                onClick={() => setShowManualAssignModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Assign a mystery celebrity card to{' '}
              <strong>{teams.find((t) => t.id === showManualAssignModal)?.teamNumber}</strong>. Coins will be deducted
              based on the card's fixed price.
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-bold">Select Available Card:</label>
              <select
                value={selectedCardForAssign}
                onChange={(e) => setSelectedCardForAssign(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono text-xs shadow-inner"
              >
                <option value="">-- Choose Available Celebrity Card --</option>
                {celebrities
                  .filter((c) => c.status === 'AVAILABLE')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Card #{c.celebrityNumber} - {c.name} (₹{(c.price || 3000).toLocaleString()} Coins)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowManualAssignModal(null)}
                className="btn-chrome-secondary text-xs px-4 py-2"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={!selectedCardForAssign}
                onClick={handleExecuteManualAssign}
                className="btn-chrome-primary text-xs px-4 py-2"
              >
                CONFIRM ASSIGNMENT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET CELEBRITY REVEAL ROUND */}
      {/* ========================================================================= */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-red-500/50 w-full max-w-md p-6 rounded-2xl space-y-4 font-mono shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 border-b border-white/10 pb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                RESET CELEBRITY REVEAL ROUND?
              </h3>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>This action will reset the Celebrity Reveal round state:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Refund all Morph Coins spent on celebrity cards back to teams</li>
                <li>Return all 20 celebrity cards to AVAILABLE status</li>
                <li>Lock all celebrity identities (reset revealed status)</li>
                <li>Clear Spin Wheel selection history</li>
                <li>Preserve all card details, prices, and customized settings</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="btn-chrome-secondary text-xs px-4 py-2"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playDanger();
                  resetCelebrityRound();
                  setShowResetModal(false);
                  showSuccess('Celebrity Reveal round reset successfully. All coins refunded and cards made available.');
                }}
                className="btn-chrome-danger text-xs px-5 py-2"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: STAGE CELEBRATION / CELEBRITY REVEAL MODAL */}
      {/* ========================================================================= */}
      {unveiledCelebrityModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="chrome-panel border-2 border-amber-400 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-6 font-mono p-6 sm:p-8 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setUnveiledCelebrityModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
                <Sparkles className="w-4 h-4" />
                OFFICIAL STAGE ENDORSEMENT UNVEILED
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {unveiledCelebrityModal.teamNumber} • {unveiledCelebrityModal.teamName}
              </h3>
            </div>

            {/* Celebrity Portrait Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950/90 border border-white/10 rounded-2xl p-5 shadow-inner items-center">
              <div className="relative h-60 w-full rounded-xl overflow-hidden border-2 border-amber-400/40 shadow-xl">
                <CelebrityImage
                  src={unveiledCelebrityModal.card.imageUrl || unveiledCelebrityModal.card.image || ''}
                  alt={unveiledCelebrityModal.card.name}
                  name={unveiledCelebrityModal.card.name}
                  domain={unveiledCelebrityModal.card.domain}
                  celebrityNumber={unveiledCelebrityModal.card.celebrityNumber}
                  isMystery={false}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-amber-400 font-bold text-xs">
                  #{unveiledCelebrityModal.card.celebrityNumber}
                </div>
                <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-xs">
                  ₹{(unveiledCelebrityModal.card.price || 3000).toLocaleString()} Coins
                </div>
              </div>

              {/* Identity & Stats */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
                    {unveiledCelebrityModal.card.domain}
                  </span>
                  <h4 className="text-2xl font-black text-white tracking-tight">
                    {unveiledCelebrityModal.card.name}
                  </h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3">
                  {unveiledCelebrityModal.card.description}
                </p>

                {/* 5 Metrics on 0-10 Scale */}
                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Personality:</span>
                    <span className="font-bold text-white font-mono">
                      {(unveiledCelebrityModal.card.personalityRating ?? (unveiledCelebrityModal.card.ratings?.personalityRating || 8.5)).toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Popularity:</span>
                    <span className="font-bold text-white font-mono">
                      {(unveiledCelebrityModal.card.popularityRating ?? (unveiledCelebrityModal.card.ratings?.popularityRating || 9.0)).toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Business Relevance:</span>
                    <span className="font-bold text-white font-mono">
                      {(unveiledCelebrityModal.card.businessRelevanceRating ?? (unveiledCelebrityModal.card.ratings?.businessRelevanceRating || 8.5)).toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Public Appeal:</span>
                    <span className="font-bold text-white font-mono">
                      {(unveiledCelebrityModal.card.publicAppealRating ?? (unveiledCelebrityModal.card.ratings?.publicAppealRating || 8.0)).toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 truncate max-w-[130px]">
                      {unveiledCelebrityModal.card.additionalRatingLabel || 'Special Metric'}:
                    </span>
                    <span className="font-bold text-amber-300 font-mono">
                      {(unveiledCelebrityModal.card.additionalRating ?? (unveiledCelebrityModal.card.ratings?.additionalRating || 10.0)).toFixed(1)} / 10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setUnveiledCelebrityModal(null)}
                className="btn-chrome-primary text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-2.5 shadow-xl"
              >
                CLOSE STAGE PREVIEW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
