// ============================================================
// Reach Out v2 - Template Reading Surface (Center Panel)
// Real typography (16-17px, line-height 1.6, max width ~68ch)
// Subject switcher, altOpener switcher, inline tab-navigable slot chips
// Recipient compatibility warning & deadline confirmation gate
// ============================================================

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info,
  CornerDownRight,
  ExternalLink,
} from 'lucide-react';
import {
  ReachOutTemplate,
  ReachOutSlots,
  RecipientTypeId,
} from '../types';
import {
  tokenizeTemplateBody,
  resolveTemplate,
} from '../engine/slotResolver';
import { checkRecipientCompatibility } from '../data';
import { MUTED_CHANNEL_PALETTES } from '../engine/config';

interface TemplateReadingSurfaceProps {
  template: ReachOutTemplate;
  slots: ReachOutSlots;
  selectedSubjectIndex: number;
  onSelectSubjectIndex: (idx: number) => void;
  selectedOpenerIndex: number;
  onSelectOpenerIndex: (idx: number) => void;
  onSelectSlotForEdit: (slotName: string) => void;
  onSwitchTemplate: (templateId: string) => void;
  // Competing deadline confirmation gate
  isRealDeadlineConfirmed: boolean;
  onToggleRealDeadlineConfirmed: (confirmed: boolean) => void;
}

export function TemplateReadingSurface({
  template,
  slots,
  selectedSubjectIndex,
  onSelectSubjectIndex,
  selectedOpenerIndex,
  onSelectOpenerIndex,
  onSelectSlotForEdit,
  onSwitchTemplate,
  isRealDeadlineConfirmed,
  onToggleRealDeadlineConfirmed,
}: TemplateReadingSurfaceProps) {
  const [copiedSubject, setCopiedSubject] = useState(false);

  // Recipient compatibility check
  const activeRecipient = (slots.recipient_type || template.recipientTypes[0]) as RecipientTypeId;
  const compatibility = checkRecipientCompatibility(template, activeRecipient);

  // Deterministically resolved template with active alternates
  const resolved = resolveTemplate(template, slots, {
    selectedOpenerIndex,
    selectedSubjectIndex,
  });

  // Tokenize resolved body into text chunks and slot chips
  const bodyTokens = tokenizeTemplateBody(resolved.body, template.requiredSlots);

  // Palette for channel badge
  const palette = MUTED_CHANNEL_PALETTES[template.channel];

  const handleCopySubject = () => {
    if (!resolved.subject) return;
    navigator.clipboard.writeText(resolved.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  // Check if this is the competing deadline template
  const isCompetingDeadlineTemplate = template.id === 'real-competing-deadline-note';

  return (
    <article
      className="w-full h-full flex flex-col bg-neutral-950 overflow-y-auto"
      aria-label={`Outreach template reader: ${template.name}`}
    >
      {/* Reading Surface Container constrained to ~68ch */}
      <div className="w-full max-w-[68ch] mx-auto px-4 sm:px-8 py-8 flex-1 flex flex-col space-y-6">
        {/* Template Header & Metadata Badges */}
        <header className="border-b border-neutral-800 pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Channel badge */}
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5"
              style={{
                color: palette.text,
                backgroundColor: palette.bg,
                borderColor: palette.border,
              }}
            >
              {palette.label}
            </span>

            {/* Recipient types */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-900 text-neutral-300 border border-neutral-800">
              For: {template.recipientTypes.join(', ')}
            </span>

            {/* Opening move badge */}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-neutral-400 bg-neutral-900/60 border border-neutral-800/80">
              Move: {template.openingMove}
            </span>

            {/* Ask type badge */}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-neutral-400 bg-neutral-900/60 border border-neutral-800/80">
              Ask: {template.askType}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {template.name}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {template.intent}
          </p>
        </header>

        {/* Recipient Compatibility Warning (if incompatible) */}
        {!compatibility.isCompatible && (
          <div
            className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in"
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-300">
                  Recipient Mismatch Detected
                </strong>
                <span className="text-amber-200/90">{compatibility.reason}</span>
              </div>
            </div>

            {compatibility.suggestedTemplate && (
              <button
                type="button"
                onClick={() => onSwitchTemplate(compatibility.suggestedTemplate!.id)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs border border-amber-500/30 transition-colors shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Switch to {compatibility.suggestedTemplate.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Subject Line Switcher (for Email & InMail templates) */}
        {template.subjects && template.subjects.length > 0 && (
          <section className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <span>Subject Line</span>
                <span className="text-neutral-500 font-normal lowercase">
                  ({selectedSubjectIndex + 1} of {template.subjects.length} alternates)
                </span>
              </div>

              {/* Subject alternate switch buttons */}
              <div className="flex items-center gap-1">
                {template.subjects.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSubjectIndex(idx)}
                    className={`w-5 h-5 rounded text-[11px] font-mono flex items-center justify-center transition-colors cursor-pointer ${
                      selectedSubjectIndex === idx
                        ? 'bg-neutral-800 text-blue-400 font-bold border border-blue-500/40'
                        : 'text-neutral-400 hover:text-white bg-neutral-950/60'
                    }`}
                    title={`Use subject variation ${idx + 1}`}
                    aria-label={`Subject variation ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="ml-1 p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy subject line"
                  aria-label="Copy subject line"
                >
                  {copiedSubject ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Active Subject Text */}
            <div className="text-sm font-semibold text-white tracking-wide font-sans select-all">
              {resolved.subject}
            </div>
          </section>
        )}

        {/* Alternate Opener Switcher (if available) */}
        {template.altOpeners && template.altOpeners.length > 1 && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/40 border border-neutral-800/60 rounded-lg text-xs text-neutral-400">
            <span className="text-[11px]">
              Opener variation: <strong className="text-neutral-200">{selectedOpenerIndex + 1}</strong> of {template.altOpeners.length}
            </span>
            <div className="flex items-center gap-1">
              {template.altOpeners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectOpenerIndex(idx)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                    selectedOpenerIndex === idx
                      ? 'bg-neutral-800 text-white font-semibold border border-neutral-700'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Var {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Competing Deadline Confirmation Gate (Template 10.4 safety requirement) */}
        {isCompetingDeadlineTemplate && (
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Anti-Fabrication Safety Gate</span>
            </div>
            <label className="flex items-start gap-2.5 text-xs text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isRealDeadlineConfirmed}
                onChange={(e) => onToggleRealDeadlineConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 text-blue-500 focus:ring-blue-500 bg-neutral-950"
              />
              <span>
                <strong>This is a real deadline.</strong> I verify that I hold an active written offer or official decision deadline with another employer. (HireFlow strictly forbids fabricating competing offers).
              </span>
            </label>
          </div>
        )}

        {/* MAIN READING SURFACE: Real typography, 16-17px, line-height 1.6, preserved line breaks */}
        {isCompetingDeadlineTemplate && !isRealDeadlineConfirmed ? (
          <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center space-y-3">
            <ShieldAlert className="w-8 h-8 text-neutral-500 mx-auto" />
            <div className="text-sm font-semibold text-neutral-300">
              Template Gated Behind Real Deadline Confirmation
            </div>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Please check the box above to confirm you hold a genuine competing offer before accessing this template.
            </p>
          </div>
        ) : (
          <div
            className="relative rounded-2xl bg-neutral-900/60 border border-neutral-800/90 p-5 sm:p-7 transition-all"
            style={{ minHeight: '260px' }}
          >
            {/* Real typography: 16-17px proportional font, line-height 1.6, preserved line breaks */}
            <div
              className="text-[16px] sm:text-[17px] leading-[1.65] font-sans text-neutral-100 whitespace-pre-wrap select-text"
              style={{ wordBreak: 'break-word' }}
            >
              {bodyTokens.map((token, idx) => {
                if (token.type === 'text') {
                  return <span key={idx}>{token.value}</span>;
                }

                // Slot token
                const isUnresolved = token.isUnresolved;
                const slotKey = token.slotName;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSlotForEdit(slotKey)}
                    className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded text-[13px] sm:text-[14px] font-mono align-baseline transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 focus:ring-offset-neutral-950 ${
                      isUnresolved
                        ? 'border border-dashed border-amber-500 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 font-semibold animate-pulse'
                        : 'border border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                    }`}
                    title={
                      isUnresolved
                        ? `Required slot "{{${slotKey}}}" is empty. Click to fill.`
                        : `Slot: {{${slotKey}}}. Click to edit.`
                    }
                    aria-label={`Slot ${slotKey}: ${token.value}`}
                  >
                    <span>{token.value}</span>
                    <CornerDownRight className="w-3 h-3 opacity-60 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Safety Note banner at bottom of reading panel */}
        {template.riskNotes && template.riskNotes.length > 0 && (
          <footer className="text-xs text-neutral-500 space-y-1 pt-2">
            <div className="font-semibold text-neutral-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Grounding & Tone Rules</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-neutral-400 pl-1 text-[11px]">
              {template.riskNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </footer>
        )}
      </div>
    </article>
  );
}
