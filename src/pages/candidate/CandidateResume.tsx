// ============================================================
// HireFlow — Candidate Resume Management & AI Parser
// ============================================================
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Upload, FileText, CheckCircle2, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

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
        skills: Array.from(new Set([...profile.skills, ...extractedSkills])),
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

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">Resume & AI Parsing</h1>
        <p className="text-sm text-muted">Upload your CV to automatically populate skills, experience, and boost match accuracy.</p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setDragActive(true);
        }}
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
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleInputChange}
                className="hidden"
                disabled={isParsing}
              />
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
          <button
            onClick={handleRemoveResume}
            className="p-2 text-muted hover:text-danger rounded-btn hover:bg-gray-100 transition-colors"
            title="Delete resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Extracted Skills Preview */}
      <div className="bg-surface rounded-card border border-border p-6 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai" /> Extracted Profile Competencies
        </h3>
        {profile.skills.length === 0 ? (
          <p className="text-xs text-muted">No skills detected yet. Upload a resume to automatically detect skills.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-light text-primary text-xs font-semibold rounded-full border border-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
