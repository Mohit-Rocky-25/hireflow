// ============================================================
// Suite UI — Tailor My Resume (/tools/tailor)
// Decision Group: "How do I present myself better?"
// Deterministic revision suggestions, truth guarantee,
// word diffs, B1-B8 engine fixes, and professional export.
// ============================================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TailorHeader } from './components/TailorHeader';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  Building2,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { tailorResume, TailorResult, TailorSuggestion } from './tailorResume';
import { useProfile } from '../profile/ProfileContext';
import { SuiteStorage } from '../profile/storage';
import { ResumeVersion } from '../profile/types';
import { careers } from '../../../careers-core';
import { InputBox } from './components/InputBox';
import { QuickLoadSelect } from './components/QuickLoadSelect';
import { MatchPanel } from './components/MatchPanel';
import { ReviewTabBar, ReviewTab } from './components/ReviewTabBar';
import { SuggestionCard, CardStatus } from './components/SuggestionCard';
import { calculateResumeQuality } from '../../../lib/tailorEngine/strength';
import { applyGrammarGate } from '../../../lib/tailorEngine/grammar';
import { parseResumeDocModel, findUnresolvedPlaceholders, ResumePreset } from '../../../lib/tailorEngine/docModel';
import { generateDocxBlob, downloadBlob } from '../../../lib/tailorEngine/docxExport';
import { checkSeniorityMismatch } from '../../../lib/tailorEngine/actionWordEngine';
import { PaperPreview, ResumeTemplateId } from './components/PaperPreview';
import { StrengthenChecklist } from './components/StrengthenChecklist';
import { LayoutRepairsPanel } from './components/LayoutRepairsPanel';
import { ExportToolbar } from './components/ExportToolbar';
import { ExportTruthGateModal } from './components/ExportTruthGateModal';
import { applyAcceptedSuggestions } from '../../../lib/tailorEngine/patcher';
import { LayoutDensity } from '../../../lib/tailorEngine/heightSentinel';

const SAMPLE_RESUME = `Arjun Mehta | arjun@example.com | Full Stack Developer
SUMMARY: Software engineer with 3 years building web platforms using React, Node.js, TypeScript, and PostgreSQL.

EXPERIENCE:
Full Stack Engineer | CloudTech Solutions | 2022 - Present
- Responsible for developing modular React and TypeScript frontends serving 60,000 active users.
- Built Node.js and Express REST microservices with PostgreSQL database backends.
- Worked on optimizing database query indexes reducing latency by 45%.
- Helped with writing automated tests using Jest and Cypress.

PROJECTS:
Task Orchestrator | github.com/arjun/task-orch
- Implemented asynchronous task queue in TypeScript with Redis cache.
- Built dashboard for monitoring background workers.

SKILLS:
React, TypeScript, JavaScript, Node.js, Express, PostgreSQL, Redis, Jest, Git`;

const SAMPLE_JD = `Role: Senior Backend Engineer
Company: Razorpay
Requirements:
- Deep expertise in PostgreSQL database architecture and high-throughput query optimization.
- Production experience engineering RESTful microservices in Node.js and TypeScript.
- Strong automated unit testing and test coverage using Jest.
- Experience with Redis caching and distributed task queues is a strong plus.`;

export function TailorResumePage() {
  const { profile } = useProfile();

  // Header scroll detection for compact title
  const [h1Visible, setH1Visible] = useState(true);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!h1Ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setH1Visible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(h1Ref.current);
    return () => observer.disconnect();
  }, []);

  // Inputs: Strictly empty by default with zero demo data pre-loaded
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Results & Process
  const [result, setResult] = useState<TailorResult | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);

  // Suggestion actions: suggestionId -> CardStatus
  const [suggestionStatus, setSuggestionStatus] = useState<Record<string, CardStatus>>({});
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [undoSnapshot, setUndoSnapshot] = useState<Record<string, CardStatus> | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Review Tab
  const [reviewTab, setReviewTab] = useState<ReviewTab>('all');

  // Stage 4 Export & Paper Preview State
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>('classic');
  const [showChanges, setShowChanges] = useState(true);
  const [isAtsTextView, setIsAtsTextView] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [isTruthGateOpen, setIsTruthGateOpen] = useState(false);
  const [pendingExportAction, setPendingExportAction] = useState<'docx' | 'print' | null>(null);
  const [manualPreset, setManualPreset] = useState<ResumePreset | undefined>(undefined);
  const [layoutDensity, setLayoutDensity] = useState<LayoutDensity>('comfortable');

  // Handle Quick Load JD from dataset (Companies & Campus Programs)
  const handleQuickLoadCompany = (targetId: string) => {
    setSelectedCompanyId(targetId);
    
    // Check if target is a FresherProgram
    const prog = careers.programs.get(targetId);
    if (prog) {
      const company = careers.companies.get(prog.companyId);
      const compKeys = Object.keys(prog.competencyProfile || {});
      const ctcStr = prog.compensation?.fixedMinLPA
        ? `₹${prog.compensation.fixedMinLPA}${prog.compensation.fixedMaxLPA ? ` - ₹${prog.compensation.fixedMaxLPA}` : ''} LPA`
        : 'Competitive Campus Band';
      const rounds = prog.selectionProcess.map((s) => s.stage).join(' → ') || 'OA → Technical → HR';
      const generatedJD = `Role: ${prog.roleTitle} (${prog.programName})
Company: ${company?.name || prog.companyId}
Intake: Campus Graduate Intake 2026-27 (${prog.campusCategory.toUpperCase()})
Eligible Branches: ${prog.eligibility.branchCodes.join(', ') || 'Engineering & Technology'}
Cutoff: ${prog.eligibility.minCgpa ? `${prog.eligibility.minCgpa} CGPA` : 'No active cutoff'} · ${prog.eligibility.backlogPolicy || 'Zero active backlogs'}
Package / Compensation: ${ctcStr}
Selection Funnel: ${rounds}

Core Competencies Evaluated:
${compKeys.map((k) => `- ${k.toUpperCase()}: ${prog.competencyProfile[k]} proficiency`).join('\n')}

Role Description:
Campus engineering intake for ${company?.name || prog.companyId}. Evaluation emphasizes foundational problem-solving, algorithmic reasoning, and clean production code.`;
      setJdText(generatedJD);
      return;
    }

    const company = careers.companies.get(targetId);
    if (!company) return;
    const roles = careers.roles.forCompany(company.id);
    const role = roles[0];
    const roleCompList = role ? Object.keys(role.competencies) : [];
    const generatedJD = `Role: ${role?.title || 'Software Engineer'} (${role?.level || 'Mid'})
Company: ${company.name}
About: Engineering role at ${company.name} within the ${company.marketSegment} segment located across ${company.indiaOffices.join(', ')}.
Requirements:
- Strong experience with ${roleCompList.join(', ')}.
- Demonstrated mastery in production engineering and clean testing practices.
- Typical round focus: ${company.marketTier} hiring standard.`;
    setJdText(generatedJD);
  };

  const handleRunTailor = () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setIsTailoring(true);
    setTimeout(() => {
      try {
        const res = tailorResume(resumeText, jdText, new Set<string>());
        setResult(res);

        // Stage 3: Nothing pre-accepted by default. Start as 'pending' or 'needs_input'
        const initialStatus: Record<string, CardStatus> = {};
        res.suggestions.forEach((s) => {
          if (s.needsContext) {
            initialStatus[s.id] = 'needs_input';
          } else {
            initialStatus[s.id] = 'pending';
          }
        });
        setSuggestionStatus(initialStatus);
        setEditedTexts({});
        setReviewTab('all');
      } catch (err) {
        console.error(err);
      } finally {
        setIsTailoring(false);
      }
    }, 200);
  };

  // Build live tailored preview and patched docModel based on accepted / edited suggestions
  const { liveTailoredResume, acceptedSkills, modifiedBullets } = useMemo(() => {
    if (!result) return { liveTailoredResume: resumeText, acceptedSkills: [], modifiedBullets: {} };
    return applyAcceptedSuggestions(resumeText, result.suggestions, suggestionStatus, editedTexts);
  }, [result, resumeText, suggestionStatus, editedTexts]);

  // Build structured ResumeDocModel for templates & exports
  const docModel = useMemo(() => {
    return parseResumeDocModel(resumeText, modifiedBullets, manualPreset, acceptedSkills);
  }, [resumeText, modifiedBullets, manualPreset, acceptedSkills]);

  // Handle adding detected hidden skill
  const handleAddSkill = (skill: string) => {
    if (!resumeText.toLowerCase().includes(skill.toLowerCase())) {
      const skillsRegex = /(?:technical skills|skills)\s*:?/i;
      if (skillsRegex.test(resumeText)) {
        setResumeText((prev) => prev.replace(skillsRegex, (m) => `${m} ${skill}, `));
      } else {
        setResumeText((prev) => `${prev}\nTechnical Skills: ${skill}`);
      }
    }
  };

  // Unresolved placeholders detection (Export Truth Gate)
  const unresolvedPlaceholders = useMemo(() => {
    return findUnresolvedPlaceholders(liveTailoredResume);
  }, [liveTailoredResume]);

  const pendingContextCount = useMemo(() => {
    return Object.values(suggestionStatus).filter((s) => s === 'needs_input').length;
  }, [suggestionStatus]);

  const seniorityCheck = useMemo(() => {
    return checkSeniorityMismatch(resumeText, jdText);
  }, [resumeText, jdText]);

  // Tab counts
  const tabCounts = useMemo(() => {
    if (!result) return { all: 0, rephrase: 0, skills: 0, add_context: 0 };
    return {
      all: result.suggestions.length,
      rephrase: result.suggestions.filter((s) => s.type === 'rephrase').length,
      skills: result.suggestions.filter((s) => s.type === 'skills').length,
      add_context: result.suggestions.filter((s) => s.type === 'add_context').length,
    };
  }, [result]);

  const reviewedCount = useMemo(() => {
    return Object.values(suggestionStatus).filter((s) => s === 'accepted' || s === 'rejected').length;
  }, [suggestionStatus]);

  const acceptedCount = useMemo(() => {
    return Object.values(suggestionStatus).filter((s) => s === 'accepted').length;
  }, [suggestionStatus]);

  const totalCount = useMemo(() => {
    return result?.suggestions.length || 0;
  }, [result]);

  // Rule 5: Honest live match score that climbs only as genuine skills are verified
  const liveScore = useMemo(() => {
    if (!result) return 0;
    const base = result.scoreBefore;
    if (result.suggestions.length === 0) return base;

    // Honest calculation without unearned +8%/+4%/+3% boosts
    const totalMust = (result.mustHavesMatched.length + result.mustHavesMissing.length) || 1;
    const totalNice = (result.niceToHavesMatched.length + result.niceToHavesMissing.length) || 1;

    const newlyAddedMustSkills = result.mustHavesMissing.filter((skill) =>
      acceptedSkills.some((as) => as.toLowerCase() === skill.toLowerCase())
    ).length;

    const newlyAddedNiceSkills = result.niceToHavesMissing.filter((skill) =>
      acceptedSkills.some((as) => as.toLowerCase() === skill.toLowerCase())
    ).length;

    const matchedMust = result.mustHavesMatched.length + newlyAddedMustSkills;
    const matchedNice = result.niceToHavesMatched.length + newlyAddedNiceSkills;

    const matchRatio = (matchedMust / totalMust) * 75 + (matchedNice / totalNice) * 15;
    return Math.min(100, Math.max(base, Math.round(matchRatio + 10)));
  }, [result, acceptedSkills]);

  // Rule 7: Count pending SAFE_EDIT items
  const pendingSafeEditCount = useMemo(() => {
    if (!result) return 0;
    return result.suggestions.filter(
      (s) => s.kind === 'SAFE_EDIT' && suggestionStatus[s.id] !== 'accepted'
    ).length;
  }, [result, suggestionStatus]);

  // Rule 6: Safety Net Violations Check
  const exportViolations = useMemo(() => {
    const list: Array<{ id: string; text: string; reason: string }> = [];
    if (!result) return list;

    result.suggestions.forEach((s) => {
      if (suggestionStatus[s.id] === 'accepted') {
        const text = editedTexts[s.id] || s.proposedText;
        if (/[\[\]]/.test(text)) {
          list.push({
            id: s.id,
            text,
            reason: 'Contains unverified bracket placeholder [ ]'
          });
        }
      }
    });

    return list;
  }, [result, suggestionStatus, editedTexts]);

  // Rule 6: Pre-export review user-added lines (provenance = user_input)
  const userAddedLines = useMemo(() => {
    const list: Array<{ id: string; text: string; type: 'skill' | 'bullet' }> = [];
    if (!result) return list;

    acceptedSkills.forEach((skill, idx) => {
      list.push({
        id: `user-skill-${idx}`,
        text: `+ ${skill} (Technical Skills)`,
        type: 'skill'
      });
    });

    result.suggestions.forEach((s) => {
      if (s.kind === 'QUESTION' && suggestionStatus[s.id] === 'accepted') {
        const text = editedTexts[s.id] || s.proposedText;
        if (text && s.type !== 'skills') {
          list.push({
            id: s.id,
            text,
            type: 'bullet'
          });
        }
      }
    });

    return list;
  }, [result, acceptedSkills, suggestionStatus, editedTexts]);

  const handleRevertToSource = () => {
    if (!result) return;
    const initialStatus: Record<string, CardStatus> = {};
    result.suggestions.forEach((s) => {
      initialStatus[s.id] = s.kind === 'QUESTION' ? 'needs_input' : 'pending';
    });
    setSuggestionStatus(initialStatus);
    setEditedTexts({});
    setShowUndoToast(false);
  };

  const handleRemoveViolation = (id: string) => {
    handleUndo(id);
  };

  // Suggestion actions
  const handleAccept = (id: string, finalText?: string) => {
    if (finalText) {
      setEditedTexts((prev) => ({ ...prev, [id]: finalText }));
    }
    setSuggestionStatus((prev) => ({ ...prev, [id]: 'accepted' }));
  };

  const handleReject = (id: string) => {
    setSuggestionStatus((prev) => ({ ...prev, [id]: 'rejected' }));
  };

  const handleSaveEdit = (id: string, newText: string) => {
    setEditedTexts((prev) => ({ ...prev, [id]: newText }));
    setSuggestionStatus((prev) => ({ ...prev, [id]: 'accepted' }));
  };

  const handleOptionSelect = (id: string, _optIdx: number, text: string) => {
    setEditedTexts((prev) => ({ ...prev, [id]: text }));
  };

  const handleApplyContext = (id: string, snippet: string) => {
    const sug = result?.suggestions.find((s) => s.id === id);
    if (!sug) return;
    const originalClean = sug.originalText.replace(/^[-•*]\s*/, '').replace(/[.,]+$/, '');
    const cleanSnippet = snippet.replace(/[.,;]+$/, '').trim();
    const updated = applyGrammarGate(`- ${originalClean}, ${cleanSnippet}.`);
    setEditedTexts((prev) => ({ ...prev, [id]: updated }));
    setSuggestionStatus((prev) => ({ ...prev, [id]: 'accepted' }));
  };

  const handleUndo = (id: string) => {
    const sug = result?.suggestions.find((s) => s.id === id);
    setSuggestionStatus((prev) => ({
      ...prev,
      [id]: sug?.needsContext ? 'needs_input' : 'pending'
    }));
    setEditedTexts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Bulk Actions
  const handleAcceptAll = () => {
    if (!result) return;
    setUndoSnapshot({ ...suggestionStatus });
    const nextStatus = { ...suggestionStatus };
    result.suggestions.forEach((s) => {
      // RULE 7: Accept All scope applies strictly to SAFE_EDIT.
      // QUESTION cards are NEVER accepted in bulk!
      if (s.kind === 'QUESTION') return;
      nextStatus[s.id] = 'accepted';
    });
    setSuggestionStatus(nextStatus);
    setShowUndoToast(true);
    setTimeout(() => setShowUndoToast(false), 6000);
  };

  const handleRejectAll = () => {
    if (!result) return;
    setUndoSnapshot({ ...suggestionStatus });
    const nextStatus = { ...suggestionStatus };
    result.suggestions.forEach((s) => {
      nextStatus[s.id] = 'rejected';
    });
    setSuggestionStatus(nextStatus);
    setShowUndoToast(true);
    setTimeout(() => setShowUndoToast(false), 6000);
  };

  const handleUndoBulk = () => {
    if (undoSnapshot) {
      setSuggestionStatus(undoSnapshot);
      setShowUndoToast(false);
    }
  };

  // Review next item
  const handleReviewNext = () => {
    if (!result) return;
    const nextSug = result.suggestions.find(
      (s) => suggestionStatus[s.id] === 'pending' || suggestionStatus[s.id] === 'needs_input'
    );
    if (nextSug) {
      const el = document.getElementById(`card-${nextSug.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Filtered suggestions
  const filteredSuggestions = useMemo(() => {
    if (!result) return [];
    if (reviewTab === 'all') return result.suggestions;
    return result.suggestions.filter((s) => s.type === reviewTab);
  }, [result, reviewTab]);

  // Grouped by section for 'all' tab
  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, TailorSuggestion[]> = {};
    filteredSuggestions.forEach((s) => {
      const sec = s.section || 'General';
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(s);
    });
    return groups;
  }, [filteredSuggestions]);

  // Quality calculations
  const beforeQuality = useMemo(() => calculateResumeQuality(resumeText, jdText), [resumeText, jdText]);
  const afterQuality = useMemo(() => calculateResumeQuality(liveTailoredResume, jdText), [liveTailoredResume, jdText]);

  // ==========================================
  // Stage 4 Export Handlers
  // ==========================================
  const executeDownloadDocx = async () => {
    try {
      setIsGeneratingDocx(true);
      const blob = await generateDocxBlob(docModel);
      const roleSlug = result?.targetRoleTitle
        ? result.targetRoleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : 'tailored';
      downloadBlob(blob, `Resume-${roleSlug}.docx`);
    } catch (err) {
      console.error('Failed to generate docx:', err);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  const executePrintPdf = () => {
    window.print();
  };

  const handleDownloadDocxClick = () => {
    if (unresolvedPlaceholders.length > 0 || exportViolations.length > 0 || userAddedLines.length > 0) {
      setPendingExportAction('docx');
      setIsTruthGateOpen(true);
    } else {
      executeDownloadDocx();
    }
  };

  const handlePrintPdfClick = () => {
    if (unresolvedPlaceholders.length > 0 || exportViolations.length > 0 || userAddedLines.length > 0) {
      setPendingExportAction('print');
      setIsTruthGateOpen(true);
    } else {
      executePrintPdf();
    }
  };

  const handleConfirmTruthGateExport = () => {
    if (pendingExportAction === 'docx') {
      executeDownloadDocx();
    } else if (pendingExportAction === 'print') {
      executePrintPdf();
    }
    setPendingExportAction(null);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(liveTailoredResume);
  };

  const handleSaveToProfile = () => {
    if (!result) return;
    const existing = SuiteStorage.loadResumeVersions().data || [];
    const newVersion: ResumeVersion = {
      id: `ver-${Date.now()}`,
      label: `Tailored for ${result.targetRoleTitle}`,
      jdHash: String(jdText.length),
      createdAt: new Date().toISOString(),
      acceptedChanges: result.suggestions
        .filter((s) => suggestionStatus[s.id] === 'accepted')
        .map((s) => ({
          id: s.id,
          type: s.type === 'reorder' ? 'reorder_bullets' : 'action_verb_swap',
          description: s.rationale,
          originalSpan: s.originalText,
          replacementSpan: editedTexts[s.id] || s.proposedText,
        })),
      scoreBefore: result.scoreBefore,
      scoreAfter: result.projectedScoreAfter,
      tailoredText: liveTailoredResume,
    };
    SuiteStorage.saveResumeVersions([newVersion, ...existing]);
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-16">
      {/* Unified 64px Header */}
      <TailorHeader h1Visible={h1Visible} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Hero Section */}
        <div className="mb-8 max-w-3xl">
          <h1
            ref={h1Ref}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight flex items-center gap-3"
          >
            <Sparkles className="w-8 h-8 text-primary shrink-0" />
            Tailor My Resume
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-3 leading-relaxed font-medium">
            Match your resume to one job. Every change is yours to accept, and nothing is invented.
          </p>
        </div>

        {/* Two-Column Input Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Base Resume */}
          <InputBox
            stepNumber={1}
            label="Your resume"
            subtitle="Paste resume text or upload .pdf / .docx document"
            icon={<FileText className="w-5 h-5 text-sky-600" />}
            text={resumeText}
            setText={setResumeText}
            placeholder={`// Paste your resume text here...\n// Recommended sections:\n// • Contact Info & Professional Summary\n// • Work Experience & Impact (with metrics)\n// • Technical Skills & Core Competencies\n// • Education & Notable Projects`}
            onLoadSample={() => setResumeText(SAMPLE_RESUME)}
            sampleButtonLabel="Try Sample Resume"
            extraHeader={
              profile?.masterResumeText ? (
                <button
                  type="button"
                  onClick={() => setResumeText(profile.masterResumeText)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer"
                  title="Import master resume from your HireFlow profile"
                >
                  Import from Profile
                </button>
              ) : null
            }
          />

          {/* Right: Target JD */}
          <InputBox
            stepNumber={2}
            label="Target job description"
            subtitle="Paste target requirements or select a verified role"
            icon={<Building2 className="w-5 h-5 text-violet-600" />}
            text={jdText}
            setText={setJdText}
            placeholder={`// Paste the target job description or requirements here...\n// Include:\n// • Role Title & Target Seniority Level\n// • Must-Have Technical Skills & Stack\n// • Core Responsibilities & Impact\n// • Preferred / Nice-to-Have Qualifications`}
            isJD
            onLoadSample={() => setJdText(SAMPLE_JD)}
            sampleButtonLabel="Try Sample JD"
            extraHeader={
              <QuickLoadSelect
                selectedCompanyId={selectedCompanyId}
                onSelect={handleQuickLoadCompany}
              />
            }
          />
        </div>

        {/* Tailor Resume Action Button & Validation Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
          <div className="text-xs text-slate-500">
            {!resumeText.trim() && !jdText.trim() ? (
              <span className="flex items-center gap-2 text-slate-500 font-medium text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Paste both your resume and target job description above to begin tailoring.
              </span>
            ) : !resumeText.trim() ? (
              <span className="flex items-center gap-2 text-amber-600 font-medium text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                Resume missing — paste or upload your resume in Box 1.
              </span>
            ) : !jdText.trim() ? (
              <span className="flex items-center gap-2 text-amber-600 font-medium text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                Job description missing — paste target job requirements in Box 2.
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-2 text-xs sm:text-sm bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Ready to analyze alignment and generate truthful tailoring suggestions.
              </span>
            )}
          </div>

          <button
            onClick={handleRunTailor}
            disabled={isTailoring || !resumeText.trim() || !jdText.trim()}
            className={`h-[52px] min-h-[52px] px-8 rounded-xl text-base font-bold transition-all inline-flex items-center justify-center gap-2.5 outline-none ${
              isTailoring || !resumeText.trim() || !jdText.trim()
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 text-white shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] cursor-pointer'
            }`}
          >
            {isTailoring ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            <span>{isTailoring ? 'Analyzing Alignment...' : 'Tailor Resume'}</span>
          </button>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Match Panel with Gauges, Chips & Quality Summary */}
            <MatchPanel
              result={result}
              beforeQuality={beforeQuality}
              afterQuality={afterQuality}
              liveScore={liveScore}
              acceptedSkills={acceptedSkills}
              acceptedCount={acceptedCount}
              totalSuggestions={totalCount}
            />

            {/* Seniority Fit Advisory */}
            {seniorityCheck.isMismatch && (
              <div className="p-4 bg-amber-950/25 border border-amber-800/40 rounded-xl text-xs text-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-amber-300">Seniority Fit Advisory</div>
                  <p className="text-zinc-300 leading-relaxed">{seniorityCheck.advisoryNote}</p>
                </div>
              </div>
            )}

            {/* Layout Repairs & Structure Check Panel */}
            <LayoutRepairsPanel model={docModel} />

            {/* Recruiter-Grade Integrity Badge Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border bg-slate-50/80 shadow-2xs">
              <div className="flex items-center gap-2.5">
                {unresolvedPlaceholders.length > 0 || exportViolations.length > 0 ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-rose-800">
                      Integrity Alert: {unresolvedPlaceholders.length + exportViolations.length} unverified claim{unresolvedPlaceholders.length + exportViolations.length > 1 ? 's' : ''} (blocks export)
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-800">
                      Integrity Verified: All content from your resume or your own input
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleRevertToSource}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:underline cursor-pointer inline-flex items-center gap-1 self-end sm:self-auto"
                title="Restore original source resume with zero changes"
              >
                <RotateCcw className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                Revert to source resume
              </button>
            </div>

            {/* Stage 3 Sticky Tab Bar */}
            <ReviewTabBar
              activeTab={reviewTab}
              onTabChange={setReviewTab}
              counts={tabCounts}
              reviewedCount={reviewedCount}
              totalCount={totalCount}
              acceptedCount={acceptedCount}
              onReviewNext={handleReviewNext}
              onAcceptAll={handleAcceptAll}
              onRejectAll={handleRejectAll}
              onUndoBulk={handleUndoBulk}
              showUndoToast={showUndoToast}
              onRevertToSource={handleRevertToSource}
              safeEditCount={pendingSafeEditCount}
            />

            {/* Suggestions List */}
            {filteredSuggestions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-slate-200 text-slate-500">
                <p className="text-sm font-medium">
                  {reviewTab === 'skills'
                    ? 'No missing skills to add — your resume already covers the required technologies.'
                    : reviewTab === 'add_context'
                    ? 'No context items needed — all bullets already include concrete metrics.'
                    : 'No suggestions available in this category.'}
                </p>
              </div>
            ) : reviewTab === 'all' ? (
              /* Grouped by Section */
              <div className="space-y-8">
                {Object.entries(groupedSuggestions).map(([section, items]) => (
                  <div key={section} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {section}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono font-semibold">
                        ({items.length} {items.length === 1 ? 'revision' : 'revisions'})
                      </span>
                    </div>

                    <div className="space-y-4">
                      {items.map((sug) => (
                        <SuggestionCard
                          key={sug.id}
                          suggestion={sug}
                          status={suggestionStatus[sug.id] || 'pending'}
                          editedText={editedTexts[sug.id]}
                          onAccept={handleAccept}
                          onReject={handleReject}
                          onSaveEdit={handleSaveEdit}
                          onOptionSelect={handleOptionSelect}
                          onApplyContext={handleApplyContext}
                          onUndo={handleUndo}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Filtered Flat List */
              <div className="space-y-4">
                {filteredSuggestions.map((sug) => (
                  <SuggestionCard
                    key={sug.id}
                    suggestion={sug}
                    status={suggestionStatus[sug.id] || 'pending'}
                    editedText={editedTexts[sug.id]}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onSaveEdit={handleSaveEdit}
                    onOptionSelect={handleOptionSelect}
                    onApplyContext={handleApplyContext}
                    onUndo={handleUndo}
                  />
                ))}
              </div>
            )}

            {/* Stage 4: Professional Resume Preview & Export Section */}
            <div className="space-y-4 pt-6" id="preview-section">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-text flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-primary" />
                    Professional Tailored Resume
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    White A4 canvas preview reflecting your accepted changes in real time.
                  </p>
                </div>
              </div>

              {/* Export & Customization Toolbar */}
              <ExportToolbar
                template={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
                showChanges={showChanges}
                onToggleShowChanges={() => setShowChanges(!showChanges)}
                isAtsTextView={isAtsTextView}
                onToggleAtsTextView={() => setIsAtsTextView(!isAtsTextView)}
                onDownloadDocx={handleDownloadDocxClick}
                onPrintPdf={handlePrintPdfClick}
                onCopyText={handleCopyText}
                onSaveToProfile={handleSaveToProfile}
                isGeneratingDocx={isGeneratingDocx}
              />

              {/* Strengthen This Resume Guidance Checklist */}
              <StrengthenChecklist model={docModel} onAddSkill={handleAddSkill} />

              {/* White A4 Paper Sheet Preview with Real-Time 1-Page Height Sentinel */}
              <PaperPreview
                ref={paperRef}
                model={docModel}
                template={selectedTemplate}
                showChanges={showChanges}
                isAtsTextView={isAtsTextView}
                rawText={liveTailoredResume}
                onPresetChange={setManualPreset}
                density={layoutDensity}
                onDensityChange={setLayoutDensity}
              />
            </div>
          </div>
        )}
      </div>

      {/* Export Truth Gate Warning & Verification Modal */}
      <ExportTruthGateModal
        isOpen={isTruthGateOpen}
        onClose={() => setIsTruthGateOpen(false)}
        onConfirmExport={handleConfirmTruthGateExport}
        unresolvedPlaceholders={unresolvedPlaceholders}
        violations={exportViolations}
        onRemoveViolation={handleRemoveViolation}
        userAddedLines={userAddedLines}
        onRevertToSource={handleRevertToSource}
      />
    </div>
  );
}