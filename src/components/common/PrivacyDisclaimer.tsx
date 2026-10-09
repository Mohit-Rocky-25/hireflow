import React, { useState } from 'react';
import { Shield, Lock, EyeOff, Trash2, Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function PrivacyDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [cleared, setCleared] = useState(false);
  const clearAllUserData = useStore((s) => s.clearAllUserData);

  const handleClear = () => {
    clearAllUserData();
    setCleared(true);
    setTimeout(() => {
      setCleared(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface-3 transition-colors border border-border"
        title="Privacy & Data Protection Notice"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Privacy & Data Protection</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface max-w-lg w-full rounded-xl border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-text text-base">Privacy & Data Governance</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-text-muted leading-relaxed">
              <div className="flex items-start gap-2.5">
                <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text block font-medium">Local-Only Processing</strong>
                  Your resumes, skills, and target JDs are parsed in-browser on your device. We do not transmit your documents to third-party ad networks or tracking brokers.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text block font-medium">DPDP Act 2023 Principles</strong>
                  We adhere to Purpose Limitation and Data Minimization. Mock evaluation data persists strictly in your browser session and is never repurposed.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text block font-medium">Right to Erasure (One-Click Deletion)</strong>
                  You retain full control over your candidate profile and demo data. Click below to instantly purge all stored records from this device.
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                onClick={handleClear}
                disabled={cleared}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
              >
                {cleared ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>All Data Erased</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Erase All My Data</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
