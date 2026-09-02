import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { AdminRoundHeader } from './AdminRoundHeader';
import { morphAudio } from '../utils/audio';
import {
  FileText,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  Eye,
  Edit3,
  Building2,
  Package,
  Mail,
  Send,
  AlertCircle,
} from 'lucide-react';

export const ProductCreationManager: React.FC = () => {
  const {
    teams,
    productCreationConfig,
    releaseProductCreationInfo,
    hideProductCreationInfo,
    releaseProductCreationRound,
    pauseProductCreationRound,
    completeProductCreationRound,
    resetProductCreationRound,
    updateProductCreationConfig,
  } = useEvent();

  const [activeTab, setActiveTab] = useState<'case-study' | 'team-matrix' | 'preview'>('case-study');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Form State initialized from config
  const [title, setTitle] = useState(productCreationConfig.title || '');
  const [theme, setTheme] = useState(productCreationConfig.theme || '');
  const [deadline, setDeadline] = useState(productCreationConfig.deadline || '');
  const [submissionEmail, setSubmissionEmail] = useState(productCreationConfig.submissionEmail || 'submissions.morph@event.org');
  const [submissionInstructions, setSubmissionInstructions] = useState(
    productCreationConfig.submissionInstructions ||
      'Email your final presentation slide deck (PDF format) and prototype/demo links to the address above. Ensure the email subject is formatted as: "[MORPH-SUBMISSION] Team Number - Brand Name & Product Name". All members should be CC\'d.'
  );
  const [deliverables, setDeliverables] = useState(
    Array.isArray(productCreationConfig.deliverables)
      ? productCreationConfig.deliverables.join('\n')
      : (productCreationConfig.deliverables || '')
  );
  const [caseStudyText, setCaseStudyText] = useState(productCreationConfig.caseStudyText || productCreationConfig.caseStudy || '');

  const handleSaveConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    morphAudio.playClick();
    const deliverablesList = deliverables
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    updateProductCreationConfig({
      title,
      theme,
      deadline,
      submissionEmail,
      submissionInstructions,
      deliverables: deliverablesList,
      caseStudyText,
    });

    morphAudio.playSuccess();
    setFeedback({
      message: 'Product Creation configuration and submission instructions saved successfully!',
      isError: false,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const insertSnippet = (snippet: string) => {
    morphAudio.playClick();
    setCaseStudyText((prev) => prev + '\n\n' + snippet);
  };

  const isInfoReleased = productCreationConfig.infoReleased;
  const isRoundActive = productCreationConfig.roundStatus === 'ACTIVE';
  const isRoundCompleted = productCreationConfig.roundStatus === 'COMPLETED';

  // Count teams ready (with brand + product)
  const teamsWithBrandAndProduct = teams.filter(
    (t) => t.brand && t.brand !== '—' && t.product && t.product !== '—'
  ).length;

  return (
    <div id="product-creation-manager" className="space-y-6 font-mono">
      {/* 1. MASTER ROUND CONTROL HEADER */}
      <AdminRoundHeader
        roundBadge="ROUND 4"
        roundName="PRODUCT CREATION / OVERNIGHT BUILD"
        description="Release the overnight build case study to participants. Manage project briefs, track assigned brand/product pairings, and control round lifecycle."
        infoReleased={isInfoReleased}
        roundStatus={productCreationConfig.roundStatus}
        onReleaseInfo={releaseProductCreationInfo}
        onHideInfo={hideProductCreationInfo}
        onReleaseRound={releaseProductCreationRound}
        onPauseRound={pauseProductCreationRound}
        onCompleteRound={completeProductCreationRound}
        onReset={resetProductCreationRound}
        idPrefix="product-creation"
      >
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Paired Teams</div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-1">
              {teamsWithBrandAndProduct} <span className="text-xs font-normal text-slate-500">/ 15 Ready</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Build Phase</div>
            <div className="text-xl font-black font-mono text-white mt-1">
              {isRoundActive ? 'ACTIVE BUILD' : isRoundCompleted ? 'SUBMISSIONS' : 'LOCKED'}
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Case Study</div>
            <div className="text-xl font-black font-mono text-amber-300 mt-1 truncate">
              {productCreationConfig.uploadedFileName || productCreationConfig.caseStudyFileName ? 'FILE LOADED' : 'TEXT READY'}
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Submission Deadline</div>
            <div className="text-xl font-black font-mono text-white mt-1 truncate text-xs">
              {deadline || '08:00 AM TOMORROW'}
            </div>
          </div>
        </div>
      </AdminRoundHeader>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div
          id="product-creation-feedback"
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border shadow-lg ${
            feedback.isError
              ? 'bg-red-950/80 border-red-800 text-red-300'
              : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* SUB NAVIGATION TABS */}
      <div className="chrome-panel p-1.5 flex gap-1.5 overflow-x-auto text-xs font-bold border border-white/10 shadow-lg no-scrollbar">
        <button
          id="tab-pc-case-study"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('case-study');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeTab === 'case-study'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Edit3 className="w-4 h-4 text-emerald-400" />
          <span>CASE STUDY & BRIEF EDITOR</span>
        </button>
        <button
          id="tab-pc-team-matrix"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('team-matrix');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeTab === 'team-matrix'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>TEAM PAIRING MATRIX ({teams.length})</span>
        </button>
        <button
          id="tab-pc-preview"
          type="button"
          onClick={() => {
            morphAudio.playClick();
            setActiveTab('preview');
          }}
          className={`py-2.5 px-4 rounded-lg uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 text-xs ${
            activeTab === 'preview'
              ? 'btn-chrome-primary text-slate-950 font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Eye className="w-4 h-4 text-blue-400" />
          <span>PARTICIPANT VIEW PREVIEW</span>
        </button>
      </div>

      {/* TAB 1: CASE STUDY & BRIEF EDITOR */}
      {activeTab === 'case-study' && (
        <form onSubmit={handleSaveConfig} className="chrome-panel p-6 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                OVERNIGHT BUILD SPECIFICATION
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Participants will see these instructions once "Release Info" is activated.
              </p>
            </div>
            <button
              id="btn-save-case-study-top"
              type="submit"
              className="btn-chrome-primary text-xs uppercase tracking-wider px-5 py-2.5 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              SAVE & BROADCAST
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Challenge Title</label>
              <input
                id="input-pc-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono shadow-inner"
                placeholder="e.g. THE OVERNIGHT MORPH HACK"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Theme / Category</label>
              <input
                id="input-pc-theme"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono shadow-inner"
                placeholder="e.g. Cross-Industry Brand Innovation"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Submission Deadline</label>
              <input
                id="input-pc-deadline"
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono shadow-inner"
                placeholder="e.g. 08:00 AM (Overnight 12-Hour Sprint)"
                required
              />
            </div>
          </div>

          {/* Email Submission Parameters Section (No File Upload) */}
          <div className="border border-white/10 bg-slate-950/80 p-5 rounded-xl space-y-4 shadow-inner">
            <div className="border-b border-white/10 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                EMAIL SUBMISSION SETTINGS (NO FILE UPLOAD)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Teams will submit all presentations, prototypes, and reports to this official email address.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  SUBMISSION EMAIL
                </label>
                <input
                  id="input-pc-submission-email"
                  type="email"
                  value={submissionEmail}
                  onChange={(e) => setSubmissionEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 shadow-inner font-bold"
                  placeholder="e.g. submissions.morph@event.org"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  SUBMISSION INSTRUCTIONS
                </label>
                <textarea
                  id="input-pc-submission-instructions"
                  rows={3}
                  value={submissionInstructions}
                  onChange={(e) => setSubmissionInstructions(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 leading-relaxed shadow-inner"
                  placeholder="Describe submission guidelines, subject format, deliverable attachments, CC requirements..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Deliverables Input */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-1">
              Required Deliverables (One per line)
            </label>
            <textarea
              id="input-pc-deliverables"
              rows={3}
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono shadow-inner"
              placeholder="Interactive Demo Prototype&#10;3-Minute Pitch Video&#10;Architecture & Tech Stack Summary"
            />
          </div>

          {/* Case Study Full Text Editor */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-xs uppercase font-bold text-slate-400">
                Case Study Document / Problem Statement (Markdown & Text)
              </label>
              {/* Quick Template Inserts */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-slate-500 font-bold">Insert:</span>
                <button
                  type="button"
                  onClick={() => insertSnippet('### 🎯 Problem Statement\nDefine the friction point your morph solution addresses.')}
                  className="btn-chrome-secondary text-[10px] px-2.5 py-1"
                >
                  + Problem
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('### 🚀 Solution Guidelines\n1. Target Audience\n2. Key Features\n3. Value Proposition')}
                  className="btn-chrome-secondary text-[10px] px-2.5 py-1"
                >
                  + Guidelines
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('### 📊 Judging Criteria\n- Innovation & Brand Alignment: 40%\n- Functional Execution: 30%\n- UI/UX Polish: 30%')}
                  className="btn-chrome-secondary text-[10px] px-2.5 py-1"
                >
                  + Rubric
                </button>
              </div>
            </div>
            <textarea
              id="input-pc-casestudy"
              rows={12}
              value={caseStudyText}
              onChange={(e) => setCaseStudyText(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono leading-relaxed shadow-inner"
              placeholder="Paste or write the full case study brief here..."
              required
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-white/10">
            <button
              id="btn-save-case-study-bottom"
              type="submit"
              className="btn-chrome-primary text-xs uppercase tracking-wider px-6 py-3 shadow-xl"
            >
              <Save className="w-4 h-4" />
              SAVE & BROADCAST BRIEF
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: TEAM PAIRING MATRIX */}
      {activeTab === 'team-matrix' && (
        <div className="chrome-panel p-6 space-y-4 shadow-2xl">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                TEAM ASSET & PAIRING MATRIX
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of each team's won Brand (Round 1/Auction) and selected Product (Round 2/Vault).
              </p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 border border-white/10 rounded-xl font-bold font-mono">
              Total Teams: {teams.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3 border-r border-white/5">Team</th>
                  <th className="p-3 border-r border-white/5">Acquired Brand</th>
                  <th className="p-3 border-r border-white/5">Claimed Product</th>
                  <th className="p-3 border-r border-white/5">Active Morph Cards</th>
                  <th className="p-3">Build Ready Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/20 font-mono">
                {teams.map((t) => {
                  const hasBrand = t.brand && t.brand !== '—';
                  const hasProduct = t.product && t.product !== '—';
                  const isReady = hasBrand && hasProduct;

                  return (
                    <tr key={t.id} className="hover:bg-white/5 transition">
                      <td className="p-3 border-r border-white/5 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{t.teamNumber}</span>
                          <span className="text-slate-400 font-normal truncate max-w-[120px]">
                            {t.teamName !== t.teamNumber ? `(${t.teamName})` : ''}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 border-r border-white/5">
                        {hasBrand ? (
                          <div className="flex items-center gap-2 text-amber-300 font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t.brand}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">No Brand Assigned</span>
                        )}
                      </td>

                      <td className="p-3 border-r border-white/5">
                        {hasProduct ? (
                          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                            <Package className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t.product}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">No Product Claimed</span>
                        )}
                      </td>

                      <td className="p-3 border-r border-white/5">
                        {(t.cards || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {(t.cards || []).map((cName, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-amber-950/80 border border-amber-800/80 text-amber-300 text-[10px] rounded font-bold"
                              >
                                {cName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">None</span>
                        )}
                      </td>

                      <td className="p-3">
                        {isReady ? (
                          <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 text-[10px] font-bold uppercase rounded">
                            ✓ READY TO BUILD
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-950/80 text-amber-400 border border-amber-700/80 text-[10px] font-bold uppercase rounded">
                            PENDING ASSETS
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
      )}

      {/* TAB 3: PARTICIPANT VIEW PREVIEW */}
      {activeTab === 'preview' && (
        <div className="chrome-panel p-6 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                PREVIEW: WHAT PARTICIPANTS SEE
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current broadcast preview rendered in real-time.
              </p>
            </div>
            <span
              className={`text-xs px-3 py-1 font-bold uppercase rounded-lg border ${
                isInfoReleased
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-red-950/80 text-red-400 border-red-800/80'
              }`}
            >
              {isInfoReleased ? 'Broadcast: Live' : 'Broadcast: Hidden'}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-white/10 p-6 rounded-2xl space-y-6 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-700/80 px-2.5 py-0.5 rounded">
                  {theme || 'PRODUCT CREATION CHALLENGE'}
                </span>
                <h1 className="text-xl font-black text-white mt-2 uppercase tracking-wide">
                  {title || 'PRODUCT CREATION / OVERNIGHT BUILD'}
                </h1>
              </div>
              <div className="bg-slate-900 border border-white/10 p-3.5 rounded-xl text-right shadow-inner">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Submission Deadline</span>
                <span className="text-sm font-black text-amber-300">{deadline || '08:00 AM'}</span>
              </div>
            </div>

            {/* Email Submission Box Preview */}
            <div className="bg-slate-900 border border-cyan-500/40 p-4.5 rounded-xl space-y-2 shadow-lg">
              <span className="text-xs uppercase text-cyan-400 font-extrabold flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                OFFICIAL SUBMISSION VIA EMAIL
              </span>
              <div className="flex items-center gap-2 bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs font-mono text-cyan-300 shadow-inner">
                <span className="text-slate-500 font-bold">To:</span>
                <span className="font-bold">{submissionEmail}</span>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed mt-2">
                {submissionInstructions}
              </p>
            </div>

            {/* Deliverables Pills */}
            <div>
              <span className="text-xs uppercase text-slate-400 block mb-2 font-bold">
                Key Deliverables:
              </span>
              <div className="flex flex-wrap gap-2">
                {deliverables
                  .split('\n')
                  .map((d) => d.trim())
                  .filter(Boolean)
                  .map((deliv, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-slate-900 border border-white/10 text-xs text-slate-200 rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {deliv}
                    </span>
                  ))}
              </div>
            </div>

            {/* Brief Content Preview */}
            <div className="border-t border-white/10 pt-4">
              <span className="text-xs uppercase text-slate-400 block mb-2 font-bold">
                Case Study Brief:
              </span>
              <div className="bg-slate-900/60 p-4 border border-white/10 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                {caseStudyText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
