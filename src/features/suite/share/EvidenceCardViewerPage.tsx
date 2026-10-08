// ============================================================
// Suite UI — Evidence Card Viewer (/card)
// Decision Group: "Connecting HireFlow's Roles"
// Public, read-only, zero-server verification page.
// Decodes compressed client-side fragment and verifies SHA-256 integrity.
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
  Copy,
  Check,
  FileCheck,
  User,
  Info,
} from 'lucide-react';
import { decodeCard, CodecDecodeResult, CompactCardEnvelope } from './cardCodec';

const SAMPLE_PAYLOAD_STRING =
  'eyJ2IjoxLCJjcmVhdGVkQXQiOiIyMDI2LTEwLTA4VDA5OjAwOjAwLjAwMFoiLCJkYXRhIjp7Im5hbWUiOiJBcmp1biBNZWh0YSIsImhlYWRsaW5lIjoiU29mdHdhcmUgRW5naW5lZXIgfCBSZWFjdCwgTm9kZS5qcywgR28iLCJ0YXJnZXRSb2xlRml0IjoiU3Ryb25nIG1hdGNoIGZvciBCYWNrZW5kIEVuZ2luZWVyIChQbGF0Zm9ybSkgcm9sZXMuIiwic2tpbGxzIjpbeyJuYW1lIjoiVHlwZVNjcmlwdCIsImV2aWRlbmNlTGV2ZWwiOjQsInF1b3RlIjoiQnVpbHQgaGlnaC10aHJvdWdocHV0IEFQSSBnYXRld2F5In0seyJuYW1lIjoiR28iLCJldmlkZW5jZUxldmVsIjozLCJxdW90ZSI6IkVuZ2luZWVyZWQgcmF0ZSBsaW1pdGVyIGluIEdvIn0seyJuYW1lIjoiUmVkaXMiLCJldmlkZW5jZUxldmVsIjozLCJxdW90ZSI6IkF0b21pYyBMdWEgc2NyaXB0cyBmb3Igc2xpZGluZy13aW5kb3cgY2FjaGluZyJ9LHsibmFtZSI6IlBvc3RncmVTUUwiLCJldmlkZW5jZUxldmVsIjoyLCJxdW90ZSI6IkRlc2lnbmVkIGRvdWJsZS1lbnRyeSBsZWRnZXIgc2NoZW1hcyJ9XSwiZXZpZGVuY2VTbmlwcGV0cyI6WyJCdWlsdCBoaWdoLXRocm91Z2hwdXQgQVBJIGdhdGV3YXkgcmVkdWNpbmcgcDk1IGxhdGVuY3kgYnkgNDAlIGFjcm9zcyA1MGsgcmVxL21pbi4iLCJFbmdpbmVlcmVkIGRpc3RyaWJ1dGVkIHJhdGUgbGltaXRpbmcgcHJveHkgaW4gR28gJiBSZWRpcyB1c2luZyBhdG9taWMgTHVhIHNjcmlwdHMgdW5kZXIgMjVrIFJQUyBsb2FkLiJdfSwiaGFzaCI6IjAwMDAwMDAwMDAwMCJ9';

export function EvidenceCardViewerPage() {
  const location = useLocation();
  const [decodeResult, setDecodeResult] = useState<CodecDecodeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [manualInput, setManualInput] = useState<string>('');

  useEffect(() => {
    let hash = window.location.hash || location.hash || '';
    if (hash.startsWith('#d=')) {
      hash = hash.substring(3);
    } else if (hash.startsWith('#')) {
      hash = hash.substring(1);
    }

    async function loadData(encoded: string) {
      setLoading(true);
      if (!encoded) {
        setDecodeResult(null);
        setLoading(false);
        return;
      }
      const res = await decodeCard(encoded);
      setDecodeResult(res);
      setLoading(false);
    }

    loadData(hash);
  }, [location]);

  const envelope = decodeResult?.envelope;
  const data = envelope?.data;

  const handleManualDecode = async () => {
    let raw = manualInput.trim();
    if (raw.includes('#d=')) {
      raw = raw.split('#d=')[1];
    }
    setLoading(true);
    const res = await decodeCard(raw);
    setDecodeResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col justify-between">
      {/* Top Banner */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold tracking-tight text-text">HireFlow Evidence Card</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Read-Only
            </span>
          </div>

          <Link
            to="/tools/evidence-card"
            className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
          >
            Create My Own Card <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 space-y-6 flex-1">
        {loading && (
          <div className="text-center py-20 text-text-muted text-xs animate-pulse">
            Verifying cryptographic signature and expanding card data...
          </div>
        )}

        {/* If No Fragment Provided */}
        {!loading && !envelope && (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-text">No Evidence Card Loaded</h2>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Evidence cards contain all verified data within the URL fragment. Paste a link below or inspect a sample card.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Paste card link or encoded string..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary font-mono"
              />
              <button
                onClick={handleManualDecode}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-surface transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        )}

        {/* Loaded Evidence Card */}
        {!loading && envelope && data && (
          <div className="space-y-6">
            {/* Integrity Status Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                decodeResult?.integrityPassed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {decodeResult?.integrityPassed ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold">
                    {decodeResult?.integrityPassed
                      ? 'Integrity Check Passed (SHA-256 Verified)'
                      : 'Integrity Verification Failed (Tampered or Corrupted Payload)'}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                    <strong>Honest Verification Note:</strong> Detects tampering after creation. It does not verify who
                    originally created the claim.
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-background/50 border border-border">
                  SHA-256 Digest
                </span>
              </div>
            </div>

            {/* Expiry Banner if applicable */}
            {decodeResult?.isExpired && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Notice:</strong> This card has expired (past requested soft expiry date). Content is displayed
                  for historical reference only.
                </span>
              </div>
            )}

            {/* Candidate Header Card */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-text tracking-tight">{data.name}</h1>
                  {data.headline && (
                    <p className="text-xs font-medium text-text-muted mt-1">{data.headline}</p>
                  )}
                </div>

                <div className="text-right text-[11px] text-text-muted">
                  <div>Created: {new Date(envelope.createdAt).toLocaleDateString()}</div>
                  {envelope.expiresAt && (
                    <div>Expires: {new Date(envelope.expiresAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              {data.targetRoleFit && (
                <div className="bg-background/60 border border-border p-3.5 rounded-xl text-xs text-text leading-relaxed">
                  <span className="font-bold text-text-muted uppercase text-[10px] block mb-1">
                    Target Role Alignment
                  </span>
                  {data.targetRoleFit}
                </div>
              )}

              {/* Skills with Verified Evidence Levels */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-primary" /> Verified Technical Competencies ({data.skills.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border bg-background/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">{skill.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            skill.evidenceLevel === 4
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : skill.evidenceLevel === 3
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : skill.evidenceLevel === 2
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                          }`}
                        >
                          Ladder L{skill.evidenceLevel}
                        </span>
                      </div>

                      {skill.quote ? (
                        <p className="text-[11px] text-text-muted italic line-clamp-2">
                          "{skill.quote}"
                        </p>
                      ) : (
                        <p className="text-[10px] text-text-muted">Listed in skills catalog</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Verbatim Evidence Proof Points */}
              {data.evidenceSnippets && data.evidenceSnippets.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Verbatim Production Proof Points
                  </span>
                  <div className="space-y-2">
                    {data.evidenceSnippets.map((snip, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-background border border-border text-xs font-mono text-text leading-relaxed"
                      >
                        • {snip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opt-In Contact Information (if present) */}
              {(data.email || data.phone || data.education || (data.links && data.links.length > 0)) && (
                <div className="pt-4 border-t border-border text-xs text-text-muted space-y-1.5">
                  <span className="font-bold text-text uppercase text-[10px] block">
                    Verified Contact &amp; Links (Provided by Candidate)
                  </span>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {data.email && <span>Email: <strong className="text-text">{data.email}</strong></span>}
                    {data.phone && <span>Phone: <strong className="text-text">{data.phone}</strong></span>}
                    {data.education && <span>Education: <strong className="text-text">{data.education}</strong></span>}
                  </div>
                </div>
              )}
            </div>

            {/* Zero-Storage Notice */}
            <div className="text-center text-[11px] text-text-muted pt-2">
              <span className="inline-flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                <strong>Stored Nowhere:</strong> This link contains all data in its cryptographic fragment. Zero database records were queried.
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-text-muted">
        HireFlow Suite • Pure In-Browser Determinism
      </footer>
    </div>
  );
}
export default EvidenceCardViewerPage;
