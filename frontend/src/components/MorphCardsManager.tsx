import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { MorphCard } from '../types';
import { AdminRoundHeader } from './AdminRoundHeader';
import { BrandConflictManager } from './BrandConflictManager';
import { morphAudio } from '../utils/audio';
import {
  CreditCard,
  Shield,
  Repeat,
  Sparkles,
  Zap,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Lock,
  Unlock,
  ShoppingCart,
  RotateCcw,
  Clock,
  AlertTriangle,
  Coins,
  Check,
  X,
  Layers,
  HelpCircle,
  History,
} from 'lucide-react';

export const MorphCardsManager: React.FC = () => {
  const {
    cards,
    cardTransactions,
    cardRoundConfig,
    teams,
    releaseCardInfo,
    hideCardInfo,
    releaseCardPurchase,
    closeCardPurchase,
    completeCardRound,
    resetCardRound,
    addCard,
    updateCard,
    deleteCard,
  } = useEvent();

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCard, setEditingCard] = useState<MorphCard | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<MorphCard | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Sub-tabs state inside Morph Cards
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'transactions' | 'ownership' | 'conflicts'>('catalog');

  // Form state
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number>(2000);
  const [formPower, setFormPower] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsUnlimited, setFormIsUnlimited] = useState(false);
  const [formMaxAvailable, setFormMaxAvailable] = useState<number>(10);
  const [formError, setFormError] = useState('');

  // Quick preset helper
  const handleSelectPreset = (presetName: 'SAFE' | 'SWAP' | 'INTEL' | 'BOOST') => {
    morphAudio.playClick();
    setFormName(presetName);
    if (presetName === 'SAFE') {
      setFormPrice(2000);
      setFormPower('Asset Immunity & Penalty Shield');
      setFormDescription('Provides comprehensive immunity against asset reallocation, opposing team swap maneuvers, or penalty coin deductions.');
      setFormIsUnlimited(false);
      setFormMaxAvailable(15);
    } else if (presetName === 'SWAP') {
      setFormPrice(3500);
      setFormPower('Direct Strategic Asset Exchange');
      setFormDescription('Grants the tactical authorization to initiate a direct brand or product swap proposal with another team under official mediation.');
      setFormIsUnlimited(false);
      setFormMaxAvailable(5);
    } else if (presetName === 'INTEL') {
      setFormPrice(1500);
      setFormPower('Strategic Forecast & Telemetry Clues');
      setFormDescription('Unlocks classified event telemetry, upcoming evaluation rubrics, and secret stage intelligence before public reveals.');
      setFormIsUnlimited(false);
      setFormMaxAvailable(10);
    } else if (presetName === 'BOOST') {
      setFormPrice(2000);
      setFormPower('Score Multiplier & Event Advantage');
      setFormDescription('Activates a 1.25x performance multiplier during milestone judge reviews and awards exclusive priority advantages.');
      setFormIsUnlimited(false);
      setFormMaxAvailable(10);
    }
  };

  const openAddModal = () => {
    morphAudio.playClick();
    setEditingCard(null);
    setFormName('SAFE');
    setFormPrice(2000);
    setFormPower('Asset Immunity & Penalty Shield');
    setFormDescription('Provides comprehensive immunity against asset reallocation, opposing team swap maneuvers, or penalty coin deductions.');
    setFormIsUnlimited(false);
    setFormMaxAvailable(15);
    setFormError('');
    setShowAddEditModal(true);
  };

  const openEditModal = (card: MorphCard) => {
    morphAudio.playClick();
    setEditingCard(card);
    setFormName(card.name);
    setFormPrice(card.price);
    setFormPower(card.power);
    setFormDescription(card.description);
    setFormIsUnlimited(card.maxAvailable === null);
    setFormMaxAvailable(card.maxAvailable ?? 10);
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Card name is required.');
      return;
    }
    if (isNaN(formPrice) || formPrice < 0) {
      setFormError('Price must be a valid non-negative number.');
      return;
    }
    if (!formPower.trim()) {
      setFormError('Power / Function description is required.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Card description is required.');
      return;
    }

    morphAudio.playClick();
    const maxStock = formIsUnlimited ? null : (isNaN(formMaxAvailable) || formMaxAvailable < 1 ? 1 : Math.round(formMaxAvailable));

    if (editingCard) {
      updateCard(editingCard.id, {
        name: formName.trim().toUpperCase(),
        price: Math.round(formPrice),
        power: formPower.trim(),
        description: formDescription.trim(),
        maxAvailable: maxStock,
      });
    } else {
      addCard({
        name: formName.trim().toUpperCase(),
        price: Math.round(formPrice),
        power: formPower.trim(),
        description: formDescription.trim(),
        maxAvailable: maxStock,
      });
    }

    morphAudio.playSuccess();
    setShowAddEditModal(false);
  };

  const handleDeleteCardConfirm = () => {
    if (showDeleteModal) {
      morphAudio.playDanger();
      deleteCard(showDeleteModal.id);
      setShowDeleteModal(null);
    }
  };

  const getCardIcon = (name: string) => {
    const clean = name.toUpperCase();
    if (clean.includes('SAFE') || clean.includes('SHIELD')) return <Shield className="w-5 h-5 text-emerald-400" />;
    if (clean.includes('SWAP') || clean.includes('TRADE')) return <Repeat className="w-5 h-5 text-indigo-400" />;
    if (clean.includes('INTEL') || clean.includes('RADAR') || clean.includes('CLUE')) return <Sparkles className="w-5 h-5 text-cyan-400" />;
    if (clean.includes('BOOST') || clean.includes('POWER') || clean.includes('SURGE')) return <Zap className="w-5 h-5 text-amber-400" />;
    return <CreditCard className="w-5 h-5 text-purple-400" />;
  };

  const getCardThemeBorder = (name: string) => {
    const clean = name.toUpperCase();
    if (clean.includes('SAFE')) return 'border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
    if (clean.includes('SWAP')) return 'border-indigo-500/30 bg-indigo-950/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]';
    if (clean.includes('INTEL')) return 'border-cyan-500/30 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]';
    if (clean.includes('BOOST')) return 'border-amber-500/30 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
    return 'border-white/10 bg-slate-950/60';
  };

  const totalCardsSold = cards.reduce((acc, c) => acc + c.purchasedCount, 0);
  const totalSpentCoins = cardTransactions.reduce((acc, tx) => acc + tx.price, 0);

  return (
    <div className="space-y-6 font-mono">
      {/* 1. MASTER ROUND CONTROLS */}
      <AdminRoundHeader
        roundBadge="ROUND 3"
        roundName="MORPH CARDS"
        description="Control the two-stage release: first release card information to participants, then open purchases. Track live sales and adjust card prices or powers."
        infoReleased={cardRoundConfig.infoReleased}
        roundStatus={cardRoundConfig.roundStatus === 'ACTIVE' ? 'ACTIVE' : cardRoundConfig.roundStatus === 'COMPLETED' ? 'COMPLETED' : 'LOCKED'}
        onReleaseInfo={releaseCardInfo}
        onHideInfo={hideCardInfo}
        onReleaseRound={releaseCardPurchase}
        onPauseRound={closeCardPurchase}
        onCompleteRound={() => setShowCompleteModal(true)}
        onReset={() => setShowResetModal(true)}
        idPrefix="cards"
      >
        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Cards in Catalog</div>
            <div className="text-xl font-black font-mono text-white mt-1">
              {cards.length} <span className="text-xs font-normal text-slate-500">Configured</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Cards Sold</div>
            <div className="text-xl font-black font-mono text-amber-300 mt-1">
              {totalCardsSold} <span className="text-xs font-normal text-slate-500">Units</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Coins Spent</div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-1">
              ₹{totalSpentCoins.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Purchase Status</div>
            <div className="text-xl font-black font-mono text-slate-200 mt-1">
              {cardRoundConfig.purchaseStatus === 'OPEN' ? 'OPEN FOR BUYING' : 'PURCHASE CLOSED'}
            </div>
          </div>
        </div>
      </AdminRoundHeader>

      {/* Sub Tabs Inside Morph Cards */}
      <div className="chrome-panel p-1.5 flex gap-1.5 overflow-x-auto text-xs font-bold border border-white/10 shadow-lg no-scrollbar">
        <button
          id="tab-cards-catalog"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveSubTab('catalog');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeSubTab === 'catalog'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>CARDS CATALOG & LIVE INVENTORY</span>
        </button>

        <button
          id="tab-cards-transactions"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveSubTab('transactions');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeSubTab === 'transactions'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4 text-emerald-400" />
          <span>PURCHASE TRANSACTIONS ({cardTransactions.length})</span>
        </button>

        <button
          id="tab-cards-ownership"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveSubTab('ownership');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeSubTab === 'ownership'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>TEAM VAULT MATRIX</span>
        </button>

        <button
          id="tab-cards-conflicts"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveSubTab('conflicts');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeSubTab === 'conflicts'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>BRAND CONFLICTS & TIEBREAKERS</span>
        </button>
      </div>

      {/* 2. CARD INVENTORY CATALOG & MANAGEMENT */}
      {activeSubTab === 'catalog' && (
      <section className="chrome-panel p-5 md:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3 mb-5">
          <div>
            <h3 className="text-sm font-extrabold tracking-widest text-white uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              MORPH CARDS CATALOG ({cards.length} CARDS CONFIGURED)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add, edit, or delete card definitions. Customize coin prices, strategic powers, and maximum stock limits.
            </p>
          </div>

          <button
            id="open-add-card-modal-btn"
            type="button"
            onClick={openAddModal}
            className="btn-chrome-primary text-xs uppercase tracking-wider px-4 py-2.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            + ADD NEW CARD
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="border border-dashed border-white/10 p-8 text-center bg-slate-950/60 rounded-xl">
            <p className="text-xs text-slate-400">No cards currently configured in the catalog.</p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-3 btn-chrome-primary text-xs font-bold uppercase tracking-wider px-4 py-2"
            >
              Add First Morph Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
              const isSoldOut = card.maxAvailable !== null && card.purchasedCount >= card.maxAvailable;
              const remaining = card.maxAvailable !== null ? Math.max(0, card.maxAvailable - card.purchasedCount) : null;

              return (
                <div
                  key={card.id}
                  className={`chrome-panel p-4 flex flex-col justify-between space-y-3 relative group transition duration-300 ${getCardThemeBorder(card.name)}`}
                >
                  {/* Top: Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-950 border border-white/10 rounded-xl shadow-inner">
                          {getCardIcon(card.name)}
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase block">
                            MORPH CARD
                          </span>
                          <h4 className="text-base font-extrabold text-white tracking-wider">
                            {card.name}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-amber-400 flex items-center gap-1 justify-end">
                          <Coins className="w-3.5 h-3.5" />
                          ₹{card.price.toLocaleString()}
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase font-bold">COINS</span>
                      </div>
                    </div>

                    {/* Power / Function */}
                    <div className="mb-2">
                      <span className="text-[9px] font-extrabold text-purple-400 tracking-widest uppercase block mb-0.5">
                        POWER / FUNCTION
                      </span>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                        {card.power}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase block mb-0.5">
                        CARD DESCRIPTION
                      </span>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Stock & Actions */}
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between text-[11px] mb-3">
                      <span className="text-slate-400">Availability:</span>
                      {card.maxAvailable === null ? (
                        <span className="text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 border border-emerald-700/80 rounded">
                          UNLIMITED
                        </span>
                      ) : isSoldOut ? (
                        <span className="text-red-300 font-bold bg-red-950/80 px-2 py-0.5 border border-red-800 rounded">
                          SOLD OUT ({card.purchasedCount}/{card.maxAvailable})
                        </span>
                      ) : (
                        <span className="text-slate-200 font-mono bg-slate-950 px-2 py-0.5 border border-white/10 rounded">
                          {remaining} LEFT ({card.purchasedCount} sold)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(card)}
                        className="flex-1 py-1.5 px-2 btn-chrome-secondary text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        EDIT
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          morphAudio.playDanger();
                          setShowDeleteModal(card);
                        }}
                        className="py-1.5 px-2.5 btn-chrome-danger text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3 h-3" />
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      )}

      {/* 3. CARD PURCHASES MONITOR & LIVE TRANSACTIONS */}
      {activeSubTab === 'transactions' && (
      <section className="chrome-panel p-5 md:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-extrabold tracking-widest text-white uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              LIVE CARD PURCHASE HISTORY ({cardTransactions.length} TRANSACTIONS)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit ledger of all participant card acquisitions and Morph Coin deductions.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-950/80 px-3 py-1.5 border border-white/10 rounded-xl shadow-inner">
              <span className="text-slate-400">TOTAL CARDS SOLD: </span>
              <strong className="text-emerald-400">{totalCardsSold}</strong>
            </div>
            <div className="bg-slate-950/80 px-3 py-1.5 border border-white/10 rounded-xl shadow-inner">
              <span className="text-slate-400">TOTAL COINS SPENT: </span>
              <strong className="text-amber-400">₹{totalSpentCoins.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {cardTransactions.length === 0 ? (
          <div className="border border-white/5 bg-slate-950/60 p-6 text-center text-xs text-slate-500 rounded-xl">
            No card purchases recorded yet. Once participants acquire cards during the open purchase phase, transactions will log here instantly.
          </div>
        ) : (
          <div className="overflow-x-auto border border-white/5 bg-slate-950/40 rounded-xl">
            <table className="w-full text-left text-xs border-collapse font-mono" id="admin-card-transactions-table">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider bg-slate-950/80">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Card Name</th>
                  <th className="py-2.5 px-3">Price Paid</th>
                  <th className="py-2.5 px-3">Time Purchased</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {cardTransactions.map((tx, idx) => (
                  <tr key={tx.id} className="hover:bg-purple-950/20 transition">
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {(cardTransactions.length - idx).toString().padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {tx.teamNumber} {tx.teamName !== tx.teamNumber && <span className="text-slate-400 text-[11px] font-normal">({tx.teamName})</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                        {tx.cardName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">
                      -₹{tx.price.toLocaleString()} Coins
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {tx.timePurchased}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/80 px-2 py-0.5 rounded uppercase tracking-wider">
                        PURCHASED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      {/* 4. TEAM CARD OWNERSHIP ROSTER */}
      {activeSubTab === 'ownership' && (
      <section className="chrome-panel p-5 md:p-6 shadow-2xl">
        <div className="border-b border-white/10 pb-3 mb-4">
          <h3 className="text-sm font-extrabold tracking-widest text-white uppercase flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            TEAM CARD OWNERSHIP MATRIX (ALL 15 TEAMS)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit of all Morph Cards currently held in each team's vault.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {teams.map((t) => {
            const ownedCards = t.cards || [];
            return (
              <div
                key={t.id}
                className="chrome-panel p-3.5 flex flex-col justify-between space-y-2 text-xs hover:border-white/20 transition"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="font-extrabold text-white">{t.teamNumber}</span>
                  <span className="text-[11px] text-amber-400 font-bold">₹{t.morphCoins.toLocaleString()}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block mb-1 font-bold">
                    Held Cards ({ownedCards.length})
                  </span>
                  {ownedCards.length === 0 ? (
                    <span className="text-slate-600 text-xs italic">No cards owned</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {ownedCards.map((cName, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-1.5 py-0.5 bg-slate-950 border border-white/10 text-amber-300 font-bold text-[10px] rounded"
                        >
                          {cName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* 5. BRAND CONFLICTS & TIEBREAKERS SUBTAB */}
      {activeSubTab === 'conflicts' && (
        <BrandConflictManager />
      )}

      {/* --- MODAL: ADD / EDIT CARD --- */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="chrome-panel border border-white/20 rounded-2xl w-full max-w-lg p-6 space-y-4 font-mono shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {editingCard ? `EDIT CARD: ${editingCard.name}` : 'ADD NEW MORPH CARD'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setShowAddEditModal(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Bar */}
            {!editingCard && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1 font-bold">
                  Quick Load Preset:
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                  {(['SAFE', 'SWAP', 'INTEL', 'BOOST'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`py-2 border rounded-xl text-center transition cursor-pointer ${
                        formName === p
                          ? 'border-amber-500 bg-amber-950/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'border-white/5 bg-slate-950/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveCard} className="space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl text-red-300 font-bold">
                  {formError}
                </div>
              )}

              {/* Card Name */}
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">
                  Card Name (e.g. SAFE, SWAP, INTEL, BOOST)
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. SAFE"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white font-bold tracking-wider uppercase focus:outline-none focus:border-purple-500 shadow-inner"
                  required
                />
              </div>

              {/* Price in Morph Coins */}
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">
                  Price in Morph Coins
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-amber-300 font-bold tracking-wider focus:outline-none focus:border-purple-500 shadow-inner"
                  required
                />
              </div>

              {/* Power / Function */}
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">
                  Power / Function
                </label>
                <input
                  type="text"
                  value={formPower}
                  onChange={(e) => setFormPower(e.target.value)}
                  placeholder="e.g. Asset Immunity & Penalty Shield"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 shadow-inner"
                  required
                />
              </div>

              {/* Card Description */}
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">
                  Card Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the card's rules, usage constraints, or strategic effect..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 resize-none shadow-inner"
                  required
                />
              </div>

              {/* Availability Limits */}
              <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3.5 space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold">Max Available Stock</label>
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsUnlimited}
                      onChange={(e) => setFormIsUnlimited(e.target.checked)}
                      className="accent-purple-500 cursor-pointer"
                    />
                    Unlimited Copies
                  </label>
                </div>

                {!formIsUnlimited && (
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={formMaxAvailable}
                      onChange={(e) => setFormMaxAvailable(Number(e.target.value))}
                      placeholder="e.g. 10"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500 shadow-inner"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Maximum total purchases allowed across all teams.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    morphAudio.playClick();
                    setShowAddEditModal(false);
                  }}
                  className="btn-chrome-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-chrome-primary text-xs uppercase tracking-wider px-5 py-2"
                >
                  {editingCard ? 'SAVE CHANGES' : 'CREATE CARD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CONFIRM DELETE CARD (NO WINDOW.CONFIRM) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-red-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 font-mono shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2.5 bg-red-950/80 border border-red-700/80 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-red-400 uppercase tracking-widest">
                  CONFIRM CARD DELETION
                </h3>
                <span className="text-[11px] text-slate-400">Irreversible Catalog Action</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-amber-300">{showDeleteModal.name}</strong> from the Morph Cards catalog?
            </p>

            <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 space-y-1 text-xs text-slate-400 shadow-inner">
              <div>Price: <strong className="text-amber-400">₹{showDeleteModal.price.toLocaleString()} Coins</strong></div>
              <div>Total Sold So Far: <strong className="text-white">{showDeleteModal.purchasedCount} copies</strong></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setShowDeleteModal(null);
                }}
                className="btn-chrome-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCardConfirm}
                className="btn-chrome-danger text-xs uppercase tracking-wider px-5 py-2"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CONFIRM COMPLETE ROUND --- */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-blue-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 font-mono shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2.5 bg-blue-950/80 border border-blue-700/80 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-blue-400 uppercase tracking-widest">
                  COMPLETE MORPH CARDS ROUND
                </h3>
                <span className="text-[11px] text-slate-400">Stage Finalization</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will lock purchases and mark Round 3 (MORPH CARDS) as <strong className="text-blue-300">COMPLETED</strong>. All team card ownership and remaining Morph Coins will remain intact.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setShowCompleteModal(false);
                }}
                className="btn-chrome-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playConfirm();
                  completeCardRound();
                  setShowCompleteModal(false);
                }}
                className="btn-chrome-primary text-xs uppercase tracking-wider px-5 py-2"
              >
                CONFIRM COMPLETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CONFIRM RESET ROUND --- */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="chrome-panel border border-red-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 font-mono shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2.5 bg-red-950/80 border border-red-700/80 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-red-400 uppercase tracking-widest">
                  RESET MORPH CARDS PURCHASES
                </h3>
                <span className="text-[11px] text-slate-400">Card Reset & Coin Refund</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to reset Round 3?
            </p>

            <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs text-slate-400 shadow-inner">
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>All card purchases will be refunded to teams.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Team cards vaults will be cleared.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Purchases will be closed and info locked.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setShowResetModal(false);
                }}
                className="btn-chrome-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playDanger();
                  resetCardRound();
                  setShowResetModal(false);
                }}
                className="btn-chrome-danger text-xs uppercase tracking-wider px-5 py-2"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};