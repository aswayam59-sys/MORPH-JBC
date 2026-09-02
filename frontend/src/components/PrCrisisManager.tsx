import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { morphAudio } from '../utils/audio';
import { AdminRoundHeader } from './AdminRoundHeader';
import { UniversalJudgingManager } from './UniversalJudgingManager';
import {
  AlertTriangle,
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
  Users,
  Award,
} from 'lucide-react';

export const PrCrisisManager: React.FC = () => {
  const {
    prCrisisConfig,
    releasePrCrisisInfo,
    hidePrCrisisInfo,
    releasePrCrisisRound,
    pausePrCrisisRound,
    completePrCrisisRound,
    resetPrCrisisRound,
    updatePrCrisisConfig,
  } = useEvent();

  const [activeTab, setActiveTab] = useState<'BRIEFING' | 'JUDGING'>('BRIEFING');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...prCrisisConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    morphAudio.playSuccess();
    updatePrCrisisConfig(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      morphAudio.playConfirm();
      // Simulate file upload with file name and object URL or placeholder
      const fakeUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        attachmentName: file.name,
        attachmentUrl: fakeUrl,
      }));
    }
  };

  return (
    <div id="pr-crisis-admin-module" className="space-y-6 font-mono">
      {/* 1. MASTER ROUND CONTROLLER */}
      <AdminRoundHeader
        roundNumber={6}
        roundTitle="PR CRISIS BRIEFING"
        infoReleased={prCrisisConfig.infoReleased}
        roundStatus={prCrisisConfig.roundStatus}
        onReleaseInfo={releasePrCrisisInfo}
        onHideInfo={hidePrCrisisInfo}
        onReleaseRound={releasePrCrisisRound}
        onPauseRound={pausePrCrisisRound}
        onCompleteRound={completePrCrisisRound}
        onResetRound={resetPrCrisisRound}
        idPrefix="pr-crisis"
      />

      {/* TEAM SPLIT NOTICE */}
      <div className="p-4 rounded-2xl chrome-panel border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-black uppercase tracking-wide block">TEAM ROSTER SPLIT MANDATE</span>
            <span className="text-slate-300">
              During this round, teams are split: <strong>2 Members</strong> address PR Crisis & Presentation, and <strong>1 Member</strong> operates the MORPH Market Investment Desk.
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('BRIEFING');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'BRIEFING'
              ? 'btn-chrome-primary text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4 text-red-400" />
          <span>1. Crisis Case & Briefing</span>
        </button>

        <button
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('JUDGING');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'JUDGING'
              ? 'bg-purple-600 text-white border border-purple-500 shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-purple-300 hover:bg-purple-950/20 border border-transparent'
          }`}
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span>2. Universal Judging & Scoring Desk</span>
        </button>
      </div>

      {activeTab === 'JUDGING' ? (
        <UniversalJudgingManager roundId="PR_CRISIS" roundName="PR CRISIS" />
      ) : (
        <>

      {savedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>PR Crisis configuration and case study updated successfully!</span>
        </div>
      )}

      {/* 2. CASE STUDY & BRIEFING CONFIGURATION */}
      <div className="chrome-panel border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                PR CRISIS CASE & BRIEFING CONTENT
              </h2>
              <p className="text-xs text-slate-400">
                Author and customize all text fields seen by participants on their PR Crisis screen.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              morphAudio.playClick();
              if (isEditing) {
                setFormData({ ...prCrisisConfig });
                setIsEditing(false);
              } else {
                setFormData({ ...prCrisisConfig });
                setIsEditing(true);
              }
            }}
            className="btn-chrome-secondary text-xs px-4 py-2 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>{isEditing ? 'CANCEL EDITING' : 'EDIT CASE CONTENT'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Round Display Name
                </label>
                <input
                  type="text"
                  value={formData.roundName}
                  onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Submission Deadline / Time
                </label>
                <input
                  type="text"
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. 40 Minutes from Round Activation"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Round Objective
              </label>
              <textarea
                rows={2}
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-red-400 uppercase mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                PR Crisis / Case Situation (Long-form Text)
              </label>
              <textarea
                rows={6}
                value={formData.crisisCaseText}
                onChange={(e) => setFormData({ ...formData, crisisCaseText: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-red-400 focus:outline-none font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Required Deliverables
                </label>
                <textarea
                  rows={4}
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Submission Method
                </label>
                <textarea
                  rows={4}
                  value={formData.submissionMethod}
                  onChange={(e) => setFormData({ ...formData, submissionMethod: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Round Rules & Constraints
                </label>
                <textarea
                  rows={3}
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Additional Instructions
                </label>
                <textarea
                  rows={3}
                  value={formData.additionalInstructions}
                  onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Optional File/Image/PDF upload */}
            <div className="p-4 bg-slate-950/80 border border-white/10 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">
                Attach Case Document (Optional PDF / Image)
              </label>
              <div className="flex items-center gap-3">
                <label className="btn-chrome-secondary text-xs px-4 py-2 flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>UPLOAD FILE</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {formData.attachmentName ? (
                  <div className="flex items-center gap-2 text-xs text-amber-300">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{formData.attachmentName}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attachmentName: '', attachmentUrl: '' })}
                      className="text-red-400 hover:underline text-[10px] ml-2"
                    >
                      [Remove]
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">No document attached</span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  morphAudio.playClick();
                  setIsEditing(false);
                }}
                className="btn-chrome-secondary text-xs px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-chrome-primary text-slate-950 font-black text-xs px-6 py-2.5 flex items-center gap-2 shadow-xl"
              >
                <Save className="w-4 h-4" />
                <span>SAVE CHANGES</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 text-xs">
            {/* PR Crisis / Case View */}
            <div className="p-5 bg-red-950/30 border border-red-500/40 rounded-2xl space-y-2 shadow-inner">
              <div className="text-[11px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                CASE / SITUATION
              </div>
              <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                {prCrisisConfig.crisisCaseText}
              </p>
              {prCrisisConfig.attachmentName && (
                <div className="pt-2 flex items-center gap-2 text-amber-400">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="font-bold">{prCrisisConfig.attachmentName}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-950/70 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  DELIVERABLES
                </div>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {prCrisisConfig.deliverables}
                </p>
              </div>

              <div className="p-5 bg-slate-950/70 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  SUBMISSION METHOD
                </div>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {prCrisisConfig.submissionMethod}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-950/70 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  TIME / DEADLINE
                </div>
                <p className="text-white font-bold">{prCrisisConfig.submissionDeadline}</p>
              </div>

              <div className="p-5 bg-slate-950/70 rounded-2xl border border-white/10 space-y-1.5 shadow-inner">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  RULES
                </div>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {prCrisisConfig.rules}
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
