import React from 'react';
import { Brand } from '../types';

interface BrandCardProps {
  brand: Brand;
  isCompact?: boolean;
  showAdminControls?: boolean;
  onSelect?: () => void;
  isActiveLot?: boolean;
}

export const BrandCard: React.FC<BrandCardProps> = ({
  brand,
  isCompact = false,
  isActiveLot = false,
}) => {
  const getStatusBadge = () => {
    switch (brand.status) {
      case 'AVAILABLE':
      case 'LIVE':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-lg animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            ● AVAILABLE ON STAGE
          </span>
        );
      case 'SOLD':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase bg-red-950/80 text-red-300 border border-red-800/80 rounded-lg">
            SOLD TO {brand.winningTeamNumber}
          </span>
        );
      case 'HIDDEN':
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-slate-900 text-slate-400 border border-white/10 rounded-lg">
            HIDDEN
          </span>
        );
    }
  };

  if (isCompact) {
    return (
      <div
        id={`brand-compact-card-${brand.id}`}
        className={`chrome-panel rounded-xl border ${
          isActiveLot
            ? 'border-amber-400/80 ring-2 ring-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            : 'border-white/10 hover:border-white/20'
        } p-3.5 transition flex flex-col justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0 bg-slate-950/80 border border-white/10 rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-inner">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <span className="text-xs font-black text-slate-400">
                {brand.name.slice(0, 2)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                LOT #{brand.lotNumber.toString().padStart(2, '0')}
              </span>
              <span className="text-[11px] font-black text-slate-200 font-mono">
                ₹{brand.basePrice.toLocaleString()}
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-slate-100 truncate tracking-wide mt-0.5">
              {brand.name}
            </h4>
            <div className="mt-1">
              {brand.status === 'SOLD' ? (
                <span className="text-[10px] text-red-400 font-bold">
                  Sold: {brand.winningTeamNumber} (₹{brand.winningBid?.toLocaleString()})
                </span>
              ) : brand.status === 'AVAILABLE' || brand.status === 'LIVE' ? (
                <span className="text-[10px] text-amber-300 font-black">
                  ● AVAILABLE / ACTIVE
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">Stage Queue</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`brand-card-${brand.id}`}
      className="chrome-panel border border-white/15 text-slate-100 flex flex-col max-w-md w-full shadow-2xl relative overflow-hidden font-mono rounded-2xl"
    >
      {/* Top Card Header */}
      <div className="p-4 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-widest text-purple-300">
            LOT {brand.lotNumber.toString().padStart(2, '0')}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
            BRAND ASSET
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Brand Visual & Identity */}
      <div className="p-6 flex flex-col items-center text-center border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="w-28 h-28 bg-slate-950/90 border border-white/15 rounded-2xl p-2.5 flex items-center justify-center shadow-2xl mb-4 overflow-hidden">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={`${brand.name} Logo`}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain drop-shadow"
            />
          ) : (
            <div className="text-3xl font-black text-slate-400 tracking-wider">
              {brand.name.slice(0, 3)}
            </div>
          )}
        </div>

        <h3 id={`brand-card-title-${brand.id}`} className="text-2xl font-black tracking-widest uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          {brand.name}
        </h3>

        {brand.sector && (
          <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-purple-950/60 text-purple-300 border border-purple-500/30 rounded-full">
            {brand.sector}
          </span>
        )}

        {/* Base Price / Winning Bid Display */}
        <div className="mt-4 flex items-center justify-center gap-3 w-full">
          <div className="chrome-panel border border-white/10 px-4 py-2.5 text-center min-w-[130px] rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">
              BASE PRICE
            </span>
            <span className="text-lg font-black text-slate-100 tracking-tight">
              ₹{brand.basePrice.toLocaleString()}
            </span>
          </div>

          {brand.status === 'SOLD' && (
            <div className="chrome-panel border border-red-800/80 bg-red-950/40 px-4 py-2.5 text-center min-w-[130px] rounded-xl">
              <span className="text-[10px] text-red-300 block uppercase tracking-wider font-bold">
                WINNING BID
              </span>
              <span className="text-lg font-black text-red-300 tracking-tight">
                ₹{brand.winningBid?.toLocaleString() || '—'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description and Details Body */}
      <div className="p-5 space-y-4 text-xs">
        <div>
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
            SHORT DESCRIPTION
          </span>
          <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-white/5 font-sans text-xs">
            {brand.shortDescription || 'No description provided.'}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
            BRAND ATTRIBUTES & IDENTITY
          </span>
          <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-white/5 font-sans text-xs">
            {brand.brandDetails || 'Standard portfolio assets and corporate identity documentation.'}
          </p>
        </div>

        {brand.status === 'SOLD' && (
          <div className="p-3.5 border border-red-800/50 bg-red-950/30 rounded-xl text-center space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-bold">
              ACQUIRED BY
            </span>
            <span className="text-sm font-black text-slate-100 block">
              {brand.winningTeamNumber}
            </span>
            {brand.soldAt && (
              <span className="text-[10px] text-slate-400 block font-mono">
                Finalized at {brand.soldAt}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
