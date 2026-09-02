import React, { useState, useEffect } from 'react';
import { useEvent, RoundCompletionItem } from '../context/EventContext';
import { Product } from '../types';
import { createDefaultProductVectorSvg } from '../utils/initialData';
import { ProductImage } from './ProductImage';
import { AdminRoundHeader } from './AdminRoundHeader';
import { morphAudio } from '../utils/audio';
import {
  Lock,
  Unlock,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Package,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  Upload,
  Key,
  ShieldCheck,
  Check,
  X,
  FileText,
  Boxes,
  HelpCircle,
  Sparkles,
  Info,
  Tag,
  RefreshCw,
} from 'lucide-react';

export const ProductRevealManager: React.FC = () => {
  const {
    roundConfig,
    products,
    releaseRoundInfo,
    hideRoundInfo,
    releaseRound,
    pauseRound,
    completeRound,
    resetRound,
    resetProductRevealRound,
    restoreDefaultProducts,
    updateRoundDetails,
    updatePuzzle,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProduct,
    getRound2Leaderboard,
    teams,
  } = useEvent();

  // Round Details editing state
  const [objectiveText, setObjectiveText] = useState(roundConfig.objective || '');
  const [rulesText, setRulesText] = useState(roundConfig.rules || '');
  const [timeLimitText, setTimeLimitText] = useState(roundConfig.timeLimit || '');
  const [importantNotesText, setImportantNotesText] = useState(roundConfig.importantNotes || roundConfig.instructions || '');
  const [detailsSaved, setDetailsSaved] = useState(false);

  // Sync details from context if updated from another tab
  useEffect(() => {
    setObjectiveText(roundConfig.objective || '');
    setRulesText(roundConfig.rules || '');
    setTimeLimitText(roundConfig.timeLimit || '');
    setImportantNotesText(roundConfig.importantNotes || roundConfig.instructions || '');
  }, [roundConfig.objective, roundConfig.rules, roundConfig.timeLimit, roundConfig.importantNotes, roundConfig.instructions]);

  // Puzzle editing
  const [puzzleType, setPuzzleType] = useState<'text' | 'image' | 'both'>(roundConfig.puzzle?.type || 'text');
  const [puzzleText, setPuzzleText] = useState(roundConfig.puzzle?.text || '');
  const [puzzleImage, setPuzzleImage] = useState(roundConfig.puzzle?.imageUrl || '');
  const [puzzleAnswer, setPuzzleAnswer] = useState(roundConfig.puzzle?.correctAnswer || '');
  const [showAnswer, setShowAnswer] = useState(false);
  const [puzzleSaved, setPuzzleSaved] = useState(false);

  useEffect(() => {
    if (roundConfig.puzzle) {
      setPuzzleType(roundConfig.puzzle.type || 'text');
      setPuzzleText(roundConfig.puzzle.text || '');
      setPuzzleImage(roundConfig.puzzle.imageUrl || '');
      setPuzzleAnswer(roundConfig.puzzle.correctAnswer || '');
    }
  }, [roundConfig.puzzle]);

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [resettingProduct, setResettingProduct] = useState<Product | null>(null);

  // Product form
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');

  const leaderboard = getRound2Leaderboard();
  const availableCount = products.filter((p) => p.status === 'AVAILABLE').length;
  const takenCount = products.filter((p) => p.status === 'TAKEN').length;
  const solvedCount = teams.filter((t) => t.puzzleSolved).length;

  const handleSaveDetails = () => {
    morphAudio.playClick();
    updateRoundDetails({
      objective: objectiveText,
      rules: rulesText,
      timeLimit: timeLimitText,
      importantNotes: importantNotesText,
      instructions: importantNotesText,
    });
    setDetailsSaved(true);
    morphAudio.playSuccess();
    setTimeout(() => setDetailsSaved(false), 2500);
  };

  const handleSavePuzzle = () => {
    morphAudio.playClick();
    updatePuzzle({
      type: puzzleType,
      text: puzzleText,
      imageUrl: puzzleImage,
      correctAnswer: puzzleAnswer.trim(),
    });
    setPuzzleSaved(true);
    morphAudio.playSuccess();
    setTimeout(() => setPuzzleSaved(false), 2500);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isPuzzle: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (isPuzzle) {
          setPuzzleImage(result);
        } else {
          setFormImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddProductModal = () => {
    morphAudio.playClick();
    setEditingProductId(null);
    setFormName('');
    setFormCategory('');
    setFormDesc('');
    setFormImage('');
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: Product) => {
    morphAudio.playClick();
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormCategory(prod.category || '');
    setFormDesc(prod.shortDescription);
    setFormImage(prod.image);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    morphAudio.playClick();
    const finalName = formName.trim().toUpperCase();
    const finalCategory = formCategory.trim() || 'General / Consumer Product';
    let finalImage = formImage.trim();
    if (!finalImage) {
      finalImage = createDefaultProductVectorSvg(finalName, finalCategory);
    }

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: finalName,
        category: finalCategory,
        shortDescription: formDesc.trim(),
        image: finalImage,
      });
    } else {
      addProduct({
        name: finalName,
        category: finalCategory,
        shortDescription: formDesc.trim() || 'Official event product inventory lot.',
        image: finalImage,
      });
    }

    morphAudio.playSuccess();
    setShowProductModal(false);
  };

  const isInfoReleased = !!roundConfig.infoReleased;
  const isRoundActive = roundConfig.roundStatus === 'ACTIVE';
  const isRoundCompleted = roundConfig.roundStatus === 'COMPLETED';

  return (
    <div className="space-y-8" id="product-reveal-manager">
      {/* 1. ROUND CONTROL HEADER & STATUS BAR */}
      <AdminRoundHeader
        roundBadge="ROUND 2"
        roundName="PRODUCT REVEAL"
        description="Admin two-step control: Release instructions for participants to read, then release the round to enable gameplay."
        infoReleased={isInfoReleased}
        roundStatus={roundConfig.roundStatus === 'ACTIVE' ? 'ACTIVE' : roundConfig.roundStatus === 'COMPLETED' ? 'COMPLETED' : 'LOCKED'}
        onReleaseInfo={releaseRoundInfo}
        onHideInfo={hideRoundInfo}
        onReleaseRound={releaseRound}
        onPauseRound={pauseRound}
        onCompleteRound={() => setShowCompleteModal(true)}
        onReset={() => setShowResetModal(true)}
        idPrefix="product-reveal"
      >
        {/* Live Metrics Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Vault Inventory</div>
            <div className="text-xl font-black font-mono text-white mt-1">
              {availableCount} <span className="text-xs font-normal text-slate-500">/ {products.length} Avail</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Puzzles Solved</div>
            <div className="text-xl font-black font-mono text-amber-400 mt-1">
              {solvedCount} <span className="text-xs font-normal text-slate-500">/ {teams.length} Teams</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Products Claimed</div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-1">
              {takenCount} <span className="text-xs font-normal text-slate-500">/ {teams.length} Teams</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Participant Status</div>
            <div className="text-xl font-black font-mono text-slate-200 mt-1">
              {!isInfoReleased ? 'NO ACTIVE ROUND' : !isRoundActive ? 'READING RULES' : 'PLAYING ROUND'}
            </div>
          </div>
        </div>
      </AdminRoundHeader>

      {/* 2. ROUND INFORMATION DETAILS & PUZZLE CONFIGURATION (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROUND INFORMATION CONFIG (Shown to participants when INFO is released) */}
        <div className="chrome-panel p-6 shadow-2xl flex flex-col" id="round-instructions-box">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="font-mono font-extrabold text-base text-white uppercase tracking-wider">ROUND INFORMATION PAGE</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Visible on Info Release</span>
          </div>

          <p className="text-xs text-slate-400 mb-4 font-mono leading-relaxed">
            Configure the Objective, Rules, Time Limit, and Important Notes that participants read before gameplay starts.
          </p>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1 font-bold">Objective</label>
              <textarea
                id="admin-round-objective-input"
                value={objectiveText}
                onChange={(e) => setObjectiveText(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 transition resize-y shadow-inner"
                placeholder="Round objective..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1 font-bold">Rules (One per line or formatted)</label>
              <textarea
                id="admin-round-rules-input"
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 transition resize-y shadow-inner"
                placeholder="Round rules..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1 font-bold">Time Limit</label>
                <input
                  type="text"
                  id="admin-round-timelimit-input"
                  value={timeLimitText}
                  onChange={(e) => setTimeLimitText(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 shadow-inner"
                  placeholder="e.g. 15 Minutes"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1 font-bold">Round Subtitle</label>
                <input
                  type="text"
                  disabled
                  value="Round 2 • Product Reveal"
                  className="w-full bg-slate-950/60 border border-white/5 rounded-xl p-2.5 text-xs text-slate-500 font-mono shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1 font-bold">Important Notes</label>
              <textarea
                id="admin-round-notes-input"
                value={importantNotesText}
                onChange={(e) => setImportantNotesText(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 transition resize-y shadow-inner"
                placeholder="Key advice or hints..."
              />
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs text-slate-500 font-mono">
              {detailsSaved && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Details saved
                </span>
              )}
            </span>
            <button
              id="btn-save-instructions"
              onClick={handleSaveDetails}
              className="btn-chrome-secondary text-xs uppercase tracking-wider px-4 py-2"
            >
              SAVE ROUND DETAILS
            </button>
          </div>
        </div>

        {/* PRODUCT REVEAL PUZZLE CONFIG */}
        <div className="chrome-panel p-6 shadow-2xl flex flex-col" id="puzzle-config-box">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="font-mono font-extrabold text-base text-white uppercase tracking-wider">PRODUCT REVEAL PUZZLE</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Vault Security Access</span>
          </div>

          <div className="space-y-4">
            {/* Input Type Selector */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1 font-bold">Puzzle Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['text', 'image', 'both'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      morphAudio.playClick();
                      setPuzzleType(type);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-mono uppercase font-bold border transition ${
                      puzzleType === type
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950/80 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Puzzle Text / Riddle */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1 font-bold">
                Puzzle Clue / Riddle Prompt
              </label>
              <textarea
                id="admin-puzzle-text-input"
                value={puzzleText}
                onChange={(e) => setPuzzleText(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition shadow-inner"
                placeholder="e.g. Enter the 4-digit code to unlock the Vault..."
              />
            </div>

            {/* Puzzle Image (Optional / when type is image or both) */}
            {(puzzleType === 'image' || puzzleType === 'both') && (
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1 font-bold">
                  Puzzle Image (URL or Upload)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={puzzleImage}
                    onChange={(e) => setPuzzleImage(e.target.value)}
                    placeholder="https://... image URL"
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border border-white/10 transition">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
                {puzzleImage && (
                  <div className="relative w-full h-24 bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shadow-inner">
                    <img src={puzzleImage} alt="Puzzle preview" className="max-h-full max-w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setPuzzleImage('')}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-black text-red-400 p-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Correct Answer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-slate-400 uppercase font-bold">
                  Correct Answer (Case-Insensitive Match)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    morphAudio.playClick();
                    setShowAnswer(!showAnswer);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 font-mono flex items-center gap-1"
                >
                  {showAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showAnswer ? 'Hide' : 'Reveal'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-puzzle-answer-input"
                  type={showAnswer ? 'text' : 'password'}
                  value={puzzleAnswer}
                  onChange={(e) => setPuzzleAnswer(e.target.value)}
                  placeholder="e.g. 1234 or MORPH"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500 shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs text-slate-500 font-mono">
              {puzzleSaved && (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Puzzle saved
                </span>
              )}
            </span>
            <button
              id="btn-save-puzzle"
              onClick={handleSavePuzzle}
              className="btn-chrome-primary text-xs uppercase tracking-wider px-4 py-2"
            >
              SAVE PUZZLE
            </button>
          </div>
        </div>
      </div>

      {/* 3. LIVE COMPLETION & TEAM PROGRESS TABLE (Current Round Only) */}
      <div className="chrome-panel p-6 shadow-2xl" id="round-completion-table">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-white/10">
          <div>
            <h3 className="font-mono font-extrabold text-lg text-white flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-5 h-5 text-emerald-400" />
              PRODUCT REVEAL COMPLETION ORDER (LIVE)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Ranked in real time by product selection timestamp. Independent of the main Morph Coins leaderboard.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-white/10 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Sync Active
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/5">
          <table className="w-full text-left text-xs font-mono border-collapse" id="admin-product-reveal-table">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider bg-slate-950/80">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Puzzle Status</th>
                <th className="py-3 px-4">Puzzle Solved Time</th>
                <th className="py-3 px-4">Selected Product</th>
                <th className="py-3 px-4">Product Selected Time</th>
                <th className="py-3 px-4 text-right">Completion State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/40">
              {leaderboard.map((item) => {
                const isCompleted = item.position > 0;
                return (
                  <tr
                    key={item.teamId}
                    className={`hover:bg-purple-950/20 transition ${
                      isCompleted ? 'bg-emerald-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      {isCompleted ? (
                        <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-white/10 shadow-inner">
                          #{item.position}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.teamNumber}</div>
                      <div className="text-[11px] text-slate-400">{item.teamName}</div>
                    </td>
                    <td className="py-3 px-4">
                      {item.puzzleSolved ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> SOLVED
                        </span>
                      ) : (
                        <span className="text-slate-500">WAITING</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.puzzleSolvedAt || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {item.productName !== '—' ? (
                        <span className="font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                          {item.productName}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-bold">
                      {item.productSelectedAt || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isCompleted ? (
                        <span className="inline-block bg-emerald-950 text-emerald-300 border border-emerald-700/80 font-bold px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
                          COMPLETED (#{item.position})
                        </span>
                      ) : item.puzzleSolved ? (
                        <span className="inline-block bg-amber-950 text-amber-300 border border-amber-700/80 px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
                          IN VAULT
                        </span>
                      ) : (
                        <span className="inline-block bg-slate-900 text-slate-500 border border-white/5 px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
                          WAITING
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PRODUCT INVENTORY VAULT CRUD SECTION */}
      <div className="chrome-panel p-6 shadow-2xl" id="product-inventory-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-400" />
              <h3 className="font-mono font-extrabold text-lg text-white uppercase tracking-wider">PRODUCT INVENTORY ({products.length} PRODUCTS)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Admin inventory catalog for the Vault round. Add, edit, or delete items. Teams select only 1 item upon solving the puzzle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                morphAudio.playClick();
                setShowRestoreModal(true);
              }}
              className="btn-chrome-secondary text-xs uppercase tracking-wider px-3.5 py-2.5 flex items-center gap-1.5 border border-purple-500/30 text-purple-300 hover:bg-purple-950/30"
              title="Reset product inventory to the official 20 MORPH products"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              RESTORE OFFICIAL 20
            </button>
            <button
              id="btn-add-product"
              onClick={openAddProductModal}
              className="btn-chrome-primary text-xs uppercase tracking-wider px-4 py-2.5 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              ADD PRODUCT
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((prod) => {
            const isTaken = prod.status === 'TAKEN';
            return (
              <div
                key={prod.id}
                className={`chrome-panel p-4 flex flex-col justify-between transition duration-300 hover:border-purple-500/40 ${
                  isTaken ? 'opacity-85' : ''
                }`}
              >
                <div>
                  <div className="relative w-full aspect-square bg-slate-950 rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-white/5">
                    <ProductImage
                      src={prod.image}
                      alt={prod.name}
                      name={prod.name}
                      category={prod.category}
                      showAdminWarning={true}
                    />
                    <span
                      className={`absolute top-2 right-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wider uppercase border shadow-md ${
                        isTaken
                          ? 'bg-red-950/90 text-red-300 border-red-800'
                          : 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      {prod.status}
                    </span>
                  </div>

                  {prod.category && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-1 line-clamp-1">
                      <Tag className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>{prod.category}</span>
                    </div>
                  )}

                  <h4 className="font-mono font-bold text-sm text-white tracking-wider mb-1">
                    {prod.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 font-mono">
                    {prod.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  {isTaken ? (
                    <div className="text-[11px] font-mono text-amber-300 mb-2">
                      Claimed by: <span className="font-bold text-white">{prod.takenByTeamNumber}</span> ({prod.takenAt})
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono text-emerald-400 mb-2">
                      Available in Vault
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    {isTaken ? (
                      <button
                        type="button"
                        onClick={() => {
                          morphAudio.playClick();
                          setResettingProduct(prod);
                        }}
                        className="text-[10px] font-mono px-2 py-1 bg-amber-950/40 hover:bg-amber-950 text-amber-300 border border-amber-800/60 rounded-lg transition flex items-center gap-1"
                        title="Reset Product Selection"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset Claim
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Ready</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditProductModal(prod)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-lg transition"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          morphAudio.playDanger();
                          setDeletingProduct(prod);
                        }}
                        className="p-2 text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950 border border-red-800/40 rounded-lg transition"
                        title="Delete Product"
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

      {/* CONFIRM RESET PRODUCT SELECTION MODAL */}
      {resettingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chrome-panel border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl font-mono space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2.5 bg-amber-950/80 border border-amber-700/80 rounded-xl">
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-widest">
                  RESET PRODUCT CLAIM
                </h3>
                <span className="text-[11px] text-slate-400">Restore to Available</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to reset the selection of <strong className="text-white">{resettingProduct.name}</strong>?
            </p>

            <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-3 text-xs text-amber-300">
              This product is currently claimed by <strong className="text-white">{resettingProduct.takenByTeamNumber}</strong>. Resetting it will return the product to AVAILABLE status in the Vault and clear the product from {resettingProduct.takenByTeamNumber}'s inventory.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setResettingProduct(null);
                }}
                className="btn-chrome-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playConfirm();
                  resetProduct(resettingProduct.id);
                  setResettingProduct(null);
                }}
                className="btn-chrome-primary text-xs uppercase tracking-wider px-5 py-2"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE PRODUCT MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chrome-panel border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl font-mono space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2.5 bg-red-950/80 border border-red-700/80 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-red-400 uppercase tracking-widest">
                  CONFIRM PRODUCT DELETION
                </h3>
                <span className="text-[11px] text-slate-400">Vault Catalog Action</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{deletingProduct.name}</strong> from the Product Vault inventory?
            </p>

            {deletingProduct.status === 'TAKEN' && (
              <div className="bg-red-950/40 border border-red-800 rounded-xl p-3 text-xs text-red-300">
                Notice: This product is claimed by {deletingProduct.takenByTeamNumber}. Deleting it will clear this product assignment from the team.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setDeletingProduct(null);
                }}
                className="btn-chrome-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playDanger();
                  deleteProduct(deletingProduct.id);
                  setDeletingProduct(null);
                }}
                className="btn-chrome-danger text-xs uppercase tracking-wider px-5 py-2"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chrome-panel border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="font-mono font-extrabold text-lg text-white uppercase tracking-wider">
                {editingProductId ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setShowProductModal(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 uppercase mb-1 font-bold">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. PREMIUM UNDERWEAR, INSTANT NOODLES..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-bold tracking-wider uppercase focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1 font-bold">Category</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Fashion / Apparel, Food / FMCG..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-purple-300 font-bold tracking-wider focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1 font-bold">Short Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="e.g. Everyday consumer product with unique market positioning..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-500 resize-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1 font-bold">Product Illustration URL</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="Image URL (leave blank to auto-generate vector SVG)"
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 shadow-inner"
                  />
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-white/10 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
                {!formImage && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    * If left blank, a high-contrast MORPH vector illustration will be generated automatically.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    morphAudio.playClick();
                    setShowProductModal(false);
                  }}
                  className="btn-chrome-secondary text-xs px-4 py-2"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-chrome-primary text-xs uppercase tracking-wider px-5 py-2"
                >
                  {editingProductId ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET ROUND 2 CONFIRMATION */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chrome-panel border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 text-red-400 mb-4 pb-3 border-b border-white/10">
              <div className="p-2.5 bg-red-950/80 border border-red-700/80 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-mono font-extrabold text-lg text-white uppercase tracking-wider">RESET PRODUCT REVEAL ROUND</h3>
            </div>

            <p className="text-sm text-slate-300 mb-4 font-mono">
              Are you sure you want to reset Round 2? This will:
            </p>

            <ul className="text-xs text-slate-400 font-mono space-y-2 list-disc pl-5 mb-6">
              <li>Lock round status and hide round info from participants</li>
              <li>Clear all teams' puzzle solving timestamps</li>
              <li>Reset all claimed products back to <span className="text-emerald-400 font-bold">AVAILABLE</span></li>
              <li>Clear team product assignments</li>
            </ul>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setShowResetModal(false);
                }}
                className="btn-chrome-secondary text-xs px-4 py-2"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playDanger();
                  resetRound();
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

      {/* MODAL: RESTORE OFFICIAL 20 PRODUCTS CONFIRMATION */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chrome-panel border border-purple-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 text-purple-400 mb-4 pb-3 border-b border-white/10">
              <div className="p-2.5 bg-purple-950/80 border border-purple-700/80 rounded-xl">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-mono font-extrabold text-lg text-white uppercase tracking-wider">RESTORE OFFICIAL 20 PRODUCTS</h3>
            </div>

            <p className="text-sm text-slate-300 mb-4 font-mono leading-relaxed">
              Are you sure you want to restore the official 20 MORPH products (Underwear, Instant Noodles, Pickle Jar, Socks, Toilet Paper, etc.)?
            </p>

            <ul className="text-xs text-slate-400 font-mono space-y-2 list-disc pl-5 mb-6">
              <li>Replaces current product inventory with the official 20 deck</li>
              <li>Sets all 20 products to <span className="text-emerald-400 font-bold">AVAILABLE</span></li>
              <li>Keeps all other rounds intact</li>
            </ul>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setShowRestoreModal(false);
                }}
                className="btn-chrome-secondary text-xs px-4 py-2"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playConfirm();
                  restoreDefaultProducts();
                  setShowRestoreModal(false);
                }}
                className="btn-chrome-primary text-xs uppercase tracking-wider px-5 py-2"
              >
                RESTORE DECK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE ROUND 2 CONFIRMATION */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chrome-panel border border-blue-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 text-blue-400 mb-4 pb-3 border-b border-white/10">
              <div className="p-2.5 bg-blue-950/80 border border-blue-700/80 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-mono font-extrabold text-lg text-white uppercase tracking-wider">COMPLETE PRODUCT REVEAL ROUND</h3>
            </div>

            <p className="text-sm text-slate-300 mb-4 font-mono leading-relaxed">
              This will officially close Round 2. The round status will be marked as <span className="text-blue-400 font-bold">COMPLETED</span>. The puzzle and vault will become read-only.
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
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  morphAudio.playConfirm();
                  completeRound();
                  setShowCompleteModal(false);
                }}
                className="btn-chrome-primary text-xs uppercase tracking-wider px-5 py-2"
              >
                COMPLETE ROUND
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
