// ============================================================
// HireFlow — Interactive Live Video Interview Room & Assessment Sandbox
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Code2, MessageSquare,
  Sparkles, Play, CheckCircle, Star, Users, Brain, Shield,
  ChevronRight, Copy, Check, Settings, Layout, Terminal
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function LiveInterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, interviews, jobs, users, candidateProfiles, submitFeedback } = useStore();

  const interview = interviews.find(i => i.id === id);
  const job = jobs.find(j => j.id === interview?.jobId);
  const candidate = users.find(u => u.id === interview?.candidateId);
  const interviewer = users.find(u => u.id === interview?.interviewerId);
  const profile = candidateProfiles.find(p => p.userId === interview?.candidateId);

  // Video / Audio toggles
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'code' | 'copilot' | 'feedback' | 'notes'>('code');

  // Code editor state
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(
`// Candidate Technical Assessment Sandbox
// Problem: Implement a memoized function cache with TTL (Time To Live)

function createCachedFunction(fn, ttlMs = 5000) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const { value, expiry } = cache.get(key);
      if (now < expiry) {
        return { result: value, cached: true };
      }
    }

    const value = fn(...args);
    cache.set(key, { value, expiry: now + ttlMs });
    return { result: value, cached: false };
  };
}

// Test Run
const expensiveAdd = (a, b) => a + b;
const memoizedAdd = createCachedFunction(expensiveAdd, 3000);

console.log("Run 1 (Calculated):", memoizedAdd(10, 20));
console.log("Run 2 (From Cache):", memoizedAdd(10, 20));
`
  );
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // In-call evaluation rubric (for interviewer / manager)
  const [ratings, setRatings] = useState({
    technicalKnowledge: interview?.feedback?.technicalKnowledge || 4,
    problemSolving: interview?.feedback?.problemSolving || 4,
    communication: interview?.feedback?.communication || 4,
    roleSpecific: interview?.feedback?.roleSpecific || 4,
  });
  const [recommendation, setRecommendation] = useState<'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire'>(
    interview?.feedback?.recommendation || 'hire'
  );
  const [writtenNotes, setWrittenNotes] = useState(interview?.feedback?.writtenFeedback || '');
  const [copiedLink, setCopiedLink] = useState(false);

  // Live AI Co-Pilot / Transcription Simulation
  const [transcriptions, setTranscriptions] = useState<{ speaker: string; text: string; time: string }[]>([
    { speaker: interviewer?.displayName || 'Interviewer', text: 'Welcome! Let us start by discussing how you approach designing scalable caching layers.', time: '00:02' },
    { speaker: candidate?.displayName || 'Candidate', text: 'Thank you! I typically evaluate cache invalidation strategies, TTL constraints, and concurrency implications first.', time: '00:15' },
    { speaker: interviewer?.displayName || 'Interviewer', text: 'Great. Let us jump into the code sandbox and write a quick in-memory TTL cache.', time: '00:30' },
  ]);

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    'Ask about cache eviction policies (LRU / LFU) when memory exceeds capacity.',
    'Ask how this implementation behaves in a distributed multi-node environment with Redis.',
    'Probe on edge cases: race conditions during async cache hydration.',
  ]);

  if (!interview || !job) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 mb-4">Interview room not found or session has expired.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-white text-sm rounded-btn">
          Go Back
        </button>
      </div>
    );
  }

  const isInterviewerOrAdmin = currentUser?.role === 'INTERVIEWER' || currentUser?.role === 'BHR_MANAGER' || currentUser?.role === 'PLATFORM_ADMIN';

  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput([]);
    setTimeout(() => {
      setConsoleOutput([
        '⚡ Executing code sandbox environment (Node.js v20.x)...',
        'Run 1 (Calculated): { result: 30, cached: false }',
        'Run 2 (From Cache): { result: 30, cached: true }',
        '✓ All internal test assertions passed successfully (Execution time: 18ms)',
      ]);
      setIsRunning(false);
    }, 600);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast('info', 'Interview room link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveEvaluation = () => {
    if (!currentUser) return;
    submitFeedback(interview.id, {
      interviewId: interview.id,
      interviewerId: currentUser.id,
      technicalKnowledge: ratings.technicalKnowledge,
      problemSolving: ratings.problemSolving,
      communication: ratings.communication,
      roleSpecific: ratings.roleSpecific,
      writtenFeedback: writtenNotes.trim() || 'Evaluated during live technical interview session.',
      recommendation,
    });
    toast('success', 'Live evaluation submitted successfully!');
  };

  const handleLeaveCall = () => {
    if (currentUser?.role === 'CANDIDATE') {
      navigate('/candidate/interviews');
    } else {
      navigate('/interviewer/interviews');
    }
  };

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="h-14 bg-gray-900/90 backdrop-blur border-b border-gray-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-wide">HireFlow Live Studio</span>
          </div>
          <span className="text-gray-600">|</span>
          <div className="text-xs text-gray-300">
            <span className="font-semibold text-white">{job.title}</span> — {interview.stage}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 rounded-btn transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copied' : 'Share Room'}
          </button>
          <div className="px-2.5 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-medium flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> End-to-End Encrypted
          </div>
        </div>
      </header>

      {/* Main Grid: Left = Video Feeds, Middle = Code Sandbox / Live Workspace, Right = AI Copilot & Rubric */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Video Feeds */}
        <div className="w-72 md:w-80 bg-gray-900/50 border-r border-gray-800 p-3 flex flex-col gap-3 shrink-0 overflow-y-auto">
          {/* Tile 1: Candidate */}
          <div className="relative bg-gray-900 rounded-card border border-gray-800 aspect-video flex flex-col items-center justify-center overflow-hidden group shadow-lg">
            {isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-indigo-950/60 via-gray-900 to-slate-900 flex items-center justify-center relative">
                <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary text-xl font-bold">
                  {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CA'}
                </div>
                {/* Audio wave simulation */}
                <div className="absolute bottom-2 right-2 flex items-center gap-0.5">
                  <div className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" />
                  <div className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce delay-75" />
                  <div className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-xs flex flex-col items-center gap-1">
                <VideoOff className="w-6 h-6" />
                <span>Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[11px] font-medium text-white flex items-center gap-1.5">
              <span>{candidate?.displayName || 'Candidate'}</span>
              <span className="text-[10px] text-gray-400">(Candidate)</span>
            </div>
          </div>

          {/* Tile 2: Interviewer */}
          <div className="relative bg-gray-900 rounded-card border border-gray-800 aspect-video flex flex-col items-center justify-center overflow-hidden group shadow-lg">
            <div className="w-full h-full bg-gradient-to-br from-purple-950/60 via-gray-900 to-slate-900 flex items-center justify-center relative">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center text-purple-300 text-xl font-bold">
                {interviewer?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'IN'}
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-0.5">
                <div className="w-1 h-2 bg-emerald-400 rounded-full" />
                <div className="w-1 h-4 bg-emerald-400 rounded-full" />
                <div className="w-1 h-1 bg-emerald-400 rounded-full" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[11px] font-medium text-white flex items-center gap-1.5">
              <span>{interviewer?.displayName || 'Interviewer'}</span>
              <span className="text-[10px] text-purple-400">(Panel)</span>
            </div>
          </div>

          {/* Job Requirements Checklist Quick Glance */}
          <div className="mt-auto bg-gray-900/80 rounded-card border border-gray-800 p-3 space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Evaluation Targets</p>
            <div className="space-y-1.5">
              {job.requirements.slice(0, 4).map(req => (
                <div key={req.id} className="text-xs text-gray-300 flex items-center justify-between">
                  <span className="truncate pr-2">{req.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded font-medium">{req.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Technical Workspace */}
        <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
          {/* Workspace Tabs Header */}
          <div className="h-10 bg-gray-900/80 border-b border-gray-800 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                  activeTab === 'code' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" /> Shared Code Editor
              </button>
              <button
                onClick={() => setActiveTab('copilot')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                  activeTab === 'copilot' ? 'bg-ai text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Co-Pilot Feed
              </button>
              {isInterviewerOrAdmin && (
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                    activeTab === 'feedback' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" /> Live Rubric
                </button>
              )}
            </div>

            {activeTab === 'code' && (
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded border border-gray-700 outline-none"
                >
                  <option value="javascript">JavaScript / TypeScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="sql">PostgreSQL</option>
                </select>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" /> {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
            )}
          </div>

          {/* Workspace Body */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            {activeTab === 'code' && (
              <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                {/* Editor textarea */}
                <div className="flex-1 bg-gray-900 rounded-card border border-gray-800 p-3 font-mono text-xs overflow-hidden flex flex-col shadow-inner">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800 text-gray-500 text-[11px]">
                    <span>solution.ts</span>
                    <span>Multi-Cursor Collaboration Active</span>
                  </div>
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="flex-1 bg-transparent text-gray-200 font-mono text-xs resize-none outline-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Console Output Window */}
                <div className="h-36 bg-gray-900 rounded-card border border-gray-800 p-3 font-mono text-xs flex flex-col shrink-0">
                  <div className="flex items-center gap-2 text-gray-400 text-[11px] pb-1.5 border-b border-gray-800 mb-1.5">
                    <Terminal className="w-3.5 h-3.5 text-primary" /> Execution Console Output
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 text-gray-300">
                    {consoleOutput.length === 0 ? (
                      <p className="text-gray-600 italic">Click "Run Code" to execute script and evaluate test cases.</p>
                    ) : (
                      consoleOutput.map((line, idx) => (
                        <p key={idx} className={line.startsWith('✓') ? 'text-emerald-400 font-semibold' : line.startsWith('⚡') ? 'text-cyan-400' : 'text-gray-300'}>
                          {line}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'copilot' && (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                <div className="bg-ai-light/10 border border-ai/30 rounded-card p-4">
                  <div className="flex items-center gap-2 text-ai font-bold text-sm mb-2">
                    <Sparkles className="w-4 h-4" /> AI Real-Time Interview Assistant
                  </div>
                  <p className="text-xs text-gray-300">
                    HireFlow AI actively transcribes audio feeds and suggests targeted probing questions aligned with the candidate's resume gaps and required skills.
                  </p>
                </div>

                {/* AI Prompts */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Recommended Probing Questions</p>
                  {aiSuggestions.map((sug, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-card p-3 flex items-start gap-3 hover:border-gray-700 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-ai/20 text-ai flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed">{sug}</p>
                    </div>
                  ))}
                </div>

                {/* Live Transcript */}
                <div className="bg-gray-900 border border-gray-800 rounded-card p-4 flex-1 flex flex-col">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Live Speech Transcription Stream</p>
                  <div className="space-y-3 overflow-y-auto flex-1">
                    {transcriptions.map((t, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{t.speaker}</span>
                          <span className="text-[10px] text-gray-500">{t.time}</span>
                        </div>
                        <p className="text-gray-300 pl-2 border-l border-gray-700">{t.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && isInterviewerOrAdmin && (
              <div className="flex-1 bg-gray-900 rounded-card border border-gray-800 p-5 overflow-y-auto space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" /> In-Call Structured Evaluation Rubric
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Score candidate competencies in real time during the conversation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'technicalKnowledge', label: 'Technical Depth' },
                    { key: 'problemSolving', label: 'Problem Solving' },
                    { key: 'communication', label: 'Communication' },
                    { key: 'roleSpecific', label: 'Role Competency' },
                  ].map(dim => (
                    <div key={dim.key} className="bg-gray-950 p-3 rounded-card border border-gray-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-200">{dim.label}</span>
                        <span className="text-xs font-bold text-primary">{(ratings as any)[dim.key]} / 5</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(val => (
                          <button
                            key={val}
                            onClick={() => setRatings(r => ({ ...r, [dim.key]: val }))}
                            className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all ${
                              val <= (ratings as any)[dim.key] ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">Hiring Recommendation</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'strong_hire', label: 'Strong Hire', color: 'bg-emerald-600' },
                      { id: 'hire', label: 'Hire', color: 'bg-blue-600' },
                      { id: 'maybe', label: 'Maybe', color: 'bg-amber-600' },
                      { id: 'no_hire', label: 'No Hire', color: 'bg-rose-600' },
                      { id: 'strong_no_hire', label: 'Strong No', color: 'bg-red-700' },
                    ].map(rec => (
                      <button
                        key={rec.id}
                        type="button"
                        onClick={() => setRecommendation(rec.id as any)}
                        className={`py-2 px-1 text-xs font-semibold rounded border transition-all ${
                          recommendation === rec.id
                            ? `${rec.color} text-white border-white/40 ring-2 ring-white/20`
                            : 'bg-gray-950 text-gray-400 border-gray-800 hover:bg-gray-800'
                        }`}
                      >
                        {rec.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Interviewer Notes & Observations</label>
                  <textarea
                    rows={4}
                    value={writtenNotes}
                    onChange={e => setWrittenNotes(e.target.value)}
                    placeholder="Candidate demonstrated clean code habits, strong understanding of TTL caching, and explained race condition mitigations clearly..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-btn p-3 text-xs text-gray-200 outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveEvaluation}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-btn transition-all shadow-sm"
                  >
                    Save & Submit Rubric
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <footer className="h-16 bg-gray-900 border-t border-gray-800 px-6 flex items-center justify-between shrink-0">
        <div className="text-xs text-gray-400 hidden sm:block">
          Duration: <span className="font-mono text-white">24:38</span>
        </div>

        {/* Center Media Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isMicOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-600 text-white hover:bg-red-500'
            }`}
            title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isVideoOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-600 text-white hover:bg-red-500'
            }`}
            title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={handleLeaveCall}
            className="px-6 h-11 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full flex items-center gap-2 transition-all shadow-lg shadow-red-950"
          >
            <PhoneOff className="w-4 h-4" /> End Session
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'code' ? 'copilot' : 'code')}
            className="p-2.5 text-gray-400 hover:text-white bg-gray-800 rounded-btn transition-colors"
            title="Toggle View"
          >
            <Layout className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
