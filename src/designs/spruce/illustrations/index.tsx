import React from 'react';

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/** 1. Resume Sheet: Editorial document with clean ruled lines and token fills */
export function ResumeSheetIllustration({ size = 64, className = '', ...props }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <rect x="14" y="8" width="36" height="48" rx="2" fill="var(--sp-mint-50)" stroke="var(--sp-forest)" strokeWidth="2" />
      <path d="M38 8V20H50" stroke="var(--sp-forest)" strokeWidth="2" fill="var(--sp-mint-200)" />
      <line x1="20" y1="26" x2="44" y2="26" stroke="var(--sp-primary)" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="33" x2="44" y2="33" stroke="var(--sp-forest)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="20" y1="40" x2="38" y2="40" stroke="var(--sp-forest)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="20" y1="47" x2="32" y2="47" stroke="var(--sp-lime-accent)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** 2. Target: Precise calibration concentric rings with an arrowhead */
export function TargetIllustration({ size = 64, className = '', ...props }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <circle cx="32" cy="32" r="24" stroke="var(--sp-forest)" strokeWidth="2" fill="var(--sp-mint-50)" />
      <circle cx="32" cy="32" r="16" stroke="var(--sp-primary)" strokeWidth="2" fill="var(--sp-mint-200)" />
      <circle cx="32" cy="32" r="7" fill="var(--sp-forest)" />
      <path d="M42 22L34 30M42 22V28M42 22H36" stroke="var(--sp-lime-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 3. Envelope: Outreach communication with secure sealed flap */
export function EnvelopeIllustration({ size = 64, className = '', ...props }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <rect x="10" y="16" width="44" height="32" rx="2" fill="var(--sp-mint-50)" stroke="var(--sp-forest)" strokeWidth="2" />
      <path d="M10 18L32 34L54 18" stroke="var(--sp-primary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 46L24 32M54 46L40 32" stroke="var(--sp-forest)" strokeWidth="1.5" opacity="0.4" />
      <circle cx="32" cy="34" r="5" fill="var(--sp-lime-accent)" stroke="var(--sp-forest)" strokeWidth="1.5" />
    </svg>
  );
}

/** 4. Blocks: Modular architecture building blocks */
export function BlocksIllustration({ size = 64, className = '', ...props }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <rect x="10" y="34" width="20" height="18" rx="2" fill="var(--sp-forest)" stroke="var(--sp-forest)" strokeWidth="1.5" />
      <rect x="34" y="34" width="20" height="18" rx="2" fill="var(--sp-primary)" stroke="var(--sp-forest)" strokeWidth="1.5" />
      <rect x="22" y="12" width="20" height="18" rx="2" fill="var(--sp-mint-200)" stroke="var(--sp-forest)" strokeWidth="2" />
      <circle cx="32" cy="21" r="3" fill="var(--sp-lime-accent)" />
      <circle cx="20" cy="43" r="2.5" fill="var(--sp-mint-50)" />
      <circle cx="44" cy="43" r="2.5" fill="var(--sp-lime-accent)" />
    </svg>
  );
}

/** 5. Ribbon Badge: Credential verification seal */
export function RibbonBadgeIllustration({ size = 64, className = '', ...props }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <path d="M22 36L18 54L32 46L46 54L42 36" fill="var(--sp-mint-200)" stroke="var(--sp-forest)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="24" r="16" fill="var(--sp-mint-50)" stroke="var(--sp-forest)" strokeWidth="2" />
      <circle cx="32" cy="24" r="11" fill="var(--sp-primary)" />
      <path d="M27 24L30.5 27.5L37.5 20.5" stroke="var(--sp-lime-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 6. Compass: Trajectory navigation needle */
export function CompassIllustration({ size = 64, className = '', ...props }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <circle cx="32" cy="32" r="24" fill="var(--sp-mint-50)" stroke="var(--sp-forest)" strokeWidth="2" />
      <circle cx="32" cy="32" r="20" stroke="var(--sp-forest)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <path d="M32 14L37 28L48 32L37 36L32 50L27 36L16 32L27 28Z" fill="var(--sp-mint-200)" stroke="var(--sp-forest)" strokeWidth="1.5" />
      <path d="M32 14L37 28L32 32L27 28Z" fill="var(--sp-forest)" />
      <path d="M32 32L37 36L32 50L27 36Z" fill="var(--sp-primary)" />
      <circle cx="32" cy="32" r="3.5" fill="var(--sp-lime-accent)" />
    </svg>
  );
}

/** 7. Building: Enterprise level corporate tower */
export function BuildingIllustration({ size = 64, className = '', ...props }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <rect x="14" y="24" width="16" height="32" rx="1" fill="var(--sp-mint-100)" stroke="var(--sp-forest)" strokeWidth="1.5" />
      <rect x="28" y="10" width="22" height="46" rx="2" fill="var(--sp-mint-50)" stroke="var(--sp-forest)" strokeWidth="2" />
      <rect x="34" y="16" width="4" height="4" fill="var(--sp-forest)" />
      <rect x="42" y="16" width="4" height="4" fill="var(--sp-forest)" />
      <rect x="34" y="24" width="4" height="4" fill="var(--sp-primary)" />
      <rect x="42" y="24" width="4" height="4" fill="var(--sp-primary)" />
      <rect x="34" y="32" width="4" height="4" fill="var(--sp-lime-accent)" />
      <rect x="42" y="32" width="4" height="4" fill="var(--sp-forest)" />
      <rect x="35" y="44" width="8" height="12" fill="var(--sp-forest)" />
    </svg>
  );
}

/** 8. Balance: Comparative weighing scale */
export function BalanceIllustration({ size = 64, className = '', ...props }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <line x1="32" y1="12" x2="32" y2="52" stroke="var(--sp-forest)" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="22" y="50" width="20" height="4" rx="1" fill="var(--sp-forest)" />
      <line x1="14" y1="20" x2="50" y2="20" stroke="var(--sp-forest)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="12" r="3.5" fill="var(--sp-lime-accent)" stroke="var(--sp-forest)" strokeWidth="1.5" />
      <path d="M14 20L8 36H24L18 20" stroke="var(--sp-primary)" strokeWidth="1.5" fill="var(--sp-mint-100)" />
      <path d="M50 20L44 36H60L54 20" stroke="var(--sp-primary)" strokeWidth="1.5" fill="var(--sp-mint-200)" />
    </svg>
  );
}

export const SpruceIllustrations = {
  resumeSheet: ResumeSheetIllustration,
  target: TargetIllustration,
  envelope: EnvelopeIllustration,
  blocks: BlocksIllustration,
  ribbonBadge: RibbonBadgeIllustration,
  compass: CompassIllustration,
  building: BuildingIllustration,
  balance: BalanceIllustration,
};
