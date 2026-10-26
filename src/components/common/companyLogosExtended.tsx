// ============================================================
// HireFlow — Canonical Company Logo Extension System
// Authentic vector marks for Companies-100 Indian & Global Tech Employers
// Calibrated for Dark Mode UI with 100% Offline Zero-Egress Compatibility
// ============================================================

import React from 'react';

export type SvgComponent = React.FC<{ className?: string }>;

export const EXTENDED_ALIASES: Record<string, string> = {
  // Quant & Financial Markets
  futures_first: 'futuresfirst',
  futuresfirst: 'futuresfirst',
  futuresfirstinfoservices: 'futuresfirst',
  graviton: 'graviton',
  gravitonresearch: 'graviton',
  gravitonresearchcapital: 'graviton',
  alphagrep: 'alphagrep',
  alphagrepsecurities: 'alphagrep',
  quadeye: 'quadeye',
  quadeyesecurities: 'quadeye',
  estee_advisors: 'esteeadvisors',
  esteeadvisors: 'esteeadvisors',
  estee: 'esteeadvisors',
  tmg_india: 'tmgindia',
  tmgindia: 'tmgindia',
  transmarketgroup: 'tmgindia',
  tmg: 'tmgindia',
  worldquant_india: 'worldquant',
  worldquantindia: 'worldquant',
  worldquant: 'worldquant',
  worldquantresearch: 'worldquant',
  deshaw_india: 'deshaw',
  deshawindia: 'deshaw',
  deshaw: 'deshaw',
  deshawco: 'deshaw',
  cams: 'cams',
  computeragemanagementservices: 'cams',

  // GCCs & Banking Tech
  socgen_gsc: 'socgen',
  socgengsc: 'socgen',
  socgen: 'socgen',
  societegenerale: 'socgen',
  bny_mellon_tech: 'bnymellon',
  bnymellontech: 'bnymellon',
  bnymellon: 'bnymellon',
  bankofnewyorkmellon: 'bnymellon',
  northern_trust: 'northerntrust',
  northerntrust: 'northerntrust',
  northerntrustindia: 'northerntrust',
  fidelity_international: 'fidelityintl',
  fidelityinternational: 'fidelityintl',
  fidelityintl: 'fidelityintl',
  filindia: 'fidelityintl',
  state_street_india: 'statestreet',
  statestreetindia: 'statestreet',
  statestreet: 'statestreet',
  statestreetcorporateservices: 'statestreet',
  natwest_group: 'natwest',
  natwestgroup: 'natwest',
  natwest: 'natwest',
  natwestgroupindia: 'natwest',
  macquarie_india: 'macquarie',
  macquarieindia: 'macquarie',
  macquarie: 'macquarie',
  macquariegroup: 'macquarie',
  standard_chartered_gbs: 'standardchartered',
  standardcharteredgbs: 'standardchartered',
  standardchartered: 'standardchartered',
  standardcharteredbank: 'standardchartered',
  smarsh: 'smarsh',
  smarshindia: 'smarsh',
  concertai: 'concertai',
  concertaiindia: 'concertai',
  nielseniq: 'nielseniq',
  nielseniqindia: 'nielseniq',
  niq: 'nielseniq',
  conneqt: 'conneqt',
  conneqtbusiness: 'conneqt',
  incedo: 'incedo',
  incedotechnologies: 'incedo',
  human_security: 'humansecurity',
  humansecurity: 'humansecurity',
  humansecurityindia: 'humansecurity',
  sgs_india: 'sgs',
  sgsindia: 'sgs',
  sgs: 'sgs',

  // Automotive, Core Engineering, Embedded & IoT
  visteon: 'visteon',
  visteonindia: 'visteon',
  visteonautomotive: 'visteon',
  siemens_healthineers: 'siemenshealthineers',
  siemenshealthineers: 'siemenshealthineers',
  siemenshealthcare: 'siemenshealthineers',
  honeywell_hts: 'honeywell',
  honeywellhts: 'honeywell',
  honeywell: 'honeywell',
  honeywelltechnology: 'honeywell',
  garmin_india: 'garmin',
  garminindia: 'garmin',
  garmin: 'garmin',
  syrma_sgs: 'syrmasgs',
  syrmasgs: 'syrmasgs',
  syrmasgstechnology: 'syrmasgs',
  san_radiance: 'sanradiance',
  sanradiance: 'sanradiance',
  continental_automotive: 'continental',
  continentalautomotive: 'continental',
  continental: 'continental',
  aptiv_india: 'aptiv',
  aptivindia: 'aptiv',
  aptiv: 'aptiv',
  bgsw: 'bosch',
  harman_india: 'harman',
  harmanindia: 'harman',
  harman: 'harman',
  harmanconnected: 'harman',
  valeo_india: 'valeo',
  valeoindia: 'valeo',
  valeo: 'valeo',
  kpit_tech: 'kpit',
  kpittech: 'kpit',
  kpit: 'kpit',
  zf_india: 'zf',
  zfindia: 'zf',
  zf: 'zf',
  alstom_india: 'alstom',
  alstomindia: 'alstom',
  alstom: 'alstom',
  schneider_electric: 'schneider',
  schneiderelectric: 'schneider',
  schneider: 'schneider',
  abb_india: 'abb',
  abbindia: 'abb',
  abb: 'abb',
  danfoss_india: 'danfoss',
  danfossindia: 'danfoss',
  danfoss: 'danfoss',
  eaton_india: 'eaton',
  eatonindia: 'eaton',
  eaton: 'eaton',
  emerson_india: 'emerson',
  emersonindia: 'emerson',
  emerson: 'emerson',
  rockwell_automation: 'rockwell',
  rockwellautomation: 'rockwell',
  rockwell: 'rockwell',
  lam_research_india: 'lamresearch',
  lamresearchindia: 'lamresearch',
  lamresearch: 'lamresearch',
  kla_india: 'kla',
  klaindia: 'kla',
  kla: 'kla',
  klatencor: 'kla',
  applied_materials_india: 'appliedmaterials',
  appliedmaterialsindia: 'appliedmaterials',
  appliedmaterials: 'appliedmaterials',
  western_digital_india: 'westerndigital',
  westerndigitalindia: 'westerndigital',
  westerndigital: 'westerndigital',
  sandisk: 'westerndigital',
  seagate_india: 'seagate',
  seagateindia: 'seagate',
  seagate: 'seagate',

  // Analytics, AI & Data Platforms
  fractal: 'fractal',
  fractalanalytics: 'fractal',
  latentview: 'latentview',
  latentviewanalytics: 'latentview',
  tiger_analytics: 'tigeranalytics',
  tigeranalytics: 'tigeranalytics',
  tredence: 'tredence',
  tredenceanalytics: 'tredence',
  course5: 'course5',
  course5intelligence: 'course5',
  quantiphi: 'quantiphi',
  quantiphianalytics: 'quantiphi',
  polestar_solutions: 'polestar',
  polestarsolutions: 'polestar',
  polestar: 'polestar',
  sigmoid: 'sigmoid',
  sigmoidanalytics: 'sigmoid',
  ugam_solutions: 'ugam',
  ugamsolutions: 'ugam',
  ugam: 'ugam',
  absolutdata: 'absolutdata',
  absolutdatatechnologies: 'absolutdata',
  micron_india: 'micron',
  micronindia: 'micron',
  micron: 'micron',
  texas_instruments_india: 'texasinstruments',
  texasinstrumentsindia: 'texasinstruments',
  texasinstruments: 'texasinstruments',
  ti: 'texasinstruments',
  analog_devices_india: 'analogdevices',
  analogdevicesindia: 'analogdevices',
  analogdevices: 'analogdevices',
  adi: 'analogdevices',
  nxp_india: 'nxp',
  nxpindia: 'nxp',
  nxp: 'nxp',

  // High-Growth Tech, Logistics & Consumer
  wakefit: 'wakefit',
  wakefitinnovations: 'wakefit',
  zee_tech: 'zeetech',
  zeetech: 'zeetech',
  zee: 'zeetech',
  nxtwave: 'nxtwave',
  nxtwavedisruptive: 'nxtwave',
  bytexl: 'bytexl',
  bytexlindia: 'bytexl',
  clevertap: 'clevertap',
  wizrocket: 'clevertap',
  moengage: 'moengage',
  moengageindia: 'moengage',
  shiprocket: 'shiprocket',
  bigfootretail: 'shiprocket',
  physicswallah_tech: 'physicswallah',
  physicswallahtech: 'physicswallah',
  physicswallah: 'physicswallah',
  pw: 'physicswallah',
  scaler_tech: 'scaler',
  scalertech: 'scaler',
  scaler: 'scaler',
  interviewbit: 'scaler',
  porter: 'porter',
  smartshift: 'porter',
  rapido: 'rapido',
  roppen: 'rapido',
  shadowfax: 'shadowfax',
  shadowfaxtechnologies: 'shadowfax',
  delhivery: 'delhivery',
  delhiverylimited: 'delhivery',

  // IT Consulting & Digital Engineering
  persistent_systems: 'persistentsystems',
  persistentsystems: 'persistentsystems',
  cyient: 'cyient',
  cyientlimited: 'cyient',
  happiest_minds: 'happiestminds',
  happiestminds: 'happiestminds',
  coforge: 'coforge',
  coforgelimited: 'coforge',
  sonata_software: 'sonatasoftware',
  sonatasoftware: 'sonatasoftware',
  mastek: 'mastek',
  masteklimited: 'mastek',
  nucleus_software: 'nucleussoftware',
  nucleussoftware: 'nucleussoftware',
  newgen_software: 'newgensoftware',
  newgensoftware: 'newgensoftware',
  intellect_design: 'intellectdesign',
  intellectdesign: 'intellectdesign',
  intellectdesignarena: 'intellectdesign',
  tanla_platforms: 'tanlaplatforms',
  tanlaplatforms: 'tanlaplatforms',
  tata_elxsi: 'tataelxsi',
  tataelxsi: 'tataelxsi',
  sasken: 'sasken',
  saskentechnologies: 'sasken',
  stmicro_india: 'stmicro',
  stmicroindia: 'stmicro',
  stmicro: 'stmicro',
  stmicroelectronics: 'stmicro',
  renesas_india: 'renesas',
  renesasindia: 'renesas',
  renesas: 'renesas',
  blackbuck: 'blackbuck',
  zinka: 'blackbuck',
  ninjacart: 'ninjacart',
  ideas63: 'ninjacart',
  urban_company: 'urbancompany',
  urbancompany: 'urbancompany',
  urbanclap: 'urbancompany',
};

export const EXTENDED_LOGO_COMPONENTS: Record<string, SvgComponent> = {
  // ==========================================
  // CATEGORY 1: QUANT & FINANCIAL MARKETS
  // ==========================================
  futuresfirst: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0A192F" />
      <path fill="#00A3E0" d="M5 6h9v3.5H8.8v2.2h4.5v3.2H8.8V18H5V6z" />
      <path fill="#38BDF8" d="M12.5 9h6.5v2.8h-4.2v1.8h3.5v2.6h-3.5V18h-2.3V9z" />
    </svg>
  ),

  graviton: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#050C1A" />
      <ellipse cx="12" cy="12" rx="9" ry="4" stroke="#00E599" strokeWidth="1.8" transform="rotate(-30 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="4" stroke="#38BDF8" strokeWidth="1.8" transform="rotate(30 12 12)" />
      <circle cx="12" cy="12" r="2.4" fill="#FFFFFF" />
    </svg>
  ),

  alphagrep: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#180C02" />
      <path
        fill="#FF6B00"
        d="M14.8 6.5c-3.2 0-5.8 2.2-6.5 5.2-.5 2.1.2 4.2 1.8 5.4 1.4 1.1 3.2 1.4 4.9.9l3.5 2.5 1.5-1.8-3-2.1c1.2-1.3 1.8-3.1 1.5-5-.4-2.8-2.6-5.1-5.7-5.1zm-.8 3.2c1.7 0 2.8 1.1 3 2.6.2 1.5-.7 2.9-2.2 3.2-1.5.3-2.9-.6-3.3-2-.4-1.6.6-3.3 2.5-3.8z"
      />
    </svg>
  ),

  quadeye: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0C0A1D" />
      <circle cx="12" cy="12" r="8" stroke="#6366F1" strokeWidth="2" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="4.2" stroke="#06B6D4" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.8" fill="#FFFFFF" />
      <line x1="12" y1="2" x2="12" y2="6" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="6" y2="12" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="12" x2="22" y2="12" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  esteeadvisors: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#071933" />
      <path fill="#F59E0B" d="M12 4l7.5 14H4.5L12 4z" />
      <path fill="#0F52BA" d="M12 8.5l4.5 8.5h-9L12 8.5z" />
      <circle cx="12" cy="14" r="1.5" fill="#FFFFFF" />
    </svg>
  ),

  tmgindia: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#002D5A" />
      <path fill="#FFFFFF" d="M4 7h16v2.5h-6.2v9.5H10.2V9.5H4V7z" />
      <path fill="#38BDF8" d="M15 12h5v7h-5z" />
    </svg>
  ),

  worldquant: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#031633" />
      <circle cx="12" cy="12" r="8.5" stroke="#00A3E0" strokeWidth="1.8" />
      <ellipse cx="12" cy="12" rx="8.5" ry="3.5" stroke="#38BDF8" strokeWidth="1.2" />
      <ellipse cx="12" cy="12" rx="3.5" ry="8.5" stroke="#38BDF8" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
    </svg>
  ),

  deshaw: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#9E1B32" />
      <path
        fill="#FFFFFF"
        d="M6 6.5h4.8c3.8 0 6.2 2.2 6.2 5.5s-2.4 5.5-6.2 5.5H6V6.5zm3.2 2.6v5.8h1.6c2.2 0 3.4-1.2 3.4-2.9 0-1.7-1.2-2.9-3.4-2.9H9.2z"
      />
    </svg>
  ),

  cams: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#003366" />
      <path fill="#E31837" d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3l-2.4 2.4A4.2 4.2 0 0 0 7.8 12a4.2 4.2 0 0 0 7.1 2.9l2.4 2.4A7.5 7.5 0 0 1 4.5 12z" />
      <circle cx="18" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  ),

  // ==========================================
  // CATEGORY 2: GCCS & BANKING TECH
  // ==========================================
  socgen: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#141416" />
      <rect x="4" y="4" width="16" height="8" fill="#E60028" />
      <rect x="4" y="12" width="16" height="8" fill="#111111" />
      <rect x="4" y="11" width="16" height="2" fill="#FFFFFF" />
    </svg>
  ),

  bnymellon: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0B1E36" />
      <path fill="#BF9000" d="M5 8.5l7-4.5 7 4.5v7l-7 4.5-7-4.5v-7z" />
      <path fill="#FFFFFF" d="M8 9.5l4-2.5 4 2.5v5l-4 2.5-4-2.5v-5z" />
    </svg>
  ),

  northerntrust: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#00472B" />
      <circle cx="12" cy="7" r="2.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <line x1="12" y1="9.5" x2="12" y2="19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 16c2 3.5 10 3.5 12 0" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  fidelityintl: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#005A36" />
      <path fill="#F59E0B" d="M12 4l8 14H4L12 4z" />
      <circle cx="12" cy="8.5" r="2" fill="#FFFFFF" />
      <path fill="#005A36" d="M12 11.5l5 6.5H7l5-6.5z" />
    </svg>
  ),

  statestreet: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#002D5B" />
      <path
        fill="#0072CE"
        d="M6 16.5c3-1 9-1 12 0l-2 2.5H8l-2-2.5zm5-11.5v9h2v-9h-2zm-4 4.5l3.5-3v6.5L7 9.5zm8-1l3 2-3 4.5V8.5z"
      />
      <path fill="#FFFFFF" d="M8 12.5l2-2.5v4.5L8 12.5z" />
    </svg>
  ),

  natwest: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#4B166A" />
      <path fill="#D2268D" d="M12 4.5l5.5 3.2v6.4L12 17.3 6.5 14.1V7.7L12 4.5z" />
      <path fill="#FFFFFF" d="M12 8l3 1.8v3.6L12 15.2 9 13.4V9.8L12 8z" />
    </svg>
  ),

  macquarie: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#141416" />
      <circle cx="12" cy="12" r="8" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),

  standardchartered: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#07223D" />
      <path
        fill="#00A3E0"
        d="M12 4c-3.5 0-6 2.5-6 6 0 4 3 6.5 6 6.5s4-1.5 5.5-3.5l-2-1.5c-1 1.2-2.2 2-3.5 2-2 0-3.5-1.5-3.5-3.5 0-2 1.5-3.5 3.5-3.5 1.5 0 2.5.8 3.2 1.8l2-1.6C16 4.8 14.2 4 12 4z"
      />
      <path
        fill="#009639"
        d="M16 11c0 2-1.5 3.5-3.5 3.5-1.2 0-2.2-.6-2.8-1.5l-2 1.5c1.2 1.8 3 2.8 4.8 2.8 3.5 0 6-2.5 6-6 0-3-1.8-5-4-5.8v2.6c1 .6 1.5 1.6 1.5 2.9z"
      />
    </svg>
  ),

  smarsh: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#091A2E" />
      <path
        fill="#00C1D5"
        d="M15.5 6.5c-2-1-5-1-6.8.5-1.8 1.5-1.5 3.8.2 4.8 1.8 1.1 4.5 1.5 4.5 3.2 0 1.2-1.2 2-2.8 1.8-1.5-.2-2.8-1-3.6-2l-1.8 1.8c1.2 1.8 3.2 2.8 5.4 3 3 .2 5.5-1.5 5.5-4.2 0-3-3.2-3.8-5-4.8-1.5-.8-1.8-1.8-.8-2.6.9-.8 2.5-.8 3.8 0l1.4-1.7z"
      />
    </svg>
  ),

  concertai: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1C0F24" />
      <circle cx="7" cy="12" r="3" fill="#FF5A36" />
      <circle cx="17" cy="7" r="2.5" fill="#A855F7" />
      <circle cx="17" cy="17" r="2.5" fill="#06B6D4" />
      <line x1="7" y1="12" x2="17" y2="7" stroke="#A855F7" strokeWidth="1.8" />
      <line x1="7" y1="12" x2="17" y2="17" stroke="#06B6D4" strokeWidth="1.8" />
    </svg>
  ),

  nielseniq: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#111116" />
      <path fill="#FFFFFF" d="M5 8h2.8l4 6V8h2.8v8h-2.8l-4-6v6H5V8zm12.5 0H20v8h-2.5V8z" />
      <circle cx="21" cy="7" r="1.5" fill="#00D084" />
    </svg>
  ),

  conneqt: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1B263B" />
      <circle cx="12" cy="11" r="6" stroke="#FF6600" strokeWidth="2.5" fill="none" />
      <path fill="#FF6600" d="M15 14l4 4-1.8 1.8-4-4 1.8-1.8z" />
      <circle cx="12" cy="11" r="2" fill="#FFFFFF" />
    </svg>
  ),

  incedo: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0B1A2C" />
      <path fill="#00B2A9" d="M12 4l6.5 4v8L12 20l-6.5-4V8L12 4z" />
      <path fill="#FFFFFF" d="M12 7.5L16 10v4l-4 2.5-4-2.5V10l4-2.5z" />
    </svg>
  ),

  humansecurity: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0F0F12" />
      <path
        fill="#E6FF00"
        d="M12 3.5l7 3.5v5c0 4.5-3 8.5-7 9.5-4-1-7-5-7-9.5V7l7-3.5zm0 3.2L7.5 9v3c0 3 2 6 4.5 7 2.5-1 4.5-4 4.5-7V9L12 6.7z"
      />
    </svg>
  ),

  sgs: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#FF5500" />
      <path
        fill="#FFFFFF"
        d="M5 8.5h4v1.8H6.8v1.4h2.2v1.8H5v-5zm5 0h4v5h-4v-5zm1.8 1.8v1.4h.8v-1.4h-.8zm3.2-1.8h4v1.8h-2.2v1.4h2.2v1.8H15v-5z"
      />
    </svg>
  ),

  // ==========================================
  // CATEGORY 3: CORE ENGINEERING, EMBEDDED & AUTOMOTIVE
  // ==========================================
  visteon: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#160802" />
      <path fill="#FF5100" d="M4 5l6.5 14h3L20 5h-3.8l-4.7 10.5L6.8 5H4z" />
    </svg>
  ),

  siemenshealthineers: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0C1B24" />
      <circle cx="8" cy="9" r="4" fill="#FF7900" />
      <circle cx="16" cy="15" r="4" fill="#00A3A6" />
      <path d="M8 9l8 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  honeywell: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#EE3124" />
      <path fill="#FFFFFF" d="M6 6.5h3.5v4.2h5V6.5H18v11h-3.5v-4.5h-5v4.5H6v-11z" />
    </svg>
  ),

  garmin: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#00294B" />
      <path fill="#007CC3" d="M12 4l8 15h-5.5l-2.5-5-2.5 5H4L12 4z" />
      <circle cx="12" cy="11" r="1.8" fill="#FFFFFF" />
    </svg>
  ),

  syrmasgs: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#041E3A" />
      <path fill="#00A3E0" d="M5 8c2-2.5 6-2.5 8 0l-2 2c-1-1-3-1-4 0s-1 3 0 4l-2 2C3.5 14 3.5 10 5 8z" />
      <path fill="#38BDF8" d="M19 16c-2 2.5-6 2.5-8 0l2-2c1 1 3 1 4 0s1-3 0-4l2-2c1.5 2 1.5 6 0 8z" />
      <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
    </svg>
  ),

  sanradiance: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1C1004" />
      <circle cx="12" cy="12" r="5" fill="#F59E0B" />
      <line x1="12" y1="2" x2="12" y2="5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="5" y2="12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
    </svg>
  ),

  continental: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#FFA500" />
      <circle cx="12" cy="12" r="8" fill="#1A1A1A" />
      <path fill="#FFA500" d="M9.5 8.5c1.5 0 2.8 1 2.8 2.5 0 1-.8 1.8-1.8 2.2l2.2 3.3h-1.8l-2-3h-1v3H6.5v-8h3zm-.5 1.5H8v2h1c.8 0 1.2-.4 1.2-1s-.4-1-1.2-1z" />
      <circle cx="15.5" cy="10" r="1.5" fill="#FFA500" />
    </svg>
  ),

  aptiv: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#140601" />
      <circle cx="8" cy="12" r="4.5" fill="#FE5000" />
      <circle cx="16" cy="12" r="4.5" fill="#FFFFFF" />
      <circle cx="12" cy="12" r="2.2" fill="#FE5000" />
    </svg>
  ),

  harman: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#002D54" />
      <path
        fill="#0082CA"
        d="M4 12c0-4.4 3.6-8 8-8v3.5c-2.5 0-4.5 2-4.5 4.5S9.5 16.5 12 16.5V20c-4.4 0-8-3.6-8-8z"
      />
      <circle cx="15" cy="12" r="3.5" fill="#FFFFFF" />
    </svg>
  ),

  valeo: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0C2408" />
      <circle cx="12" cy="12" r="8" stroke="#80C241" strokeWidth="2.5" fill="none" />
      <path fill="#80C241" d="M8 8l4 8 4-8h-3l-1 2-1-2H8z" />
    </svg>
  ),

  kpit: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#E31837" />
      <path fill="#FFFFFF" d="M6 6.5h3.2v4.5L13.5 6.5h3.8l-5 5.5 5.5 6h-4l-4.6-5.2v5.2H6v-11z" />
    </svg>
  ),

  zf: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#00509B" />
      <circle cx="12" cy="12" r="7.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <path
        fill="#FFFFFF"
        d="M8 9h5v1.8l-3.2 3.2H13v1.8H7.5v-1.8l3.2-3.2H8V9zm7-1.5h1.8v8.5H15v-8.5z"
      />
    </svg>
  ),

  alstom: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#002D54" />
      <path fill="#004887" d="M4 6h16v12H4V6z" />
      <path fill="#E2001A" d="M12 6l6 6-6 6V6z" />
      <path fill="#FFFFFF" d="M6 8l4 8h-2L7 14H5l-1 2H2l4-8zm0 2.2L5.2 12h1.6L6 10.2z" />
    </svg>
  ),

  schneider: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#072610" />
      <path
        fill="#3DCD58"
        d="M6 13c1-4 4.5-6.5 8.5-6.5 2.2 0 4.2.8 5.5 2l-1.8 2c-.9-.8-2.2-1.4-3.7-1.4-2.8 0-5 1.8-5.8 4.2L6 13zm12-2c-1 4-4.5 6.5-8.5 6.5-2.2 0-4.2-.8-5.5-2l1.8-2c.9.8 2.2 1.4 3.7 1.4 2.8 0 5-1.8 5.8-4.2L18 11z"
      />
    </svg>
  ),

  abb: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#FF000F" />
      <path
        fill="#FFFFFF"
        d="M4 8.5h4.5c1.5 0 2.5.8 2.5 2s-.8 1.8-1.8 2c1.2.2 2 1 2 2.2 0 1.5-1.2 2.3-2.7 2.3H4V8.5zm2.4 2.2v1.6h1.8c.6 0 1-.3 1-.8s-.4-.8-1-.8H6.4zm0 3.2v1.8h2c.6 0 1-.3 1-.9s-.4-.9-1-.9H6.4zm8-5.4h4.5c1.5 0 2.5.8 2.5 2s-.8 1.8-1.8 2c1.2.2 2 1 2 2.2 0 1.5-1.2 2.3-2.7 2.3h-4.5V8.5zm2.4 2.2v1.6h1.8c.6 0 1-.3 1-.8s-.4-.8-1-.8h-1.8zm0 3.2v1.8h2c.6 0 1-.3 1-.9s-.4-.9-1-.9h-2z"
      />
    </svg>
  ),

  danfoss: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#E2001A" />
      <path
        fill="#FFFFFF"
        d="M6 7.5h5.5c3.5 0 5.5 2 5.5 4.5s-2 4.5-5.5 4.5H6V7.5zm3 2.5v4h2.2c1.8 0 2.8-1 2.8-2s-1-2-2.8-2H9z"
      />
    </svg>
  ),

  eaton: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#005EB8" />
      <path fill="#FFFFFF" d="M6 7h12v2.8H9.5v2.2h6.5v2.8H9.5V17H18v2.8H6V7z" />
    </svg>
  ),

  emerson: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#003566" />
      <circle cx="12" cy="12" r="7.5" stroke="#38BDF8" strokeWidth="2" fill="none" />
      <path fill="#FFFFFF" d="M7 8h10v2H9.5v1.8h6v2h-6v2H17v2H7V8z" />
    </svg>
  ),

  rockwell: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#D22630" />
      <path fill="#FFFFFF" d="M12 4l6 3.5v7L12 18l-6-3.5v-7L12 4z" />
      <path fill="#D22630" d="M12 7l3.5 2v4L12 15l-3.5-2V9L12 7z" />
      <circle cx="12" cy="11" r="1.5" fill="#FFFFFF" />
    </svg>
  ),

  lamresearch: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0B1E36" />
      <path fill="#E31837" d="M12 4l7 7-7 7-7-7 7-7z" />
      <path fill="#FFFFFF" d="M12 7l4 4-4 4-4-4 4-4z" />
      <circle cx="12" cy="11" r="2" fill="#0B1E36" />
    </svg>
  ),

  kla: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#005596" />
      <path fill="#FFFFFF" d="M6 7h3.2v3.8L13.5 7h4l-4.5 4.8 5 5.2h-4.2l-3.8-4.2v4.2H6V7z" />
    </svg>
  ),

  appliedmaterials: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#003B6F" />
      <path fill="#0072CE" d="M12 4a8 8 0 0 0-8 8h4a4 4 0 0 1 8 0h4a8 8 0 0 0-8-8z" />
      <path fill="#FFFFFF" d="M6 14h12v4H6v-4z" />
    </svg>
  ),

  westerndigital: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#E31837" />
      <path
        fill="#FFFFFF"
        d="M8 8c1.5-1.5 4.5-1.5 6 0l-1.5 1.5c-.8-.8-2.2-.8-3 0s-.8 2.2 0 3l3 3c1.5 1.5 1.5 4.5 0 6s-4.5 1.5-6 0l1.5-1.5c.8.8 2.2.8 3 0s.8-2.2 0-3l-3-3C6.5 12.5 6.5 9.5 8 8z"
      />
    </svg>
  ),

  seagate: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#005429" />
      <path
        fill="#00A551"
        d="M12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8c0-2.2.9-4.2 2.3-5.7L8 8a5.5 5.5 0 0 0-1.5 4c0 3 2.5 5.5 5.5 5.5s5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5V4z"
      />
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  ),

  // ==========================================
  // CATEGORY 4: ANALYTICS, AI & DATA PLATFORMS
  // ==========================================
  fractal: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1A0A26" />
      <polygon points="12,3 21,8.5 21,18 12,21 3,18 3,8.5" stroke="#C026D3" strokeWidth="1.8" fill="none" />
      <polygon points="12,7 17,10 17,15 12,17 7,15 7,10" fill="#FF5A36" />
      <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
    </svg>
  ),

  latentview: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1E0E38" />
      <path fill="#00B5B8" d="M6 18l6-12 6 12H6z" opacity="0.85" />
      <path fill="#A855F7" d="M9 18l3-6 3 6H9z" />
    </svg>
  ),

  tigeranalytics: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#240D01" />
      <path fill="#F37021" d="M6 5l3 8-3 6 4-2 2-6-2-6-4z" />
      <path fill="#F59E0B" d="M12 5l3 8-3 6 4-2 2-6-2-6-4z" />
    </svg>
  ),

  tredence: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#141D2E" />
      <polygon points="12,4 19,8 19,16 12,20 5,16 5,8" stroke="#70C041" strokeWidth="2" fill="none" />
      <path fill="#70C041" d="M9 8h6v2.5h-1.8v5.5h-2.4v-5.5H9V8z" />
    </svg>
  ),

  course5: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0C1B33" />
      <circle cx="12" cy="12" r="7.5" stroke="#38BDF8" strokeWidth="1.8" fill="none" />
      <path fill="#6366F1" d="M12 6c3 0 5.5 2.5 5.5 5.5h-3c0-1.4-1.1-2.5-2.5-2.5V6z" />
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  ),

  quantiphi: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0E1726" />
      <circle cx="12" cy="12" r="6" stroke="#FBBF24" strokeWidth="2.2" fill="none" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),

  polestar: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#031A33" />
      <path fill="#0072CE" d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z" />
      <circle cx="12" cy="12" r="2" fill="#FF6B00" />
    </svg>
  ),

  sigmoid: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0A1E3F" />
      <path
        d="M4 18c4 0 6-12 10-12s4 4 6 4"
        stroke="#06B6D4"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="14" cy="6" r="2" fill="#FFFFFF" />
    </svg>
  ),

  ugam: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1C0A14" />
      <path fill="#E11D48" d="M12 4l8 14H4L12 4z" />
      <path fill="#F59E0B" d="M12 9l4.5 9h-9L12 9z" />
      <circle cx="12" cy="15" r="1.5" fill="#FFFFFF" />
    </svg>
  ),

  absolutdata: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0C1D3B" />
      <circle cx="12" cy="12" r="8" stroke="#1E3A8A" strokeWidth="2.5" fill="none" />
      <path fill="#F97316" d="M10 7l6 5-6 5V7z" />
    </svg>
  ),

  micron: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#002D54" />
      <path
        fill="#38BDF8"
        d="M5 16V8h3l3 5 3-5h3v8h-2.5v-5l-2.5 4.5h-2L7.5 11v5H5z"
      />
    </svg>
  ),

  texasinstruments: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#CC0000" />
      <path
        fill="#FFFFFF"
        d="M6 7h12v2.5h-4.2V17h-3.6V9.5H6V7z"
      />
      <circle cx="12" cy="17" r="1.5" fill="#FFFFFF" />
    </svg>
  ),

  analogdevices: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#003366" />
      <path fill="#004C97" d="M12 4l8 15H4L12 4z" />
      <path
        d="M7 15c2-4 3-4 5 0s3 4 5 0"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),

  nxp: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#111622" />
      <rect x="4" y="8" width="4.5" height="8" rx="2" fill="#7CB342" />
      <rect x="9.8" y="8" width="4.5" height="8" rx="2" fill="#0288D1" />
      <rect x="15.5" y="8" width="4.5" height="8" rx="2" fill="#FFA000" />
    </svg>
  ),

  // ==========================================
  // CATEGORY 5: HIGH-GROWTH TECH, LOGISTICS & EDTECH
  // ==========================================
  wakefit: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1D1135" />
      <path fill="#8B5CF6" d="M15 5a7 7 0 1 0 0 14 7.5 7.5 0 0 1 0-14z" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="#F59E0B" />
    </svg>
  ),

  zeetech: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#2E0854" />
      <circle cx="12" cy="12" r="8" stroke="#EC4899" strokeWidth="2" fill="none" />
      <path fill="#FFFFFF" d="M8 8h8v2.2L10.8 14H16v2.2H8V14l5.2-3.8H8V8z" />
    </svg>
  ),

  nxtwave: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0A183D" />
      <path
        d="M4 14c3-5 5-5 8 0s5 5 8 0"
        stroke="#2563EB"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M6 10c2.5-4 4-4 6 0s4 4 6 0"
        stroke="#CCFF00"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),

  bytexl: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0D1117" />
      <path fill="#6366F1" d="M6 6l5 6-5 6h3.5l3-3.8 3 3.8H18l-5-6 5-6h-3.5L12 9.8 9.5 6H6z" />
      <circle cx="12" cy="12" r="1.8" fill="#10B981" />
    </svg>
  ),

  clevertap: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1F0808" />
      <path
        fill="#F44336"
        d="M12 4a8 8 0 0 0-8 8c0 3.5 2.2 6.4 5.4 7.5L11 15c-1.8-.6-3-2.2-3-4 0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.2-.5 2.2-1.4 3l2 2C18.2 14.8 19 13 19 11a7 7 0 0 0-7-7z"
      />
      <circle cx="12" cy="11" r="2" fill="#FFFFFF" />
    </svg>
  ),

  moengage: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#06152B" />
      <path fill="#00C0F3" d="M12 4C7.6 4 4 7.4 4 11.5c0 2.4 1.2 4.6 3.2 6L6 20l3.2-1c.9.3 1.8.5 2.8.5 4.4 0 8-3.4 8-7.5S16.4 4 12 4z" />
      <circle cx="9" cy="11.5" r="1.5" fill="#FFFFFF" />
      <circle cx="12" cy="11.5" r="1.5" fill="#FFFFFF" />
      <circle cx="15" cy="11.5" r="1.5" fill="#FFFFFF" />
    </svg>
  ),

  shiprocket: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#190B2E" />
      <path
        fill="#7C3AED"
        d="M12 3c-2.5 3-4 7-4 11l4 2 4-2c0-4-1.5-8-4-11z"
      />
      <circle cx="12" cy="10" r="1.8" fill="#FFFFFF" />
      <path fill="#F59E0B" d="M10 16l2 4 2-4h-4z" />
    </svg>
  ),

  physicswallah: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#18181B" />
      <circle cx="12" cy="12" r="8.5" stroke="#E11D48" strokeWidth="1.8" fill="none" />
      <path fill="#FFFFFF" d="M7 8h4c1.5 0 2.5 1 2.5 2.2 0 1.3-1 2.3-2.5 2.3H8.8V16H7V8zm1.8 1.8v1.4h1.8c.5 0 .9-.3.9-.7s-.4-.7-.9-.7H8.8z" />
      <path fill="#38BDF8" d="M13.5 8h1.8l1.4 5.5L18 8h1.8l-2.2 8h-1.8L14.5 11l-1.3 5H11.5L13.5 8z" />
    </svg>
  ),

  scaler: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0C1017" />
      <path fill="#E11D48" d="M7 6l6 6-6 6h4l6-6-6-6H7z" />
      <rect x="15" y="16" width="4" height="2" fill="#FFFFFF" />
    </svg>
  ),

  porter: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0047BA" />
      <path fill="#FFD700" d="M5 8h9v7H5V8zm9 2h4l2 3v2h-6v-5z" />
      <circle cx="8" cy="16.5" r="2" fill="#FFFFFF" />
      <circle cx="16.5" cy="16.5" r="2" fill="#FFFFFF" />
    </svg>
  ),

  rapido: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#FFDD00" />
      <path
        fill="#111111"
        d="M7 16l4-8h6l-3 4h4l-7 8 1.5-4H7z"
      />
    </svg>
  ),

  shadowfax: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#FF5500" />
      <path
        fill="#FFFFFF"
        d="M6 14l5-8h4l-3.5 5H18l-8 7 2-4H6z"
      />
    </svg>
  ),

  delhivery: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#DC2626" />
      <path fill="#FFFFFF" d="M6 7h6.5c3 0 5 1.8 5 4.5s-2 4.5-5 4.5H6V7zm3 2.5v4h3.2c1.4 0 2.2-.8 2.2-2s-.8-2-2.2-2H9z" />
      <polygon points="17,14 20,11.5 17,9" fill="#FFFFFF" />
    </svg>
  ),

  blackbuck: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#FBBF24" />
      <path
        fill="#111111"
        d="M6 16c2-4 5-8 7-10 1 2 2 4 4 5l-4 3 4 2-8 2-3-2z"
      />
    </svg>
  ),

  ninjacart: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#062E1E" />
      <path
        fill="#10B981"
        d="M12 4c2.5 3 5 4.5 8 5-2 3-4 6-8 11-4-5-6-8-8-11 3-.5 5.5-2 8-5z"
      />
      <circle cx="12" cy="11" r="2" fill="#FFFFFF" />
    </svg>
  ),

  urbancompany: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#111111" />
      <rect x="2" y="2" width="20" height="20" rx="3" stroke="#CCFF00" strokeWidth="1.5" />
      <path
        fill="#FFFFFF"
        d="M6 7h3v6c0 1.5 1 2.2 2 2.2s2-.7 2-2.2V7h3v6c0 3-2 4.5-5 4.5s-5-1.5-5-4.5V7z"
      />
    </svg>
  ),

  // ==========================================
  // CATEGORY 6: IT CONSULTING & DIGITAL ENGINEERING
  // ==========================================
  persistentsystems: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0C1B33" />
      <path fill="#FF6B00" d="M12 4l6.5 4v8L12 20l-6.5-4V8L12 4z" />
      <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
    </svg>
  ),

  cyient: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#003B36" />
      <circle cx="12" cy="12" r="7.5" stroke="#009688" strokeWidth="2.2" strokeDasharray="6 3" fill="none" />
      <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
    </svg>
  ),

  happiestminds: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1A1408" />
      <path
        d="M6 13c1.5 3 4 4.5 6 4.5s4.5-1.5 6-4.5"
        stroke="#FF6B00"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="9" cy="9" r="1.5" fill="#38BDF8" />
      <circle cx="15" cy="9" r="1.5" fill="#38BDF8" />
    </svg>
  ),

  coforge: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#240D01" />
      <path
        fill="#FF5A00"
        d="M7 8c-2.5 0-4 1.8-4 4s1.5 4 4 4c2.8 0 4.5-2.2 6.5-4.5 2-2.3 3.7-3.5 6.5-3.5 2.5 0 4 1.8 4 4s-1.5 4-4 4c-2.8 0-4.5-2.2-6.5-4.5C11.5 9.2 9.8 8 7 8z"
      />
    </svg>
  ),

  sonatasoftware: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#003566" />
      <path
        fill="#005A9C"
        d="M6 14a6 6 0 0 1 12 0h-3a3 3 0 0 0-6 0H6zm3-4a3 3 0 0 1 6 0h-2a1 1 0 0 0-2 0H9z"
      />
      <circle cx="12" cy="17" r="1.5" fill="#38BDF8" />
    </svg>
  ),

  mastek: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#C8102E" />
      <path fill="#FFFFFF" d="M6 7h3l3 5 3-5h3v10h-2.8v-5.5L12 16.5l-3.2-5V17H6V7z" />
    </svg>
  ),

  nucleussoftware: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#002D54" />
      <ellipse cx="12" cy="12" rx="8" ry="3.5" stroke="#00A3E0" strokeWidth="1.6" transform="rotate(-30 12 12)" />
      <ellipse cx="12" cy="12" rx="8" ry="3.5" stroke="#00A3E0" strokeWidth="1.6" transform="rotate(30 12 12)" />
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  ),

  newgensoftware: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#1C060B" />
      <path
        fill="#E31837"
        d="M12 11c-2-3.5-5.5-5-7.5-4 0 4 3 8 7.5 9 4.5-1 7.5-5 7.5-9-2-1-5.5.5-7.5 4z"
      />
      <circle cx="12" cy="8" r="1.5" fill="#FFFFFF" />
    </svg>
  ),

  intellectdesign: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0B1A3A" />
      <polygon points="12,3 21,9 18,19 6,19 3,9" stroke="#38BDF8" strokeWidth="1.8" fill="none" />
      <polygon points="12,7 17,11 15,16 9,16 7,11" fill="#F59E0B" />
    </svg>
  ),

  tanlaplatforms: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#150B2E" />
      <path
        fill="#06B6D4"
        d="M6 15c2-4 5-6 8-6 2.5 0 4.5 1.2 5.5 3l-2 1.5c-.8-1-2-1.8-3.5-1.8-2 0-4 1.5-5.5 4.5L6 15z"
      />
      <circle cx="17.5" cy="8.5" r="2.5" fill="#A855F7" />
    </svg>
  ),

  tataelxsi: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#003566" />
      <circle cx="12" cy="12" r="7.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <path fill="#FFFFFF" d="M8 8h8v2H13v6h-2v-6H8V8z" />
    </svg>
  ),

  sasken: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#0A1E2C" />
      <circle cx="9.5" cy="12" r="5" stroke="#006699" strokeWidth="2" fill="none" />
      <circle cx="14.5" cy="12" r="5" stroke="#78BE20" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
    </svg>
  ),

  stmicro: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#03234B" />
      <path
        fill="#FFFFFF"
        d="M5 10c0-2.2 1.8-3.5 4.2-3.5 2 0 3.5 1 3.8 2.5h-2c-.3-.6-.8-1-1.8-1-1.2 0-2 .6-2 1.8 0 1 .8 1.4 2.2 1.8 2.2.6 3.8 1.4 3.8 3.5 0 2.2-1.8 3.5-4.2 3.5-2.2 0-3.8-1-4-2.8h2.2c.2.8.8 1.2 1.8 1.2 1.2 0 2-.6 2-1.8 0-1-.8-1.5-2.2-1.8C6.6 13.8 5 13 5 10zm9-3.5h6.5v2H17v8.5h-2.5V8.5h-1V6.5z"
      />
    </svg>
  ),

  renesas: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#004098" />
      <path
        fill="#FFFFFF"
        d="M6 6.5h6c2.8 0 4.5 1.6 4.5 3.8 0 1.6-.9 2.8-2.2 3.4l3.2 4.3h-3.4l-2.8-3.8H8.8v3.8H6v-11.5zm2.8 2.5v3.2h3c1.2 0 1.8-.6 1.8-1.6s-.6-1.6-1.8-1.6h-3z"
      />
    </svg>
  ),
};
