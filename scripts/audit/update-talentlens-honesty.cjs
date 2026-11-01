const fs = require('fs');

// 1. Update src/lib/companySearchEngine.ts
const searchEnginePath = 'src/lib/companySearchEngine.ts';
let searchEngineContent = fs.readFileSync(searchEnginePath, 'utf8').replace(/\r\n/g, '\n');

const checkDepthTarget = `function checkDepthMatch(c: any, depthFilter: string): boolean {
  if (!depthFilter || depthFilter === 'All') return true;
  if (depthFilter === 'live_ats') {
    return isLiveAtsCompany(c);
  }
  if (depthFilter === 'benchmarks') {
    return !isLiveAtsCompany(c);
  }
  return c.depth === depthFilter;
}`;

const checkDepthReplacement = `function checkDepthMatch(c: any, depthFilter: string): boolean {
  if (!depthFilter || depthFilter === 'All') return true;
  if (depthFilter === 'full_only') {
    return c.depth !== 'basic' && !c.isBasicListing;
  }
  if (depthFilter === 'basic_only') {
    return c.depth === 'basic' || Boolean(c.isBasicListing);
  }
  if (depthFilter === 'live_ats') {
    return isLiveAtsCompany(c);
  }
  if (depthFilter === 'benchmarks') {
    return !isLiveAtsCompany(c);
  }
  return c.depth === depthFilter;
}`;

searchEngineContent = searchEngineContent.replace(checkDepthTarget, checkDepthReplacement);
fs.writeFileSync(searchEnginePath, searchEngineContent, 'utf8');
console.log('companySearchEngine.ts updated');

// 2. Update MatchingDemo.tsx
const matchingDemoPath = 'src/pages/demo/MatchingDemo.tsx';
let matchingDemoContent = fs.readFileSync(matchingDemoPath, 'utf8').replace(/\r\n/g, '\n');

// Add fullProfilesCount calculation
const fullProfilesCalcTarget = `  const cleanCompanies = React.useMemo(() => deduplicateCompanies(COMPANIES), []);
  const liveCount = React.useMemo(() => cleanCompanies.filter(isLiveAtsCompany).length, [cleanCompanies]);`;

const fullProfilesCalcReplacement = `  const cleanCompanies = React.useMemo(() => deduplicateCompanies(COMPANIES), []);
  const liveCount = React.useMemo(() => cleanCompanies.filter(isLiveAtsCompany).length, [cleanCompanies]);
  const fullProfilesCount = React.useMemo(() => cleanCompanies.filter(c => c.depth !== 'basic' && !c.isBasicListing).length, [cleanCompanies]);
  const basicCount = cleanCompanies.length - fullProfilesCount;`;

matchingDemoContent = matchingDemoContent.replace(fullProfilesCalcTarget, fullProfilesCalcReplacement);

// Update select dropdown options
const selectDropdownTarget = `                  <option value="All">All Profiles ({cleanCompanies.length})</option>
                  <option value="live_ats">🟢 Live Public ATS ({liveCount})</option>
                  <option value="benchmarks">🔵 Calibrated Benchmarks ({cleanCompanies.length - liveCount})</option>
                  <option value="deep">Deep (Campus Verified)</option>
                  <option value="standard">Standard (Careers)</option>
                  <option value="basic">Basic (Profile Only)</option>`;

const selectDropdownReplacement = `                  <option value="All">All Employers ({cleanCompanies.length})</option>
                  <option value="full_only">Full Profiles Only ({fullProfilesCount})</option>
                  <option value="basic_only">Basic Directory Listings ({basicCount})</option>
                  <option value="live_ats">ATS Catalog ({liveCount})</option>
                  <option value="benchmarks">Calibrated Benchmarks ({cleanCompanies.length - liveCount})</option>`;

matchingDemoContent = matchingDemoContent.replace(selectDropdownTarget, selectDropdownReplacement);

// Update filter pills strip
const filterPillsTarget = `              {/* Live ATS vs Benchmark Source Filter Pills */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-charcoal/80 flex-wrap text-xs font-mono">
                <span className="text-silver uppercase tracking-wider text-[11px] font-bold">Catalog Source:</span>
                <button
                  type="button"
                  onClick={() => setDepthFilter('All')}
                  className={\`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer border \${
                    depthFilter === 'All'
                      ? 'bg-volt text-black border-volt shadow-[0_0_10px_rgba(245,255,0,0.2)]'
                      : 'bg-black text-silver border-charcoal hover:text-white hover:border-neutral-600'
                  }\`}
                >
                  All ({cleanCompanies.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDepthFilter('live_ats')}
                  className={\`px-3 py-1 rounded text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer border \${
                    depthFilter === 'live_ats'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                      : 'bg-black text-emerald-400/80 border-emerald-500/40 hover:text-emerald-300 hover:border-emerald-400'
                  }\`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ATS Catalog Listings ({liveCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDepthFilter('benchmarks')}
                  className={\`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer border \${
                    depthFilter === 'benchmarks'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                      : 'bg-black text-neutral-400 border-neutral-700 hover:text-white hover:border-neutral-500'
                  }\`}
                >
                  <span>Calibrated Benchmarks ({cleanCompanies.length - liveCount})</span>
                </button>
              </div>`;

const filterPillsReplacement = `              {/* Full Profiles vs Basic Directory & Catalog Filter Pills */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-charcoal/80 flex-wrap text-xs font-mono">
                <span className="text-silver uppercase tracking-wider text-[11px] font-bold">Catalog Tier:</span>
                <button
                  type="button"
                  onClick={() => setDepthFilter('full_only')}
                  className={\`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer border \${
                    depthFilter === 'full_only'
                      ? 'bg-volt text-black border-volt shadow-[0_0_10px_rgba(245,255,0,0.2)]'
                      : 'bg-black text-silver border-charcoal hover:text-white hover:border-neutral-600'
                  }\`}
                >
                  Full Profiles Only ({fullProfilesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDepthFilter('All')}
                  className={\`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer border \${
                    depthFilter === 'All'
                      ? 'bg-volt text-black border-volt shadow-[0_0_10px_rgba(245,255,0,0.2)]'
                      : 'bg-black text-silver border-charcoal hover:text-white hover:border-neutral-600'
                  }\`}
                >
                  All Employers ({cleanCompanies.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDepthFilter('basic_only')}
                  className={\`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer border \${
                    depthFilter === 'basic_only'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-black text-neutral-400 border-charcoal hover:text-white'
                  }\`}
                >
                  Basic Directory ({basicCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDepthFilter('live_ats')}
                  className={\`px-3 py-1 rounded text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer border \${
                    depthFilter === 'live_ats'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                      : 'bg-black text-emerald-400/80 border-emerald-500/40 hover:text-emerald-300 hover:border-emerald-400'
                  }\`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ATS Catalog ({liveCount})</span>
                </button>
              </div>`;

matchingDemoContent = matchingDemoContent.replace(filterPillsTarget, filterPillsReplacement);
fs.writeFileSync(matchingDemoPath, matchingDemoContent, 'utf8');
console.log('MatchingDemo.tsx updated');

// 3. Update CompanyHeaderCard.tsx
const headerCardPath = 'src/pages/demo/components/CompanyHeaderCard.tsx';
let headerCardContent = fs.readFileSync(headerCardPath, 'utf8').replace(/\r\n/g, '\n');

// Update hiring status pill & comp disclaimer in header
const headerCompTarget = `            <div className="text-sm text-neutral-300 mt-1.5 flex items-center gap-2.5 flex-wrap">
              <span>{company.hq || 'Not available'}</span>
              <span>•</span>
              <span>{company.industry || 'Not available'}</span>
              <span>•</span>
              <span className="font-bold text-white">{company.avgPackage || 'Not available'}</span>`;

const headerCompReplacement = `            <div className="text-sm text-neutral-300 mt-1.5 flex items-center gap-2.5 flex-wrap">
              <span>{company.hq || 'Not available'}</span>
              <span>•</span>
              <span>{company.industry || 'Not available'}</span>
              <span>•</span>
              <span className="font-bold text-white" title="Estimated range based on public community reports; not verified with employer">{company.avgPackage || 'Not available'} (est.)</span>`;

headerCardContent = headerCardContent.replace(headerCompTarget, headerCompReplacement);

// Update mini stats hiring label & hiring status
const hiringMiniStatTarget = `            <div className="bg-black rounded-lg px-3.5 py-2 text-center border border-charcoal">
              <div className="text-sm sm:text-base font-bold text-white">
                {company.openRoles != null ? \`\${company.openRoles}+\` : 'Not available'}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5">Open Roles</div>
            </div>`;

const hiringMiniStatReplacement = `            <div className="bg-black rounded-lg px-3.5 py-2 text-center border border-charcoal">
              <div className="text-sm sm:text-base font-bold text-white">
                {company.openRoles != null ? \`\${company.openRoles}+\` : 'Not available'}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5">Role Catalog</div>
            </div>`;

headerCardContent = headerCardContent.replace(hiringMiniStatTarget, hiringMiniStatReplacement);

// Add honest hiring status notice in header
const sourcesBlockTarget = `            {/* Sourced evidence chips if present */}
            {company.sources && company.sources.length > 0 && (`;

const sourcesBlockReplacement = `            {/* Hiring status honesty notice */}
            <div className="mt-2 text-xs flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono text-neutral-300 bg-black border border-charcoal">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Hiring status unverified; check official careers portal</span>
              </span>
            </div>

            {/* Sourced evidence chips if present */}
            {company.sources && company.sources.length > 0 && (`;

headerCardContent = headerCardContent.replace(sourcesBlockTarget, sourcesBlockReplacement);
fs.writeFileSync(headerCardPath, headerCardContent, 'utf8');
console.log('CompanyHeaderCard.tsx updated');

// 4. Update ExperiencedRoleCard.tsx
const roleCardPath = 'src/pages/demo/components/ExperiencedRoleCard.tsx';
let roleCardContent = fs.readFileSync(roleCardPath, 'utf8').replace(/\r\n/g, '\n');

const roleProvenanceTarget = `              {role.isLiveVerified && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 flex items-center gap-1">
                  ATS: Static Catalogue (Oct 2026)
                </span>
              )}
              {role.profileKind === 'representative' && (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-near-black text-pale-yellow border border-pale-yellow/40">
                  Representative profile
                </span>
              )}
              {role.competencyFit === 'approximate' && (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-black text-neutral-300 border border-charcoal">
                  Approximate Fit
                </span>
              )}`;

const roleProvenanceReplacement = `              {/* Provenance Badge (Requirement 8.1) */}
              {role.sourceUrl ? (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-near-black text-volt border border-volt/50 flex items-center gap-1 font-mono">
                  Sourced ({role.lastVerified || 'Oct 2026'})
                </span>
              ) : role.profileKind === 'estimate' ? (
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-sky-300 border border-sky-500/40 font-mono">
                  Estimate (Community reports)
                </span>
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-pale-yellow border border-pale-yellow/40 font-mono">
                  Representative profile (Illustrative example)
                </span>
              )}
              {role.isLiveVerified && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 flex items-center gap-1">
                  ATS Catalog (Oct 2026)
                </span>
              )}`;

roleCardContent = roleCardContent.replace(roleProvenanceTarget, roleProvenanceReplacement);

// Update interview process section in ExperiencedRoleCard
const hiringProcessTarget = `            {(role as any).hiringProcess && (role as any).hiringProcess.length > 0 && (
              <div>
                <h5 className="font-bold text-neutral-400 uppercase tracking-wider text-xs mb-1">Interview Process</h5>
                <div className="flex items-center gap-2 text-xs font-bold mt-2 flex-wrap">`;

const hiringProcessReplacement = `            {(role as any).hiringProcess && (role as any).hiringProcess.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <h5 className="font-bold text-neutral-400 uppercase tracking-wider text-xs">Interview Process</h5>
                  <span className="text-[10px] text-pale-yellow font-mono px-2 py-0.5 rounded bg-near-black border border-pale-yellow/30">
                    Representative interview loop for this role type; verify with recruiter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold mt-2 flex-wrap">`;

roleCardContent = roleCardContent.replace(hiringProcessTarget, hiringProcessReplacement);
fs.writeFileSync(roleCardPath, roleCardContent, 'utf8');
console.log('ExperiencedRoleCard.tsx updated');

// 5. Update CompanyRolesPage.tsx to show prominent basic directory banner
const companyRolesPath = 'src/pages/demo/CompanyRolesPage.tsx';
let companyRolesContent = fs.readFileSync(companyRolesPath, 'utf8').replace(/\r\n/g, '\n');

const rolesContainerTarget = `        {/* Roles Section */}
        <section aria-label="Available Roles">`;

const rolesContainerReplacement = `        {/* Basic Directory Listing Notice */}
        {(company.depth === 'basic' || (company as any).isBasicListing || company.roles.length <= 1) && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 space-y-1.5">
            <div className="font-bold flex items-center gap-2 uppercase tracking-wider text-amber-300">
              <span className="text-amber-400 font-bold">[i]</span>
              <span>Basic Directory Listing</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              This employer is currently registered as a basic directory listing (name, sector, and official career links only). Detailed role level ladders, competency rubrics, and salary estimate bands are not yet calibrated for {company.name}.
            </p>
            {company.officialSiteUrl && (
              <div className="pt-1">
                <a
                  href={company.officialSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-volt hover:underline font-bold inline-flex items-center gap-1"
                >
                  Visit Official {company.name} Careers Site ↗
                </a>
              </div>
            )}
          </div>
        )}

        {/* Roles Section */}
        <section aria-label="Available Roles">`;

companyRolesContent = companyRolesContent.replace(rolesContainerTarget, rolesContainerReplacement);
fs.writeFileSync(companyRolesPath, companyRolesContent, 'utf8');
console.log('CompanyRolesPage.tsx updated');
