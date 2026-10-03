import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { Search, Brain, Clock, MoreHorizontal, LayoutGrid, List, Filter, XCircle, CheckCircle, CalendarPlus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Components';
import { toast } from '../../components/ui/Toast';

const ATS_STAGES = [
  { id: 'APPLIED', label: 'New Applied' },
  { id: 'SCREENING', label: 'Screening' },
  { id: 'INTERVIEW', label: 'Interviewing' },
  { id: 'OFFER', label: 'Offer Sent' },
  { id: 'HIRED', label: 'Hired' },
  { id: 'REJECTED', label: 'Rejected' }
];

export function CompanyCandidates() {
  const { currentCompanyId, applications, users, candidateMatches, jobs, updateApplicationStatus } = useStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [jobFilter, setJobFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  
  const companyApps = applications.filter(a => a.companyId === currentCompanyId);

  const filteredApps = companyApps.filter(a => {
    if (jobFilter !== 'all' && a.jobId !== jobFilter) return false;
    if (stageFilter !== 'all' && a.status !== stageFilter) return false;
    if (search) {
      const candidate = users.find(u => u.id === a.candidateId);
      const name = candidate?.displayName || '';
      return name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const getAppsForStage = (stageId: string) => {
    return filteredApps.filter(a => a.status === stageId);
  };

  const getCandidateName = (id: string) => {
    const u = users.find(u => u.id === id);
    return u?.displayName || 'Unknown';
  };

  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('appId', appId);
    setDraggedAppId(appId);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    if (appId) {
      updateApplicationStatus(appId, stageId as any, `Moved to ${stageId} via Kanban`);
      toast('success', `Candidate moved to ${stageId}`);
    }
    setDraggedAppId(null);
  };

  const quickAction = (e: React.MouseEvent, appId: string, stageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    updateApplicationStatus(appId, stageId as any, `Quick action: ${stageId}`);
    toast('success', `Candidate moved to ${stageId}`);
  };

  return (
    <div className="space-y-[24px] animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-[16px] items-start sm:items-center justify-between shrink-0">
        <div>
          <h1 className="text-[24px] font-bold text-text tracking-tight">Candidates</h1>
          <p className="text-[14px] text-text-secondary">Manage applicants across all roles</p>
        </div>
        <div className="flex flex-wrap items-center gap-[12px] w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-[240px]">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-text-muted" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search name..." 
              className="w-full pl-[36px] pr-[12px] h-[36px] bg-surface-2 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <select 
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="h-[36px] px-[12px] bg-surface-2 border border-border rounded-lg text-[13px] text-text outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Jobs</option>
            {jobs.filter(j => j.companyId === currentCompanyId).map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          {viewMode === 'table' && (
            <select 
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="h-[36px] px-[12px] bg-surface-2 border border-border rounded-lg text-[13px] text-text outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Stages</option>
              {ATS_STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          )}
          <div className="flex items-center bg-surface-2 border border-border rounded-lg p-[2px]">
            <button 
              onClick={() => setViewMode('board')}
              className={`p-[6px] rounded-md transition-colors ${viewMode === 'board' ? 'bg-surface shadow-sm text-text' : 'text-text-muted hover:text-text'}`}
              title="Board View"
            >
              <LayoutGrid className="w-[16px] h-[16px]" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-[6px] rounded-md transition-colors ${viewMode === 'table' ? 'bg-surface shadow-sm text-text' : 'text-text-muted hover:text-text'}`}
              title="Table View"
            >
              <List className="w-[16px] h-[16px]" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'board' ? (
        /* Kanban Board Container */
        <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-[24px] pb-[16px]">
          {ATS_STAGES.map(stage => {
            const stageApps = getAppsForStage(stage.id);
            return (
              <div key={stage.id} className="w-[320px] shrink-0 flex flex-col max-h-full">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-[16px] px-2 border-b border-border pb-2">
                  <h3 className="text-[14px] font-bold text-text flex items-center gap-[8px]">
                    <span className={`w-[8px] h-[8px] rounded-full inline-block ${
                      stage.id === 'REJECTED' ? 'bg-danger' : 
                      stage.id === 'HIRED' ? 'bg-success' : 'bg-primary'
                    }`}></span>
                    {stage.label}
                  </h3>
                  <span className="px-[8px] py-[2px] bg-surface-3 text-text-muted text-[12px] font-bold rounded-full">
                    {stageApps.length}
                  </span>
                </div>

                {/* Candidates Column (Drop Zone) */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`flex-1 rounded-xl p-[12px] flex flex-col gap-[12px] overflow-y-auto custom-scrollbar transition-colors border-2 ${
                    draggedAppId ? 'border-primary/20 bg-primary/5' : 'border-transparent bg-surface-2/50'
                  }`}
                >
                  {stageApps.length === 0 ? (
                    <div className="h-[100px] border-2 border-dashed border-border rounded-xl flex items-center justify-center text-[13px] text-text-muted">
                      Drop here
                    </div>
                  ) : (
                    stageApps.map(app => {
                      const name = getCandidateName(app.candidateId);
                      const match = candidateMatches.find(m => m.applicationId === app.id);
                      const job = jobs.find(j => j.id === app.jobId);
                      
                      return (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onDragEnd={() => setDraggedAppId(null)}
                          className={`relative block bg-surface border border-border p-[16px] rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing group ${draggedAppId === app.id ? 'opacity-50 scale-95' : ''}`}
                        >
                          <Link to={`/company/candidates/${app.candidateId}`} className="block">
                            <div className="flex items-start justify-between mb-[12px]">
                              <div className="flex items-center gap-[10px]">
                                <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-primary-light to-primary/20 flex items-center justify-center text-primary text-[14px] font-bold">
                                  {name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-bold text-text group-hover:text-primary transition-colors">{name}</h4>
                                  <p className="text-[11px] text-text-secondary truncate w-[140px] mt-0.5 font-medium">{job?.title}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* AI Insights Chip */}
                            {match && (
                              <div className="mb-[12px] bg-ai-light/30 border border-ai/10 rounded-lg p-2 flex gap-2 items-start">
                                <Brain className="w-[12px] h-[12px] text-ai shrink-0 mt-0.5" />
                                <div className="text-[11px] text-text-secondary leading-tight">
                                  <span className="font-bold text-ai">{match.overallScore}% Match</span> — {
                                    match.overallScore > 80 ? 'Strong backend architecture skills.' :
                                    match.overallScore > 60 ? 'Good fit, needs system design check.' :
                                    'Lacks required cloud experience.'
                                  }
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-[12px] pt-[12px] border-t border-border/50">
                              <div className="flex items-center gap-[6px] text-[11px] text-text-muted font-medium">
                                <Clock className="w-[12px] h-[12px]" /> 
                                {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </Link>
                          
                          {/* Quick Actions Hover Menu */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-surface/90 p-1 rounded-lg shadow-sm border border-border backdrop-blur-sm z-10">
                            {stage.id !== 'INTERVIEW' && stage.id !== 'REJECTED' && stage.id !== 'HIRED' && (
                              <button onClick={(e) => quickAction(e, app.id, 'INTERVIEW')} className="p-1.5 text-primary hover:bg-primary-light rounded-md" title="Move to Interview">
                                <CalendarPlus className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {stage.id !== 'REJECTED' && stage.id !== 'HIRED' && (
                              <button onClick={(e) => quickAction(e, app.id, 'REJECTED')} className="p-1.5 text-danger hover:bg-danger-bg rounded-md" title="Reject Candidate">
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {stage.id === 'OFFER' && (
                              <button onClick={(e) => quickAction(e, app.id, 'HIRED')} className="p-1.5 text-success hover:bg-success-bg rounded-md" title="Mark as Hired">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View Container */
        <div className="flex-1 bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-surface-2 z-10">
                <tr className="border-b border-border">
                  <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Candidate</th>
                  <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Applied Role</th>
                  <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Stage</th>
                  <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">AI Match</th>
                  <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Applied On</th>
                  <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-[20px] py-[40px] text-center text-[13px] text-text-secondary">
                      No candidates found matching the current filters.
                    </td>
                  </tr>
                ) : filteredApps.map(app => {
                  const name = getCandidateName(app.candidateId);
                  const job = jobs.find(j => j.id === app.jobId);
                  const match = candidateMatches.find(m => m.applicationId === app.id);

                  return (
                    <tr key={app.id} className="hover:bg-surface-2 transition-colors duration-150">
                      <td className="px-[20px] py-[16px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-primary-light to-primary/20 flex items-center justify-center text-primary text-[12px] font-bold">
                            {name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-text">{name}</div>
                            <div className="text-[12px] text-text-muted">#{app.id.substring(0,8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[20px] py-[16px]">
                        <div className="text-[13px] text-text font-medium">{job?.title || 'Unknown Job'}</div>
                        <div className="text-[12px] text-text-secondary">{job?.department || 'Department'}</div>
                      </td>
                      <td className="px-[20px] py-[16px]">
                        <Badge variant={
                          app.status === 'HIRED' || app.status === 'OFFER' ? 'success' :
                          app.status === 'REJECTED' ? 'danger' :
                          app.status === 'INTERVIEW' ? 'primary' :
                          'default'
                        }>{app.status}</Badge>
                      </td>
                      <td className="px-[20px] py-[16px]">
                        {match ? (
                          <div className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[11px] font-bold ${match.overallScore >= 80 ? 'bg-ai-light text-ai border border-ai/20' : match.overallScore >= 60 ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            <Brain className="w-[10px] h-[10px]" /> {match.overallScore}%
                          </div>
                        ) : (
                          <span className="text-[12px] text-text-muted">-</span>
                        )}
                      </td>
                      <td className="px-[20px] py-[16px] text-[13px] text-text">
                        {new Date(app.appliedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-[20px] py-[16px] text-right">
                        <Link 
                          to={`/company/candidates/${app.candidateId}`}
                          className="text-[13px] font-medium text-primary hover:text-primary-hover hover:underline"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
