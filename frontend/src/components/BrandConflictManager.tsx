import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import {
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Gavel,
  Shield,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

export const BrandConflictManager: React.FC = () => {
  const {
    brands,
    teams,
    brandConflicts,
    createBrandConflict,
    resolveBrandConflictManually,
    deleteBrandConflict,
  } = useEvent();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id || '');
  const [selectedTeam1Id, setSelectedTeam1Id] = useState<string>(teams[0]?.id || '');
  const [selectedTeam2Id, setSelectedTeam2Id] = useState<string>(teams[1]?.id || '');
  const [puzzleText, setPuzzleText] = useState<string>('DECRYPT CIPHER: The brand slogan was first coined in 1988 in Portland, Oregon. Name the 3-word slogan.');
  const [correctAnswer, setCorrectAnswer] = useState<string>('Just Do It');
  const [formError, setFormError] = useState<string>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) {
      setFormError('Please select a contested brand.');
      return;
    }
    if (selectedTeam1Id === selectedTeam2Id) {
      setFormError('Please select two different conflicting teams.');
      return;
    }
    if (!puzzleText.trim()) {
      setFormError('Tiebreaker puzzle riddle is required.');
      return;
    }
    if (!correctAnswer.trim()) {
      setFormError('Correct answer is required.');
      return;
    }

    const res = createBrandConflict(
      selectedBrandId,
      [selectedTeam1Id, selectedTeam2Id],
      puzzleText,
      correctAnswer
    );

    if (res.success) {
      setShowCreateModal(false);
      setFormError('');
    } else {
      setFormError(res.error || 'Failed to create conflict.');
    }
  };

  const activeConflicts = brandConflicts.filter((c) => c.status === 'ACTIVE');
  const resolvedConflicts = brandConflicts.filter((c) => c.status === 'RESOLVED');

  return (
    <div className="border border-neutral-800 bg-neutral-900 p-5 font-mono shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-950/60 border border-red-800/80 text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-100">
              BRAND CONFLICT & TIEBREAKER SYSTEM ({brandConflicts.length})
            </h2>
            <p className="text-xs text-neutral-400">
              Manage contested brand asset claims and launch live decrypt puzzles.
            </p>
          </div>
        </div>

        <button
          id="btn-create-brand-conflict"
          type="button"
          onClick={() => {
            setSelectedBrandId(brands[0]?.id || '');
            setSelectedTeam1Id(teams[0]?.id || '');
            setSelectedTeam2Id(teams[1]?.id || '');
            setFormError('');
            setShowCreateModal(true);
          }}
          className="px-3.5 py-2 bg-red-950/80 border border-red-700 hover:bg-red-900 text-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          INITIATE CONFLICT
        </button>
      </div>

      {/* List of conflicts */}
      {brandConflicts.length === 0 ? (
        <div className="bg-neutral-950 border border-neutral-850 p-6 text-center text-xs text-neutral-400 space-y-1">
          <p className="text-neutral-300 font-semibold">No active brand conflicts.</p>
          <p className="text-neutral-500 text-[11px]">
            When two teams contest ownership of the same brand, initiate a conflict here to deploy a tiebreaker riddle.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {brandConflicts.map((c) => (
            <div
              key={c.id}
              className={`p-4 border text-xs space-y-3 ${
                c.status === 'ACTIVE'
                  ? 'border-red-800/80 bg-red-950/20'
                  : 'border-neutral-800 bg-neutral-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-850 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 font-bold uppercase text-[10px] border ${
                      c.status === 'ACTIVE'
                        ? 'border-red-700 bg-red-950 text-red-300 animate-pulse'
                        : 'border-emerald-800 bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="font-bold text-sm text-neutral-100">
                    Contested Brand: <strong className="text-amber-300">{c.brandName}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                  <span>Teams: {c.conflictingTeamNumbers.join(' vs ')}</span>
                  <span>· {c.createdAt}</span>
                </div>
              </div>

              {/* Puzzle Riddle & Answer Info */}
              <div className="bg-neutral-950/80 border border-neutral-800 p-3 space-y-1.5">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold block">
                  Tiebreaker Puzzle / Riddle:
                </span>
                <p className="text-neutral-200 leading-relaxed font-sans">{c.puzzleText}</p>
                <div className="pt-1 text-[11px] text-neutral-400 flex items-center gap-2">
                  <span className="text-neutral-500">Correct Key:</span>
                  <span className="font-mono text-emerald-400 bg-neutral-900 px-2 py-0.5 border border-neutral-800">
                    {c.correctAnswer}
                  </span>
                </div>
              </div>

              {/* Status or Resolution */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {c.status === 'RESOLVED' ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Won by {c.winnerTeamNumber} at {c.resolvedAt}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-neutral-400">Manual Override:</span>
                    {c.conflictingTeamIds.map((tid, idx) => {
                      const tNum = c.conflictingTeamNumbers[idx];
                      return (
                        <button
                          key={tid}
                          type="button"
                          onClick={() => resolveBrandConflictManually(c.id, tid)}
                          className="px-2.5 py-1 bg-emerald-950 border border-emerald-700 hover:bg-emerald-900 text-emerald-200 text-[11px] font-bold uppercase cursor-pointer"
                        >
                          Award to {tNum}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => deleteBrandConflict(c.id)}
                  className="text-neutral-500 hover:text-red-400 text-xs flex items-center gap-1 cursor-pointer self-end"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Conflict
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE CONFLICT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg p-6 space-y-4 font-mono">
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
                  INITIATE BRAND CONFLICT
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 uppercase font-semibold">
                  Contested Brand:
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-neutral-100 p-2.5 focus:outline-none focus:border-neutral-400"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Lot #{b.lotNumber.toString().padStart(2, '0')}) — Status: {b.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 uppercase font-semibold">
                    Conflicting Team 1:
                  </label>
                  <select
                    value={selectedTeam1Id}
                    onChange={(e) => setSelectedTeam1Id(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-neutral-100 p-2 focus:outline-none focus:border-neutral-400"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamNumber} ({t.teamName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 uppercase font-semibold">
                    Conflicting Team 2:
                  </label>
                  <select
                    value={selectedTeam2Id}
                    onChange={(e) => setSelectedTeam2Id(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-neutral-100 p-2 focus:outline-none focus:border-neutral-400"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamNumber} ({t.teamName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 uppercase font-semibold">
                  Tiebreaker Puzzle / Riddle:
                </label>
                <textarea
                  rows={3}
                  value={puzzleText}
                  onChange={(e) => setPuzzleText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-neutral-100 p-2.5 focus:outline-none focus:border-neutral-400 font-sans"
                  placeholder="Enter riddle or decrypt challenge..."
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 uppercase font-semibold">
                  Correct Answer (Case-Insensitive):
                </label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-neutral-100 p-2.5 focus:outline-none focus:border-neutral-400"
                  placeholder="e.g. Just Do It"
                />
              </div>

              {formError && (
                <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-950 border border-red-700 hover:bg-red-900 text-red-100 font-bold uppercase tracking-wider cursor-pointer"
                >
                  DEPLOY CONFLICT
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2.5 px-4 border border-neutral-700 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
