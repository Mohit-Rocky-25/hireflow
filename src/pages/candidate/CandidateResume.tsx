import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Upload, FileText, CheckCircle2, Sparkles, AlertCircle, Trash2, Award, Briefcase, GraduationCap, ArrowRight, TrendingUp, Target } from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

export function CandidateResume() {
  const { currentUser, candidateProfiles, updateCandidateProfile } = useStore();
  const profile = candidateProfiles.find(p => p.userId === currentUser?.id);

  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!currentUser || !profile) return null;

  const handleFileUpload = (fileName: string) => {
    setIsParsing(true);
    toast('info', 'Analyzing and parsing resume with AI...');

    setTimeout(() => {
      // Simulate intelligent extraction from resume
      const extractedSkills = [
        'React',
        'TypeScript',
        'Node.js',
        'Tailwind CSS',
        'PostgreSQL',
        'REST APIs',
        'GraphQL',
        'System Design',
      ];

      updateCandidateProfile(profile.id, {
        resumeFileName: fileName,
        resumeParsed: true,
        skills: Array.from(new Set([...(profile.skills || []), ...extractedSkills])),
        headline: profile.headline || 'Full Stack Engineer | React & TypeScript',
        profileCompletion: 95,
      });

      setIsParsing(false);
      toast('success', 'Resume parsed successfully! Skills and metadata updated.');
    }, 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0].name);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0].name);
    }
  };

  const handleRemoveResume = () => {
    updateCandidateProfile(profile.id, {
      resumeFileName: undefined,
      resumeParsed: false,
    });
    toast('info', 'Resume removed.');
  };

  const groupedSkills = {
    Languages: ['TypeScript', 'JavaScript', 'Python', 'Java'],
    Frameworks: ['React', 'Node.js', 'Express', 'Tailwind CSS'],
    Databases: ['PostgreSQL', 'MongoDB', 'Redis'],
    Tools: ['Git', 'Docker', 'AWS', 'REST APIs', 'GraphQL']
  };

  // Keep only those that exist in the user's actual profile (mock filtering)
  const userSkillsStr = profile.skills?.join(' ').toLowerCase() || '';
  const filterSkills = (arr: string[]) => arr.filter(s => userSkillsStr.includes(s.toLowerCase()));

  const finalGroups = {
    Languages: filterSkills(groupedSkills.Languages).length ? filterSkills(groupedSkills.Languages) : ['TypeScript', 'JavaScript'],
    Frameworks: filterSkills(groupedSkills.Frameworks).length ? filterSkills(groupedSkills.Frameworks) : ['React', 'Node.js'],
    Databases: filterSkills(groupedSkills.Databases).length ? filterSkills(groupedSkills.Databases) : ['PostgreSQL'],
    Tools: filterSkills(groupedSkills.Tools).length ? filterSkills(groupedSkills.Tools) : ['Git', 'REST APIs'],
  };

  const strengthScore = profile.resumeParsed ? 82 : 45;

  const radarData = [
    { subject: 'System Design', A: 85, B: 100, fullMark: 100 },
    { subject: 'Algorithms', A: 90, B: 100, fullMark: 100 },
    { subject: 'Frontend', A: 95, B: 85, fullMark: 100 },
    { subject: 'Backend', A: 70, B: 90, fullMark: 100 },
    { subject: 'DevOps', A: 60, B: 80, fullMark: 100 },
    { subject: 'Leadership', A: 45, B: 75, fullMark: 100 },
  ];

  const trajectoryData = [
    { year: '2020', level: 1 },
    { year: '2021', level: 2 },
    { year: '2022', level: 3 },
    { year: '2023', level: 4 },
    { year: '2024 (Now)', level: 5 },
    { year: '2026 (Est)', level: 7 },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">Resume & AI Profile</h1>
        <p className="text-sm text-muted">Upload your CV to automatically extract skills, experience, and boost match accuracy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Box */}
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`bg-surface rounded-card border-2 border-dashed p-8 text-center transition-all ${
              dragActive ? 'border-primary bg-primary-light/20' : 'border-border hover:border-gray-400'
            }`}
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Upload your latest Resume / CV</h3>
                <p className="text-xs text-muted mt-1">Supports PDF, DOCX, or TXT (Max 10MB)</p>
              </div>

              <div className="pt-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-all">
                  <Sparkles className="w-3.5 h-3.5" /> Select File to Parse
                  <input type="file" accept=".pdf,.docx,.txt" onChange={handleInputChange} className="hidden" disabled={isParsing} />
                </label>
              </div>

              {isParsing && (
                <div className="flex items-center justify-center gap-2 pt-3 text-xs text-ai font-semibold animate-pulse">
                  <Sparkles className="w-4 h-4" /> AI is extracting structured qualifications...
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Resume Status */}
          {profile.resumeFileName && (
            <div className="bg-surface rounded-card border border-border p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-btn bg-emerald-50 text-success">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{profile.resumeFileName}</p>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-success" /> AI Parsed • Ready for job matching
                  </p>
                </div>
              </div>
              <button onClick={handleRemoveResume} className="p-2 text-muted hover:text-danger rounded-btn hover:bg-gray-100 transition-colors" title="Delete resume">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {profile.resumeParsed && (
            <>
              {/* Extracted Skills Grouped */}
              <div className="bg-surface rounded-card border border-border p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-ai" /> Extracted Skills
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(finalGroups).map(([group, sks]) => (
                    <div key={group}>
                      <h4 className="text-xs font-semibold text-muted uppercase mb-2">{group}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {sks.map(s => (
                          <span key={s} className="px-2.5 py-0.5 bg-ai-light/50 border border-ai/20 text-ai text-[11px] font-bold rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience & Education */}
              <div className="bg-surface rounded-card border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-primary" /> Experience History
                  </h3>
                  <div className="pl-6 border-l-2 border-border space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 bg-primary rounded-full border-2 border-surface" />
                      <h4 className="text-sm font-semibold text-foreground">{profile.headline || 'Software Engineer'}</h4>
                      <p className="text-xs text-muted">Tech Corp Inc. • 2021 - Present</p>
                      <p className="text-xs text-secondary mt-1 line-clamp-2">Developed full-stack web applications using React and Node.js. Improved API performance by 40% and mentored junior developers.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-surface" />
                      <h4 className="text-sm font-semibold text-foreground">Frontend Developer</h4>
                      <p className="text-xs text-muted">Web Solutions • 2018 - 2021</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-primary" /> Education
                  </h3>
                  <div className="pl-6 border-l-2 border-border space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-surface" />
                      <h4 className="text-sm font-semibold text-foreground">B.Tech in Computer Science</h4>
                      <p className="text-xs text-muted">National Institute of Technology • 2014 - 2018</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar: AI Strength & Suggestions & Trajectory */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-surface rounded-card border border-border p-6 text-center">
            <h3 className="text-sm font-bold text-foreground mb-4">Resume Strength</h3>
            
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#2563EB" strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * strengthScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-primary leading-none">{strengthScore}</span>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wide">/ 100</span>
              </div>
            </div>

            <p className="text-xs text-secondary mb-4">
              {strengthScore > 80 
                ? "Excellent! Your profile is highly competitive and ready for applications." 
                : "Upload your resume to unlock AI profile insights and job matching."}
            </p>

            <div className="pt-4 border-t border-border space-y-2 text-left">
              <p className="text-xs font-bold text-foreground mb-2">AI Suggestions</p>
              {profile.resumeParsed ? (
                <>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span className="text-secondary">Strong technical keyword coverage</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                    <span className="text-secondary">Add metrics to your experience bullets</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                    <span className="text-secondary">Include a portfolio or GitHub link</span>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-2 text-xs opacity-50">
                  <AlertCircle className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                  <span className="text-secondary">Waiting for resume upload...</span>
                </div>
              )}
            </div>
          </div>

          {profile.resumeParsed && (
            <>
              {/* Skill Gap Radar */}
              <div className="bg-surface rounded-card border border-border p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" /> Skill Gap Radar
                </h3>
                <p className="text-[11px] text-muted mb-4">You vs. Market Standard (Senior SDE)</p>
                <div className="h-[220px] -mx-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Market Standard" dataKey="B" stroke="#94A3B8" fill="#CBD5E1" fillOpacity={0.3} />
                      <Radar name="You" dataKey="A" stroke="#2563EB" strokeWidth={2} fill="#3B82F6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs flex items-center gap-4 justify-center text-secondary">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" /> You</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Market Req</div>
                </div>
              </div>

              {/* Career Trajectory Simulator */}
              <div className="bg-surface rounded-card border border-border p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" /> Career Simulator
                </h3>
                <p className="text-[11px] text-muted mb-4">Probability of reaching Staff Engineer</p>
                
                <div className="h-[120px] -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trajectoryData}>
                      <defs>
                        <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      <Area type="monotone" dataKey="level" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 p-3 bg-primary-light/20 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary-dark font-medium leading-relaxed">
                      Taking the <span className="font-bold">Backend Lead</span> role at Flipkart increases your probability of reaching Staff Engineer by <span className="font-bold">78%</span> in 2 years.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
