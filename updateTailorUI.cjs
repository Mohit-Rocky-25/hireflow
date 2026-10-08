const fs = require('fs');

const file = 'src/features/suite/tailor/TailorResumePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// The new results UI block
const newResultsUI = `        {/* RESULTS SECTION */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Score & Summary Banner */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    ATS Alignment Simulation for {result.targetRoleTitle}
                  </div>
                  <h3 className="text-xl font-extrabold text-text">
                    Projected Match: {result.projectedScoreAfter}% (Base: {result.scoreBefore}%)
                  </h3>
                  <div className="mt-2 text-sm text-text-secondary max-w-xl">
                    <p>✓ Must-haves matched: {result.mustHavesMatched.length} of {result.mustHavesMatched.length + result.mustHavesMissing.length}</p>
                    <p>✓ Nice-to-haves matched: {result.niceToHavesMatched.length} of {result.niceToHavesMatched.length + result.niceToHavesMissing.length}</p>
                    {result.unaskedSkills.length > 0 && <p className="text-xs text-text-muted mt-1">Note: You have {result.unaskedSkills.length} skills that the JD didn't explicitly ask for.</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="p-3 rounded-xl bg-surface-2 border border-border text-center min-w-[100px]">
                    <div className="text-lg font-extrabold text-text">{result.scoreBefore}%</div>
                    <div className="text-[10px] text-text-muted uppercase font-bold">Base Match</div>
                  </div>
                  <div className="text-primary font-extrabold text-lg">→</div>
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center min-w-[100px]">
                    <div className="text-lg font-extrabold text-primary">{result.projectedScoreAfter}%</div>
                    <div className="text-[10px] text-primary uppercase font-bold">Projected</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-4 border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <button onClick={handleDownloadMarkdown} className="px-4 py-2 bg-surface-2 hover:bg-surface-3 rounded-xl text-xs font-bold transition-colors border border-border flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Download (.txt / .md)
                  </button>
                  <button onClick={handleCopy} className="px-4 py-2 bg-surface-2 hover:bg-surface-3 rounded-xl text-xs font-bold transition-colors border border-border flex items-center gap-2">
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleSaveToProfile} className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-colors border border-primary/20 flex items-center gap-2">
                    {savedSuccess ? <CheckCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />} Save Version
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Bulk Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-3">
              <div className="flex gap-2">
                {(['all', 'highlight', 'reorder', 'rephrase', 'add_context'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={\`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer \${
                      typeFilter === t
                        ? 'bg-primary text-white'
                        : 'bg-surface hover:bg-surface-2 text-text-secondary border border-border'
                    }\`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold text-text-muted">
                  {Object.values(suggestionStatus).filter(s => s === 'accepted').length} accepted, {Object.values(suggestionStatus).filter(s => s === 'rejected').length} rejected, {Object.values(suggestionStatus).filter(s => s === 'pending').length} pending
                </div>
                <button
                  onClick={() => {
                    const allAcc: Record<string, 'accepted'|'pending'|'rejected'|'edited'> = {};
                    result.suggestions.forEach((s) => (allAcc[s.id] = 'accepted'));
                    setSuggestionStatus(allAcc);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold text-emerald-400 transition-colors cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  onClick={() => {
                    const allRej: Record<string, 'accepted'|'pending'|'rejected'|'edited'> = {};
                    result.suggestions.forEach((s) => (allRej[s.id] = 'rejected'));
                    setSuggestionStatus(allRej);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-400 transition-colors cursor-pointer"
                >
                  Reject All
                </button>
              </div>
            </div>

            {/* Gap Cards */}
            {result.gaps.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Missing Skills (Gaps)
                </h4>
                {result.gaps.map((gap, i) => (
                  <div key={i} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-text-secondary">
                    {gap}
                  </div>
                ))}
              </div>
            )}

            {/* Side-by-Side Diff Cards */}
            <div className="space-y-4">
              {filteredSuggestions.map((sug) => {
                const status = suggestionStatus[sug.id] || 'pending';
                const isEditing = activeEditingId === sug.id;
                const currentText = editedTexts[sug.id] || sug.proposedText;

                return (
                  <div
                    key={sug.id}
                    className={\`p-5 rounded-2xl bg-surface border transition-all \${
                      status === 'accepted' || status === 'edited'
                        ? 'border-emerald-500/30 shadow-xs'
                        : status === 'rejected'
                        ? 'border-border/50 opacity-60'
                        : 'border-primary/40 shadow-xs'
                    }\`}
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={\`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider \${
                            sug.type === 'reorder'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : sug.type === 'rephrase'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : sug.type === 'highlight'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }\`}
                        >
                          {sug.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-text-muted">
                          Section: {sug.section}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center gap-1.5">
                        {status === 'pending' && (
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            Pending Review
                          </span>
                        )}
                        {status === 'accepted' && (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Accepted
                          </span>
                        )}
                        {status === 'rejected' && (
                          <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                        {status === 'edited' && (
                          <span className="text-xs font-bold text-primary flex items-center gap-1">
                            <Edit3 className="w-3.5 h-3.5" /> Customized
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm font-semibold mb-3">{sug.rationale}</p>

                    {/* Side-by-side Diffs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {/* Left: Original */}
                      <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
                        <div className="text-[10px] text-text-muted font-bold uppercase mb-1">
                          Original Text
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed font-mono">
                          {sug.originalText}
                        </p>
                      </div>

                      {/* Right: Proposed / Edited */}
                      <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1 flex justify-between items-center">
                          <span>{isEditing ? 'Editing...' : 'Tailored'}</span>
                          {!isEditing && (
                             <button onClick={() => setActiveEditingId(sug.id)} className="text-primary hover:underline">Edit</button>
                          )}
                        </div>
                        {isEditing ? (
                          <div>
                            <textarea
                              className="w-full h-24 bg-bg border border-primary/50 rounded-lg p-2 text-xs font-mono text-text focus:outline-none"
                              defaultValue={currentText}
                              id={\`edit-\${sug.id}\`}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setActiveEditingId(null)}
                                className="px-3 py-1 rounded-md text-xs font-bold text-text-muted hover:text-text transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  const val = (document.getElementById(\`edit-\${sug.id}\`) as HTMLTextAreaElement).value;
                                  handleSaveEdit(sug.id, val);
                                }}
                                className="px-3 py-1 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                              >
                                Save & Verify
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-text leading-relaxed font-mono">
                            {currentText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Row */}
                    {!isEditing && (
                      <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          {sug.truthCheck.passed ? (
                            <span className="text-[10px] text-emerald-400/80 flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3 h-3" /> TruthCheck Passed
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
                              <XCircle className="w-3 h-3" /> {sug.truthCheck.reason}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(sug.id)}
                            className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer \${
                              status === 'rejected'
                                ? 'bg-surface-3 text-text-muted cursor-default'
                                : 'bg-surface-2 hover:bg-rose-500/10 hover:text-rose-400 text-text-secondary border border-border'
                            }\`}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAccept(sug.id)}
                            disabled={!sug.truthCheck.passed}
                            className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 \${
                              status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                                : !sug.truthCheck.passed
                                ? 'bg-surface-2 text-text-muted opacity-50 cursor-not-allowed border border-border'
                                : 'bg-primary text-white hover:bg-primary/90 border border-primary'
                            }\`}
                          >
                            {status === 'accepted' ? <Check className="w-3.5 h-3.5" /> : null}
                            {status === 'accepted' ? 'Accepted' : 'Accept'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Live Tailored Resume Preview */}
            <div className="bg-surface border border-border rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-extrabold mb-4">Live Tailored Preview</h3>
              <div className="bg-surface-2 p-4 rounded-xl border border-border">
                 <pre className="text-xs font-mono text-text whitespace-pre-wrap">{liveTailoredResume}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`;

const startIndex = content.indexOf('{/* RESULTS SECTION */}');
if (startIndex !== -1) {
  content = content.substring(0, startIndex) + newResultsUI;
  
  // also fix initialStatus in handleRunTailor
  content = content.replace(
    /const initialStatus: Record<string, 'accepted' \| 'rejected' \| 'edited'> = \{\};\n\s*res\.suggestions\.forEach\(\(s\) => \{\n\s*initialStatus\[s\.id\] = 'accepted';\n\s*\}\);/,
    `const initialStatus: Record<string, 'pending' | 'accepted' | 'rejected' | 'edited'> = {};
        res.suggestions.forEach((s) => {
          initialStatus[s.id] = 'pending';
        });`
  );
  
  // fix suggestionStatus type in useState
  content = content.replace(
    /useState<Record<string, 'accepted' \| 'rejected' \| 'edited'>>\(\{\}\)/,
    "useState<Record<string, 'pending' | 'accepted' | 'rejected' | 'edited'>>({})"
  );
  
  fs.writeFileSync(file, content);
  console.log("Replaced Results UI and states successfully.");
} else {
  console.log("Could not find RESULTS SECTION.");
}
