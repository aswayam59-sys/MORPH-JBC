import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { CelebrityCard } from '../types';
import { CelebrityImage } from './CelebrityImage';
import {
  Sparkles,
  Award,
  Flame,
  Globe,
  TrendingUp,
  Shield,
  HelpCircle,
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Coins,
  Check,
  X,
  Radio,
  ShoppingBag,
} from 'lucide-react';

export const CelebrityRevealTeamView: React.FC = () => {
  const {
    getAuthenticatedTeam,
    celebrityRoundConfig,
    celebrities,
    purchaseMysteryCelebrityForTeam,
  } = useEvent();

  const team = getAuthenticatedTeam();

  // Purchase modal state
  const [selectedCardForPurchase, setSelectedCardForPurchase] = useState<CelebrityCard | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  if (!team) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        <AlertCircle className="w-10 h-10 mx-auto text-amber-400 mb-2" />
        <p>Please log in as a team to access Celebrity Endorsements.</p>
      </div>
    );
  }

  const { infoReleased, roundStatus, selectedTeamId } = celebrityRoundConfig;
  const isRoundActive = roundStatus === 'ACTIVE';
  const isRoundCompleted = roundStatus === 'COMPLETED';

  const isCurrentTeamSelected = selectedTeamId === team.id;
  const hasAcquiredCard = !!team.celebrityId;
  const isIdentityRevealed = !!team.celebrityRevealed;
  const ownedCelebrity = team.celebrityId ? celebrities.find((c) => c.id === team.celebrityId) : null;

  // Execute Purchase
  const handleConfirmPurchase = () => {
    if (!selectedCardForPurchase) return;
    setPurchaseError(null);

    const res = purchaseMysteryCelebrityForTeam(team.id, selectedCardForPurchase.id);
    if (res.success) {
      const cardNum = selectedCardForPurchase.celebrityNumber < 10
        ? `0${selectedCardForPurchase.celebrityNumber}`
        : `${selectedCardForPurchase.celebrityNumber}`;
      setPurchaseSuccess(
        `SUCCESSFULLY ACQUIRED MYSTERY #${cardNum}! Identity remains locked until Admin stage reveal.`
      );
      setSelectedCardForPurchase(null);
      setTimeout(() => setPurchaseSuccess(null), 6000);
    } else {
      setPurchaseError(res.error || 'Failed to complete purchase.');
    }
  };

  // If round is completely closed/locked/inactive and info is not released
  if (!infoReleased && (roundStatus === 'INACTIVE' || roundStatus === 'LOCKED')) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center max-w-2xl mx-auto space-y-4 shadow-xl font-mono">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">
          {celebrityRoundConfig.roundName || 'ROUND 5: CELEBRITY REVEAL & ENDORSEMENTS'}
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          This round has not started yet. Please wait for the event administrator to release round info or begin the stage selection.
        </p>
      </div>
    );
  }

  return (
    <div id="celebrity-reveal-team-view" className="space-y-6 max-w-6xl mx-auto font-mono">
      {/* 1. HEADER BANNER */}
      <div className="bg-gradient-to-r from-neutral-950 via-purple-950/30 to-neutral-950 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              ROUND 5 • BRAND ENDORSEMENT
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              {celebrityRoundConfig.roundName || 'CELEBRITY REVEAL'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              Acquire a brand ambassador to champion your product. Inspect the verified 0–10 category ratings for all mystery cards. When your team is selected on stage by the Admin's Spin Wheel, choose your mystery card!
            </p>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-neutral-800 pt-3 sm:pt-0 sm:pl-6 gap-2">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">YOUR TEAM BALANCE</span>
              <span className="text-lg sm:text-xl font-black text-amber-300">
                ₹{team.morphCoins.toLocaleString()}
              </span>
            </div>

            <div>
              {isRoundActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  STAGE LIVE
                </span>
              ) : isRoundCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ROUND COMPLETED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold uppercase">
                  <Clock className="w-3.5 h-3.5" />
                  INFO RELEASED
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {purchaseSuccess && (
        <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-300 px-4 py-3.5 rounded-xl flex items-center justify-between shadow-lg text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{purchaseSuccess}</span>
          </div>
          <button onClick={() => setPurchaseSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {purchaseError && (
        <div className="bg-red-950/90 border border-red-700 text-red-300 px-4 py-3.5 rounded-xl flex items-center justify-between shadow-lg text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{purchaseError}</span>
          </div>
          <button onClick={() => setPurchaseError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. DYNAMIC STATUS BANNER: OWNED (LOCKED vs REVEALED) / SELECTED / WAITING */}
      {hasAcquiredCard && ownedCelebrity ? (
        /* BANNER A: TEAM ALREADY OWNS A CARD */
        <div
          className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden ${
            isIdentityRevealed
              ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-950 border-emerald-500/60'
              : 'bg-gradient-to-r from-purple-950/40 via-neutral-900 to-neutral-950 border-purple-500/60'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              
              {/* Photo or Mystery Lock Icon */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-950 border-2 border-neutral-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                <CelebrityImage
                  src={ownedCelebrity.imageUrl || ownedCelebrity.image || ''}
                  alt={ownedCelebrity.name}
                  name={ownedCelebrity.name}
                  domain={ownedCelebrity.domain}
                  celebrityNumber={ownedCelebrity.celebrityNumber}
                  isMystery={!isIdentityRevealed}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-black px-2 py-0.5 rounded text-xs font-black">
                    MYSTERY #{ownedCelebrity.celebrityNumber < 10 ? `0${ownedCelebrity.celebrityNumber}` : ownedCelebrity.celebrityNumber}
                  </span>
                  {isIdentityRevealed ? (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      OFFICIALLY REVEALED
                    </span>
                  ) : (
                    <span className="bg-purple-950 text-purple-300 border border-purple-700 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                      <EyeOff className="w-3.5 h-3.5" />
                      IDENTITY LOCKED
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-bold">
                  YOUR CELEBRITY
                </div>

                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {isIdentityRevealed
                    ? ownedCelebrity.name
                    : `MYSTERY #${ownedCelebrity.celebrityNumber < 10 ? `0${ownedCelebrity.celebrityNumber}` : ownedCelebrity.celebrityNumber}`}
                </h2>

                <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                  {isIdentityRevealed
                    ? (ownedCelebrity.description || `${ownedCelebrity.domain} • Official Endorsement`)
                    : 'The actual celebrity name, face, and photograph remain hidden. The Admin will officially reveal your celebrity identity on stage.'}
                </p>

                <div className="text-xs text-neutral-300 pt-1 flex items-center gap-2 flex-wrap">
                  <span>
                    Acquired for <strong className="text-amber-300">₹{(ownedCelebrity.price || 3000).toLocaleString()} Coins</strong>
                  </span>
                  {isIdentityRevealed && ownedCelebrity.domain && (
                    <>
                      <span>•</span>
                      <span className="text-purple-300 font-bold">{ownedCelebrity.domain}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Ratings Bar for Owned Card */}
            <div className="bg-neutral-950/90 border border-neutral-800 p-4 rounded-xl space-y-2 min-w-[240px]">
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider border-b border-neutral-800 pb-1">
                VERIFIED RATINGS (0–10)
              </div>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-300">
                  <span className="text-neutral-400">Personality:</span>
                  <span className="font-bold text-white font-mono">
                    {(ownedCelebrity.personalityRating ?? (ownedCelebrity.ratings?.personalityRating || 8.5)).toFixed(1)} / 10
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span className="text-neutral-400">Popularity:</span>
                  <span className="font-bold text-white font-mono">
                    {(ownedCelebrity.popularityRating ?? (ownedCelebrity.ratings?.popularityRating || 9.0)).toFixed(1)} / 10
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span className="text-neutral-400">Business Relevance:</span>
                  <span className="font-bold text-white font-mono">
                    {(ownedCelebrity.businessRelevanceRating ?? (ownedCelebrity.ratings?.businessRelevanceRating || 8.5)).toFixed(1)} / 10
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span className="text-neutral-400">Public Appeal:</span>
                  <span className="font-bold text-white font-mono">
                    {(ownedCelebrity.publicAppealRating ?? (ownedCelebrity.ratings?.publicAppealRating || 8.0)).toFixed(1)} / 10
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span className="text-neutral-400 truncate max-w-[140px]">
                    {ownedCelebrity.additionalRatingLabel || 'Special Metric'}:
                  </span>
                  <span className="font-bold text-amber-300 font-mono">
                    {(ownedCelebrity.additionalRating ?? (ownedCelebrity.ratings?.additionalRating || 10.0)).toFixed(1)} / 10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isCurrentTeamSelected ? (
        /* BANNER B: CURRENT TEAM IS SELECTED BY SPIN WHEEL */
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-neutral-900 border-2 border-amber-400 shadow-amber-500/20 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-400 text-black text-xs font-black uppercase tracking-wider">
                <Radio className="w-4 h-4 animate-ping" />
                YOU HAVE BEEN SELECTED
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                CHOOSE YOUR MYSTERY CELEBRITY
              </h2>
              <p className="text-xs text-amber-200/90 leading-relaxed max-w-2xl">
                Your team was selected on the stage Spin Wheel! Browse the available mystery cards below, inspect their verified 0–10 rating statistics, and click <strong>[ SELECT ]</strong> to confirm your purchase.
              </p>
            </div>

            <div className="bg-neutral-950 border border-amber-500/40 p-4 rounded-xl text-center flex-shrink-0">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">YOUR BALANCE</div>
              <div className="text-2xl font-black text-amber-300">₹{team.morphCoins.toLocaleString()}</div>
            </div>
          </div>
        </div>
      ) : (
        /* BANNER C: WAITING FOR SPIN WHEEL SELECTION */
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase">STAGE SPIN WHEEL IN PROGRESS</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                The Admin is operating the Spin Wheel on stage. When your team is selected, purchase controls will activate.
              </p>
            </div>
          </div>

          <div className="text-xs text-neutral-400 self-start sm:self-center font-mono">
            {celebrityRoundConfig.selectedTeamNumber ? (
              <span className="text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1.5 rounded-lg font-bold">
                Currently Selected: {celebrityRoundConfig.selectedTeamNumber}
              </span>
            ) : (
              <span>Awaiting next wheel spin...</span>
            )}
          </div>
        </div>
      )}

      {/* 3. ALL MYSTERY CARDS DECK (VISIBLE TO ALL TEAMS) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              AVAILABLE MYSTERY CARDS ({celebrities.length} TOTAL)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Celebrity identities remain completely hidden. Evaluate public performance ratings to select the right match for your brand.
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {celebrities.map((card) => {
            const isTaken = card.status === 'TAKEN';
            const isTakenByCurrentTeam = isTaken && card.assignedTeamId === team.id;
            const isRevealedForCard = card.isIdentityRevealed;

            const pRating = card.personalityRating ?? (card.ratings?.personalityRating || 8.5);
            const popRating = card.popularityRating ?? (card.ratings?.popularityRating || 9.0);
            const bizRating = card.businessRelevanceRating ?? (card.ratings?.businessRelevanceRating || 8.5);
            const appRating = card.publicAppealRating ?? (card.ratings?.publicAppealRating || 8.0);
            const cardPrice = card.price || 3000;
            const canAfford = team.morphCoins >= cardPrice;

            const cardNumStr = card.celebrityNumber < 10 ? `0${card.celebrityNumber}` : `${card.celebrityNumber}`;

            return (
              <div
                key={card.id}
                className={`bg-neutral-900 rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isTakenByCurrentTeam
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xl'
                    : isTaken
                    ? 'border-neutral-800 opacity-60'
                    : isCurrentTeamSelected
                    ? 'border-amber-500/60 hover:border-amber-400 shadow-lg hover:scale-101'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Card Top Banner: Mystery Graphic or Revealed Photo */}
                <div>
                  <div className="relative h-36 w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
                    <CelebrityImage
                      src={card.imageUrl || card.image || ''}
                      alt={card.name}
                      name={card.name}
                      domain={card.domain}
                      celebrityNumber={card.celebrityNumber}
                      isMystery={!isRevealedForCard}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/60 pointer-events-none" />

                    {/* Card Number Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-amber-400 font-mono font-bold text-xs border border-amber-500/30">
                        MYSTERY #{cardNumStr}
                      </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2.5 py-0.5 rounded bg-amber-400 text-black text-xs font-black shadow-md">
                        ₹{cardPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Revealed Name Overlay */}
                    {isRevealedForCard && (
                      <div className="absolute bottom-2 left-3 right-3">
                        <h4 className="text-white font-black text-sm leading-tight drop-shadow-md">
                          {card.name}
                        </h4>
                      </div>
                    )}
                  </div>

                  {/* Card Content & Public 0-10 Ratings (NO identifying text leaked) */}
                  <div className="p-4 space-y-3">
                    <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                      PUBLIC STATISTICS
                    </div>

                    <div className="space-y-1.5 border-t border-neutral-800 pt-2 text-xs">
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Flame className="w-3.5 h-3.5 text-pink-400" /> Personality:
                        </span>
                        <span className="font-bold text-white font-mono">{pRating.toFixed(1)} / 10</span>
                      </div>

                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Award className="w-3.5 h-3.5 text-amber-400" /> Popularity:
                        </span>
                        <span className="font-bold text-white font-mono">{popRating.toFixed(1)} / 10</span>
                      </div>

                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-400">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Business Relevance:
                        </span>
                        <span className="font-bold text-white font-mono">{bizRating.toFixed(1)} / 10</span>
                      </div>

                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" /> Public Appeal:
                        </span>
                        <span className="font-bold text-white font-mono">{appRating.toFixed(1)} / 10</span>
                      </div>

                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-400 truncate max-w-[130px]">
                          <Shield className="w-3.5 h-3.5 text-amber-400" /> {card.additionalRatingLabel || 'Special'}:
                        </span>
                        <span className="font-bold text-amber-300 font-mono">
                          {(card.additionalRating ?? (card.ratings?.additionalRating || 10.0)).toFixed(1)} / 10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0">
                  {isTakenByCurrentTeam ? (
                    <div className="w-full py-2 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      YOUR CARD
                    </div>
                  ) : isTaken ? (
                    <div className="w-full py-2 rounded-lg bg-neutral-950 text-neutral-500 text-xs font-bold text-center border border-neutral-800">
                      TAKEN
                    </div>
                  ) : isCurrentTeamSelected ? (
                    <button
                      onClick={() => {
                        setSelectedCardForPurchase(card);
                        setPurchaseError(null);
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-amber-500/20 active:scale-98'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {canAfford ? `SELECT (₹${cardPrice.toLocaleString()})` : 'INSUFFICIENT COINS'}
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-lg bg-neutral-950 text-emerald-400/90 text-xs font-bold text-center border border-neutral-800">
                      AVAILABLE • ₹{cardPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ROUND GUIDELINES */}
      {celebrityRoundConfig.objective && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white uppercase">ROUND GUIDELINES & OBJECTIVE</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            {celebrityRoundConfig.objective && (
              <div>
                <h4 className="font-bold text-amber-400 uppercase mb-1">Objective</h4>
                <p className="text-neutral-300">{celebrityRoundConfig.objective}</p>
              </div>
            )}

            {celebrityRoundConfig.instructions && (
              <div>
                <h4 className="font-bold text-amber-400 uppercase mb-1">Instructions</h4>
                <p className="text-neutral-300">{celebrityRoundConfig.instructions}</p>
              </div>
            )}

            {celebrityRoundConfig.rules && (
              <div>
                <h4 className="font-bold text-amber-400 uppercase mb-1">Rules</h4>
                <p className="text-neutral-300">{celebrityRoundConfig.rules}</p>
              </div>
            )}

            {celebrityRoundConfig.regulations && (
              <div>
                <h4 className="font-bold text-amber-400 uppercase mb-1">Regulations & Constraints</h4>
                <p className="text-neutral-300">{celebrityRoundConfig.regulations}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXACT SPEC CONFIRM PURCHASE */}
      {/* ========================================================================= */}
      {selectedCardForPurchase && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border-2 border-amber-400 w-full max-w-md p-6 rounded-2xl space-y-5 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                CONFIRM PURCHASE
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCardForPurchase(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 uppercase font-bold">SELECTION:</span>
                  <span className="text-amber-400 font-black text-sm">
                    MYSTERY #{selectedCardForPurchase.celebrityNumber < 10 ? `0${selectedCardForPurchase.celebrityNumber}` : selectedCardForPurchase.celebrityNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 uppercase font-bold">PRICE:</span>
                  <span className="text-white font-black text-sm">
                    {(selectedCardForPurchase.price || 3000).toLocaleString()} MORPH COINS
                  </span>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 uppercase font-bold">CURRENT BALANCE:</span>
                  <span className="text-neutral-200 font-bold">
                    {team.morphCoins.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 uppercase font-bold">BALANCE AFTER:</span>
                  <span className="text-emerald-400 font-black">
                    {(team.morphCoins - (selectedCardForPurchase.price || 3000)).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 italic">
                * Note: The celebrity identity and photograph remain locked until the official Admin stage reveal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setSelectedCardForPurchase(null)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-mono font-bold text-xs uppercase tracking-wider cursor-pointer transition"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black rounded-xl font-mono font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer transition"
              >
                CONFIRM PURCHASE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
