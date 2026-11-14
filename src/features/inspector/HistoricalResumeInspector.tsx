import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspectorState } from './useInspectorState';
import { InspectorHeader } from './InspectorHeader';
import { CompareControls } from './CompareControls';
import { ResumePane } from './ResumePane';
import { FindingsPane } from './FindingsPane';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface HistoricalResumeInspectorProps {
  auditId?: string;
  onClose?: () => void;
}

export const InspectorView: React.FC<HistoricalResumeInspectorProps> = ({
  auditId: propAuditId,
  onClose: propOnClose,
}) => {
  const { auditId: routeAuditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();

  const auditId = propAuditId || routeAuditId;
  const handleClose = propOnClose || (() => navigate('/?my=scans'));

  const {
    audit,
    resumeText,
    jdText,
    isLoading,
    error,
    compareAuditId,
    wordDiffs,
    availableCompareAudits,
    selectedFindingId,
    activeTab,
    setCompareAuditId,
    setSelectedFindingId,
    setActiveTab,
  } = useInspectorState(auditId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090907] flex items-center justify-center font-mono text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#faff69]" />
          <span>Loading historical audit snapshot...</span>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-[#090907] flex flex-col items-center justify-center p-6 font-mono text-xs text-neutral-300">
        <div className="max-w-md w-full bg-[#10100d] border border-neutral-800 rounded p-6 text-center space-y-4">
          <div className="text-rose-400 font-semibold text-sm">
            Audit Record Not Found
          </div>
          <p className="text-neutral-500 text-xs">
            The requested audit could not be located in your local journal or cloud vault.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded bg-[#141410] border border-neutral-700 text-[#faff69] hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090907] text-neutral-200 flex flex-col">
      <InspectorHeader audit={audit} onClose={handleClose} resumeText={resumeText ?? undefined} jdText={jdText ?? undefined} />

      <main className="max-w-[1600px] w-full mx-auto p-6 flex-1 flex flex-col space-y-4">
        {/* Comparison Toolbar */}
        <CompareControls
          availableAudits={availableCompareAudits}
          currentCompareId={compareAuditId}
          onSelectCompare={setCompareAuditId}
        />

        {/* Dual Pane Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch">
          <ResumePane
            label={audit.resume.label}
            resumeText={resumeText}
            evidence={audit.evidence}
            wordDiffs={wordDiffs}
            selectedFindingId={selectedFindingId}
            onSelectFinding={setSelectedFindingId}
          />

          <FindingsPane
            audit={audit}
            jdText={jdText}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedFindingId={selectedFindingId}
            onSelectFinding={setSelectedFindingId}
          />
        </div>
      </main>
    </div>
  );
};

export const HistoricalResumeInspector: React.FC<HistoricalResumeInspectorProps> = (props) => {
  return (
    <RequireAuth>
      <InspectorView {...props} />
    </RequireAuth>
  );
};

export default HistoricalResumeInspector;
