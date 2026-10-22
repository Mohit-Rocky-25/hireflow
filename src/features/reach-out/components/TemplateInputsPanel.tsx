// ============================================================
// Reach Out v2 - Template Inputs & Guidance Panel (Right Panel)
// Shows ONLY the slots needed by the active template
// Live char/word meter, send-readiness checklist, and guidance block
// Company hook selector, personal_line hints, proof-point validation
// ============================================================

import React, { useId, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lightbulb,
} from 'lucide-react';
import {
  ReachOutTemplate,
  ReachOutSlots,
  RoleFamilyId,
  RecipientTypeId,
} from '../types';
import { inspectSendReadiness } from '../engine/lintReadiness';
import { selectCompanyHooks, hasVerifiedHooks } from '../engine/companyHooks';
import { validateProofPointMetrics } from '../engine/slotResolver';
import { ROLE_FAMILIES } from '../engine/fragments';
import { LINKEDIN_CONNECT_LIMITS } from '../engine/config';
import { COMPANIES } from '../../../pages/demo/talentLensData';

interface TemplateInputsPanelProps {
  template: ReachOutTemplate;
  slots: ReachOutSlots;
  onChangeSlot: (key: keyof ReachOutSlots, value: any) => void;
  renderedBody: string;
  renderedSubject?: string;
  linkedInTier: 'free' | 'premium';
  onSwitchTemplate: (templateId: string) => void;
  focusedSlot?: string;
}

export function TemplateInputsPanel({
  template,
  slots,
  onChangeSlot,
  renderedBody,
  renderedSubject,
  linkedInTier,
  onSwitchTemplate,
  focusedSlot,
}: TemplateInputsPanelProps) {
  // Combine required & optional slots for this template
  const activeSlots = useMemo(() => {
    const set = new Set<string>();
    template.requiredSlots.forEach((s) => set.add(s));
    template.optionalSlots.forEach((s) => set.add(s));
    return Array.from(set);
  }, [template]);

  // Inspect send readiness (deterministic checklist)
  const charLimitFallback = linkedInTier === 'premium' ? 300 : 200;
  const readiness = inspectSendReadiness(
    template,
    slots,
    renderedSubject,
    renderedBody,
    { isLinkedInPremium: linkedInTier === 'premium' }
  );
  const activeCharLimit = readiness.charLimit || charLimitFallback;

  // Proof point metrics validation
  const proofValidation = validateProofPointMetrics(slots.proof_point);

  // Verified company hooks from shared company dataset
  const currentCompany = slots.company || 'Razorpay';
  const companyHooks = selectCompanyHooks(currentCompany);
  const companyHasHooks = hasVerifiedHooks(currentCompany);

  // 3 Hints for personal_line
  const personalLineHints = [
    'Mention a specific open source tool or production system they wrote about publicly.',
    'Reference a talk their team presented at a technical meetup or conference.',
    'Cite a concrete architectural challenge you solved that maps to their engineering stack.',
  ];

  // Quick Company Preset selection
  const handleSelectQuickCompany = (compName: string) => {
    const comp = COMPANIES.find((c) => c.name === compName || c.id === compName);
    if (!comp) return;

    onChangeSlot('company', comp.name);
    if (comp.roles[0]) {
      onChangeSlot('role', comp.roles[0].title);
      onChangeSlot('primary_skill', comp.roles[0].competencies.slice(0, 3).join(', '));
    }
    const hooks = selectCompanyHooks(comp.name);
    if (hooks.admiredProjects[0]) {
      onChangeSlot('admired_project', hooks.admiredProjects[0]);
    }
  };

  return (
    <aside
      className="w-full h-full flex flex-col bg-neutral-900 border-l border-neutral-800 text-neutral-200 overflow-y-auto"
      aria-label="Outreach Inputs, Send Readiness, and Guidance"
    >
      <div className="p-4 space-y-6">
        {/* Quick Company Preset Selector */}
        <div className="space-y-1.5 pb-3 border-b border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Building2 className="w-3 h-3 text-neutral-400" />
              Target Company Preset
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {['Razorpay', 'Swiggy', 'Cred', 'Zerodha', 'Flipkart'].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelectQuickCompany(name)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                  slots.company === name
                    ? 'bg-neutral-800 text-white border-neutral-600 font-semibold'
                    : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Character & Word Meter */}
        <section className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300">Length Meter</span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {readiness.wordCount} words
            </span>
          </div>

          {/* Hard limit indicator for LinkedIn Connect */}
          {template.channel === 'linkedin_connect' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">
                  LinkedIn Note ({linkedInTier === 'premium' ? '300' : '200'} char max):
                </span>
                <span
                  className={`font-mono font-bold ${
                    readiness.charCount > activeCharLimit
                      ? 'text-rose-400'
                      : 'text-neutral-200'
                  }`}
                >
                  {readiness.charCount} / {activeCharLimit} chars
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    readiness.charCount > activeCharLimit
                      ? 'bg-rose-500'
                      : readiness.charCount > activeCharLimit * 0.85
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (readiness.charCount / activeCharLimit) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Send-Readiness Checklist (Checkboxes, NOT a probability or score) */}
        <section className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Send-Readiness Checklist
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              {readiness.items.filter((c) => c.passed).length}/{readiness.items.length}
            </span>
          </div>

          <div className="space-y-1.5" role="list">
            {readiness.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 text-xs"
                role="listitem"
              >
                {item.passed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className={item.passed ? 'text-neutral-300' : 'text-neutral-400'}>
                    {item.label}
                  </span>
                  {item.detail && !item.passed && (
                    <div className="text-[11px] text-amber-400/90 mt-0.5">{item.detail}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Warnings List */}
          {(readiness.bannedPhrasesFound.length > 0 || readiness.unverifiedNumbersFound.length > 0) && (
            <div className="pt-2 border-t border-neutral-800/80 space-y-1">
              {readiness.bannedPhrasesFound.map((phrase: string, idx: number) => (
                <div key={`banned-${idx}`} className="text-[11px] text-amber-400 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Contains banned phrase or em dash: &quot;{phrase}&quot;</span>
                </div>
              ))}
              {readiness.unverifiedNumbersFound.map((num: string, idx: number) => (
                <div key={`num-${idx}`} className="text-[11px] text-amber-400 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Unverified number detected: {num}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Dynamic Inputs: ONLY fields this template needs */}
        <section className="space-y-3">
          <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider text-[10px]">
            Template Inputs ({activeSlots.length})
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. recipient_name */}
            {activeSlots.includes('recipient_name') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Recipient Name {template.requiredSlots.includes('recipient_name') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.recipient_name || ''}
                  onChange={(e) => onChangeSlot('recipient_name', e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 2. company */}
            {activeSlots.includes('company') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Target Company {template.requiredSlots.includes('company') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.company || ''}
                  onChange={(e) => onChangeSlot('company', e.target.value)}
                  placeholder="e.g. Razorpay"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 3. role */}
            {activeSlots.includes('role') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Target Role {template.requiredSlots.includes('role') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.role || ''}
                  onChange={(e) => onChangeSlot('role', e.target.value)}
                  placeholder="e.g. Backend Engineer"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 4. primary_skill */}
            {activeSlots.includes('primary_skill') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Primary Skill {template.requiredSlots.includes('primary_skill') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.primary_skill || ''}
                  onChange={(e) => onChangeSlot('primary_skill', e.target.value)}
                  placeholder="e.g. Go & Distributed Systems"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 5. admired_project / Company Hook Selector */}
            {activeSlots.includes('admired_project') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Admired Project / Platform {template.requiredSlots.includes('admired_project') && '*'}</span>
                </label>

                {companyHasHooks && companyHooks.admiredProjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {companyHooks.admiredProjects.map((p: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onChangeSlot('admired_project', p)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                          slots.admired_project === p
                            ? 'bg-neutral-800 text-white border-neutral-600'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={slots.admired_project || ''}
                  onChange={(e) => onChangeSlot('admired_project', e.target.value)}
                  placeholder={
                    companyHasHooks
                      ? 'e.g. UPI payment switch'
                      : `Add what you admire about ${slots.company || 'the company'}`
                  }
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 6. proof_point (with number/metric validation) */}
            {activeSlots.includes('proof_point') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Proof Point {template.requiredSlots.includes('proof_point') && '*'}</span>
                  {!proofValidation.hasNumber && slots.proof_point && (
                    <span className="text-[10px] text-amber-400">Add numbers (e.g. 40%, 10k req/s)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={slots.proof_point || ''}
                  onChange={(e) => onChangeSlot('proof_point', e.target.value)}
                  placeholder="e.g. reduced tail latency by 35% on 5,000 req/s load"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 7. college */}
            {activeSlots.includes('college') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>College / University {template.requiredSlots.includes('college') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.college || ''}
                  onChange={(e) => onChangeSlot('college', e.target.value)}
                  placeholder="e.g. NIT Trichy"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 8. portfolio */}
            {activeSlots.includes('portfolio') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Portfolio / Repository Link {template.requiredSlots.includes('portfolio') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.portfolio || ''}
                  onChange={(e) => onChangeSlot('portfolio', e.target.value)}
                  placeholder="e.g. github.com/username/project"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 9. role_family */}
            {activeSlots.includes('role_family') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Role Family {template.requiredSlots.includes('role_family') && '*'}</span>
                </label>
                <select
                  value={slots.role_family || 'Backend'}
                  onChange={(e) => onChangeSlot('role_family', e.target.value as RoleFamilyId)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {ROLE_FAMILIES.map((rf: { id: string; label: string }) => (
                    <option key={rf.id} value={rf.id}>
                      {rf.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 10. batch_year */}
            {activeSlots.includes('batch_year') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Graduating Batch Year {template.requiredSlots.includes('batch_year') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.batch_year || '2026'}
                  onChange={(e) => onChangeSlot('batch_year', e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 11. job_id */}
            {activeSlots.includes('job_id') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Job Requisition ID {template.requiredSlots.includes('job_id') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.job_id || ''}
                  onChange={(e) => onChangeSlot('job_id', e.target.value)}
                  placeholder="e.g. REQ-9842"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 12. source_trigger */}
            {activeSlots.includes('source_trigger') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Source Trigger (Post / Talk / PR) {template.requiredSlots.includes('source_trigger') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.source_trigger || ''}
                  onChange={(e) => onChangeSlot('source_trigger', e.target.value)}
                  placeholder="e.g. your post on distributed database caching"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 13. event_name */}
            {activeSlots.includes('event_name') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Event / Conference Name {template.requiredSlots.includes('event_name') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.event_name || ''}
                  onChange={(e) => onChangeSlot('event_name', e.target.value)}
                  placeholder="e.g. GopherCon India / HackIndia"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 14. talk_topic */}
            {activeSlots.includes('talk_topic') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Talk Topic / Keynote {template.requiredSlots.includes('talk_topic') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.talk_topic || ''}
                  onChange={(e) => onChangeSlot('talk_topic', e.target.value)}
                  placeholder="e.g. zero-downtime database sharding"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 15. interviewer_topic */}
            {activeSlots.includes('interviewer_topic') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Interviewer Discussion Topic {template.requiredSlots.includes('interviewer_topic') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.interviewer_topic || ''}
                  onChange={(e) => onChangeSlot('interviewer_topic', e.target.value)}
                  placeholder="e.g. concurrent cache eviction trade-offs"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 16. days_since_last_contact */}
            {activeSlots.includes('days_since_last_contact') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Days Since Last Contact {template.requiredSlots.includes('days_since_last_contact') && '*'}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={slots.days_since_last_contact || 6}
                  onChange={(e) => onChangeSlot('days_since_last_contact', parseInt(e.target.value, 10) || 6)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 17. notice_period */}
            {activeSlots.includes('notice_period') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Notice Period / Joining Availability {template.requiredSlots.includes('notice_period') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.notice_period || 'Immediate / 15 days'}
                  onChange={(e) => onChangeSlot('notice_period', e.target.value)}
                  placeholder="e.g. Immediate / Available post-June"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 18. location_preference */}
            {activeSlots.includes('location_preference') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Preferred Location {template.requiredSlots.includes('location_preference') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.location_preference || 'Bengaluru / Remote'}
                  onChange={(e) => onChangeSlot('location_preference', e.target.value)}
                  placeholder="e.g. Bengaluru / Hyderabad / Remote"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 19. personal_line (with 3 prompting hints, strictly user-typed) */}
            {activeSlots.includes('personal_line') && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>Personal Line (Genuine sentence about this team) {template.requiredSlots.includes('personal_line') && '*'}</span>
                </label>
                <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 space-y-1 text-[11px] text-neutral-400">
                  <div className="font-semibold text-neutral-300 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                    <Lightbulb className="w-3 h-3 text-amber-400" /> Hints:
                  </div>
                  {personalLineHints.map((hint, idx) => (
                    <div key={idx} className="text-[10px] text-neutral-400">
                      • {hint}
                    </div>
                  ))}
                </div>
                <textarea
                  rows={2}
                  value={slots.personal_line || ''}
                  onChange={(e) => onChangeSlot('personal_line', e.target.value)}
                  placeholder="Write your genuine observation about why this team..."
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 20. what_changed (for re-apply) */}
            {activeSlots.includes('what_changed') && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>What Changed Since Last Time {template.requiredSlots.includes('what_changed') && '*'}</span>
                </label>
                <input
                  type="text"
                  value={slots.what_changed || ''}
                  onChange={(e) => onChangeSlot('what_changed', e.target.value)}
                  placeholder="e.g. completed a production internship shipping Redis caching"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* User name & email signature */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Your Name</label>
                <input
                  type="text"
                  value={slots.your_name || ''}
                  onChange={(e) => onChangeSlot('your_name', e.target.value)}
                  placeholder="e.g. Mohit Yadav"
                  className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 text-[11px] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Your Email</label>
                <input
                  type="email"
                  value={slots.your_email || ''}
                  onChange={(e) => onChangeSlot('your_email', e.target.value)}
                  placeholder="e.g. mohit@example.com"
                  className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 text-[11px] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Guidance Block: When to use, When NOT to use, Best send window, Follow-up timing */}
        <section className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-3.5 space-y-3 text-xs">
          <div className="font-semibold text-neutral-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Outreach Playbook Guidance
          </div>

          <div className="space-y-2.5 text-[11px]">
            {/* When to use */}
            <div>
              <span className="font-semibold text-emerald-400 block mb-0.5">When to use:</span>
              <p className="text-neutral-300 leading-relaxed">{template.whenToUse}</p>
            </div>

            {/* When NOT to use */}
            <div>
              <span className="font-semibold text-rose-400 block mb-0.5">When NOT to use:</span>
              <p className="text-neutral-300 leading-relaxed">{template.whenNotToUse}</p>
            </div>

            {/* Best send window */}
            <div className="flex items-start gap-1.5 text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-300">Best Send Window: </span>
                <span>{template.sendWindowNote}</span>
              </div>
            </div>

            {/* Follow-up timing */}
            <div className="flex items-start gap-1.5 text-neutral-400">
              <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-300">Follow-up: </span>
                <span>{template.followUpNote}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
