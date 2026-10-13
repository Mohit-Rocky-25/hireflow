# KNOWLEDGE BASE SPECIFICATION — HIREFLOW AI RESUME TAILORING SAAS

## 1. Scope & Taxonomy Foundations
The HireFlow Knowledge Engine models skills, occupations, and credential requirements using international standards:
- **ESCO** (European Skills, Competences, Qualifications and Occupations): Hierarchical skill pillars, transversal skills, and multi-lingual synonyms.
- **O*NET** (Occupational Information Network - US Department of Labor): Standard Occupational Classification (SOC), task lists, tools and technology (T2) matrices.

---

## 2. Canonical Skill Schema
Every skill in the knowledge repository conforms to this schema:

```typescript
export interface CanonicalSkill {
  id: string;                         // Unique slug, e.g., 'typescript'
  displayName: string;                // Primary display name, e.g., 'TypeScript'
  category: SkillCategory;            // 'frontend' | 'backend' | 'devops' | 'database' | 'cloud' | 'security' | 'data_ai' | 'management' | 'methodology' | 'soft_skill'
  domain: string;                     // e.g., 'software_engineering', 'cybersecurity'
  aliases: string[];                  // Synonyms & abbreviations, e.g. ['ts', 'type script']
  relatedSkills: {
    skillId: string;
    relationshipType: 'broader' | 'narrower' | 'sibling' | 'ecosystem' | 'transferable_to';
    transferabilityWeight: number;    // 0.0 to 1.0
    rationale: string;
  }[];
  source: 'ESCO' | 'O*NET' | 'HIREFLOW_VERIFIED';
  version: string;
}
```

---

## 3. Occupational Role Hierarchies
Roles are grouped into job families with established career ladders:
- **Software Engineering**: Junior -> Mid-Level -> Senior -> Staff -> Principal -> Architect.
- **Cybersecurity**: SOC Analyst L1/L2 -> Security Engineer -> Penetration Tester -> Security Architect -> CISO.
- **Data & AI**: Data Analyst -> Data Engineer -> Machine Learning Engineer -> AI Research Scientist.
- **Product & Business**: Business Analyst -> Associate Product Manager -> Product Manager -> Group PM -> VP Product.

Each occupation defines:
- Standard Core Skills (Mandatory for the family).
- Adjacent Secondary Skills.
- Standard Certifications (e.g. AWS Certified Solutions Architect, CISSP, CEH, PMP).

---

## 4. Transferability Matrix
Transferable skills allow matching even when an exact lexical keyword is not used:
- `Docker` <--> `Podman` (Weight: 0.90, Rationale: OCI Container standard runtime parity).
- `React` <--> `Vue.js` (Weight: 0.75, Rationale: Reactive component-based virtual DOM frontend frameworks).
- `PostgreSQL` <--> `MySQL` (Weight: 0.85, Rationale: Standard SQL relational database engines).
- `AWS` <--> `GCP` (Weight: 0.80, Rationale: Core cloud infrastructure: compute, storage, networking, IAM).
- `Jest` <--> `Vitest` (Weight: 0.95, Rationale: Modern JavaScript test runner API compatibility).
