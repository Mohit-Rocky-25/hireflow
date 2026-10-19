import { describe, it, expect, beforeEach } from 'vitest';
import { useSavedRoleStore } from '../../src/store/savedRoleStore';
import { LIMITS } from '../../src/config/limits';

describe('D19: TalentLens Saved Roles & JD Bridge (D19.1 - D19.5)', () => {
  beforeEach(() => {
    useSavedRoleStore.getState().clearRoles();
  });

  it('saves target company roles and deduplicates identical entries', () => {
    const store = useSavedRoleStore.getState();

    const res1 = store.saveRole({
      companyId: 'razorpay',
      companyName: 'Razorpay',
      roleTitle: 'Software Development Engineer 1',
      tier: 'Product',
      ctcRange: '18-24 LPA',
      requiredSkills: ['Golang', 'PostgreSQL', 'Kafka'],
    });

    expect(res1.success).toBe(true);
    expect(res1.isDuplicate).toBe(false);
    expect(useSavedRoleStore.getState().roles.length).toBe(1);

    // Re-save exact same company & role
    const res2 = store.saveRole({
      companyId: 'razorpay',
      companyName: 'Razorpay',
      roleTitle: 'Software Development Engineer 1',
      requiredSkills: ['Golang'],
    });

    expect(res2.isDuplicate).toBe(true);
    expect(useSavedRoleStore.getState().roles.length).toBe(1);
    expect(store.isSaved('Razorpay', 'Software Development Engineer 1')).toBe(true);
  });

  it('enforces maximum saved roles limit (60) and refuses overflow', () => {
    const store = useSavedRoleStore.getState();

    for (let i = 1; i <= LIMITS.maxSavedRoles; i++) {
      store.saveRole({
        companyId: `comp_${i}`,
        companyName: `Company ${i}`,
        roleTitle: `Role ${i}`,
        requiredSkills: ['Java', 'SQL'],
      });
    }

    expect(useSavedRoleStore.getState().roles.length).toBe(LIMITS.maxSavedRoles);

    const overflow = store.saveRole({
      companyId: 'overflow',
      companyName: 'Overflow Corp',
      roleTitle: 'Architect',
      requiredSkills: ['C++'],
    });

    expect(overflow.success).toBe(false);
    expect(overflow.capReached).toBe(true);
    expect(useSavedRoleStore.getState().roles.length).toBe(LIMITS.maxSavedRoles);
  });
});
