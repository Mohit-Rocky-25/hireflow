import { describe, it, expect } from 'vitest';
import { parseHeader } from '../../lib/tailorEngine/structure/headerParser';
import { parseJDOverview } from '../../lib/tailorEngine/parser';
import { parseSkillsSection } from '../../lib/tailorEngine/structure/skillsParser';
import { parseEducationSection } from '../../lib/tailorEngine/structure/educationParser';
import { recoverResumeStructure } from '../../lib/tailorEngine/structure/recoveryEngine';
import { parseResumeDocModel } from '../../lib/tailorEngine/docModel';
import { generateTailoredSuggestions } from '../../lib/tailorEngine/engine';
import { evaluateBulletFormula } from '../../lib/tailorEngine/actionWordEngine';

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

  it('generates domain-aligned network suggestions without misleading canned demo data', () => {
    const resumeWithNetworkBullet = `JESWANTH POSINA
jeswanth.cipher1337@gmail.com
EXPERIENCE
Student Network Engineer | CyberLab
- Built and tested a subnetted network topology in Cisco Packet Tracer to reinforce IP addressing, encapsulation, and routing concepts.`;

    const jdText = `Role: Network Security Engineer
Company: CloudNet
Requirements:
- Strong experience with Cisco, subnetting, and network topology.
- Experience with routing, encapsulation, and IP addressing.`;

    const result = generateTailoredSuggestions(resumeWithNetworkBullet, jdText);
    const contextSug = result.suggestions.find((s) => s.needsContext);

    expect(contextSug).toBeDefined();
    // In accordance with Redesign Rules 1 & 3:
    // Engine generates a QUESTION with empty proposedText, zero canned chips, and honest consequence text!
    expect(contextSug?.kind).toBe('QUESTION');
    expect(contextSug?.proposedText).toBe('');
    expect(contextSug?.question).toContain('network');
    expect(contextSug?.consequenceText).toContain('subnetting');
    expect(contextSug?.examplePlaceholder).toContain('Example format');
    expect(contextSug?.contextTapChips).toHaveLength(0);
  });

  it('correctly evaluates 4-slot formula for networking bullets with Cisco Packet Tracer and subnets', () => {
    const rawBullet = 'Built and tested a subnetted network topology in Cisco Packet Tracer to reinforce IP addressing, encapsulation, and routing concepts';
    const beforeFormula = evaluateBulletFormula(rawBullet);

    expect(beforeFormula.action).toBe(true); // Built
    expect(beforeFormula.object).toBe(true); // topology / routing
    expect(beforeFormula.tool).toBe(true);   // Cisco Packet Tracer
    expect(beforeFormula.result).toBe(false); // No metric yet

    // After applying custom verified outcome
    const withCustomOutcome = `${rawBullet}, spanning 4 subnets across 3 VLANs with zero packet loss`;
    const afterFormula = evaluateBulletFormula(withCustomOutcome);

    expect(afterFormula.action).toBe(true);
    expect(afterFormula.object).toBe(true);
    expect(afterFormula.tool).toBe(true);
    expect(afterFormula.result).toBe(true); // 4 subnets / zero packet loss
    expect(afterFormula.score).toBe(4);
  });

  it('correctly isolates SECURITY PROJECTS & PRACTICAL EXPERIENCE from Core Competencies into presentable project bullets', () => {
    const rawResume = `JESWANTH POSINA CYBERSECURITY
jeswanth.cipher1337@gmail.com | +91 7288922933 | Intern | linkedin.com/in/jeswanthposina | github.com/HackerJbon1337

TECHNICAL SKILLS
Scripting & Platforms: Bash (Kali Linux), PowerShell, Linux, IIS
Core Competencies: Static & Dynamic Analysis, Reverse Engineering, Binary Patching, OWASP Top 10, OWASP MASTG, CTFs
Tools & Platforms: Browser DevTools
Networking & Protocols: Network Encapsulation

SECURITY PROJECTS & PRACTICAL EXPERIENCE
Android Application Security Assessment (AndroGoat) 2026
Performed static analysis with JADX to locate hardcoded secrets (API keys, Promo Codes, tokens) embedded in a vulnerable Android APK.
Identified insecure local data storage in SharedPreferences by combining static analysis (JADX) with dynamic inspection via ADB.
Documented client-side trust risks and secure-storage recommendations based on OWASP Mobile Top 10 principles.

Binary Patching & Privilege Escalation Challenge 2026
Reverse engineered an Android APK to locate a client-side isAdmin authorization check using JADX.
Modified Application Logic With APKTool, Rebuilt and Re-signed The APK, and successfully escalated privileges on an emulator, demonstrating the risk of enforcing security decisions on the client side.

L3AK CTF 2026 (International Capture the Flag Competition) 2026
Competed in a 48-hour international CTF as a first-time participant after an invitation from a senior teammate.
Attempted GeoOSINT and CSRF-bypass challenges, built practical skills in HTTP request analysis, and Client-side JavaScript Injection.
Reviewed official write-ups for unsolved challenges to close knowledge gaps and improve future performance.

Network Security Fundamentals & Lab Work 2026
Built and tested a subnetted network topology in Cisco Packet Tracer to reinforce IP addressing, and Routing Concepts.
Used Wireshark and Nmap to analyze HTTP traffic from a self-hosted IIS server and test firewall/ACL behavior on a live network, Including ICMP Vs. HTTPS Handling.

LEADERSHIP & INVOLVEMENT
Technical Team Member — Null (InfoSec) Chapter — VIT-AP University 2026 – Present
• Contribute to a student-run information security community focused on ethical hacking, CTFs, and security awareness on campus.

CERTIFICATIONS & CONTINUOUS LEARNING
• Completed OSI Model & TCP/IP Suite coursework (David Bombal — Networking Udemy course) and studying the OWASP MASTG for structured mobile pentesting methodology.
• Actively solving labs on PortSwigger Web Security Academy and following Real-World Bug Hunting by Peter Yaworski
• maintains a public, day-by-day cybersecurity learning log.`;

    const recovered = recoverResumeStructure(rawResume);

    // 1. Projects must be isolated into exactly 3 distinct technical projects (CTF routed to achievements)
    expect(recovered.projects.length).toBe(3);
    expect(recovered.projects[0].name).toContain('Android Application Security Assessment');
    expect(recovered.projects[0].bullets.length).toBe(3);
    expect(recovered.projects[1].name).toContain('Binary Patching & Privilege Escalation');
    expect(recovered.projects[1].bullets.length).toBe(2);
    expect(recovered.projects[2].name).toContain('Network Security Fundamentals');
    expect(recovered.projects[2].bullets.length).toBe(2);
    expect(recovered.achievements.join(' ')).toContain('L3AK CTF');

    // 2. Core Competencies must NOT be polluted with project narratives or sentences
    const coreCompCategory = recovered.skills.categories.find(
      (c) => c.category.toLowerCase().includes('core') || c.category.toLowerCase().includes('competenc')
    );
    expect(coreCompCategory).toBeDefined();
    for (const skill of coreCompCategory?.skills || []) {
      expect(skill).not.toContain('AndroGoat');
      expect(skill).not.toContain('Performed');
      expect(skill).not.toContain('Identified');
      expect(skill).not.toContain('Reverse engineered');
      expect(skill.length).toBeLessThan(40);
    }

    // 3. Document Model should properly contain 3 projects, achievements, and clean skill categories
    const docModel = parseResumeDocModel(rawResume);
    expect(docModel.projects.length).toBe(3);
    expect(docModel.achievements.length).toBeGreaterThan(0);
    expect(docModel.projects[0].bullets.length).toBe(3);
    expect(docModel.projects[0].bullets[0].text).toContain('Performed static analysis with JADX');
    expect(docModel.projects[1].bullets[0].text).toContain('Reverse engineered an Android APK');

    // 4. Leadership & Certifications are preserved
    expect(docModel.leadership.length).toBe(1);
    expect(docModel.certifications.length).toBe(3);
  });
});

