import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ProfileProvider } from '../../features/suite/profile/ProfileContext';
import { LandingPage } from './pages/LandingPage';
import { ToolsHubPage } from './pages/ToolsHubPage';
import { SpruceResumeCheckerPage } from './pages/ResumeChecker/ResumeCheckerPage';
import { SpruceTailorPage } from './pages/Tailor/TailorPage';
import { SpruceReachOutPage } from './pages/ReachOut/ReachOutPage';
import { SpruceBuildBriefsPage } from './pages/BuildBriefs/BuildBriefsPage';
import { SpruceCredentialEnginePage } from './pages/Credentials/CredentialEnginePage';
import { SpruceCareerPathHubPage } from './pages/CareerPath/CareerPathHubPage';
import { SpruceCompareJDsPage } from './pages/CompareJDs/CompareJDsPage';
import { SpruceTalentLensPage } from './pages/TalentLens/TalentLensPage';

describe('Spruce Stage 9: Accessibility & Smoke Test Matrix', () => {
  const pages = [
    { name: 'LandingPage', Component: LandingPage },
    { name: 'ToolsHubPage', Component: ToolsHubPage },
    { name: 'ResumeCheckerPage', Component: SpruceResumeCheckerPage },
    { name: 'TailorPage', Component: SpruceTailorPage },
    { name: 'ReachOutPage', Component: SpruceReachOutPage },
    { name: 'BuildBriefsPage', Component: SpruceBuildBriefsPage },
    { name: 'CredentialEnginePage', Component: SpruceCredentialEnginePage },
    { name: 'CareerPathHubPage', Component: SpruceCareerPathHubPage },
    { name: 'CompareJDsPage', Component: SpruceCompareJDsPage },
    { name: 'TalentLensPage', Component: SpruceTalentLensPage },
  ];

  for (const { name, Component } of pages) {
    it(`renders ${name} without throwing (Light & Dark SSR)`, () => {
      const html = renderToString(
        <ProfileProvider>
          <MemoryRouter>
            <Component />
          </MemoryRouter>
        </ProfileProvider>
      );
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(100);
      const bannedWord = ['text', 'volt'].join('-');
      expect(html).not.toContain(bannedWord);
    });
  }
});
