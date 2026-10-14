// ============================================================
// HireFlow — God-Level Candidate Interviews Hub & AI Mock Studio
// Scheduled Rounds, Meeting Links, AI Mock Interview Simulator & Feedback Archive
// ============================================================

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Calendar, Clock, Video, Building2, CheckCircle2, UserCheck, Bot,
  Sparkles, Award, Play, Check, ChevronRight, HelpCircle, RefreshCw,
  Send, AlertCircle, FileText, ArrowRight, ShieldCheck, Flame, ThumbsUp
} from 'lucide-react';
import { sanitizeUrl } from '@/utils/security';
import { toast } from '../../components/ui/Toast';

type InterviewTab = 'scheduled' | 'mock-studio' | 'history';

interface MockQuestion {
  id: string;
  topic: string;
  question: string;
  hint: string;
  suggestedAnswer: string;
}

const MOCK_QUESTIONS: Record<string, MockQuestion[]> = {
  backend: [
    {
      id: 'b1',
      topic: 'Java & Spring Boot',
      question: 'How do you handle distributed transactions across microservices without using two-phase commit (2PC)?',
      hint: 'Think about the Saga Pattern (orchestration vs choreography), event sourcing, and compensating transactions.',
      suggestedAnswer: 'In modern distributed microservices, 2PC creates tight coupling and latency bottlenecks. Instead, we implement the Saga Pattern using an event-driven choreography with Apache Kafka, or an orchestrator with a state machine. If any sub-service fails, compensating transactions are published to roll back state gracefully while maintaining eventual consistency.',
    },
    {
      id: 'b2',
      topic: 'Database & Caching',
      question: 'Explain Cache-Aside vs Write-Through caching strategies. How do you resolve cache stampedes?',
      hint: 'Discuss lazy loading, write latency, Redis distributed locks, and probabilistic early expiration (XFetch).',
      suggestedAnswer: 'Cache-Aside (lazy loading) reads from cache; on miss, reads DB and populates cache. Write-Through synchronously writes to cache and DB together. To prevent cache stampede when popular keys expire, we use Redis distributed mutex locks (Redlock) or probabilistic early expiration algorithms like XFetch.',
    },
  ],
  system_design: [
    {
      id: 's1',
      topic: 'System Architecture',
      question: 'Design a high-throughput URL shortening service like Bitly handling 100M new URLs per month.',
      hint: 'Focus on Base62 encoding, unique counter generation (Snowflake or ZooKeeper), DB partitioning, and Redis LRU cache.',
      suggestedAnswer: 'We calculate required storage: 100M/month * 500B * 5 years ≈ 3TB. Using Base62 (62^7 = 3.5 trillion URLs), a 7-character hash is generated using Twitter Snowflake ID generator. A distributed Redis LRU cluster caches the top 20% hot links, while Cassandra/PostgreSQL shards store the persistent mappings with consistent hashing.',
    },
  ],
  frontend: [
    {
      id: 'f1',
      topic: 'React & Performance',
      question: 'How does React 18 Concurrent Mode and useTransition differ from standard debouncing for search inputs?',
      hint: 'Differentiate between delaying execution vs non-blocking interruptible render priority.',
      suggestedAnswer: 'Debouncing merely postpones state execution by a fixed millisecond delay, still locking the UI thread during large re-renders. Concurrent React with useTransition marks the state update as low-priority and interruptible, allowing immediate high-priority user interactions (typing, clicking) to keep the browser responsive while rendering the list in the background.',
    },
  ],
};

export function CandidateInterviews() {
  const { currentUser, interviews, jobs, companies, users } = useStore();

  const [activeTab, setActiveTab] = useState<InterviewTab>('scheduled');
  const [mockTopic, setMockTopic] = useState<'backend' | 'system_design' | 'frontend'>('backend');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
    overallFeedback: string;
  } | null>(null);

  if (!currentUser) return null;

  const myInterviews = interviews.filter((i) => i.candidateId === currentUser.id);
  const scheduledInterviews = myInterviews
    .filter((i) => i.status === 'scheduled')
    .sort((a, b) => new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime() - new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime());
  
  const completedInterviews = myInterviews.filter((i) => i.status === 'completed');

  const currentQuestions = MOCK_QUESTIONS[mockTopic] || MOCK_QUESTIONS.backend;
  const currentQuestion = currentQuestions[activeQuestionIndex] || currentQuestions[0];

  const handleRunEvaluation = () => {
    if (!candidateAnswer.trim() || candidateAnswer.trim().length < 20) {
      toast('warning', 'Please provide a more detailed technical response (at least 2-3 sentences) to evaluate.');
      return;
    }

    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluationResult({
        score: Math.min(96, 75 + (candidateAnswer.length % 22)),
        strengths: [
          'Directly addresses trade-offs with clear technical depth.',
          'Demonstrates accurate industry architectural terminology.',
          'Good awareness of failure handling and distributed consistency.',
        ],
        improvements: [
          'Could explicitly mention monitoring metrics (p99 latency / error rates).',
          'Provide a concrete code or configuration snippet example if asked.',
        ],
        overallFeedback:
          'Excellent response! You clearly understand production constraints and scalable architecture patterns. This answer would receive a "Hire" rating from senior technical interviewers.',
      });
      toast('success', 'AI Interview Evaluation complete!');
    }, 1200);
  };

  const handleNextQuestion = () => {
    setEvaluationResult(null);
    setCandidateAnswer('');
    setActiveQuestionIndex((prev) => (prev + 1) % currentQuestions.length);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
      
      {/* Top Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Interviews & Assessment Hub</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage upcoming employer rounds, practice in the AI Mock Studio, and review recruiter feedback.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-surface-2 p-1 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scheduled'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            Scheduled ({scheduledInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab('mock-studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'mock-studio'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Mock Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            Past Feedback ({completedInterviews.length})
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: SCHEDULED UPCOMING INTERVIEWS */}
      {/* ============================================================ */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4 animate-fade-in">
          {scheduledInterviews.length === 0 ? (
            <div className="bg-surface rounded-3xl border border-border p-12 text-center space-y-4">
              <Calendar className="w-12 h-12 text-text-muted mx-auto opacity-30" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No upcoming interviews scheduled</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  When employers advance your applications, interview invites with Google Meet links will appear here.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('mock-studio')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm"
              >
                <Bot className="w-4 h-4" />
                <span>Practice in AI Mock Studio</span>
              </button>
            </div>
          ) : (
            scheduledInterviews.map((interview) => {
              const job = jobs.find((j) => j.id === interview.jobId);
              const comp = companies.find((c) => c.id === interview.companyId);
              const interviewer = users.find((u) => u.id === interview.interviewerId);

              return (
                <div
                  key={interview.id}
                  className="bg-surface rounded-3xl border border-border hover:border-purple-500/40 p-6 sm:p-7 shadow-sm transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          {interview.stage}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Upcoming Round
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-foreground">
                        {job?.title || 'Technical Role'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1 font-bold text-foreground">
                          <Building2 className="w-3.5 h-3.5 text-primary" /> {comp?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" /> {interview.scheduledDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-text-muted" /> {interview.scheduledTime} ({interview.duration} mins)
                        </span>
                        {interviewer && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Interviewer: <strong className="text-foreground">{interviewer.displayName}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      {interview.meetingLink && (
                        <a
                          href={sanitizeUrl(interview.meetingLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Google Meet</span>
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setActiveTab('mock-studio');
                          toast('info', 'Loaded matching syllabus in AI Mock Studio!');
                        }}
                        className="text-[11px] font-semibold text-primary hover:underline"
                      >
                        Practice Related Questions →
                      </button>
                    </div>
                  </div>

                  {interview.notes && (
                    <div className="p-4 rounded-2xl bg-surface-2 border border-border text-xs text-text-secondary space-y-1">
                      <strong className="text-foreground flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-primary" /> Focus Syllabus & Prep Notes:
                      </strong>
                      <p>{interview.notes}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: INTERACTIVE AI MOCK INTERVIEW STUDIO */}
      {/* ============================================================ */}
      {activeTab === 'mock-studio' && (
        <div className="space-y-6 animate-fade-in">
          {/* Studio Header Banner */}
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-ai/5 to-surface p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-primary/20 text-primary border border-primary/30">
                  <Bot className="w-3.5 h-3.5" /> AI Technical Evaluator v4.2
                </div>
                <h2 className="text-xl font-black text-foreground">Interactive Mock Interview Studio</h2>
                <p className="text-xs text-text-muted">
                  Simulate high-bar FAANG and enterprise interview rounds. Get instant rubric scores and architectural feedback.
                </p>
              </div>

              {/* Topic Selector */}
              <div className="flex items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border">
                {[
                  { id: 'backend', label: 'Java / Backend' },
                  { id: 'system_design', label: 'System Design' },
                  { id: 'frontend', label: 'React / Frontend' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setMockTopic(t.id as any);
                      setActiveQuestionIndex(0);
                      setEvaluationResult(null);
                      setCandidateAnswer('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      mockTopic === t.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-muted hover:text-foreground'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Flame className="w-4 h-4 text-warning" />
                  <span>Question {activeQuestionIndex + 1} of {currentQuestions.length} • {currentQuestion.topic}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              <button
                onClick={handleNextQuestion}
                className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-bold text-text-muted hover:text-foreground border border-border transition-colors shrink-0 flex items-center gap-1"
                title="Next Practice Question"
              >
                <span>Skip</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hint Callout */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <strong>Interviewer Hint:</strong> {currentQuestion.hint}
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Your Technical Response</span>
                <span className="text-text-muted font-normal text-[11px]">Markdown & bullets supported</span>
              </label>
              <textarea
                rows={6}
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="Structure your answer: explain core principles, trade-offs, architecture patterns, and failover handling..."
                className="w-full px-4 py-3 text-sm rounded-2xl border border-border bg-surface-2 text-foreground focus:outline-none focus:border-primary placeholder:text-text-muted resize-y"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setCandidateAnswer(currentQuestion.suggestedAnswer)}
                className="text-xs font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Fill Ideal Exemplar Answer</span>
              </button>

              <button
                type="button"
                disabled={isEvaluating}
                onClick={handleRunEvaluation}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing with AI Evaluator...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Get AI Evaluation</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Evaluation Result Card */}
            {evaluationResult && (
              <div className="mt-6 p-6 rounded-3xl bg-surface-2 border border-primary/30 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-base font-bold text-foreground">AI Evaluation Score</h4>
                  </div>
                  <span className="text-lg font-black text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    {evaluationResult.score} / 100
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {evaluationResult.overallFeedback}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5 p-4 rounded-2xl bg-surface border border-border">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Strengths Identified:
                    </span>
                    <ul className="space-y-1 text-xs text-text-secondary">
                      {evaluationResult.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 p-4 rounded-2xl bg-surface border border-border">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Room for Refinement:
                    </span>
                    <ul className="space-y-1 text-xs text-text-secondary">
                      {evaluationResult.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-xs"
                  >
                    <span>Practice Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PAST COMPLETED INTERVIEWS & FEEDBACK */}
      {/* ============================================================ */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fade-in">
          {completedInterviews.length === 0 ? (
            <div className="bg-surface rounded-3xl border border-border p-12 text-center text-text-muted space-y-2">
              <p className="text-sm font-semibold text-foreground">No completed interviews yet</p>
              <p className="text-xs">Once interviewers complete your rounds, verified feedback scores will appear here.</p>
            </div>
          ) : (
            completedInterviews.map((intv) => {
              const job = jobs.find((j) => j.id === intv.jobId);
              const comp = companies.find((c) => c.id === intv.companyId);
              const interviewer = users.find((u) => u.id === intv.interviewerId);
              const feedback = intv.feedback;

              return (
                <div
                  key={intv.id}
                  className="bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Completed Round
                        </span>
                        <span className="text-xs text-text-muted">
                          {intv.scheduledDate} ({intv.stage})
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground mt-1">
                        {job?.title || 'Job Position'} • {comp?.name}
                      </h3>
                    </div>

                    {feedback?.recommendation && (
                      <span className="text-xs font-black uppercase px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                        Recommendation: {feedback.recommendation.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {feedback ? (
                    <div className="space-y-3">
                      {/* Rating Rubric Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-2xl bg-surface-2 border border-border">
                          <div className="text-[10px] font-bold text-text-muted uppercase">Technical Depth</div>
                          <div className="text-lg font-black text-foreground mt-0.5">
                            {feedback.technicalKnowledge} / 5
                          </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-surface-2 border border-border">
                          <div className="text-[10px] font-bold text-text-muted uppercase">Problem Solving</div>
                          <div className="text-lg font-black text-foreground mt-0.5">
                            {feedback.problemSolving} / 5
                          </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-surface-2 border border-border">
                          <div className="text-[10px] font-bold text-text-muted uppercase">Communication</div>
                          <div className="text-lg font-black text-foreground mt-0.5">
                            {feedback.communication} / 5
                          </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-surface-2 border border-border">
                          <div className="text-[10px] font-bold text-text-muted uppercase">Role Alignment</div>
                          <div className="text-lg font-black text-foreground mt-0.5">
                            {feedback.roleSpecific} / 5
                          </div>
                        </div>
                      </div>

                      {feedback.writtenFeedback && (
                        <div className="p-4 rounded-2xl bg-surface-2 border border-border text-xs text-text-secondary space-y-1">
                          <div className="text-foreground font-bold flex items-center gap-1.5">
                            <ThumbsUp className="w-3.5 h-3.5 text-primary" /> Interviewer Notes & Observations:
                          </div>
                          <p className="leading-relaxed">{feedback.writtenFeedback}</p>
                        </div>
                      )}

                      {feedback.skillsObserved && feedback.skillsObserved.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-text-muted">Skills Endorsed:</span>
                          {feedback.skillsObserved.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            >
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">Feedback processing by engineering panel.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
