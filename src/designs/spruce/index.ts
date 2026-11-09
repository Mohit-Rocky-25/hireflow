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

export const SpruceGalleryPage = React.lazy(() =>
  import('./gallery/SpruceGalleryPage').then((m) => ({ default: m.SpruceGalleryPage }))
);
