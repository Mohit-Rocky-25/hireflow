// ============================================================
// Suite UI - Reach Out (/tools/reach-out) - Version 2
// Master-detail 3-column layout matching dark Decision Suite hub
// Left Rail: 12 Collapsible Scenario Groups & Filters
// Center: Typography-first Reading Surface with Inline Slot Chips
// Right: Dynamic Inputs Panel showing ONLY active template slots
// Deterministic slot-filling, zero egress, zero fake stats
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useProfile } from '../profile/ProfileContext';
import {
  ALL_REACH_OUT_TEMPLATES,
  getTemplateById,
} from '../../reach-out/data';
import {
  ReachOutTemplate,
  ReachOutSlots,
  ChannelId,
  RecipientTypeId,
} from '../../reach-out/types';
import { resolveTemplate } from '../../reach-out/engine/slotResolver';
import { extractSlotsFromProfile } from './generateOutreach';
import { ReachOutNav } from '../../reach-out/components/ReachOutNav';
import { ScenarioGroupRail } from '../../reach-out/components/ScenarioGroupRail';
import { TemplateReadingSurface } from '../../reach-out/components/TemplateReadingSurface';
import { TemplateInputsPanel } from '../../reach-out/components/TemplateInputsPanel';
import { ReachOutActionBar } from '../../reach-out/components/ReachOutActionBar';
import { MobileBottomSheet } from '../../reach-out/components/MobileBottomSheet';

const STORAGE_TIER_KEY = 'hireflow:v4:reach-out:linkedin-tier';
const STORAGE_SLOTS_KEY = 'hireflow:v4:reach-out:slots';

export function ReachOutPage() {
  const { profile } = useProfile();

  // Active template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    ALL_REACH_OUT_TEMPLATES[0].id
  );

  // Active filters & search query
  const [activeChannelFilter, setActiveChannelFilter] = useState<ChannelId | 'all'>('all');
  const [activeRecipientFilter, setActiveRecipientFilter] = useState<RecipientTypeId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // LinkedIn tier toggle (free: 200 chars vs premium: 300 chars)
  const [linkedInTier, setLinkedInTier] = useState<'free' | 'premium'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TIER_KEY);
      return saved === 'free' ? 'free' : 'premium';
    } catch {
      return 'premium';
    }
  });

  const handleToggleLinkedInTier = (tier: 'free' | 'premium') => {
    setLinkedInTier(tier);
    try {
      localStorage.setItem(STORAGE_TIER_KEY, tier);
    } catch {
      // Ignore storage errors
    }
  };

  // Alternates switcher state per template
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number>(0);
  const [selectedOpenerIndex, setSelectedOpenerIndex] = useState<number>(0);

  // Competing deadline confirmation gate
  const [isRealDeadlineConfirmed, setIsRealDeadlineConfirmed] = useState<boolean>(false);

  // Mobile bottom sheet state
  const [isMobileInputsOpen, setIsMobileInputsOpen] = useState<boolean>(false);
  const [focusedSlot, setFocusedSlot] = useState<string | undefined>(undefined);

  // Dynamic Outreach Slots
  const [slots, setSlots] = useState<ReachOutSlots>(() => {
    const base: ReachOutSlots = {
      company: 'Razorpay',
      role: 'Backend Engineer',
      recipient_name: 'Rahul Sharma',
      recipient_type: 'Recruiter',
      primary_skill: 'Node.js & PostgreSQL',
      admired_project: 'UPI payment switch',
      proof_point: 'scaled REST APIs reducing latency by 45%',
      college: 'NIT Trichy',
      portfolio: 'github.com/myname/portfolio',
      role_family: 'Backend',
      experience_level: 'Fresher',
      batch_year: '2026',
      job_id: 'REQ-9842',
      source_trigger: 'your engineering post on distributed caching',
      event_name: 'GopherCon India',
      talk_topic: 'distributed event streaming',
      interviewer_topic: 'concurrency trade-offs',
      referrer_relationship: 'former_colleague',
      days_since_last_contact: 6,
      availability_date: 'Immediate',
      notice_period: 'Immediate / 15 days',
      location_preference: 'Bengaluru / Remote',
      personal_line: 'Your team\'s public architecture write-up on zero-downtime ledger migration directly influenced how I designed my capstone cache.',
      what_changed: 'shipped production microservices reducing cache misses by 30%',
      your_name: 'Mohit Yadav',
      your_email: 'mohit@example.com',
    };

    try {
      const saved = localStorage.getItem(STORAGE_SLOTS_KEY);
      if (saved) {
        return { ...base, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to base
    }
    return base;
  });

  // Sync slots from CandidateProfile when available
  useEffect(() => {
    if (profile) {
      const extracted = extractSlotsFromProfile(
        profile,
        slots.company || 'Razorpay',
        slots.role || 'Backend Engineer'
      );
      setSlots((prev) => ({
        ...prev,
        primary_skill: extracted.primarySkill || prev.primary_skill,
        proof_point: extracted.proofPoint || prev.proof_point,
        college: extracted.collegeName || prev.college,
        portfolio: extracted.portfolioLink || prev.portfolio,
        your_name: profile.identity?.name || prev.your_name,
        your_email: profile.identity?.email || prev.your_email,
      }));
    }
  }, [profile]);

  // Save slots to localStorage under hireflow:v4:*
  const handleSlotChange = (key: keyof ReachOutSlots, value: any) => {
    setSlots((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(updated));
      } catch {
        // Storage quota / error safeguard
      }
      return updated;
    });
  };

  // Currently active template
  const activeTemplate = useMemo(() => {
    return (
      getTemplateById(selectedTemplateId) ||
      ALL_REACH_OUT_TEMPLATES[0]
    );
  }, [selectedTemplateId]);

  // When switching template, reset alternates indices if out of range
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setSelectedSubjectIndex(0);
    setSelectedOpenerIndex(0);
    setIsRealDeadlineConfirmed(false);
  };

  // When an inline chip is clicked in reading panel, highlight or open sheet on mobile
  const handleSelectSlotForEdit = (slotName: string) => {
    setFocusedSlot(slotName);
    if (window.innerWidth < 1024) {
      setIsMobileInputsOpen(true);
    }
  };

  // Resolved template body for length meter & checklist
  const resolved = useMemo(() => {
    return resolveTemplate(activeTemplate, slots, {
      selectedOpenerIndex,
      selectedSubjectIndex,
    });
  }, [activeTemplate, slots, selectedOpenerIndex, selectedSubjectIndex]);

  return (
    <div
      data-theme="reach-out-dark"
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans"
    >
      {/* 1. Top Navigation Bar with Back & Home buttons (black press effect) */}
      <ReachOutNav
        linkedInTier={linkedInTier}
        onToggleLinkedInTier={handleToggleLinkedInTier}
      />

      {/* 2. Main 3-Column Master-Detail Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT RAIL: 12 Scenario Groups & Filter Chips */}
        <div className="w-full lg:w-72 xl:w-80 lg:h-[calc(100vh-57px)] shrink-0 border-b lg:border-b-0">
          <ScenarioGroupRail
            templates={ALL_REACH_OUT_TEMPLATES}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            activeChannelFilter={activeChannelFilter}
            onChangeChannelFilter={setActiveChannelFilter}
            activeRecipientFilter={activeRecipientFilter}
            onChangeRecipientFilter={setActiveRecipientFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* CENTER: Main Reading Surface (Typography-First, Inline Chips) */}
        <div className="flex-1 flex flex-col lg:h-[calc(100vh-57px)] overflow-hidden border-b lg:border-b-0">
          <div className="flex-1 overflow-y-auto">
            <TemplateReadingSurface
              template={activeTemplate}
              slots={slots}
              selectedSubjectIndex={selectedSubjectIndex}
              onSelectSubjectIndex={setSelectedSubjectIndex}
              selectedOpenerIndex={selectedOpenerIndex}
              onSelectOpenerIndex={setSelectedOpenerIndex}
              onSelectSlotForEdit={handleSelectSlotForEdit}
              onSwitchTemplate={handleSelectTemplate}
              isRealDeadlineConfirmed={isRealDeadlineConfirmed}
              onToggleRealDeadlineConfirmed={setIsRealDeadlineConfirmed}
            />
          </div>

          {/* Bottom Action Bar: Copy with confirmation + Log in Tracker link */}
          <ReachOutActionBar
            template={activeTemplate}
            slots={slots}
            selectedSubjectIndex={selectedSubjectIndex}
            selectedOpenerIndex={selectedOpenerIndex}
            onOpenMobileInputs={() => setIsMobileInputsOpen(true)}
          />
        </div>

        {/* RIGHT PANEL: Dynamic Inputs (Desktop lg+) */}
        <div className="hidden lg:block w-80 xl:w-96 lg:h-[calc(100vh-57px)] shrink-0">
          <TemplateInputsPanel
            template={activeTemplate}
            slots={slots}
            onChangeSlot={handleSlotChange}
            renderedBody={resolved.body}
            renderedSubject={resolved.subject}
            linkedInTier={linkedInTier}
            onSwitchTemplate={handleSelectTemplate}
            focusedSlot={focusedSlot}
          />
        </div>
      </main>

      {/* Mobile Bottom Sheet for Inputs (Mobile / Tablet < lg) */}
      <MobileBottomSheet
        isOpen={isMobileInputsOpen}
        onClose={() => setIsMobileInputsOpen(false)}
        title={`${activeTemplate.name} Inputs`}
      >
        <TemplateInputsPanel
          template={activeTemplate}
          slots={slots}
          onChangeSlot={handleSlotChange}
          renderedBody={resolved.body}
          renderedSubject={resolved.subject}
          linkedInTier={linkedInTier}
          onSwitchTemplate={handleSelectTemplate}
          focusedSlot={focusedSlot}
        />
      </MobileBottomSheet>
    </div>
  );
}
export default ReachOutPage;
