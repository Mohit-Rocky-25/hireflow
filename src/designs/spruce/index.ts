import React from 'react';

export const SpruceLandingPage = React.lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);

export const SpruceToolsHubPage = React.lazy(() =>
  import('./pages/ToolsHubPage').then((m) => ({ default: m.ToolsHubPage }))
);

export const SpruceResumeCheckerPage = React.lazy(() =>
  import('./pages/ResumeChecker/ResumeCheckerPage').then((m) => ({ default: m.SpruceResumeCheckerPage }))
);

export const SpruceTailorPage = React.lazy(() =>
  import('./pages/Tailor/TailorPage').then((m) => ({ default: m.SpruceTailorPage }))
);

export const SpruceReachOutPage = React.lazy(() =>
  import('./pages/ReachOut/ReachOutPage').then((m) => ({ default: m.SpruceReachOutPage }))
);

export const SpruceBuildBriefsPage = React.lazy(() =>
  import('./pages/BuildBriefs/BuildBriefsPage').then((m) => ({ default: m.SpruceBuildBriefsPage }))
);

export const SpruceCredentialEnginePage = React.lazy(() =>
  import('./pages/Credentials/CredentialEnginePage').then((m) => ({ default: m.SpruceCredentialEnginePage }))
);

export const SpruceCareerPathHubPage = React.lazy(() =>
  import('./pages/CareerPath/CareerPathHubPage').then((m) => ({ default: m.SpruceCareerPathHubPage }))
);

export const SpruceCompareJDsPage = React.lazy(() =>
  import('./pages/CompareJDs/CompareJDsPage').then((m) => ({ default: m.SpruceCompareJDsPage }))
);

export const SpruceTalentLensPage = React.lazy(() =>
  import('./pages/TalentLens/TalentLensPage').then((m) => ({ default: m.SpruceTalentLensPage }))
);

export const SpruceCompanyRolesPage = React.lazy(() =>
  import('./pages/TalentLens/CompanyRolesPage').then((m) => ({ default: m.SpruceCompanyRolesPage }))
);

export const SpruceGalleryPage = React.lazy(() =>
  import('./gallery/SpruceGalleryPage').then((m) => ({ default: m.SpruceGalleryPage }))
);
