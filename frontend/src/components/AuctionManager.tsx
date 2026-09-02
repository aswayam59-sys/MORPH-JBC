import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { BrandCard } from './BrandCard';
import { Brand } from '../types';
import { AdminRoundHeader } from './AdminRoundHeader';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

export const AuctionManager: React.FC = () => {
  const {
    brands,
    teams,
    activeBrandId,
    auctionHistory,
    auctionStatus,
    setAuctionStatus,
    resetAuctionRound,
    setActiveAuctionBrand,
    revealBrand,
    setBrandStatus,
    confirmAuctionResult,
    revertAuctionResult,
    addBrand,
    updateBrand,
    deleteBrand,
  } = useEvent();

  // Active brand selection
  const currentBrandIndex = brands.findIndex((b) => b.id === activeBrandId);
  const activeBrand = brands[currentBrandIndex >= 0 ? currentBrandIndex : 0] || brands[0];

  // Bidding form state
  const [winningTeamId, setWinningTeamId] = useState<string>('1');
  const [winningBidInput, setWinningBidInput] = useState<string>('');
  const [auctionFeedback, setAuctionFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Add Brand Form State
  const [showAddBrandModal, setShowAddBrandModal] = useState<boolean>(false);
  const [newBrandForm, setNewBrandForm] = useState({
    name: '',
    sector: '',
    logo: '',
    basePrice: 3000,
    shortDescription: '',
    brandDetails: '',
  });

  // Edit Brand Form State
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [editBrandForm, setEditBrandForm] = useState({
    name: '',
    sector: '',
    logo: '',
    basePrice: 3000,
    shortDescription: '',
    brandDetails: '',
  });

  const selectedWinningTeam = teams.find((t) => t.id === winningTeamId);
  const parsedWinningBid = Number(winningBidInput.replace(/,/g, ''));

  const handleNextBrand = () => {
    if (currentBrandIndex < brands.length - 1) {
      setActiveAuctionBrand(brands[currentBrandIndex + 1].id);
      setAuctionFeedback(null);
      setWinningBidInput('');
    }
  };

  const handlePrevBrand = () => {
    if (currentBrandIndex > 0) {
      setActiveAuctionBrand(brands[currentBrandIndex - 1].id);
      setAuctionFeedback(null);
      setWinningBidInput('');
    }
  };

  const handlePreConfirmBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrand) return;

    if (activeBrand.status === 'SOLD') {
      setAuctionFeedback({ message: 'This brand is already marked as SOLD.', isError: true });
      return;
    }

    if (!winningTeamId) {
      setAuctionFeedback({ message: 'Please select a winning team.', isError: true });
      return;
    }

    if (isNaN(parsedWinningBid) || parsedWinningBid <= 0) {
      setAuctionFeedback({ message: 'Please enter a valid winning bid amount.', isError: true });
      return;
    }

    if (selectedWinningTeam && parsedWinningBid > selectedWinningTeam.morphCoins) {
      setAuctionFeedback({
        message: `Winning bid (₹${parsedWinningBid.toLocaleString()}) exceeds ${selectedWinningTeam.teamNumber}'s balance (₹${selectedWinningTeam.morphCoins.toLocaleString()}).`,
        isError: true,
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleExecuteAuctionConfirm = () => {
    if (!activeBrand || !selectedWinningTeam) return;

    const result = confirmAuctionResult(activeBrand.id, selectedWinningTeam.id, parsedWinningBid);
    setShowConfirmModal(false);

    if (result.success) {
      setAuctionFeedback({
        message: `AUCTION CONFIRMED: ${activeBrand.name} sold to ${selectedWinningTeam.teamNumber} for ₹${parsedWinningBid.toLocaleString()}!`,
        isError: false,
      });
      setWinningBidInput('');
    } else {
      setAuctionFeedback({ message: result.error || 'Failed to record auction.', isError: true });
    }
  };

  const handleCreateBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandForm.name.trim()) {
      alert('Brand name is required.');
      return;
    }

    // fallback svg logo if none provided
    const logoToUse = newBrandForm.logo.trim() || `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="28" fill="#171717"/><text x="100" y="110" font-family="sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle">${newBrandForm.name.toUpperCase()}</text></svg>`
    )}`;

    addBrand({
      name: newBrandForm.name.trim().toUpperCase(),
      sector: newBrandForm.sector.trim() || undefined,
      logo: logoToUse,
      basePrice: Number(newBrandForm.basePrice) || 3000,
      shortDescription: newBrandForm.shortDescription.trim(),
      brandDetails: newBrandForm.brandDetails.trim(),
    });

    setNewBrandForm({
      name: '',
      sector: '',
      logo: '',
      basePrice: 3000,
      shortDescription: '',
      brandDetails: '',
    });
    setShowAddBrandModal(false);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (isEdit) {
            setEditBrandForm((prev) => ({ ...prev, logo: reader.result as string }));
          } else {
            setNewBrandForm((prev) => ({ ...prev, logo: reader.result as string }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBrandEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    updateBrand(editingBrand.id, {
      name: editBrandForm.name.trim().toUpperCase(),
      sector: editBrandForm.sector.trim() || undefined,
      logo: editBrandForm.logo,
      basePrice: Number(editBrandForm.basePrice),
      shortDescription: editBrandForm.shortDescription,
      brandDetails: editBrandForm.brandDetails,
    });
    setEditingBrand(null);
  };

  if (brands.length === 0) {
    return (
      <div className="chrome-panel p-8 text-center text-xs font-mono rounded-2xl">
        <p className="text-slate-400 mb-4">No brands registered in the auction catalog.</p>
        <button
          onClick={() => setShowAddBrandModal(true)}
          className="btn-chrome-primary text-xs font-black tracking-wider"
        >
          [ ADD FIRST BRAND ]
        </button>
      </div>
    );
  }

  return (
    <div id="auction-management-module" className="space-y-8 font-mono">
      
      {/* 0. ROUND 1 AUCTION CONTROL HEADER & STATUS BAR */}
      <AdminRoundHeader
        roundBadge="ROUND 1"
        roundName="BRAND AUCTION"
        description="Manage auction accessibility, lock or activate participant live stage broadcasting, and confirm winning brand allocations."
        infoReleased={auctionStatus !== 'LOCKED'}
        roundStatus={auctionStatus}
        showInfoReleaseControls={false}
        onReleaseRound={() => {
          setAuctionStatus('ACTIVE');
          setAuctionFeedback({ message: 'AUCTION ROUND ACTIVE: Stage is now broadcast live to all participants.', isError: false });
        }}
        onPauseRound={() => {
          setAuctionStatus('LOCKED');
          setAuctionFeedback({ message: 'AUCTION ROUND LOCKED / PAUSED.', isError: false });
        }}
        onCompleteRound={() => {
          setAuctionStatus('COMPLETED');
          setAuctionFeedback({ message: 'AUCTION ROUND MARKED COMPLETED.', isError: false });
        }}
        onReopenRound={() => {
          setAuctionStatus('ACTIVE');
          setAuctionFeedback({ message: 'AUCTION ROUND RE-OPENED.', isError: false });
        }}
        onReset={() => {
          setShowResetModal(true);
        }}
        idPrefix="auction"
      />
      
      {/* 1. STAGE / LIVE LOT CONTROLLER */}
      <section className="chrome-panel p-6 rounded-2xl space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-black tracking-widest text-slate-100 uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              MORPH AUCTION STAGE
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">Current Lot:</span>
              <span id="active-lot-indicator" className="text-xs font-black text-amber-300 bg-amber-950/60 px-3 py-0.5 rounded-lg border border-amber-500/40 shadow-inner">
                LOT {activeBrand ? activeBrand.lotNumber.toString().padStart(2, '0') : '01'} / {brands.length.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Quick lot navigation controls */}
          <div className="flex items-center gap-2">
            <button
              id="prev-lot-btn"
              type="button"
              disabled={currentBrandIndex <= 0}
              onClick={handlePrevBrand}
              className="px-3.5 py-1.5 btn-chrome-secondary disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold cursor-pointer"
            >
              ← PREV LOT
            </button>

            <select
              id="lot-quick-select"
              value={activeBrand?.id || ''}
              onChange={(e) => {
                setActiveAuctionBrand(e.target.value);
                setAuctionFeedback(null);
                setWinningBidInput('');
              }}
              className="bg-slate-950 border border-white/15 text-slate-200 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-purple-400"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  Lot {b.lotNumber.toString().padStart(2, '0')} — {b.name} ({b.status})
                </option>
              ))}
            </select>

            <button
              id="next-lot-btn"
              type="button"
              disabled={currentBrandIndex >= brands.length - 1}
              onClick={handleNextBrand}
              className="px-3.5 py-1.5 btn-chrome-secondary disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold cursor-pointer"
            >
              NEXT LOT →
            </button>
          </div>
        </div>

        {/* Active Lot Presentation & Physical Bidding Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Card Presentation */}
          <div className="lg:col-span-5 flex justify-center">
            {activeBrand && <BrandCard brand={activeBrand} />}
          </div>

          {/* Admin Bidding Controls */}
          <div className="lg:col-span-7 chrome-panel bg-slate-950/70 p-6 space-y-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-extrabold text-slate-200 uppercase tracking-widest">
                LOT CONTROLS & PHYSICAL BIDDING
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                Physical bidding in room; record winning sale below
              </span>
            </div>

            {/* Status change actions */}
            <div className="flex flex-wrap gap-2.5">
              <button
                id="reveal-brand-btn"
                type="button"
                onClick={() => {
                  if (activeBrand) {
                    revealBrand(activeBrand.id);
                    setAuctionFeedback({ message: `REVEALED: ${activeBrand.name} is now visible to all participants!`, isError: false });
                  }
                }}
                className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-xl cursor-pointer transition shadow ${
                  activeBrand?.status === 'AVAILABLE' || activeBrand?.status === 'LIVE'
                    ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'btn-chrome-secondary text-slate-200'
                }`}
              >
                [ REVEAL BRAND ]
              </button>

              <button
                id="hide-brand-btn"
                type="button"
                onClick={() => {
                  if (activeBrand) {
                    setBrandStatus(activeBrand.id, 'HIDDEN');
                    setAuctionFeedback({ message: `HIDDEN: ${activeBrand.name} is now hidden from participants.`, isError: false });
                  }
                }}
                className={`px-3.5 py-2 text-xs rounded-xl cursor-pointer transition ${
                  activeBrand?.status === 'HIDDEN'
                    ? 'border border-white/15 bg-slate-900 text-slate-400'
                    : 'border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                [ HIDE BRAND ]
              </button>

              {activeBrand?.status === 'SOLD' && (
                <button
                  id="revert-auction-btn"
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Revert auction sale for ${activeBrand.name}? This will refund the winning bid coins and unassign the brand.`)) {
                      const res = revertAuctionResult(activeBrand.id);
                      if (res.success) {
                        setAuctionFeedback({ message: `Sale reverted for ${activeBrand.name}. Coins refunded.`, isError: false });
                      } else {
                        setAuctionFeedback({ message: res.error || 'Failed to revert.', isError: true });
                      }
                    }
                  }}
                  className="px-3.5 py-2 border border-red-800/80 bg-red-950/40 text-xs font-bold text-red-300 hover:bg-red-900/50 rounded-xl cursor-pointer transition"
                >
                  [ Revert Sale & Refund ]
                </button>
              )}
            </div>

            {/* Physical Bid Recording Form */}
            {activeBrand?.status !== 'SOLD' ? (
              <form onSubmit={handlePreConfirmBid} className="space-y-4 pt-3 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="winning-team-select" className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">
                      WINNING TEAM
                    </label>
                    <select
                      id="winning-team-select"
                      value={winningTeamId}
                      onChange={(e) => {
                        setWinningTeamId(e.target.value);
                        setAuctionFeedback(null);
                      }}
                      className="w-full bg-slate-950 border border-white/15 text-slate-100 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-purple-400"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.teamNumber} ({t.teamName}) — ₹{t.morphCoins.toLocaleString()} Coins
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="winning-bid-input" className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">
                      WINNING BID (₹)
                    </label>
                    <input
                      id="winning-bid-input"
                      type="number"
                      min={activeBrand?.basePrice || 0}
                      step="100"
                      placeholder={`Min: ₹${activeBrand?.basePrice.toLocaleString() || '3,000'}`}
                      value={winningBidInput}
                      onChange={(e) => {
                        setWinningBidInput(e.target.value);
                        setAuctionFeedback(null);
                      }}
                      className="w-full bg-slate-950 border border-white/15 text-slate-100 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-purple-400 font-mono"
                    />
                  </div>
                </div>

                {/* Calculation breakdown */}
                {selectedWinningTeam && parsedWinningBid > 0 && (
                  <div className="bg-slate-950/90 border border-white/10 p-3.5 rounded-xl text-xs space-y-1.5 shadow-inner font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>{selectedWinningTeam.teamNumber} Current Balance:</span>
                      <span className="font-bold text-slate-200">₹{selectedWinningTeam.morphCoins.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Winning Bid Deduction:</span>
                      <span className="font-bold text-red-400">- ₹{parsedWinningBid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5 text-slate-200 font-black">
                      <span>Resulting Balance:</span>
                      <span className={selectedWinningTeam.morphCoins - parsedWinningBid < 0 ? 'text-red-400' : 'text-emerald-400'}>
                        ₹{(selectedWinningTeam.morphCoins - parsedWinningBid).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  id="record-winning-bid-btn"
                  type="submit"
                  className="w-full py-3 btn-chrome-primary text-xs font-black tracking-widest uppercase transition cursor-pointer shadow-lg"
                >
                  [ RECORD WINNING BID & CONFIRM SALE ]
                </button>
              </form>
            ) : (
              <div className="p-4 border border-red-800/80 bg-red-950/30 rounded-xl text-xs space-y-2">
                <span className="font-black text-red-300 block uppercase tracking-wider">LOT COMPLETE — SOLD</span>
                <p className="text-slate-300 font-sans">
                  {activeBrand.name} was acquired by <span className="font-black text-slate-100">{activeBrand.winningTeamNumber}</span> for <span className="font-black text-amber-300 font-mono">₹{activeBrand.winningBid?.toLocaleString()}</span>.
                </p>
                <button
                  type="button"
                  onClick={handleNextBrand}
                  className="mt-2 py-2 px-4 btn-chrome-secondary text-slate-100 text-xs font-bold cursor-pointer"
                >
                  PROCEED TO NEXT BRAND →
                </button>
              </div>
            )}

            {auctionFeedback && (
              <div
                id="auction-feedback-msg"
                className={`p-3.5 rounded-xl border text-xs font-bold tracking-wide ${
                  auctionFeedback.isError
                    ? 'border-red-800/80 bg-red-950/60 text-red-300'
                    : 'border-emerald-700/80 bg-emerald-950/60 text-emerald-300'
                }`}
              >
                {auctionFeedback.message}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 2. AUCTION HISTORY */}
      <section className="chrome-panel p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm font-black tracking-widest text-slate-100 uppercase">
            AUCTION HISTORY & TRANSACTION LOGS
          </h2>
          <span className="text-xs text-slate-400 font-bold">
            {auctionHistory.length} completed transactions
          </span>
        </div>

        {auctionHistory.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 font-sans">No completed auction lots yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table id="auction-history-table" className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-widest bg-slate-950/60 text-[10px]">
                  <th className="py-3 px-3.5">Lot</th>
                  <th className="py-3 px-3.5">Brand</th>
                  <th className="py-3 px-3.5">Base Price</th>
                  <th className="py-3 px-3.5">Winning Team</th>
                  <th className="py-3 px-3.5">Winning Bid</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Time</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {auctionHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition">
                    <td className="py-2.5 px-3.5 font-bold text-slate-400">
                      #{item.lotNumber.toString().padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-3.5 font-black text-slate-100">
                      {item.brandName}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-400">
                      ₹{item.basePrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-200">
                      {item.winningTeamNumber}
                    </td>
                    <td className="py-2.5 px-3.5 font-black text-amber-300">
                      ₹{item.winningBid.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3.5 text-red-400 font-bold">
                      {item.status}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 text-[11px]">
                      {item.timestamp}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Revert auction for ${item.brandName}?`)) {
                            revertAuctionResult(item.brandId);
                          }
                        }}
                        className="text-[11px] text-slate-400 hover:text-red-400 cursor-pointer font-bold"
                      >
                        [Revert]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. BRAND CATALOG & MANAGEMENT */}
      <section className="chrome-panel p-6 rounded-2xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-sm font-black tracking-widest text-slate-100 uppercase">
              BRAND CATALOG ({brands.length} ASSETS)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Add, edit, or customize brand lots for the MORPH competition.
            </p>
          </div>

          <button
            id="open-add-brand-modal-btn"
            type="button"
            onClick={() => setShowAddBrandModal(true)}
            className="px-4 py-2 btn-chrome-primary text-xs font-black tracking-wider cursor-pointer"
          >
            + ADD NEW BRAND
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {brands.map((b) => (
            <div
              key={b.id}
              className={`chrome-panel rounded-xl border ${
                b.id === activeBrand?.id ? 'border-amber-400/80 ring-2 ring-amber-400/20 bg-slate-950/90' : 'border-white/10 bg-slate-950/60'
              } p-4 flex flex-col justify-between text-xs space-y-3.5`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 flex-shrink-0 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
                  <img
                    src={b.logo}
                    alt={b.name}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-purple-300 font-mono font-bold">
                      LOT #{b.lotNumber.toString().padStart(2, '0')}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                      b.status === 'SOLD'
                        ? 'border-red-800 text-red-300 bg-red-950/50'
                        : b.status === 'LIVE'
                        ? 'border-amber-500 text-amber-300 bg-amber-950/50'
                        : 'border-white/10 text-slate-400 bg-slate-900'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-100 truncate text-sm mt-0.5">{b.name}</h4>
                  <span className="text-slate-400 text-[11px] font-mono">Base: ₹{b.basePrice.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 font-sans">
                {b.shortDescription}
              </p>

              {b.status === 'SOLD' && (
                <div className="text-[11px] text-amber-300 font-bold bg-amber-950/30 p-2 rounded-lg border border-amber-500/30">
                  Sold to {b.winningTeamNumber} for ₹{b.winningBid?.toLocaleString()}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAuctionBrand(b.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition"
                >
                  Set Stage Lot →
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBrand(b);
                      setEditBrandForm({
                        name: b.name,
                        sector: b.sector || '',
                        logo: b.logo,
                        basePrice: b.basePrice,
                        shortDescription: b.shortDescription,
                        brandDetails: b.brandDetails,
                      });
                    }}
                    className="text-slate-400 hover:text-slate-200 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingBrand(b)}
                    className="text-red-400 hover:text-red-300 font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DELETE BRAND CONFIRMATION MODAL */}
      {deletingBrand && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-red-700/80 rounded-2xl w-full max-w-md p-6 space-y-4 font-mono shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2.5 bg-red-950/60 border border-red-700 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-red-400 uppercase tracking-widest">
                  CONFIRM BRAND DELETION
                </h3>
                <span className="text-[11px] text-slate-400 font-sans">Irreversible Catalog Action</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Are you sure you want to delete <strong className="text-amber-300">{deletingBrand.name}</strong> (Lot #{deletingBrand.lotNumber}) from the Brand Auction catalog?
            </p>

            {deletingBrand.status === 'SOLD' && (
              <div className="bg-red-950/40 border border-red-800 p-3 rounded-xl text-xs text-red-300 font-sans">
                Notice: This brand is currently owned by {deletingBrand.winningTeamNumber}. Deleting it will remove the ownership assignment from the team.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBrand(null)}
                className="btn-chrome-secondary px-4 py-2 text-slate-300 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBrand(deletingBrand.id);
                  setDeletingBrand(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition shadow-lg"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM AUCTION RESULT MODAL */}
      {showConfirmModal && activeBrand && selectedWinningTeam && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-amber-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 font-mono shadow-2xl">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest">
                CONFIRM AUCTION RESULT
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Please double check all values before committing:
              </p>
            </div>

            <div className="bg-slate-950/90 border border-white/10 p-4 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Brand Lot:</span>
                <span className="font-bold text-slate-100">{activeBrand.name} (Lot #{activeBrand.lotNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Winning Team:</span>
                <span className="font-bold text-slate-100">{selectedWinningTeam.teamNumber} ({selectedWinningTeam.teamName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Price:</span>
                <span className="text-slate-300">₹{activeBrand.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-mono">
                <span className="text-slate-400 font-bold">Winning Bid:</span>
                <span className="font-black text-amber-300 text-sm">₹{parsedWinningBid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">New Coin Balance:</span>
                <span className="font-black text-emerald-400">₹{(selectedWinningTeam.morphCoins - parsedWinningBid).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleExecuteAuctionConfirm}
                className="flex-1 py-3 btn-chrome-primary text-slate-950 font-black text-xs tracking-wider cursor-pointer"
              >
                CONFIRM & DEDUCT COINS
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-4 btn-chrome-secondary text-slate-300 text-xs font-bold cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BRAND MODAL */}
      {showAddBrandModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-4 font-mono max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="border-b border-white/10 pb-2 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                ADD NEW BRAND TO AUCTION
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBrandModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBrandSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TESLA"
                  value={newBrandForm.name}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Sector / Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Food Tech / Consumer Internet"
                  value={newBrandForm.sector}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, sector: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Base Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={newBrandForm.basePrice}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, basePrice: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Logo Image (Upload File or Enter URL)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoFileUpload(e, false)}
                    className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border file:border-white/10 file:bg-slate-900 file:text-slate-200 file:text-xs"
                  />
                  <input
                    type="text"
                    placeholder="or paste image URL https://..."
                    value={newBrandForm.logo}
                    onChange={(e) => setNewBrandForm({ ...newBrandForm, logo: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief overview of company and product category"
                  value={newBrandForm.shortDescription}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, shortDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Brand Details & Attributes</label>
                <textarea
                  rows={3}
                  placeholder="Competitive edges, market strengths, endorsements, etc."
                  value={newBrandForm.brandDetails}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, brandDetails: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400 font-sans"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 btn-chrome-primary text-slate-950 font-black cursor-pointer uppercase tracking-wider"
                >
                  ADD BRAND TO CATALOG
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBrandModal(false)}
                  className="py-3 px-4 btn-chrome-secondary text-slate-400 cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BRAND MODAL */}
      {editingBrand && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-4 font-mono max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="border-b border-white/10 pb-2 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                EDIT BRAND — {editingBrand.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingBrand(null)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBrandEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editBrandForm.name}
                  onChange={(e) => setEditBrandForm({ ...editBrandForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Sector / Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Food Tech / Consumer Internet"
                  value={editBrandForm.sector}
                  onChange={(e) => setEditBrandForm({ ...editBrandForm, sector: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Base Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={editBrandForm.basePrice}
                  onChange={(e) => setEditBrandForm({ ...editBrandForm, basePrice: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Logo Image (Upload File or Enter URL)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoFileUpload(e, true)}
                    className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border file:border-white/10 file:bg-slate-900 file:text-slate-200 file:text-xs"
                  />
                  <input
                    type="text"
                    value={editBrandForm.logo}
                    onChange={(e) => setEditBrandForm({ ...editBrandForm, logo: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Short Description</label>
                <textarea
                  rows={2}
                  value={editBrandForm.shortDescription}
                  onChange={(e) => setEditBrandForm({ ...editBrandForm, shortDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Brand Details & Attributes</label>
                <textarea
                  rows={3}
                  value={editBrandForm.brandDetails}
                  onChange={(e) => setEditBrandForm({ ...editBrandForm, brandDetails: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-purple-400 font-sans"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 btn-chrome-primary text-slate-950 font-black cursor-pointer uppercase tracking-wider"
                >
                  SAVE CHANGES
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  className="py-3 px-4 btn-chrome-secondary text-slate-400 cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET AUCTION ROUND CONFIRMATION */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="chrome-panel border border-red-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <RotateCcw className="w-6 h-6" />
              <h3 className="font-mono font-black text-lg text-white uppercase">RESET AUCTION ROUND?</h3>
            </div>

            <p className="text-sm text-slate-300 mb-6 font-sans">
              This will reset all auction activity and return the Auction to its initial state.
            </p>

            <div className="flex items-center justify-end gap-3 font-mono">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="btn-chrome-secondary text-slate-300 font-bold text-xs uppercase tracking-wider px-4 py-2.5 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAuctionRound();
                  setShowResetModal(false);
                  setAuctionFeedback({ message: 'AUCTION ROUND RESET. ALL BIDS REFUNDED AND BRANDS RESTORED.', isError: false });
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
              >
                RESET AUCTION
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
