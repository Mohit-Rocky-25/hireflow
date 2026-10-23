import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  ArrowRightLeft,
  Sparkles,
  Search,
} from 'lucide-react';
import { ExtractedRequirement } from '../../../lib/ats/types';

export interface ConfirmedRequirement {
  text: string;
  type: 'must' | 'nice';
  source?: string;
  inTaxonomy?: boolean;
}

interface ConfirmRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmed: ConfirmedRequirement[]) => void;
  extractedRequirements: ExtractedRequirement[];
  unrecognizedRequirements: ExtractedRequirement[];
}

export const ConfirmRequirementsModal: React.FC<ConfirmRequirementsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  extractedRequirements,
  unrecognizedRequirements,
}) => {
  const [mustHaves, setMustHaves] = useState<ConfirmedRequirement[]>(() =>
    extractedRequirements
      .filter((r) => r.type === 'must')
      .map((r) => ({
        text: r.canonical || r.text,
        type: 'must',
        source: r.sourceSentence,
        inTaxonomy: r.inTaxonomy,
      }))
  );

  const [niceToHaves, setNiceToHaves] = useState<ConfirmedRequirement[]>(() =>
    extractedRequirements
      .filter((r) => r.type === 'nice')
      .map((r) => ({
        text: r.canonical || r.text,
        type: 'nice',
        source: r.sourceSentence,
        inTaxonomy: r.inTaxonomy,
      }))
  );

  const [unrecognized, setUnrecognized] = useState<ExtractedRequirement[]>(() => unrecognizedRequirements);
  const [newSkillText, setNewSkillText] = useState('');
  const [newSkillType, setNewSkillType] = useState<'must' | 'nice'>('must');

  if (!isOpen) return null;

  const handleFlip = (item: ConfirmedRequirement, from: 'must' | 'nice') => {
    if (from === 'must') {
      setMustHaves((prev) => prev.filter((i) => i.text !== item.text));
      setNiceToHaves((prev) => [...prev, { ...item, type: 'nice' }]);
    } else {
      setNiceToHaves((prev) => prev.filter((i) => i.text !== item.text));
      setMustHaves((prev) => [...prev, { ...item, type: 'must' }]);
    }
  };

  const handleDelete = (text: string, from: 'must' | 'nice') => {
    if (from === 'must') {
      setMustHaves((prev) => prev.filter((i) => i.text !== text));
    } else {
      setNiceToHaves((prev) => prev.filter((i) => i.text !== text));
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillText.trim();
    if (!trimmed) return;

    // Check duplicate
    const exists = [...mustHaves, ...niceToHaves].some(
      (r) => r.text.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return;

    const newItem: ConfirmedRequirement = {
      text: trimmed,
      type: newSkillType,
      source: 'User manually added',
      inTaxonomy: true,
    };

    if (newSkillType === 'must') {
      setMustHaves((prev) => [...prev, newItem]);
    } else {
      setNiceToHaves((prev) => [...prev, newItem]);
    }
    setNewSkillText('');
  };

  const handleAdoptUnrecognized = (item: ExtractedRequirement, asType: 'must' | 'nice') => {
    setUnrecognized((prev) => prev.filter((i) => i.id !== item.id));
    const newItem: ConfirmedRequirement = {
      text: item.text,
      type: asType,
      source: item.sourceSentence,
      inTaxonomy: false,
    };
    if (asType === 'must') {
      setMustHaves((prev) => [...prev, newItem]);
    } else {
      setNiceToHaves((prev) => [...prev, newItem]);
    }
  };

  const handleDismissUnrecognized = (id: string) => {
    setUnrecognized((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmit = () => {
    onConfirm([...mustHaves, ...niceToHaves]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Search className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-foreground">
                Confirm Job Requirements
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Review what this job description actually requires before running the simulation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Must-Haves Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Must-Have Requirements ({mustHaves.length})
              </span>
              <span className="text-[11px] text-muted-foreground">
                Full weight in coverage pillar
              </span>
            </div>

            {mustHaves.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-3 rounded-lg bg-muted/20 border border-border">
                No must-have requirements extracted. Add one below.
              </p>
            ) : (
              <div className="grid gap-2">
                {mustHaves.map((item) => (
                  <div
                    key={item.text}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {item.text}
                        </span>
                        {!item.inTaxonomy && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">
                            custom
                          </span>
                        )}
                      </div>
                      {item.source && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-md italic">
                          "{item.source}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleFlip(item, 'must')}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                        title="Move to Nice-to-Have"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                        <span>Make Nice-to-Have</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.text, 'must')}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nice-to-Haves Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-500" />
                Nice-to-Have / Preferred ({niceToHaves.length})
              </span>
              <span className="text-[11px] text-muted-foreground">
                Secondary differentiator credit
              </span>
            </div>

            {niceToHaves.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-3 rounded-lg bg-muted/20 border border-border">
                No preferred skills found.
              </p>
            ) : (
              <div className="grid gap-2">
                {niceToHaves.map((item) => (
                  <div
                    key={item.text}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {item.text}
                        </span>
                        {!item.inTaxonomy && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">
                            custom
                          </span>
                        )}
                      </div>
                      {item.source && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-md italic">
                          "{item.source}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleFlip(item, 'nice')}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                        title="Move to Must-Have"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                        <span>Make Must-Have</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.text, 'nice')}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unrecognized Requirements Bucket (Stage 2C) */}
          {unrecognized.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Unrecognized JD Cue Terms ({unrecognized.length})
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    These terms were highlighted in cue phrases like "must have" or "experience with" but are not yet in the standard skills taxonomy. Adopt them if they are genuine requirements:
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                {unrecognized.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-card/80 border border-border text-xs gap-2"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{item.text}</span>
                      <p className="text-[10px] text-muted-foreground truncate max-w-sm italic mt-0.5">
                        "{item.sourceSentence}"
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleAdoptUnrecognized(item, 'must')}
                        className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-medium transition-colors"
                      >
                        + Must
                      </button>
                      <button
                        onClick={() => handleAdoptUnrecognized(item, 'nice')}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground text-[11px] font-medium transition-colors"
                      >
                        + Nice
                      </button>
                      <button
                        onClick={() => handleDismissUnrecognized(item.id)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Requirement */}
          <form onSubmit={handleAddCustom} className="pt-2 border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
              placeholder="Add another requirement (e.g. Docker, GraphQL, System Design)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
            <select
              value={newSkillType}
              onChange={(e) => setNewSkillType(e.target.value as 'must' | 'nice')}
              className="px-2.5 py-2 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-primary text-foreground"
            >
              <option value="must">Must-Have</option>
              <option value="nice">Nice-to-Have</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-card/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
          >
            Confirm & Run Simulation ({mustHaves.length} Must-Haves)
          </button>
        </div>
      </div>
    </div>
  );
};
