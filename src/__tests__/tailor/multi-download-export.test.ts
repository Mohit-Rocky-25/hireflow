import { describe, it, expect } from 'vitest';
import { ResumeDocModel } from '../../lib/tailorEngine/docModel';
import { generateLatexCode, generateLatexBlob, escapeLatex } from '../../lib/tailorEngine/latexExport';
import { generatePlainText, generatePlainTextBlob } from '../../lib/tailorEngine/textExport';
import { generateDocxBlob } from '../../lib/tailorEngine/docxExport';

describe('Multi-Download Export Options & Clean Formats', () => {
  const sampleModel: ResumeDocModel = {
    contact: {
      name: 'Jeswanth Posina',
      email: 'jeswanth.cipher1337@gmail.com',
      phone: '+91 7288922933',
      location: 'Andhra Pradesh, India',
      headline: 'Cybersecurity Analyst',
      links: ['github.com/HackerJbon1337', 'linkedin.com/in/jeswanthposina']
    },
    summary: 'Second-year Electronics & Communication Engineering student with practical experience in mobile application security.',
    education: [
      {
        degree: 'B.Tech in ECE',
        institution: 'VIT-AP University',
        year: '2026',
        details: '8.4 CGPA'
      }
    ],
    skills: ['Android Pentesting', 'JADX', 'Wireshark', 'Python'],
    skillCategories: [
      { category: 'Security Testing', skills: ['Android Pentesting', 'JADX'] },
      { category: 'Networking', skills: ['Wireshark', 'Python'] }
    ],
    addedSkills: ['JADX'],
    projects: [
      {
        name: 'Android App Security Assessment',
        date: '2026',
        linkOrTech: 'JADX, APKTool',
        bullets: [
          {
            id: 'b1',
            text: 'Performed static analysis with JADX to locate hardcoded secrets.',
            isModified: true
          }
        ]
      }
    ],
    experience: [],
    achievements: ['Competed in 48-hour international CTF challenge.'],
    certifications: ['Completed OSI Model & TCP/IP Suite coursework.'],
    preset: 'fresher'
  };

  it('generates compile-ready LaTeX code without diff highlights or plus markers', () => {
    const code = generateLatexCode(sampleModel);

    // Assert standard Jake's Resume structure
    expect(code).toContain('\\documentclass[letterpaper,10pt]{article}');
    expect(code).toContain('Jeswanth Posina');
    expect(code).toContain('\\section{Technical Skills}');
    expect(code).toContain('\\section{Projects}');
    expect(code).toContain('Android App Security Assessment');

    // Crucial: Must NOT contain diff markers or green styling
    expect(code).not.toContain('+JADX');
    expect(code).not.toContain('Updated');
    expect(code).not.toContain('bg-emerald');
    expect(code).not.toContain('border-emerald');

    // LaTeX characters escaped
    expect(escapeLatex('C & C++')).toBe('C \\& C++');
    expect(escapeLatex('100%')).toBe('100\\%');
  });

  it('creates valid LaTeX Blob with text/x-tex mime type', () => {
    const blob = generateLatexBlob(sampleModel);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain('text/x-tex');
    expect(blob.size).toBeGreaterThan(200);
  });

  it('generates clean ATS-optimized plain text with standard delimiters', () => {
    const txt = generatePlainText(sampleModel);

    expect(txt).toContain('JESWANTH POSINA');
    expect(txt).toContain('jeswanth.cipher1337@gmail.com');
    expect(txt).toContain('PROFESSIONAL SUMMARY');
    expect(txt).toContain('TECHNICAL SKILLS');
    expect(txt).toContain('PROJECTS');
    expect(txt).toContain('• Performed static analysis with JADX to locate hardcoded secrets.');

    // Crucial: Must NOT contain diff markers
    expect(txt).not.toContain('+JADX');
    expect(txt).not.toContain('[Updated]');
    expect(txt).not.toContain('bg-emerald');
  });

  it('creates valid plain text Blob with text/plain mime type', () => {
    const blob = generatePlainTextBlob(sampleModel);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain('text/plain');
    expect(blob.size).toBeGreaterThan(100);
  });

  it('generates production Word (.docx) blob cleanly without throwing', async () => {
    const blob = await generateDocxBlob(sampleModel);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(500);
  });
});
