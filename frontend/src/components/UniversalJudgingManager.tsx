import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { JudgingCriterion, TeamScoreRecord } from '../types';
import { morphAudio } from '../utils/audio';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Coins,
  History,
  TrendingUp,
  ArrowUpDown,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface UniversalJudgingManagerProps {
  roundId: 'PR_CRISIS' | 'FINAL_GROWTH';
  roundName: string;
}

export const UniversalJudgingManager: React.FC<UniversalJudgingManagerProps> = ({
  roundId,
  roundName,
}) => {
  const {
    teams,
    getRoundJudgingState,
    updateJudgingCriteria,
    addJudgingCriterion,
    editJudgingCriterion,
    deleteJudgingCriterion,
    resetJudgingCriteriaToDefault,
    setTeamCriterionScore,
    confirmTeamScore,
    unlockTeamScoreForEdit,
    toggleReleaseRoundScores,
    toggleTeamScoreRelease,
    scoreHistory,
  } = useEvent();

  const judgingState = getRoundJudgingState(roundId);
  const { criteria, teamScores } = judgingState;
  const isScoresReleased = judgingState.isScoresReleased ?? judgingState.scoresReleased ?? false;

  // Local state for criteria editing
  const [isManagingCriteria, setIsManagingCriteria] = useState(false);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [criterionForm, setCriterionForm] = useState<{ name: string; description: string; weightage: number }>({
    name: '',
    description: '',
    weightage: 20,
  });
  const [newCriterionForm, setNewCriterionForm] = useState<{ name: string; description: string; weightage: number }>({
    name: '',
    description: '',
    weightage: 10,
  });
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'DRAFT'>('ALL');
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Calculate total weightage
  const totalWeightage = criteria.reduce((sum, c) => sum + (Number(c.weightage) || 0), 0);
  const isWeightageValid = Math.round(totalWeightage) === 100;

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Handle criteria save
  const handleSaveEditCriterion = (criterionId: string) => {
    if (!criterionForm.name.trim()) {
      setCriteriaError('Criterion name cannot be empty.');
      return;
    }
    if (criterionForm.weightage <= 0 || criterionForm.weightage > 100) {
      setCriteriaError('Weightage must be between 1% and 100%.');
      return;
    }

    morphAudio.playConfirm();
    const res = editJudgingCriterion(roundId, criterionId, {
      name: criterionForm.name.trim(),
      description: criterionForm.description.trim(),
      weightage: Number(criterionForm.weightage),
    });

    if (res.success) {
      setEditingCriterionId(null);
      setCriteriaError(null);
      showToast('Judging criterion updated successfully.');
    } else {
      setCriteriaError(res.error || 'Failed to update criterion.');
    }
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriterionForm.name.trim()) {
      setCriteriaError('Criterion name cannot be empty.');
      return;
    }

    morphAudio.playConfirm();
    const res = addJudgingCriterion(roundId, {
      name: newCriterionForm.name.trim(),
      description: newCriterionForm.description.trim(),
      weightage: Number(newCriterionForm.weightage),
    });

    if (res.success) {
      setIsAddingCriterion(false);
      setNewCriterionForm({ name: '', description: '', weightage: 10 });
      setCriteriaError(null);
      showToast('New judging criterion added.');
    } else {
      setCriteriaError(res.error || 'Failed to add criterion.');
    }
  };

  const handleDeleteCriterion = (criterionId: string) => {
    morphAudio.playDanger();
    if (window.confirm('Are you sure you want to delete this criterion? Team scores will be recalculated.')) {
      const res = deleteJudgingCriterion(roundId, criterionId);
      if (res.success) {
        showToast('Criterion deleted and scores recalculated.');
      } else {
        setCriteriaError(res.error || 'Failed to delete criterion.');
      }
    }
  };

  const handleResetCriteria = () => {
    morphAudio.playDanger();
    if (window.confirm('Reset all judging criteria to default template? Existing unconfirmed scores will be reset.')) {
      resetJudgingCriteriaToDefault(roundId);
      showToast('Judging criteria restored to defaults.');
    }
  };

  const handleScoreChange = (teamId: string, criterionId: string, valueStr: string) => {
    const parsed = valueStr === '' ? 0 : Number(valueStr);
    if (isNaN(parsed)) return;
    const clamped = Math.max(0, Math.min(100, parsed));
    setTeamCriterionScore(roundId, teamId, criterionId, clamped);
  };

  const handleConfirmScore = (teamId: string) => {
    morphAudio.playSuccess();
    const res = confirmTeamScore(roundId, teamId);
    if (res.success) {
      showToast(`Scores locked and ₹${(res.morphCoinsAwarded || res.balanceDelta || 0).toLocaleString()} Morph Coins awarded to Team!`);
    } else {
      showToast(res.error || 'Failed to confirm score.');
    }
  };

  const handleUnlockScore = (teamId: string) => {
    morphAudio.playClick();
    unlockTeamScoreForEdit(roundId, teamId);
    showToast('Score unlocked for adjustment. Vault will update upon confirmation.');
  };

  // Filter and sort teams
  const filteredTeams = teams
    .filter((team) => {
      const scoreRec = teamScores[team.id];
      const isConfirmed = scoreRec?.isConfirmed || false;

      const matchesSearch =
        team.teamNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.member1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.member2.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.member3.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.brand && team.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      if (statusFilter === 'CONFIRMED') return matchesSearch && isConfirmed;
      if (statusFilter === 'DRAFT') return matchesSearch && !isConfirmed;
      return matchesSearch;
    })
    .sort((a, b) => {
      const numA = parseInt(a.teamNumber.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.teamNumber.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

  // Filtered score history for this round
  const roundScoreHistory = scoreHistory.filter((h) => h.roundId === roundId);

  const totalConfirmedTeams = teams.filter((t) => teamScores[t.id]?.isConfirmed).length;
  const totalCoinsAwardedInRound = Object.values(teamScores).reduce((sum: number, rec: TeamScoreRecord) => {
    return sum + (rec.isConfirmed ? rec.morphCoinsEarned : 0);
  }, 0);

  return (
    <div id={`universal-judging-manager-${roundId.toLowerCase()}`} className="space-y-6 font-mono">
      {/* SUCCESS TOAST BANNER */}
      {actionSuccess && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => {
              morphAudio.playClick();
              setActionSuccess(null);
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER CONTROLS & STATS BAR */}
      <div className="chrome-panel border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>{roundName} — JUDGING & SCORING DESK</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 font-bold">
                    UNIVERSAL SCORER
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Formula: <span className="text-purple-300">Weighted Score (0-100)</span> × 100 ={' '}
                  <span className="text-amber-400 font-bold">Morph Coins Earned</span>
                </p>
              </div>
            </div>
          </div>

          {/* QUICK SUMMARY BADGES */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/10 flex items-center gap-2 shadow-inner">
              <span className="text-slate-500">Evaluated:</span>
              <span className="text-purple-400 font-bold">
                {totalConfirmedTeams} / {teams.length} Teams
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center gap-2 shadow-inner">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Total Awarded:</span>
              <span className="text-amber-300 font-bold">₹{totalCoinsAwardedInRound.toLocaleString()}</span>
            </div>
            <button
              onClick={() => {
                morphAudio.playClick();
                setShowHistoryDrawer(!showHistoryDrawer);
              }}
              className="px-3.5 py-2 rounded-xl btn-chrome-secondary text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit History ({roundScoreHistory.length})</span>
            </button>
          </div>
        </div>

        {/* GLOBAL RELEASE SWITCH & CRITERIA TOGGLE */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                morphAudio.playClick();
                setIsManagingCriteria(!isManagingCriteria);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center ${
                isManagingCriteria
                  ? 'btn-chrome-primary text-slate-950 shadow-xl'
                  : 'btn-chrome-secondary text-slate-200'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isManagingCriteria ? 'Hide Criteria Rubric' : 'Customize Judging Criteria Rubric'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                  isWeightageValid ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                }`}
              >
                {totalWeightage}%
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Team Score Visibility:</span>
              <button
                onClick={() => {
                  morphAudio.playClick();
                  toggleReleaseRoundScores(roundId, !isScoresReleased);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer shadow-lg ${
                  isScoresReleased
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-900/30'
                    : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/50'
                }`}
              >
                {isScoresReleased ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>SCORES RELEASED TO TEAMS</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>SCORES HIDDEN FROM TEAMS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CRITERIA RUBRIC EDITOR PANEL */}
      {isManagingCriteria && (
        <div className="chrome-panel border border-purple-500/30 rounded-3xl p-6 space-y-6 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h4 className="text-sm font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>JUDGING CRITERIA & WEIGHTAGES CONFIGURATION</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Every team within this round will be scored against these identical criteria. The sum of all weightages{' '}
                <strong>must equal exactly 100%</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCriteria}
                className="px-3 py-1.5 rounded-xl btn-chrome-secondary text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
                title="Reset to default template"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to Defaults</span>
              </button>
              <button
                onClick={() => {
                  morphAudio.playClick();
                  setIsAddingCriterion(!isAddingCriterion);
                }}
                className="px-3 py-1.5 rounded-xl btn-chrome-primary text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Criterion</span>
              </button>
            </div>
          </div>

          {criteriaError && (
            <div className="p-3 bg-red-950/80 border border-red-700 text-red-300 text-xs rounded-xl flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{criteriaError}</span>
            </div>
          )}

          {/* ADD CRITERION FORM */}
          {isAddingCriterion && (
            <form onSubmit={handleAddCriterion} className="p-4 bg-slate-950/80 border border-purple-500/30 rounded-2xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">New Criterion</span>
                <button
                  type="button"
                  onClick={() => {
                    morphAudio.playClick();
                    setIsAddingCriterion(false);
                  }}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Business Viability"
                    value={newCriterionForm.name}
                    onChange={(e) => setNewCriterionForm({ ...newCriterionForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">Weightage (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newCriterionForm.weightage}
                    onChange={(e) => setNewCriterionForm({ ...newCriterionForm, weightage: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">Description</label>
                  <input
                    type="text"
                    placeholder="Brief evaluation guide"
                    value={newCriterionForm.description}
                    onChange={(e) => setNewCriterionForm({ ...newCriterionForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    morphAudio.playClick();
                    setIsAddingCriterion(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl btn-chrome-secondary text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl btn-chrome-primary text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Save Criterion
                </button>
              </div>
            </form>
          )}

          {/* CRITERIA LIST */}
          <div className="space-y-3">
            {criteria.map((c, idx) => {
              const isEditingThis = editingCriterionId === c.id;

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors hover:border-white/20 shadow-inner"
                >
                  {isEditingThis ? (
                    <div className="w-full space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1 font-bold">NAME</label>
                          <input
                            type="text"
                            value={criterionForm.name}
                            onChange={(e) => setCriterionForm({ ...criterionForm, name: e.target.value })}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1 font-bold">WEIGHTAGE (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={criterionForm.weightage}
                            onChange={(e) => setCriterionForm({ ...criterionForm, weightage: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1 font-bold">DESCRIPTION</label>
                          <input
                            type="text"
                            value={criterionForm.description}
                            onChange={(e) => setCriterionForm({ ...criterionForm, description: e.target.value })}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            morphAudio.playClick();
                            setEditingCriterionId(null);
                          }}
                          className="px-3.5 py-1.5 rounded-xl btn-chrome-secondary text-slate-300 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEditCriterion(c.id)}
                          className="px-3.5 py-1.5 rounded-xl btn-chrome-primary text-slate-950 text-xs font-bold"
                        >
                          Apply Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-700 text-purple-300 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{c.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-lg bg-purple-950/80 text-purple-300 font-bold border border-purple-800/60">
                              {c.weightage}% weight
                            </span>
                          </div>
                          {c.description && <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            morphAudio.playClick();
                            setEditingCriterionId(c.id);
                            setCriterionForm({
                              name: c.name,
                              description: c.description,
                              weightage: c.weightage,
                            });
                          }}
                          className="p-2 rounded-xl btn-chrome-secondary text-slate-300 transition-colors cursor-pointer"
                          title="Edit Criterion"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCriterion(c.id)}
                          className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors cursor-pointer"
                          title="Delete Criterion"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* TOTAL WEIGHTAGE VALIDATION STATUS */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
              isWeightageValid
                ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                : 'bg-red-950/60 border-red-700 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isWeightageValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <span>
                {isWeightageValid
                  ? 'Total Weightage sums to exactly 100%. Rubric is mathematically calibrated.'
                  : `Warning: Total Weightage is ${totalWeightage}%. Must adjust criteria weightages to sum to 100%.`}
              </span>
            </div>
            <span className="text-sm font-black">{totalWeightage}% / 100%</span>
          </div>
        </div>
      )}

      {/* AUDIT LOG & REVISION HISTORY DRAWER */}
      {showHistoryDrawer && (
        <div className="chrome-panel border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                SCORE TRANSACTION & AUDIT LEDGER ({roundScoreHistory.length})
              </span>
            </div>
            <button
              onClick={() => {
                morphAudio.playClick();
                setShowHistoryDrawer(false);
              }}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>

          {roundScoreHistory.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No score awards or revisions recorded yet.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {roundScoreHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs flex items-center justify-between shadow-inner"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Team {item.teamNumber}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                        item.type === 'ROUND_RESET'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : item.type === 'SCORE_EDITED'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {item.type || 'SCORE_AWARDED'}
                    </span>
                    <span className="text-slate-400 text-[11px]">{item.adminNote || item.note}</span>
                  </div>
                  <div className="text-right flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`font-black ${
                        (item.deltaCoins ?? item.coinsDelta ?? 0) >= 0 ? 'text-amber-400' : 'text-red-400'
                      }`}
                    >
                      {(item.deltaCoins ?? item.coinsDelta ?? 0) >= 0 ? '+' : ''}₹
                      {(item.deltaCoins ?? item.coinsDelta ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 chrome-panel p-3 rounded-2xl border border-white/10 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by team number, name, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none font-semibold"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end text-xs">
          <span className="text-slate-500 mr-1 text-[11px]">Filter:</span>
          {(['ALL', 'CONFIRMED', 'DRAFT'] as const).map((filterOpt) => (
            <button
              key={filterOpt}
              onClick={() => {
                morphAudio.playClick();
                setStatusFilter(filterOpt);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === filterOpt
                  ? 'btn-chrome-primary text-slate-950 shadow-md'
                  : 'btn-chrome-secondary text-slate-400 hover:text-white'
              }`}
            >
              {filterOpt}
            </button>
          ))}
        </div>
      </div>

      {/* TEAM SCORING MATRIX & EVALUATION CARDS */}
      <div className="space-y-4">
        {filteredTeams.length === 0 ? (
          <div className="p-8 text-center chrome-panel border border-white/10 rounded-3xl text-slate-500 text-xs">
            No teams match the current search or status filter.
          </div>
        ) : (
          filteredTeams.map((team) => {
            const scoreRec = teamScores[team.id];
            const isConfirmed = scoreRec?.isConfirmed || false;
            const currentScores = scoreRec?.scores || {};
            const weightedScore = scoreRec?.weightedScore || 0;
            const coinsEarned = scoreRec?.morphCoinsEarned || 0;
            const isTeamReleased = scoreRec?.isReleased ?? isScoresReleased;
            const previouslyAwarded = scoreRec?.lastAwardedCoins || 0;
            const editDelta = coinsEarned - previouslyAwarded;

            return (
              <div
                key={team.id}
                id={`team-judging-card-${team.id}`}
                className={`chrome-panel border rounded-3xl p-5 md:p-6 space-y-4 shadow-2xl transition-all ${
                  isConfirmed
                    ? 'border-emerald-900/60 bg-gradient-to-b from-slate-900 to-emerald-950/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* TEAM HEADER ROW */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-slate-950/90 border border-white/10 text-amber-300 font-black text-xs shadow-inner">
                      {team.teamNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">{team.teamName}</h4>
                        {team.brand && team.brand !== '—' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                            {team.brand}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Current Vault:</span>
                        <span className="text-amber-400 font-bold">₹{team.morphCoins.toLocaleString()} coins</span>
                        {scoreRec?.confirmedAt && (
                          <span className="text-slate-500">
                            • Confirmed: {new Date(scoreRec.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT SIDE BADGES & INDIVIDUAL VISIBILITY TOGGLE */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`text-xs px-3 py-1 rounded-xl font-black flex items-center gap-1.5 ${
                        isConfirmed
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700 shadow-sm'
                          : 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>CONFIRMED & AWARDED</span>
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>DRAFT / UNSAVED</span>
                        </>
                      )}
                    </span>

                    <button
                      onClick={() => {
                        morphAudio.playClick();
                        toggleTeamScoreRelease(roundId, team.id, !isTeamReleased);
                      }}
                      className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                        isTeamReleased
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : 'btn-chrome-secondary text-slate-400 hover:text-white'
                      }`}
                      title={isTeamReleased ? 'Score visible to team' : 'Score hidden from team'}
                    >
                      {isTeamReleased ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* CRITERIA SCORE INPUTS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {criteria.map((c) => {
                    const currentScore = currentScores[c.id] ?? '';

                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-2xl border flex flex-col justify-between shadow-inner ${
                          isConfirmed ? 'bg-slate-950/60 border-white/5' : 'bg-slate-950/80 border-white/10'
                        }`}
                      >
                        <div className="mb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 truncate pr-1" title={c.name}>
                              {c.name}
                            </span>
                            <span className="text-[10px] text-purple-400 font-bold flex-shrink-0">{c.weightage}%</span>
                          </div>
                          {c.description && (
                            <p className="text-[10px] text-slate-500 truncate" title={c.description}>
                              {c.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            disabled={isConfirmed}
                            placeholder="0 - 100"
                            value={currentScore}
                            onChange={(e) => handleScoreChange(team.id, c.id, e.target.value)}
                            className={`w-full text-center font-black rounded-xl py-2 text-sm outline-none border transition-colors ${
                              isConfirmed
                                ? 'bg-slate-900/60 border-white/5 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-900 border-white/10 text-white focus:border-purple-500 focus:bg-slate-800'
                            }`}
                          />
                          <span className="text-[10px] text-slate-500 font-bold">/100</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SUMMARY & ACTION BUTTONS FOOTER */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* CALCULATED VALUES */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Weighted Score:</span>
                      <span className="text-base font-black text-purple-300">
                        {weightedScore.toFixed(1)}
                        <span className="text-xs text-slate-500 font-normal"> / 100</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-700/50 shadow-inner">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-400">Morph Coins:</span>
                      <span className="text-sm font-black text-amber-300">
                        ₹{coinsEarned.toLocaleString()}
                      </span>
                    </div>

                    {isConfirmed && previouslyAwarded !== coinsEarned && (
                      <span className="text-[11px] text-blue-400 font-bold">
                        Pending Delta: {editDelta >= 0 ? '+' : ''}₹{editDelta.toLocaleString()} coins
                      </span>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isConfirmed ? (
                      <button
                        onClick={() => handleUnlockScore(team.id)}
                        className="px-4 py-2 rounded-xl btn-chrome-secondary text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unlock for Edit</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConfirmScore(team.id)}
                        className="px-5 py-2 rounded-xl btn-chrome-primary text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{previouslyAwarded > 0 ? 'Update & Confirm Score' : 'Confirm & Award Score'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
