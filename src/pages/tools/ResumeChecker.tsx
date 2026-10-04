import { useState } from 'react';
import { Brain, Search, AlertTriangle, CheckCircle, FileText, XCircle, ArrowRight, ScanLine, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResumeChecker() {
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = () => {
    if (!resumeText || !jobText) return;
    setIsScanning(true);
    
    // Simulate AI scanning delay
    setTimeout(() => {
      setIsScanning(false);
      setResult({
        score: 68,
        status: 'warning',
        missingKeywords: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Design'],
        matchedKeywords: ['React', 'TypeScript', 'Node.js', 'REST APIs'],
        harshTruths: [
          'You list "React" but provided zero metrics on performance improvements or traffic handled.',
          'The job requires extensive DevOps knowledge (Docker/K8s) which is completely absent from your resume.',
          'Your bullet points read like a job description, not a list of accomplishments.'
        ]
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-black text-text hover:text-primary transition-colors">
            <ArrowRight className="w-5 h-5 rotate-180" /> Back to Home
          </Link>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            ATS Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ai">Roaster</span>
          </h1>
          <p className="text-secondary text-lg">
            Stop guessing why you got rejected. Paste your resume and the job description below to see exactly what the AI ATS filters see.
          </p>
        </div>

        {!result && (
          <div className="grid md:grid-cols-2 gap-6 relative">
            <div className="bg-surface rounded-card p-6 border border-border shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">Your Resume</h2>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-semibold transition-colors">
                  <UploadCloud className="w-4 h-4" /> Upload File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        // Mock file upload by filling text
                        setResumeText(`[Extracted from ${e.target.files[0].name}]\n\nSenior Software Engineer with 5+ years of experience...`);
                      }
                    }}
                  />
                </label>
              </div>
              <textarea 
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your plain text resume here..."
                className="flex-1 w-full bg-surface-2 border border-border rounded-lg p-4 text-sm font-mono focus:ring-2 focus:ring-primary outline-none resize-none custom-scrollbar"
              />
            </div>

            <div className="bg-surface rounded-card p-6 border border-border shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-ai" />
                  <h2 className="text-lg font-bold">Target Job Description</h2>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-ai/10 text-ai hover:bg-ai/20 rounded-md text-sm font-semibold transition-colors">
                  <UploadCloud className="w-4 h-4" /> Upload File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        // Mock file upload by filling text
                        setJobText(`[Extracted from ${e.target.files[0].name}]\n\nWe are looking for a Senior Software Engineer with strong experience in...`);
                      }
                    }}
                  />
                </label>
              </div>
              <textarea 
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the job description you want to apply for..."
                className="flex-1 w-full bg-surface-2 border border-border rounded-lg p-4 text-sm font-mono focus:ring-2 focus:ring-ai outline-none resize-none custom-scrollbar"
              />
            </div>
          </div>
        )}

        {!result && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleScan}
              disabled={!resumeText || !jobText || isScanning}
              className={`relative overflow-hidden group px-8 py-4 rounded-full font-black text-lg transition-all ${
                isScanning ? 'bg-surface-3 text-secondary cursor-not-allowed' : 'bg-primary text-white hover:scale-105 hover:shadow-xl'
              }`}
            >
              {isScanning ? (
                <span className="flex items-center gap-2 relative z-10"><ScanLine className="w-5 h-5 animate-spin" /> Scanning Systems...</span>
              ) : (
                <span className="flex items-center gap-2 relative z-10"><Brain className="w-5 h-5" /> Analyze My Resume</span>
              )}
              {!isScanning && <div className="absolute inset-0 bg-gradient-to-r from-primary-hover to-ai opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-8">
            {/* Score Card */}
            <div className="bg-surface rounded-card border border-border p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-warning/10 rounded-full blur-3xl -z-10" />
              
              <div className="shrink-0 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" className="stroke-surface-3 stroke-[12px] fill-none" />
                    <circle cx="80" cy="80" r="70" className="stroke-warning stroke-[12px] fill-none stroke-dasharray-[440] stroke-dashoffset-[140] transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-foreground">{result.score}</span>
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Match Score</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-warning-dark mb-2">You probably won't get an interview.</h2>
                <p className="text-secondary leading-relaxed mb-6">
                  Your resume scored a <strong className="text-foreground">{result.score}%</strong> match. Most modern ATS filters will auto-reject candidates scoring below 75% for this specific role. You are missing critical hard skills required in the job description.
                </p>
                <button onClick={() => setResult(null)} className="px-5 py-2.5 bg-surface-2 border border-border text-sm font-bold rounded-btn hover:bg-surface-3 transition-colors">
                  Try Another Job
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Keywords */}
              <div className="space-y-6">
                <div className="bg-surface rounded-card p-6 border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-danger" /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw: string) => (
                      <span key={kw} className="px-3 py-1.5 bg-danger-bg text-danger text-xs font-bold rounded-md border border-danger/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-surface rounded-card p-6 border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" /> Matched Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords.map((kw: string) => (
                      <span key={kw} className="px-3 py-1.5 bg-success-bg text-success text-xs font-bold rounded-md border border-success/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Harsh Truths */}
              <div className="bg-surface rounded-card p-6 border border-border shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> The Harsh Truth
                </h3>
                <div className="space-y-4">
                  {result.harshTruths.map((truth: string, i: number) => (
                    <div key={i} className="flex gap-3 bg-warning/5 p-4 rounded-lg border border-warning/10">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-warning/20 text-warning flex items-center justify-center text-xs font-black">
                        {i + 1}
                      </span>
                      <p className="text-sm text-secondary leading-relaxed">{truth}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
