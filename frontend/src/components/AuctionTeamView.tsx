import React from 'react';
import { useEvent } from '../context/EventContext';
import { Team, Brand } from '../types';
import { BrandCard } from './BrandCard';
import { Gavel, CheckCircle2, Clock, ShieldCheck, Building2, Coins, Flame } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface AuctionTeamViewProps {
  team: Team;
}

export const AuctionTeamView: React.FC<AuctionTeamViewProps> = ({ team }) => {
  const {
    brands,
    activeBrandId,
    auctionStatus,
    getTeamWonBrand,
  } = useEvent();

  const wonBrand = getTeamWonBrand(team.id);

  // Live stage brand if currently revealed by Admin
  const liveStageBrand: Brand | undefined = brands.find(
    (b) =>
      (b.id === activeBrandId && (b.status === 'AVAILABLE' || b.status === 'LIVE')) ||
      (b.status === 'AVAILABLE' || b.status === 'LIVE')
  );

  const isAuctionActive = auctionStatus === 'ACTIVE';
  const isAuctionCompleted = auctionStatus === 'COMPLETED';

  return (
    <div id="auction-team-view-page" className="space-y-6 font-mono">
      {/* 1. ROUND STATUS BANNER */}
      {isAuctionActive ? (
        <div className="chrome-panel border border-emerald-500/40 bg-emerald-950/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <div>
              <span className="font-extrabold text-emerald-300 uppercase tracking-widest block text-sm">
                ROUND 1 LIVE — BRAND AUCTION ACTIVE
              </span>
              <p className="text-emerald-400/80 text-xs mt-0.5 font-sans">
                The auction stage is synchronized. Physical bidding takes place live with the auctioneer.
              </p>
            </div>
          </div>
          <div className="bg-emerald-900/50 border border-emerald-500/40 px-3.5 py-2 rounded-xl text-right flex-shrink-0 shadow-inner">
            <span className="text-[10px] text-emerald-300 block uppercase font-bold tracking-wider">Stage Status</span>
            <span className="font-black text-white text-xs tracking-wide">
              {liveStageBrand ? `LOT #${liveStageBrand.lotNumber.toString().padStart(2, '0')}` : 'WAITING FOR LOT'}
            </span>
          </div>
        </div>
      ) : isAuctionCompleted ? (
        <div className="chrome-panel border border-blue-500/30 bg-blue-950/30 p-4 rounded-2xl flex items-center gap-3 text-xs text-blue-300">
          <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <span className="font-black uppercase tracking-widest block text-sm">
              ROUND 1 CONCLUDED — AUCTION CLOSED
            </span>
            <p className="text-blue-400/80 text-xs mt-0.5 font-sans">
              All brand lots have been finalized. Review your assigned brand asset below and in your Team Home.
            </p>
          </div>
        </div>
      ) : (
        <div className="chrome-panel border border-amber-500/30 bg-amber-950/20 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-300">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-black uppercase tracking-widest block text-sm">
              AUCTION STAGE STANDBY
            </span>
            <p className="text-amber-400/80 text-xs mt-0.5 font-sans">
              Waiting for the Admin to activate the live auction stage.
            </p>
          </div>
        </div>
      )}

      {/* 2. ROUND INSTRUCTIONS & BRIEFING */}
      <section className="chrome-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-100 flex items-center gap-2">
            <Gavel className="w-4 h-4 text-amber-400" />
            AUCTION PROTOCOL & BRIEFING
          </h2>
          <span className="text-[11px] font-bold text-amber-300 bg-amber-950/50 border border-amber-500/30 px-3 py-1 rounded-xl">
            Live Room Floor
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-slate-300">
          <div className="bg-slate-950/70 border border-white/5 p-4 rounded-xl space-y-1.5 shadow-inner">
            <span className="text-amber-400 font-extrabold block uppercase text-[11px] tracking-wider">
              1. Physical Bidding
            </span>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Bidding happens live on the floor. The auctioneer calls and raises bids in real time using your paddle.
            </p>
          </div>
          <div className="bg-slate-950/70 border border-white/5 p-4 rounded-xl space-y-1.5 shadow-inner">
            <span className="text-amber-400 font-extrabold block uppercase text-[11px] tracking-wider">
              2. Stage Sync
            </span>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              This screen displays the currently active lot, asset attributes, and baseline price authorized by Admin.
            </p>
          </div>
          <div className="bg-slate-950/70 border border-white/5 p-4 rounded-xl space-y-1.5 shadow-inner">
            <span className="text-amber-400 font-extrabold block uppercase text-[11px] tracking-wider">
              3. Asset Acquisition
            </span>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Upon winning, Admin finalizes your bid, Morph Coins are deducted, and the brand is unlocked instantly.
            </p>
          </div>
        </div>

        {/* Team's Current Bidding Power Summary */}
        <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Available Bidding Capital:</span>
            <span className="font-black text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl shadow-inner">
              <AnimatedNumber value={team.morphCoins} prefix="₹" /> Morph Coins
            </span>
          </div>

          {wonBrand && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              <span>
                Acquired: <strong>{wonBrand.name}</strong> (₹{team.winningBid?.toLocaleString() || '0'})
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 3. CURRENTLY REVEALED AUCTION LOT */}
      <section className="chrome-panel p-6 rounded-2xl space-y-4">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isAuctionCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            ) : liveStageBrand ? (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
            ) : (
              <Clock className="w-4 h-4 text-slate-500" />
            )}
            <h3 className="text-sm font-extrabold tracking-widest uppercase text-slate-200">
              CURRENT AUCTION LOT ON STAGE
            </h3>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-xl uppercase tracking-widest ${
              isAuctionCompleted
                ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                : liveStageBrand
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900 text-slate-400 border border-white/10'
            }`}
          >
            {isAuctionCompleted
              ? 'AUCTION CONCLUDED'
              : liveStageBrand
              ? `LIVE LOT #${liveStageBrand.lotNumber.toString().padStart(2, '0')}`
              : 'STAGE WAITING'}
          </span>
        </div>

        {/* Content based on auction stage */}
        {isAuctionCompleted ? (
          <div className="bg-slate-950/80 border border-white/10 p-8 text-center text-xs space-y-3 rounded-2xl shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-base font-black uppercase tracking-wider text-slate-100 block">
              ALL AUCTION LOTS COMPLETED
            </span>
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed font-sans">
              The Brand Auction round has officially concluded. Your acquired brand is registered as an owned asset in your Team Overview.
            </p>
          </div>
        ) : liveStageBrand ? (
          <div className="space-y-4">
            <div className="p-4 border border-amber-500/50 bg-amber-950/30 rounded-xl text-xs text-amber-300 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span><strong>LIVE ON STAGE:</strong> {liveStageBrand.name} is currently open for bidding with the auctioneer.</span>
              </span>
              <span className="font-extrabold text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                Lot #{liveStageBrand.lotNumber.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex justify-center py-3">
              <BrandCard brand={liveStageBrand} />
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/80 border border-white/10 p-10 text-center text-xs text-slate-400 space-y-3 rounded-2xl shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-sm font-extrabold uppercase tracking-widest text-slate-300 block">
              WAITING FOR NEXT LOT REVEAL
            </span>
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed font-sans">
              No brand lot is currently active on stage. The Admin and auctioneer will reveal the next brand shortly.
            </p>
          </div>
        )}
      </section>

      {/* 4. IF TEAM WON A BRAND, DISPLAY IT HERE AS WELL */}
      {wonBrand && (
        <section id="auction-team-won-brand" className="chrome-panel p-6 rounded-2xl space-y-4">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              YOUR TEAM'S ACQUIRED BRAND
            </h3>
            <span className="text-xs font-black text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl">
              {team.winningBid ? `Won for ₹${team.winningBid.toLocaleString()}` : 'Official Property'}
            </span>
          </div>

          <div className="flex justify-center py-2">
            <BrandCard brand={wonBrand} />
          </div>
        </section>
      )}
    </div>
  );
};
