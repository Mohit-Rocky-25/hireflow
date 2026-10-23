import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-near-black border border-charcoal rounded-lg shadow-level-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal bg-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-near-black border border-charcoal text-volt">
                <Search className="w-5 h-5 stroke-[1.5px]" />
              </span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Confirm Job Requirements
              </h2>
            </div>
            <p className="text-xs text-silver mt-1">
              Review what this job description actually requires before running the simulation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-silver hover:text-white hover:bg-hover-gray rounded transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[1.5px]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Must-Haves Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-[1.4px] text-volt flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-volt stroke-[1.5px]" />
                Must-Have Requirements ({mustHaves.length})
              </span>
              <span className="text-[11px] text-silver uppercase tracking-[1px]">
                Full weight in coverage pillar
              </span>
            </div>

            {mustHaves.length === 0 ? (
              <p className="text-xs text-silver italic p-3 rounded bg-black border border-charcoal">
                No must-have requirements extracted. Add one below.
              </p>
            ) : (
              <div className="grid gap-2">
                {mustHaves.map((item) => (
                  <div
                    key={item.text}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-black border border-charcoal hover:border-volt/60 transition-colors gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {item.text}
                        </span>
                        {!item.inTaxonomy && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-near-black text-pale-yellow border border-pale-yellow/60 font-mono uppercase">
                            custom
                          </span>
                        )}
                      </div>
                      {item.source && (
                        <p className="text-[11px] text-silver truncate max-w-md italic">
                          "{item.source}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleFlip(item, 'must')}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-near-black hover:bg-hover-gray border border-charcoal text-silver hover:text-white transition-colors uppercase tracking-[1px]"
                        title="Move to Nice-to-Have"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-silver stroke-[1.5px]" />
                        <span>Make Nice</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.text, 'must')}
                        className="p-1.5 rounded text-silver hover:text-danger hover:bg-black transition-colors"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5px]" />
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
              <span className="text-xs font-mono font-bold uppercase tracking-[1.4px] text-silver flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-volt stroke-[1.5px]" />
                Nice-to-Have / Preferred ({niceToHaves.length})
              </span>
              <span className="text-[11px] text-silver uppercase tracking-[1px]">
                Secondary differentiator credit
              </span>
            </div>

            {niceToHaves.length === 0 ? (
              <p className="text-xs text-silver italic p-3 rounded bg-black border border-charcoal">
                No preferred skills found.
              </p>
            ) : (
              <div className="grid gap-2">
                {niceToHaves.map((item) => (
                  <div
                    key={item.text}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-black border border-charcoal hover:border-volt/60 transition-colors gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {item.text}
                        </span>
                        {!item.inTaxonomy && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-near-black text-pale-yellow border border-pale-yellow/60 font-mono uppercase">
                            custom
                          </span>
                        )}
                      </div>
                      {item.source && (
                        <p className="text-[11px] text-silver truncate max-w-md italic">
                          "{item.source}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleFlip(item, 'nice')}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-near-black hover:bg-hover-gray border border-charcoal text-silver hover:text-white transition-colors uppercase tracking-[1px]"
                        title="Move to Must-Have"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-silver stroke-[1.5px]" />
                        <span>Make Must</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.text, 'nice')}
                        className="p-1.5 rounded text-silver hover:text-danger hover:bg-black transition-colors"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unrecognized Requirements Bucket */}
          {unrecognized.length > 0 && (
            <div className="p-4 rounded bg-black border border-charcoal space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-pale-yellow shrink-0 mt-0.5 stroke-[1.5px]" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-[1.4px]">
                    Unrecognized JD Cue Terms ({unrecognized.length})
                  </h4>
                  <p className="text-[11px] text-silver mt-1">
                    These terms were highlighted in cue phrases like "must have" or "experience with" but are not yet in the standard skills taxonomy. Adopt them if they are genuine requirements:
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                {unrecognized.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded bg-near-black border border-charcoal text-xs gap-2"
                  >
                    <div>
                      <span className="font-bold text-white">{item.text}</span>
                      <p className="text-[10px] text-silver truncate max-w-sm italic mt-0.5">
                        "{item.sourceSentence}"
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleAdoptUnrecognized(item, 'must')}
                        className="px-2 py-0.5 rounded bg-black text-volt border border-volt/60 hover:bg-hover-gray text-[11px] font-semibold transition-colors uppercase"
                      >
                        + Must
                      </button>
                      <button
                        onClick={() => handleAdoptUnrecognized(item, 'nice')}
                        className="px-2 py-0.5 rounded bg-black text-silver hover:text-white border border-charcoal text-[11px] font-semibold transition-colors uppercase"
                      >
                        + Nice
                      </button>
                      <button
                        onClick={() => handleDismissUnrecognized(item.id)}
                        className="p-1 text-silver hover:text-white"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3 stroke-[1.5px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Requirement */}
          <form onSubmit={handleAddCustom} className="pt-2 border-t border-charcoal flex items-center gap-2">
            <input
              type="text"
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
              placeholder="Add another requirement (e.g. Docker, GraphQL, System Design)..."
              className="flex-1 px-3 py-2 text-xs rounded bg-black border border-charcoal focus:outline-none focus:border-volt text-white placeholder:text-silver"
            />
            <select
              value={newSkillType}
              onChange={(e) => setNewSkillType(e.target.value as 'must' | 'nice')}
              className="px-2.5 py-2 text-xs rounded bg-black border border-charcoal focus:outline-none focus:border-volt text-white uppercase font-semibold"
            >
              <option value="must">Must-Have</option>
              <option value="nice">Nice-to-Have</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-2 rounded bg-near-black hover:bg-hover-gray border border-charcoal text-white text-xs font-semibold uppercase tracking-[1px] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[1.5px]" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-charcoal bg-black">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-[1px] rounded text-silver hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold uppercase tracking-[1.4px] rounded bg-volt text-[#151515] border border-volt hover:bg-[#1d1d1d] hover:text-white transition-colors"
          >
            Confirm &amp; Run Simulation ({mustHaves.length} Must-Haves)
          </button>
        </div>
      </div>
    </div>
  );
};
