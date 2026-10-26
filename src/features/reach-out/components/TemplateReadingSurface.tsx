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
      className="w-full h-full flex flex-col bg-black text-white overflow-y-auto"
      aria-label={`Outreach template reader: ${template.name}`}
    >
      {/* Reading Surface Container constrained to ~68ch */}
      <div className="w-full max-w-[68ch] mx-auto px-4 sm:px-8 py-8 flex-1 flex flex-col space-y-6">
        {/* Template Header & Metadata Badges */}
        <header className="border-b border-charcoal pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Channel badge */}
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold border border-charcoal bg-black text-volt inline-flex items-center gap-1.5">
              {palette.label}
            </span>

            {/* Recipient types */}
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-black text-silver border border-charcoal">
              For: {template.recipientTypes.join(', ')}
            </span>

            {/* Opening move badge */}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-silver bg-black border border-charcoal">
              Move: {template.openingMove}
            </span>

            {/* Ask type badge */}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-silver bg-black border border-charcoal">
              Ask: {template.askType}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {template.name}
          </h1>

          <p className="text-xs sm:text-sm text-silver leading-relaxed">
            {template.intent}
          </p>
        </header>

        {/* Recipient Compatibility Warning (if incompatible) */}
        {!compatibility.isCompatible && (
          <div
            className="p-3.5 rounded-lg bg-black border border-pale-yellow/40 text-pale-yellow text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in"
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-pale-yellow shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-white font-mono uppercase">
                  Recipient Mismatch Detected
                </strong>
                <span className="text-silver">{compatibility.reason}</span>
              </div>
            </div>

            {compatibility.suggestedTemplate && (
              <button
                type="button"
                onClick={() => onSwitchTemplate(compatibility.suggestedTemplate!.id)}
                className="px-3 py-1.5 rounded bg-black hover:border-volt text-volt font-mono font-semibold text-xs border border-charcoal transition-colors shrink-0 inline-flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <span>Switch to {compatibility.suggestedTemplate.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Subject Line Switcher (for Email & InMail templates) */}
        {template.subjects && template.subjects.length > 0 && (
          <section className="bg-[#141414] border border-charcoal rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-silver flex items-center gap-1.5">
                <span>Subject Line</span>
                <span className="text-silver/60 font-normal lowercase">
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
                        ? 'bg-black text-volt font-bold border border-volt'
                        : 'text-silver hover:text-white bg-black/60 border border-charcoal'
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
                  className="ml-1 p-1 rounded hover:bg-black text-silver hover:text-volt transition-colors cursor-pointer"
                  title="Copy subject line"
                  aria-label="Copy subject line"
                >
                  {copiedSubject ? (
                    <Check className="w-3.5 h-3.5 text-volt" />
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
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#141414] border border-charcoal rounded text-xs text-silver">
            <span className="text-[11px] font-mono">
              Opener variation: <strong className="text-white">{selectedOpenerIndex + 1}</strong> of {template.altOpeners.length}
            </span>
            <div className="flex items-center gap-1">
              {template.altOpeners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectOpenerIndex(idx)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    selectedOpenerIndex === idx
                      ? 'bg-black text-volt font-semibold border border-volt'
                      : 'text-silver hover:text-white'
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
          <div className="p-4 rounded-lg bg-[#141414] border border-charcoal space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
              <ShieldAlert className="w-4 h-4 text-pale-yellow" />
              <span>Anti-Fabrication Safety Gate</span>
            </div>
            <label className="flex items-start gap-2.5 text-xs text-silver cursor-pointer">
              <input
                type="checkbox"
                checked={isRealDeadlineConfirmed}
                onChange={(e) => onToggleRealDeadlineConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-charcoal text-volt focus:ring-volt bg-black"
              />
              <span>
                <strong className="text-white">This is a real deadline.</strong> I verify that I hold an active written offer or official decision deadline with another employer. (HireFlo strictly forbids fabricating competing offers).
              </span>
            </label>
          </div>
        )}

        {/* MAIN READING SURFACE: Real typography, 16-17px, line-height 1.6, preserved line breaks */}
        {isCompetingDeadlineTemplate && !isRealDeadlineConfirmed ? (
          <div className="p-8 rounded-lg bg-[#141414] border border-charcoal text-center space-y-3">
            <ShieldAlert className="w-8 h-8 text-silver mx-auto" />
            <div className="text-sm font-semibold text-white font-mono">
              Template Gated Behind Real Deadline Confirmation
            </div>
            <p className="text-xs text-silver max-w-md mx-auto">
              Please check the box above to confirm you hold a genuine competing offer before accessing this template.
            </p>
          </div>
        ) : (
          <div
            className="relative rounded-lg bg-[#141414] border border-charcoal p-5 sm:p-7 transition-all"
            style={{ minHeight: '260px' }}
          >
            {/* Real typography: 16-17px proportional font, line-height 1.6, max width about 68ch */}
            <div
              className="text-[16px] sm:text-[17px] leading-[1.6] font-sans text-white whitespace-pre-wrap select-text max-w-[68ch]"
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
                    className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded text-[13px] sm:text-[14px] font-mono align-baseline transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-volt focus:ring-offset-1 focus:ring-offset-black ${
                      isUnresolved
                        ? 'border border-dashed border-volt bg-[#141414] text-pale-yellow hover:bg-black font-semibold animate-pulse'
                        : 'border border-volt bg-[#141414] text-pale-yellow hover:bg-black'
                    }`}
                    title={
                      isUnresolved
                        ? `Required slot "{{${slotKey}}}" is empty. Click to fill.`
                        : `Slot: {{${slotKey}}}. Click to edit.`
                    }
                    aria-label={`Slot ${slotKey}: ${token.value}`}
                  >
                    <span>{token.value}</span>
                    <CornerDownRight className="w-3 h-3 text-volt shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Safety Note banner at bottom of reading panel */}
        {template.riskNotes && template.riskNotes.length > 0 && (
          <footer className="text-xs text-silver space-y-1 pt-2 font-mono">
            <div className="font-semibold text-white flex items-center gap-1.5 uppercase">
              <Info className="w-3.5 h-3.5 text-volt" />
              <span>Grounding & Tone Rules</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-silver pl-1 text-[11px]">
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
