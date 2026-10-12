import React from 'react';
import { ResumeDocModel } from '../../../../../lib/tailorEngine/docModel';

interface TemplateProps {
  model: ResumeDocModel;
  showChanges: boolean;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ model, showChanges }) => {
  const contactParts: string[] = [];
  if (model.contact.email) contactParts.push(model.contact.email);
  if (model.contact.phone) contactParts.push(model.contact.phone);
  if (model.contact.location) contactParts.push(model.contact.location);
  if (model.contact.headline) contactParts.push(model.contact.headline);
  if (model.contact.links) contactParts.push(...model.contact.links);

  const cleanBullet = (text: string) => text.replace(/^[-•*●▪‣]\s*/, '').trim();

  const renderSummary = () => {
    if (!model.summary) return null;
    return (
      <section key="summary" className="mt-3.5">
        <h2 className="text-[10pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
          Profile Summary
        </h2>
        <p className="text-[9.5pt] text-zinc-700 leading-relaxed">
          {model.summary}
        </p>
      </section>
    );
  };

  const renderEducation = () => {
    if (model.education.length === 0) return null;
    return (
      <section key="education" className="mt-3.5">
        <h2 className="text-[10pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
          Education
        </h2>
        <div className="space-y-1.5">
          {model.education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-baseline text-[9.5pt]">
              <div>
                <span className="font-bold text-zinc-950">{edu.degree}</span>
                {edu.details && <span className="text-zinc-600">, {edu.details}</span>}
                {edu.institution && <span className="text-zinc-600"> — {edu.institution}</span>}
              </div>
              {edu.year && <span className="text-zinc-500 font-semibold text-[9pt]">{edu.year}</span>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (model.skills.length === 0) return null;
    const isAdded = (s: string) => showChanges && Boolean(model.addedSkills?.includes(s));

    // Merge single-item orphan categories to avoid orphan 1-item lines
    const mergedCategories = (() => {
      if (!model.skillCategories || model.skillCategories.length <= 1) return model.skillCategories || [];
      const valid: Array<{ category: string; skills: string[] }> = [];
      const orphans: string[] = [];
      for (const g of model.skillCategories) {
        if (g.skills.length < 2) {
          orphans.push(...g.skills);
        } else {
          valid.push({ category: g.category, skills: [...g.skills] });
        }
      }
      if (orphans.length > 0) {
        if (valid.length > 0) {
          for (const s of orphans) {
            if (!valid[0].skills.includes(s)) valid[0].skills.push(s);
          }
        } else {
          valid.push({ category: 'Core Skills', skills: orphans });
        }
      }
      return valid;
    })();

    return (
      <section key="skills" className="mt-3.5">
        <h2 className="text-[10pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
          Technical Skills
        </h2>
        {mergedCategories.length > 0 ? (
          <div className="space-y-1.5 text-[9.2pt]">
            {mergedCategories.map((group) => (
              <div key={group.category} className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-zinc-900 min-w-[140px]">{group.category}:</span>
                <div className="flex flex-wrap gap-1">
                  {group.skills.map((s, i) => (
                    <span
                      key={i}
                      className={`font-medium px-2 py-0.5 rounded text-[8.8pt] ${
                        isAdded(s)
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold shadow-2xs'
                          : 'bg-indigo-50/70 text-indigo-950 border border-indigo-100/80'
                      }`}
                    >
                      {isAdded(s) ? `+${s}` : s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {model.skills.map((s, i) => (
              <span
                key={i}
                className={`font-medium px-2 py-0.5 rounded text-[9pt] ${
                  isAdded(s)
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold shadow-2xs'
                    : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                }`}
              >
                {isAdded(s) ? `+${s}` : s}
              </span>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderProjects = () => {
    if (model.projects.length === 0) return null;
    return (
      <section key="projects" className="mt-3.5">
        <h2 className="text-[10pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
          Key Projects
        </h2>
        <div className="space-y-2.5">
          {model.projects.map((proj, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-baseline text-[9.8pt]">
                <span className="font-bold text-zinc-950">{proj.name}</span>
                {proj.linkOrTech && (
                  <span className="text-[8.8pt] text-indigo-600 font-mono font-medium">{proj.linkOrTech}</span>
                )}
              </div>
              {proj.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.4pt] text-zinc-700">
                  {proj.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded font-medium border-l-[3px] border-emerald-500 inline-block">
                          {cleanBullet(b.text)}
                          <span className="ml-2 text-[7pt] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded tracking-wider">
                            Updated
                          </span>
                        </span>
                      ) : (
                        cleanBullet(b.text)
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (model.experience.length === 0) return null;
    return (
      <section key="experience" className="mt-3.5">
        <h2 className="text-[10pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
          Experience
        </h2>
        <div className="space-y-2.5">
          {model.experience.map((exp, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-baseline text-[9.8pt]">
                <div>
                  <span className="font-bold text-zinc-950">{exp.role}</span>
                  {exp.company && <span className="text-zinc-700 font-medium"> @ {exp.company}</span>}
                </div>
                {exp.dates && (
                  <span className="text-[8.8pt] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                    {exp.dates}
                  </span>
                )}
              </div>
              {exp.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.4pt] text-zinc-700">
                  {exp.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded font-medium border-l-[3px] border-emerald-500 inline-block">
                          {cleanBullet(b.text)}
                          <span className="ml-2 text-[7pt] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded tracking-wider">
                            Updated
                          </span>
                        </span>
                      ) : (
                        cleanBullet(b.text)
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderLeadership = () => {
    if (!model.leadership || model.leadership.length === 0) return null;
    return (
      <section key="leadership" className="mt-3.5">
        <h2 className="text-[10pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
          Leadership & Involvement
        </h2>
        <div className="space-y-2.5">
          {model.leadership.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-baseline text-[9.8pt]">
                <div>
                  <span className="font-bold text-zinc-950">{item.role}</span>
                  {item.company && <span className="text-zinc-700 font-medium"> @ {item.company}</span>}
                </div>
                {item.dates && (
                  <span className="text-[8.8pt] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                    {item.dates}
                  </span>
                )}
              </div>
              {item.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.4pt] text-zinc-700">
                  {item.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded font-medium border-l-[3px] border-emerald-500 inline-block">
                          {cleanBullet(b.text)}
                          <span className="ml-2 text-[7pt] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded tracking-wider">
                            Updated
                          </span>
                        </span>
                      ) : (
                        cleanBullet(b.text)
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertifications = () => {
    if (!model.certifications || model.certifications.length === 0) return null;
    return (
      <section key="certifications" className="mt-3.5">
        <h2 className="text-[10pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
          Certifications & Continuous Learning
        </h2>
        <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.4pt] text-zinc-700">
          {model.certifications.map((cert, idx) => (
            <li key={idx} className="leading-snug">
              {cert}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderAchievements = () => {
    if (!model.achievements || model.achievements.length === 0) return null;
    return (
      <section key="achievements" className="mt-3.5">
        <h2 className="text-[10pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
          Honors & Achievements
        </h2>
        <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.4pt] text-zinc-700">
          {model.achievements.map((ach, idx) => (
            <li key={idx} className="leading-snug">
              {ach}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderLanguages = () => {
    if (!model.languages || model.languages.length === 0) return null;
    return (
      <section key="languages" className="mt-3.5">
        <h2 className="text-[10pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
          Languages
        </h2>
        <p className="text-[9.4pt] text-zinc-700">
          {model.languages.join('  •  ')}
        </p>
      </section>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: renderSummary,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    experience: renderExperience,
    leadership: renderLeadership,
    certifications: renderCertifications,
    achievements: renderAchievements,
    languages: renderLanguages
  };

  return (
    <div className="font-sans text-[10pt] text-zinc-900 leading-normal max-w-none">
      {/* Header with accent bar */}
      <header className="pb-2.5 border-b-2 border-indigo-600">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
          {model.contact.name}
        </h1>
        {model.contact.headline && (
          <p className="text-xs sm:text-sm font-semibold text-indigo-700 mt-0.5">
            {model.contact.headline}
          </p>
        )}
        {contactParts.length > 0 && (() => {
          const filtered = contactParts.filter((p) => p !== model.contact.headline);
          const rows = filtered.length <= 4
            ? [filtered]
            : [filtered.slice(0, Math.ceil(filtered.length / 2)), filtered.slice(Math.ceil(filtered.length / 2))];

          return (
            <div className="space-y-0.5 mt-1">
              {rows.map((row, rIdx) => (
                <p key={rIdx} className="text-[9pt] text-zinc-600 flex flex-wrap gap-x-3">
                  {row.map((p, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-zinc-400">•</span>}
                      {p}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          );
        })()}
      </header>

      {/* Dynamic Preset Section Ordering */}
      {model.sectionOrder.map((secKey) => (
        <React.Fragment key={secKey}>
          {sectionRenderers[secKey] ? sectionRenderers[secKey]() : null}
        </React.Fragment>
      ))}
    </div>
  );
};
