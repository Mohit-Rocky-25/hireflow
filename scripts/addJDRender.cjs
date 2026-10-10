const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'src/pages/demo/CompanyRolesPage.tsx');
let content = fs.readFileSync(file, 'utf8');

// I will insert a block just before `{/* Mobile-Only Action Panel` which is line 871.
const insertPoint = content.indexOf('{/* Mobile-Only Action Panel');
if (insertPoint !== -1) {
  const jdRenderCode = `
                      {/* Expanded JD Details */}
                      {isSelected && role.fullText && (
                        <div className="mt-2 p-5 bg-surface-2 rounded-xl border border-border animate-fade-in cursor-default text-left" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                            <h4 className="text-sm font-bold text-foreground">Complete Job Description</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(role.fullText || '');
                                  alert('JD Copied to clipboard!');
                                }}
                                className="px-3 py-1.5 bg-surface-3 hover:bg-surface border border-border rounded-lg text-xs font-bold text-text transition-colors flex items-center gap-1"
                              >
                                📋 Copy JD
                              </button>
                              <Link
                                to={\`/tools/resume-checker?company=\${company.id}&role=\${encodeURIComponent(role.title)}\`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                              >
                                🎯 Use in ATS Scanner
                              </Link>
                            </div>
                          </div>
                          
                          <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
                            {role.aboutRole && (
                              <div>
                                <h5 className="font-bold text-text mb-1">About the Role</h5>
                                <p>{role.aboutRole}</p>
                              </div>
                            )}
                            {role.responsibilities && role.responsibilities.length > 0 && (
                              <div>
                                <h5 className="font-bold text-text mb-1">Key Responsibilities</h5>
                                <ul className="list-disc pl-4 space-y-1">
                                  {role.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                              </div>
                            )}
                            {role.qualifications && role.qualifications.length > 0 && (
                              <div>
                                <h5 className="font-bold text-text mb-1">Qualifications</h5>
                                <ul className="list-disc pl-4 space-y-1">
                                  {role.qualifications.map((q, i) => <li key={i}>{q}</li>)}
                                </ul>
                              </div>
                            )}
                            {role.hiringProcess && role.hiringProcess.length > 0 && (
                              <div>
                                <h5 className="font-bold text-text mb-1">Interview Process</h5>
                                <div className="flex items-center gap-2 text-[11px] font-bold mt-2">
                                  {role.hiringProcess.map((step, i) => (
                                    <React.Fragment key={i}>
                                      <span className="px-2 py-1 bg-surface-3 rounded-md text-text">{step}</span>
                                      {i < role.hiringProcess!.length - 1 && <span className="text-text-muted">→</span>}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      `;
  content = content.substring(0, insertPoint) + jdRenderCode + content.substring(insertPoint);
  fs.writeFileSync(file, content);
  console.log('Added JD details');
} else {
  console.log('Could not find insertion point');
}
