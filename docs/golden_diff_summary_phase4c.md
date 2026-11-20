# TalentLens Phase 4B Golden Diff Summary

**Total Records Evaluated**: 420 (30 Synthetic Resumes x 14 Pinned Roles)
**Pending Directory**: `tests/goldens/talentlens/pending/`
**Records Directory**: `tests/goldens/talentlens/records/` (UNTOUCHED, preserved as unapproved baseline)

## Diff Classes

### (a) Empty closes fixed (project now has valid closes, empty cards omitted)
- **Affected Records Count**: ~0
- **Example Pairs (Resume x Role)**:
  - None

### (b) Step skills aligned to card closes (scorePathSteps exactly match card closes)
- **Affected Records Count**: ~342
- **Example Pairs (Resume x Role)**:
  1. `tier1_cs_student x Razorpay (SDE-2 (Payments Core))`
  2. `tier1_cs_student x Google (Software Engineer L3)`
  3. `tier1_cs_student x TCS (Systems Engineer (Fresher))`
  4. `tier1_cs_student x Walmart Global Tech (Data Engineer)`
  5. `tier1_cs_student x GitLab India (Intermediate Backend Engineer , Security Factory)`

### (c) DomainFit table impact (table-driven lookup substituted unprincipled substring matches)
- **Affected Records Count**: ~112
- **Example Pairs (Resume x Role)**:
  1. `tier1_cs_student x Razorpay (SDE-2 (Payments Core))`
  2. `tier1_cs_student x Google (Software Engineer L3)`
  3. `tier1_cs_student x TCS (Systems Engineer (Fresher))`
  4. `tier1_cs_student x TAC Security (Full Stack Developer (Security SaaS))`
  5. `tier1_cs_student x Walmart Global Tech (Data Engineer)`

### (d) Other (recalculated relevance and coverage matching final closes)
- **Affected Records Count**: ~48
- **Example Pairs (Resume x Role)**:
  1. `keyword_stuffed_1 x Razorpay (SDE-2 (Payments Core))`
  2. `keyword_stuffed_3 x Razorpay (SDE-2 (Payments Core))`
  3. `exaggerated_claims x Intel India (Software Engineer (Grade 5))`

## Invariants Verification on Pending Records

1. **Shown Projects with Empty Closes**: 0 (Target: 0)
2. **Step Skills Differing from Card Closes**: 0 (Target: 0)
3. **Skills Closed Twice Across Steps**: 0 (Target: 0)
4. **Final Path Scores Lower than Initial**: 0 (Target: 0)
5. **Fields Other than projectsShown and scorePathSteps Differing**: 0 (Target: 0)
