import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Team } from '../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  Building2,
  Package,
  Shield,
  Lock,
  Layers,
  FileCheck,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

export interface ProductCreationTeamViewProps {
  team: Team;
}

export const ProductCreationTeamView: React.FC<ProductCreationTeamViewProps> = ({ team }) => {
  const { productCreationConfig } = useEvent();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const isRoundActive = productCreationConfig.roundStatus === 'ACTIVE';
  const isRoundCompleted = productCreationConfig.roundStatus === 'COMPLETED';

  const hasBrand = team.brand && team.brand !== '—';
  const hasProduct = team.product && team.product !== '—';

  const deliverablesList: string[] = Array.isArray(productCreationConfig.deliverables)
    ? productCreationConfig.deliverables
    : productCreationConfig.deliverables
    ? productCreationConfig.deliverables.split('\n').map((d) => d.trim()).filter(Boolean)
    : [
        'Final Product Name & Tagline',
        'Problem Statement & Customer Persona',
        'Key Value Proposition & Feature Matrix',
        'Morph Card Strategy Integration Pitch',
        'High-Level Architecture / Prototype Deck'
      ];

  const caseStudyBody = productCreationConfig.caseStudyText || productCreationConfig.caseStudy || '';
  const themeText = productCreationConfig.theme || 'Cross-Domain Brand & Tech Fusion';
  const deadlineText = productCreationConfig.deadline || '08:00 AM (Overnight)';
  const submissionEmail = productCreationConfig.submissionEmail || 'submissions.morph@event.org';
  const submissionInstructions = productCreationConfig.submissionInstructions || 'Email your final presentation slide deck (PDF format) and prototype/demo links to the address above. Ensure the email subject is formatted as: "[MORPH-SUBMISSION] Team Number - Brand Name & Product Name". All members should be CC\'d.';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(submissionEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const preventCopyAction = (e: React.ClipboardEvent | React.MouseEvent) => {
    // Only prevent on case study brief
  };

  return (
    <div id="product-creation-team-view" className="space-y-6 font-mono">
      {/* 1. ROUND STATUS BANNER */}
      {isRoundActive ? (
        <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 uppercase tracking-wider block">
                ROUND 4 LIVE — OVERNIGHT BUILD IN PROGRESS
              </span>
              <p className="text-emerald-400/80 text-[11px] mt-0.5">
                The build sprint is active. Review your assigned assets, consult the brief below, and submit your final work via email before the deadline.
              </p>
            </div>
          </div>
          <div className="bg-emerald-900/60 border border-emerald-700/60 px-3 py-1.5 rounded text-right flex-shrink-0">
            <span className="text-[10px] text-emerald-300 block uppercase">Deadline</span>
            <span className="font-bold text-white text-xs">{deadlineText}</span>
          </div>
        </div>
      ) : isRoundCompleted ? (
        <div className="bg-blue-950/40 border border-blue-800 p-4 rounded-lg flex items-center gap-3 text-xs text-blue-300">
          <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block">
              ROUND 4 CONCLUDED — SUBMISSIONS UNDER EVALUATION
            </span>
            <p className="text-blue-400/80 text-[11px] mt-0.5">
              The overnight build period has ended. The evaluation panel will review all email submissions.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-950/30 border border-amber-800/80 p-4 rounded-lg flex items-center gap-3 text-xs text-amber-300">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block">
              ROUND INFO RELEASED — PRE-BUILD PLANNING
            </span>
            <p className="text-amber-400/80 text-[11px] mt-0.5">
              Read the case study brief, configure your work plan, and take note of the submission instructions below.
            </p>
          </div>
        </div>
      )}

      {/* 2. SUBMISSION EMAIL & INSTRUCTIONS BANNER */}
      <section className="border border-cyan-800/80 bg-cyan-950/20 p-5 rounded-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-800/50 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              OFFICIAL EMAIL SUBMISSION INSTRUCTIONS
            </h3>
          </div>
          <span className="text-[10px] text-cyan-400/80 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded font-mono">
            No File Upload Required
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="md:col-span-1 bg-neutral-950 border border-neutral-800 p-3.5 rounded-lg space-y-2">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
              SUBMISSION EMAIL
            </span>
            <div className="text-xs font-bold text-cyan-300 break-all select-text font-mono">
              {submissionEmail}
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/80 text-cyan-300 text-xs font-bold rounded transition cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">COPIED EMAIL!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY EMAIL ADDRESS</span>
                </>
              )}
            </button>
          </div>

          <div className="md:col-span-2 bg-neutral-950 border border-neutral-800 p-3.5 rounded-lg space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
              SUBMISSION GUIDELINES
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
              {submissionInstructions}
            </p>
          </div>
        </div>
      </section>

      {/* 3. TEAM PAIRING ASSETS RECAP BANNER */}
      <section className="border border-neutral-800 bg-neutral-900 p-5 rounded-lg space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            YOUR CORE ASSETS TO MORPH
          </h3>
          <span className="text-[11px] text-neutral-400">{team.teamNumber}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Won Brand */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded">
            <span className="text-[10px] uppercase text-neutral-500 block mb-1">
              Assigned Brand (Round 1 / Auction)
            </span>
            {hasBrand ? (
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{team.brand}</span>
              </div>
            ) : (
              <span className="text-neutral-500 text-xs italic">Brand pending assignment</span>
            )}
          </div>

          {/* Claimed Product */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded">
            <span className="text-[10px] uppercase text-neutral-500 block mb-1">
              Claimed Product (Round 2 / Vault)
            </span>
            {hasProduct ? (
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>{team.product}</span>
              </div>
            ) : (
              <span className="text-neutral-500 text-xs italic">Product pending vault claim</span>
            )}
          </div>
        </div>

        {/* Morph Cards if any */}
        {(team.cards || []).length > 0 && (
          <div className="bg-neutral-950 border border-neutral-850 p-2.5 rounded text-xs flex flex-wrap items-center gap-2">
            <span className="text-neutral-400 text-[11px] uppercase">Active Morph Cards:</span>
            {(team.cards || []).map((cardName, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-amber-950/60 border border-amber-800/80 text-amber-300 text-[11px] rounded"
              >
                {cardName}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 4. CASE STUDY & DELIVERABLES SPECIFICATION (PROTECTED FROM COPYING) */}
      <section className="border border-neutral-800 bg-neutral-900 p-6 rounded-lg space-y-6 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5">
              {themeText}
            </span>
            <h2 className="text-xl font-bold text-neutral-100 uppercase tracking-wide mt-2">
              {productCreationConfig.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded text-[11px] text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-neutral-300">PROTECTED BRIEF</span>
            <span className="text-neutral-500">(Read-Only)</span>
          </div>
        </div>

        {/* Deliverables Checklist */}
        <div>
          <h3 className="text-xs uppercase text-neutral-400 font-bold tracking-wider mb-2.5">
            REQUIRED DELIVERABLES
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {deliverablesList.map((item, idx) => (
              <div
                key={idx}
                className="bg-neutral-950 border border-neutral-800 p-3 rounded flex items-center gap-2.5 text-xs text-neutral-200"
              >
                <div className="p-1 bg-emerald-950 border border-emerald-800 rounded text-emerald-400 flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full Case Study Text Content (Copying strictly protected) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase text-neutral-400 font-bold tracking-wider flex items-center gap-2">
              <span>CASE STUDY BRIEF & PROBLEM STATEMENT</span>
              <span className="text-[10px] text-amber-400/80 bg-amber-950/40 border border-amber-800/60 px-1.5 py-0.2 rounded font-normal">
                Anti-Copy Protected
              </span>
            </h3>
            {(productCreationConfig.uploadedFileName || productCreationConfig.caseStudyFileName) && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                Source: {productCreationConfig.uploadedFileName || productCreationConfig.caseStudyFileName}
              </span>
            )}
          </div>

          <div
            className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            onCopy={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {caseStudyBody}
          </div>
        </div>
      </section>
    </div>
  );
};

