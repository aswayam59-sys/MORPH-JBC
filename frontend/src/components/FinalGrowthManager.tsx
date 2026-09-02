import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { AdminRoundHeader } from './AdminRoundHeader';
import { UniversalJudgingManager } from './UniversalJudgingManager';
import { morphAudio } from '../utils/audio';
import {
  TrendingUp,
  FileText,
  Clock,
  Send,
  ShieldAlert,
  Edit3,
  Save,
  CheckCircle2,
  Paperclip,
  Upload,
  Layers,
  HelpCircle,
  Award,
  Globe,
  DollarSign,
  Briefcase,
  Target,
  Sparkles,
} from 'lucide-react';

export const FinalGrowthManager: React.FC = () => {
  const {
    finalGrowthConfig,
    releaseFinalGrowthInfo,
    hideFinalGrowthInfo,
    releaseFinalGrowthRound,
    pauseFinalGrowthRound,
    completeFinalGrowthRound,
    resetFinalGrowthRound,
    updateFinalGrowthConfig,
  } = useEvent();

  const [activeTab, setActiveTab] = useState<'CASE' | 'JUDGING'>('CASE');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...finalGrowthConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    morphAudio.playConfirm();
    const updated = {
      ...formData,
      timeLimit: formData.submissionDeadline || formData.timeLimit || '20 Minutes Pitch + 10 Minutes Q&A',
      submissionDeadline: formData.submissionDeadline || formData.timeLimit || '20 Minutes Pitch + 10 Minutes Q&A',
    };
    updateFinalGrowthConfig(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      morphAudio.playClick();
      const fakeUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        attachmentName: file.name,
        attachmentUrl: fakeUrl,
      }));
    }
  };

  return (
    <div id="final-growth-admin-module" className="space-y-6 font-mono">
      {/* 1. MASTER ROUND CONTROLLER */}
      <AdminRoundHeader
        roundNumber={8}
        roundTitle="FINAL GROWTH EXPANSION"
        infoReleased={finalGrowthConfig.infoReleased}
        roundStatus={finalGrowthConfig.roundStatus}
        onReleaseInfo={releaseFinalGrowthInfo}
        onHideInfo={hideFinalGrowthInfo}
        onReleaseRound={releaseFinalGrowthRound}
        onPauseRound={pauseFinalGrowthRound}
        onCompleteRound={completeFinalGrowthRound}
        onResetRound={() => {
          morphAudio.playDanger();
          resetFinalGrowthRound();
        }}
        idPrefix="final-growth"
      />

      {/* STRATEGIC GRAND FINALE NOTICE */}
      <div className="p-5 rounded-3xl chrome-panel border border-purple-500/30 text-purple-200 text-xs flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black uppercase tracking-widest block text-white text-sm">
              GRAND FINALE ROUND — GROWTH & SCALING
            </span>
            <span className="text-slate-300 text-xs leading-relaxed">
              Teams synthesize brand equity, product innovation, celebrity endorsements, crisis resilience, and capital reserves into a multi-year scaling and market expansion masterplan.
            </span>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('CASE');
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'CASE'
              ? 'btn-chrome-primary text-slate-950 shadow-xl'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>1. Growth Case & Strategic Briefing</span>
        </button>

        <button
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('JUDGING');
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'JUDGING'
              ? 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/50 shadow-xl shadow-purple-900/30'
              : 'text-slate-400 hover:text-purple-300 hover:bg-purple-950/20 border border-transparent'
          }`}
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span>2. Grand Finale Judging & Scoring Desk</span>
        </button>
      </div>

      {activeTab === 'JUDGING' ? (
        <UniversalJudgingManager roundId="FINAL_GROWTH" roundName="FINAL GROWTH EXPANSION" />
      ) : (
        <>
          {savedSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-lg animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Final Growth Expansion case study and briefing updated successfully!</span>
            </div>
          )}

          {/* CASE STUDY & BRIEFING CONFIGURATION */}
          <div className="chrome-panel border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-wider">
                    FINAL GROWTH EXPANSION CASE & BRIEFING
                  </h2>
                  <p className="text-xs text-slate-400">
                    Author and customize the comprehensive strategic case dossier and submission parameters.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  if (isEditing) {
                    setFormData({ ...finalGrowthConfig });
                    setIsEditing(false);
                  } else {
                    setFormData({ ...finalGrowthConfig });
                    setIsEditing(true);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                  isEditing
                    ? 'btn-chrome-secondary text-slate-200'
                    : 'btn-chrome-primary text-slate-950 font-black shadow-lg'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Editing' : 'Edit Briefing Content'}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase">Round Name</label>
                    <input
                      type="text"
                      value={formData.roundName}
                      onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase">Submission Deadline / Presentation Slot</label>
                    <input
                      type="text"
                      value={formData.submissionDeadline}
                      onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">Strategic Objective</label>
                  <textarea
                    rows={2}
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-purple-500 outline-none leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Growth Expansion Case Study Dossier (Comprehensive Long Form)
                  </label>
                  <textarea
                    rows={12}
                    value={formData.caseStudyText}
                    onChange={(e) => setFormData({ ...formData, caseStudyText: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-purple-500 outline-none leading-relaxed font-sans"
                    placeholder="Enter the detailed growth expansion scenario, market dynamics, international vectors..."
                  />
                </div>

                {/* ATTACHMENT UPLOAD */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-3 shadow-inner">
                  <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-purple-400" />
                    Attach Strategic Financial Models / Market Data PDF
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <label className="px-4 py-2.5 rounded-xl btn-chrome-secondary text-xs text-slate-300 font-bold flex items-center gap-2 cursor-pointer transition-colors w-full sm:w-auto justify-center">
                      <Upload className="w-4 h-4 text-purple-400" />
                      <span>Choose File (PDF/Spreadsheet)</span>
                      <input type="file" onChange={handleFileUpload} accept=".pdf,.xlsx,.csv,image/*" className="hidden" />
                    </label>
                    {formData.attachmentName && (
                      <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-800/40">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="font-bold">{formData.attachmentName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            morphAudio.playClick();
                            setFormData({ ...formData, attachmentName: undefined, attachmentUrl: undefined });
                          }}
                          className="text-slate-500 hover:text-white ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase">Deliverables</label>
                    <textarea
                      rows={4}
                      value={formData.deliverables}
                      onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-purple-500 outline-none leading-relaxed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase">Submission & Presentation Method</label>
                    <textarea
                      rows={4}
                      value={formData.submissionMethod}
                      onChange={(e) => setFormData({ ...formData, submissionMethod: e.target.value })}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-purple-500 outline-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase">Rules & Evaluation Standards</label>
                    <textarea
                      rows={3}
                      value={formData.rules}
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-purple-500 outline-none leading-relaxed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase">Additional Instructions & Guidelines</label>
                    <textarea
                      rows={3}
                      value={formData.additionalInstructions}
                      onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-purple-500 outline-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      morphAudio.playClick();
                      setFormData({ ...finalGrowthConfig });
                      setIsEditing(false);
                    }}
                    className="btn-chrome-secondary px-5 py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-chrome-primary text-slate-950 px-6 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Final Growth Briefing</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ROUND NAME</div>
                    <p className="text-white font-bold text-sm">{finalGrowthConfig.roundName}</p>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">OBJECTIVE</div>
                    <p className="text-slate-300 leading-relaxed">{finalGrowthConfig.objective}</p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/80 rounded-2xl border border-purple-900/40 space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider">
                    <Globe className="w-4 h-4" />
                    GROWTH EXPANSION CASE DOSSIER
                  </div>
                  <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                    {finalGrowthConfig.caseStudyText}
                  </p>
                  {finalGrowthConfig.attachmentName && (
                    <div className="pt-2 flex items-center gap-2 text-purple-400">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span className="font-bold">{finalGrowthConfig.attachmentName}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                    <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      DELIVERABLES
                    </div>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                      {finalGrowthConfig.deliverables}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                    <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="w-4 h-4" />
                      SUBMISSION METHOD
                    </div>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                      {finalGrowthConfig.submissionMethod}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-400" />
                      TIME / PRESENTATION SCHEDULE
                    </div>
                    <p className="text-white font-bold">{finalGrowthConfig.submissionDeadline}</p>
                  </div>

                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      RULES & SCORING IMPACT
                    </div>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                      {finalGrowthConfig.rules}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

