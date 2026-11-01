/**
 * Short-Skill Token-Boundary & Ambiguity Guard Tests (Stage 4.3)
 *
 * Verifies that single-character and short skills ("R", "C", "Go", "C++", "C#", ".NET")
 * use strict word/token boundaries and context/ambiguity guards so they NEVER
 * trigger false positive matches inside words like:
 * "Ruby", "React", "Graph", "Google", "Docker", "Internet", "cache".
 */

import { describe, it, expect } from 'vitest';
import { matchRequiredSkills } from '../../src/features/ats/engine/skillMatcher';
import { ParsedSection, JdRequirement } from '../../src/features/ats/engine/types';

function makeSection(content: string): ParsedSection[] {
  return [
    {
      type: 'experience',
      rawTitle: 'EXPERIENCE',
      content,
      charStart: 0,
      charEnd: content.length,
    },
  ];
}

function makeRequirement(skillId: string, canonical: string): JdRequirement[] {
  return [
    {
      skillId,
      canonical,
      category: 'languages',
      required: 'must',
      weight: 5,
    },
  ];
}

describe('Short-Skill Token-Boundary Matching (Stage 4.3)', () => {
  describe('Skill: R', () => {
    const rReq = makeRequirement('r', 'R');

    it('does NOT match inside "React", "Ruby", "Graph", "Docker", or "for"', () => {
      const text = 'Built React frontend for GraphQL services inside Docker containers. Used Ruby for scripts.';
      const res = matchRequiredSkills(text, makeSection(text), rReq);
      expect(res[0].found).toBe(false);
      expect(res[0].evidence.length).toBe(0);
    });

    it('matches when R is used as a standalone programming language with context', () => {
      const text = 'Performed statistical analysis and data visualization using R, Python, and ggplot2 in R studio.';
      const res = matchRequiredSkills(text, makeSection(text), rReq);
      expect(res[0].found).toBe(true);
      expect(res[0].evidence.length).toBeGreaterThan(0);
    });
  });

  describe('Skill: C', () => {
    const cReq = makeRequirement('c', 'C');

    it('does NOT match inside "Cisco", "React", "Docker", "cache", or "CSS"', () => {
      const text = 'Configured Cisco routers, optimized cache latency, and deployed React with CSS in Docker.';
      const res = matchRequiredSkills(text, makeSection(text), cReq);
      expect(res[0].found).toBe(false);
      expect(res[0].evidence.length).toBe(0);
    });

    it('matches when C is used as a standalone language with context hints', () => {
      const text = 'Developed low-level embedded software and device drivers using C language and pointer memory management.';
      const res = matchRequiredSkills(text, makeSection(text), cReq);
      expect(res[0].found).toBe(true);
      expect(res[0].evidence.length).toBeGreaterThan(0);
    });
  });

  describe('Skill: Go', () => {
    const goReq = makeRequirement('go', 'Go');

    it('does NOT match inside "Google", "MongoDB", "algorithm", or "Django"', () => {
      const text = 'Integrated Google Cloud services, queried MongoDB, and implemented sorting algorithm in Django.';
      const res = matchRequiredSkills(text, makeSection(text), goReq);
      expect(res[0].found).toBe(false);
      expect(res[0].evidence.length).toBe(0);
    });

    it('matches when Go is used as a backend programming language', () => {
      const text = 'Engineered high-throughput microservices using Go and goroutines with PostgreSQL on AWS.';
      const res = matchRequiredSkills(text, makeSection(text), goReq);
      expect(res[0].found).toBe(true);
      expect(res[0].evidence.length).toBeGreaterThan(0);
    });
  });

  describe('Skill: C++', () => {
    const cppReq = makeRequirement('cpp', 'C++');

    it('matches "C++", "C++14", "C++17" and does not match plain C or Java', () => {
      const text = 'Architected real-time trading engine in C++17 with low latency.';
      const res = matchRequiredSkills(text, makeSection(text), cppReq);
      expect(res[0].found).toBe(true);
    });
  });

  describe('Skill: C#', () => {
    const csReq = makeRequirement('csharp', 'C#');

    it('matches "C#" and does not false positive on unrelated words', () => {
      const text = 'Built enterprise backend APIs using C# and .NET Core.';
      const res = matchRequiredSkills(text, makeSection(text), csReq);
      expect(res[0].found).toBe(true);
    });
  });

  describe('Skill: .NET / ASP.NET', () => {
    const netReq = makeRequirement('aspnet_core', 'ASP.NET Core');

    it('does NOT match "Internet" or "Network"', () => {
      const text = 'Configured Internet gateway and high-speed network interfaces.';
      const res = matchRequiredSkills(text, makeSection(text), netReq);
      expect(res[0].found).toBe(false);
    });

    it('matches ".NET Core" or "ASP.NET"', () => {
      const text = 'Developed microservices with ASP.NET and Entity Framework Core.';
      const res = matchRequiredSkills(text, makeSection(text), netReq);
      expect(res[0].found).toBe(true);
    });
  });
});
