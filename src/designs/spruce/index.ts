import React from 'react';

export const SpruceLandingPage = React.lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);

export const SpruceToolsHubPage = React.lazy(() =>
  import('./pages/ToolsHubPage').then((m) => ({ default: m.ToolsHubPage }))
);

export const SpruceGalleryPage = React.lazy(() =>
  import('./gallery/SpruceGalleryPage').then((m) => ({ default: m.SpruceGalleryPage }))
);
