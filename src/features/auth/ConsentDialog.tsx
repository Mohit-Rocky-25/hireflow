import React from 'react';

interface ConsentDialogProps {
  isOpen: boolean;
  onConsent: (cloudSyncEnabled: boolean) => void;
}

export const ConsentDialog: React.FC<ConsentDialogProps> = ({ isOpen, onConsent }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="max-w-lg w-full bg-[#10100d] border border-neutral-800 p-6 rounded-lg shadow-xl">
        <h2 id="consent-title" className="text-base font-mono font-semibold text-neutral-100 mb-2">
          Data Storage Preference
        </h2>
        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
          Signed-in history (resume text, job description snapshots, and score audits) is stored in your private account, protected by Row Level Security. You can choose whether to sync this history across devices or keep it exclusively on this device.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-neutral-800">
          <button
            onClick={() => onConsent(false)}
            className="px-4 py-2 text-xs font-mono rounded border border-neutral-700 bg-[#181814] text-neutral-300 hover:bg-neutral-800 transition-colors focus:ring-2 focus:ring-[#faff69]"
          >
            Keep history on this device only
          </button>
          <button
            onClick={() => onConsent(true)}
            className="px-4 py-2 text-xs font-mono font-semibold rounded bg-[#faff69] text-[#090907] hover:bg-[#ebf059] transition-colors focus:ring-2 focus:ring-[#faff69]"
          >
            Sync history to my account
          </button>
        </div>
      </div>
    </div>
  );
};
