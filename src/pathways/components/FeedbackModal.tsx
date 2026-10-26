// ============================================================
// Pathways Architecture — In-Product Feedback Modal
// Constitution B7 & Spec S10.5: Local issue generator with zero egress
// ============================================================

import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId?: string;
  field?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  subjectId = '',
  field = ''
}) => {
  const [targetSubject, setTargetSubject] = useState(subjectId);
  const [targetField, setTargetField] = useState(field);
  const [claimedValue, setClaimedValue] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const issueTemplate = {
    reportType: 'pathways_data_correction',
    subjectId: targetSubject,
    field: targetField,
    proposedValue: claimedValue,
    sourceUrl,
    rationale: note,
    submittedAt: new Date().toISOString()
  };

  const handleDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(issueTemplate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `correction-${targetSubject || 'report'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(issueTemplate, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-zinc-950 border border-zinc-700 shadow-2xl text-left text-zinc-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-white">Report an Error or Data Update</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">100% Client-Side. No telemetry transmitted.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-mono text-zinc-400 mb-1">Program / Subject ID</label>
            <input
              type="text"
              value={targetSubject}
              onChange={(e) => setTargetSubject(e.target.value)}
              placeholder="e.g. tcs-ninja, infosys-se, govt-incometax"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none focus:border-volt"
            />
          </div>

          <div>
            <label className="block font-mono text-zinc-400 mb-1">Field Name (Optional)</label>
            <input
              type="text"
              value={targetField}
              onChange={(e) => setTargetField(e.target.value)}
              placeholder="e.g. eligibility.cgpaMin, bondAmount"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none focus:border-volt"
            />
          </div>

          <div>
            <label className="block font-mono text-zinc-400 mb-1">Correct / Updated Value</label>
            <input
              type="text"
              value={claimedValue}
              onChange={(e) => setClaimedValue(e.target.value)}
              placeholder="e.g. 6.5, ₹0 bond, revised criteria"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none focus:border-volt"
            />
          </div>

          <div>
            <label className="block font-mono text-zinc-400 mb-1">Primary Source URL (Official circular / notice)</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://company.com/campus-circular"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none focus:border-volt"
            />
          </div>

          <div>
            <label className="block font-mono text-zinc-400 mb-1">Correction Notes / Context</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Provide exact quotes from the verified notification PDF or circular."
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-sans focus:outline-none focus:border-volt"
            />
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 font-mono">
            Exports structured JSON for GitHub
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-mono text-zinc-200 hover:bg-zinc-800"
            >
              {copied ? 'Copied! ✓' : 'Copy Payload'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-xs font-mono hover:bg-emerald-400"
            >
              Download JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
