import { describe, it, expect } from 'vitest';
import { parseHeader } from '../../lib/tailorEngine/structure/headerParser';
import { parseJDOverview } from '../../lib/tailorEngine/parser';
import { parseSkillsSection } from '../../lib/tailorEngine/structure/skillsParser';
import { parseEducationSection } from '../../lib/tailorEngine/structure/educationParser';
import { recoverResumeStructure } from '../../lib/tailorEngine/structure/recoveryEngine';
import { parseResumeDocModel } from '../../lib/tailorEngine/docModel';

describe('Cybersecurity Resume & Role Tailoring Pipeline', () => {
  it('correctly splits candidate name from cybersecurity headline', () => {
    const rawHeader = `JESWANTH POSINA CYBERSECURITY
jeswanth.cipher1337@gmail.com | +91 7288922933 | Intern | linkedin.com/in/jeswanthposina | github.com/HackerJbon1337`;

    const header = parseHeader(rawHeader);
    expect(header.name).toBe('Jeswanth Posina');
    expect(header.headline).toBe('Cybersecurity');
    expect(header.email).toBe('jeswanth.cipher1337@gmail.com');
    expect(header.phone).toBe('+91 7288922933');
    expect(header.links).toContain('linkedin.com/in/jeswanthposina');
    expect(header.links).toContain('github.com/HackerJbon1337');
  });

  it('correctly extracts Cloud Security Engineer from markdown JD title without defaulting to Software Engineer', () => {
    const jdText = `# Role: Cloud Security Engineer
Company: Acme Cloud Solutions
Location: Remote / Bangalore
Requirements:
- Strong understanding of OWASP MASTG and Android/Cloud application security.
- Experience with Wireshark, Nmap, and network penetration testing.
- Hands-on with Linux systems and Python automation.`;

    const jd = parseJDOverview(jdText);
    expect(jd.role).toBe('Cloud Security Engineer');
    expect(jd.role).not.toBe('Software Engineer');
    expect(jd.company).toBe('Acme Cloud Solutions');
    expect(jd.mustHaves.length).toBeGreaterThan(0);
  });

  it('preserves labeled skill subcategories instead of lumping everything into Other', () => {
    const skillsText = `Tools & Platforms: Linux
Security Tools: JADX, APKTool, ADB, Android Studio Emulator, Wireshark, Nmap, TruffleHog, Cisco Packet Tracer
Networking: TCP/IP, OSI model, Subnetting & CIDR, NAT, PAT, ACLs, Firewalls, DHCP, VPN fundamentals, PowerShell basics, IIS
Core Competencies: Static & dynamic analysis, Reverse engineering, Binary patching, OWASP Top 10, OWASP MASTG methodology, CTFs`;

    const skills = parseSkillsSection(skillsText);

    expect(skills.categories.length).toBeGreaterThanOrEqual(3);
    const catNames = skills.categories.map((c) => c.category);

    expect(catNames.some((c) => c.includes('Tools') || c.includes('Platforms'))).toBe(true);
    expect(catNames.some((c) => c.includes('Security'))).toBe(true);
    expect(catNames.some((c) => c.includes('Networking'))).toBe(true);

    // Verify individual tools are present and cleaned
    expect(skills.canonicalSkills).toContain('Linux');
    expect(skills.canonicalSkills).toContain('JADX');
    expect(skills.canonicalSkills).toContain('Wireshark');
    expect(skills.canonicalSkills).toContain('Nmap');
    expect(skills.canonicalSkills).toContain('OWASP Top 10');
    expect(skills.canonicalSkills).toContain('OWASP MASTG');
    expect(skills.canonicalSkills).toContain('TCP/IP');
  });

  it('correctly extracts full degree and institution without 45-char truncation', () => {
    const eduText = `B.Tech in Electronics and Communication Engineering
Vellore Institute of Technology - AP
Sept 2025 - Aug 2029`;

    const edu = parseEducationSection(eduText);
    expect(edu.length).toBe(1);
    expect(edu[0].degree).toBe('B.Tech in Electronics and Communication Engineering');
    expect(edu[0].degree.endsWith('Engin')).toBe(false); // Not truncated
    expect(edu[0].degree).toContain('Engineering');
    expect(edu[0].institution).toContain('Vellore Institute of Technology');
  });

  it('recovers all distinct sections: Summary, Education, Skills, Leadership, Continuous Learning', () => {
    const fullResume = `JESWANTH POSINA CYBERSECURITY
jeswanth.cipher1337@gmail.com | +91 7288922933 | Intern | linkedin.com/in/jeswanthposina | github.com/HackerJbon1337

PROFESSIONAL SUMMARY
Second-year Electronics & Communication Engineering student building hands-on skills in mobile application security, penetration testing, and networking. Self-directed learner with a documented, consistent practice of applying OWASP MASTG methodology to real vulnerable applications.

EDUCATION
B.Tech in Electronics and Communication Engineering
VIT-AP University
Sept 2025 - Aug 2029

TECHNICAL SKILLS
Tools & Platforms: Linux
Security Tools: JADX, APKTool, ADB, Android Studio Emulator, Wireshark, Nmap, TruffleHog, Cisco Packet Tracer
Networking: TCP/IP, OSI model, Subnetting & CIDR, NAT, PAT, ACLs, Firewalls, DHCP, VPN fundamentals

LEADERSHIP & INVOLVEMENT
Technical Team Member | Null (InfoSec) Chapter, VIT-AP University | 2026 - Present
- Conducted hands-on mobile security and APK reverse engineering workshops for 40+ student members.
- Organized campus CTF competitions and developed web exploitation challenges.

CONTINUOUS LEARNING
- Completed OSI Model & TCP/IP Deep Dive certification.
- CompTIA Security+ fundamentals.`;

    const recovered = recoverResumeStructure(fullResume);

    expect(recovered.header.name).toBe('Jeswanth Posina');
    expect(recovered.header.headline).toBe('Cybersecurity');
    expect(recovered.summary).toBeTruthy();
    expect(recovered.education.length).toBe(1);
    expect(recovered.skills.canonicalSkills.length).toBeGreaterThan(5);

    // Leadership must be its own section, NOT swallowed into skills!
    expect(recovered.leadership.length).toBe(1);
    expect(recovered.leadership[0].role).toBe('Technical Team Member');
    expect(recovered.leadership[0].company).toContain('Null (InfoSec) Chapter');
    expect(recovered.leadership[0].bullets.length).toBe(2);

    // Continuous learning must be extracted as certifications
    expect(recovered.certifications.length).toBe(2);
    expect(recovered.certifications[0]).toContain('Completed OSI Model & TCP/IP');

    // Parse DocModel with accepted bullet edits and accepted skill
    const acceptedEdits = {
      'Conducted hands-on mobile security and APK reverse engineering workshops for 40+ student members.':
        'Conducted hands-on mobile security workshops, improving vulnerability detection proficiency for 40+ students.'
    };
    const acceptedSkills = ['Cloud Security'];

    const docModel = parseResumeDocModel(fullResume, acceptedEdits, undefined, acceptedSkills);

    expect(docModel.contact.name).toBe('Jeswanth Posina');
    expect(docModel.addedSkills).toContain('Cloud Security');
    expect(docModel.skills).toContain('Cloud Security');

    // Verify modified bullet is marked as isModified: true for dynamic green rendering
    const modifiedBullet = docModel.leadership?.[0].bullets.find((b) => b.isModified);
    expect(modifiedBullet).toBeDefined();
    expect(modifiedBullet?.isModified).toBe(true);
    expect(modifiedBullet?.text).toContain('improving vulnerability detection proficiency');
  });
});
