// ============================================================
// HireFlow — Company ATS (Kanban Board)
// Premium Applicant Tracking System with drag-and-drop aesthetics
// ============================================================
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Search, Brain, Clock, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const ATS_STAGES = [
  { id: 'APPLIED', label: 'New Applied' },
  { id: 'SCREENING', label: 'Screening' },
  { id: 'INTERVIEW', label: 'Interviewing' },
  { id: 'OFFER', label: 'Offer Sent' },
  { id: 'HIRED', label: 'Hired' },
];

export function CompanyCandidates() {
  const { currentCompanyId, applications, users, candidateMatches, jobs } = useStore();
  const [search, setSearch] = useState('');
  
  const companyApps = applications.filter(a => a.companyId === currentCompanyId);

  // Group applications by status
  const getAppsForStage = (stageId: string) => {
    return companyApps
      .filter(a => a.status === stageId)
      .filter(a => {
        if (!search) return true;
        const user = users.find(u => u.id === a.candidateId);
        return user?.displayName.toLowerCase().includes(search.toLowerCase());
      });
  };

  return (
    <div className="space-y-[24px] animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-[16px] items-start sm:items-center justify-between shrink-0">
        <div>
          <h1 className="text-[24px] font-bold text-text tracking-tight">Applicant Tracking</h1>
          <p className="text-[14px] text-text-secondary">Drag and drop candidates across stages (Mock UI)</p>
        </div>
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-text-muted stroke-[2px]" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search candidate name..." 
            className="w-full pl-[40px] pr-[16px] h-[44px] bg-surface-2 border border-border rounded-xl text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
          />
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-[24px] pb-[16px]">
        {ATS_STAGES.map(stage => {
          const stageApps = getAppsForStage(stage.id);
          return (
            <div key={stage.id} className="w-[300px] shrink-0 flex flex-col max-h-full">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-[16px]">
                <h3 className="text-[14px] font-bold text-text flex items-center gap-[8px]">
                  <span className="w-[8px] h-[8px] rounded-full bg-primary inline-block"></span>
                  {stage.label}
                </h3>
                <span className="px-[8px] py-[2px] bg-surface-3 text-text-muted text-[12px] font-semibold rounded-full">
                  {stageApps.length}
                </span>
              </div>

              {/* Candidates Column */}
              <div className="flex-1 bg-surface-2/50 border border-border rounded-2xl p-[12px] flex flex-col gap-[12px] overflow-y-auto custom-scrollbar">
                {stageApps.length === 0 ? (
                  <div className="h-[100px] border-2 border-dashed border-border rounded-xl flex items-center justify-center text-[13px] text-text-muted">
                    No candidates here
                  </div>
                ) : (
                  stageApps.map(app => {
                    const candidate = users.find(u => u.id === app.candidateId);
                    const match = candidateMatches.find(m => m.applicationId === app.id);
                    const job = jobs.find(j => j.id === app.jobId);
                    
                    return (
                      <Link 
                        key={app.id} 
                        to={`/company/candidates/${app.candidateId}`}
                        className="block bg-surface border border-border p-[16px] rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-[12px]">
                          <div className="flex items-center gap-[10px]">
                            <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-primary-light to-primary/20 flex items-center justify-center text-primary text-[14px] font-bold">
                              {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-[14px] font-bold text-text group-hover:text-primary transition-colors">{candidate?.displayName}</h4>
                              <p className="text-[12px] text-text-secondary truncate w-[140px]">{job?.title}</p>
                            </div>
                          </div>
                          <button className="text-text-muted hover:text-text">
                            <MoreHorizontal className="w-[16px] h-[16px]" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-[12px] pt-[12px] border-t border-border/50">
                          <div className="flex items-center gap-[6px] text-[12px] text-text-muted font-medium">
                            <Clock className="w-[12px] h-[12px]" /> 
                            {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                          {match && (
                            <span className="px-[8px] py-[2px] bg-ai-light border border-ai/20 text-ai text-[11px] font-bold rounded-full flex items-center gap-[4px]">
                              <Brain className="w-[10px] h-[10px]" /> {match.overallScore}% AI Match
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
