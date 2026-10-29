// ============================================================
// HIREFLOW DETERMINISTIC BULLET COMPOSER (STAGE 4)
// Composes structured bullets from confirmed facts according to 4 patterns.
// Invariant P2: Never invents numbers, skills, or responsibilities.
// Invariant P3: Strict adherence to declared ownership tier verb ladder.
// Invariant P4: Metric optional, zero [X%] placeholders.
// ============================================================

import { Fact, OwnershipTier } from '../types';
import { OWNERSHIP_VERB_LADDER, isVerbPermittedForTier } from './verbs';

export type BulletCompositionPattern =
  | 'outcome-first'
  | 'action-first'
  | 'scale-first'
  | 'problem-and-fix';

export interface ComposedBullet {
  factId: string;
  pattern: BulletCompositionPattern;
  text: string;
  tier: OwnershipTier;
  verb: string;
  metricUsed?: string;
}

/**
 * Selects an appropriate verb honoring the candidate's declared ownership tier.
 */
function resolveVerbForTier(action: string, tier: OwnershipTier): string {
  const cleanAction = action.trim();
  if (isVerbPermittedForTier(cleanAction, tier)) {
    return cleanAction.charAt(0).toUpperCase() + cleanAction.slice(1);
  }
  // If proposed action exceeds tier, fall back to the primary verb for that tier
  const tierVerbs = OWNERSHIP_VERB_LADDER[tier];
  return tierVerbs[0] || 'Contributed to';
}

export function composeBulletFromFact(
  fact: Fact,
  pattern: BulletCompositionPattern = 'action-first'
): ComposedBullet {
  if (!fact.confirmed || fact.ownership === undefined) {
    throw new Error(`Cannot compose bullet from unconfirmed or tier-less fact "${fact.id}".`);
  }

  const tier = fact.ownership;
  const verb = resolveVerbForTier(fact.action, tier);
  const object = fact.object.trim();
  const techList = fact.tech.length > 0 ? fact.tech.join(', ') : '';
  const evidence = fact.evidence?.value ? fact.evidence.value : undefined;
  const outcome = fact.outcome?.trim();

  let text = '';

  switch (pattern) {
    case 'outcome-first': {
      if (evidence && outcome) {
        text = `${evidence} ${outcome} achieved by ${verb.toLowerCase()} ${object}${techList ? ` using ${techList}` : ''}.`;
      } else if (evidence) {
        text = `Achieved ${evidence} impact by ${verb.toLowerCase()} ${object}${techList ? ` using ${techList}` : ''}.`;
      } else if (outcome) {
        text = `${outcome} delivered by ${verb.toLowerCase()} ${object}${techList ? ` using ${techList}` : ''}.`;
      } else {
        text = `${verb} ${object}${techList ? ` using ${techList}` : ''}.`;
      }
      break;
    }

    case 'scale-first': {
      if (evidence) {
        text = `Across ${evidence}, ${verb.toLowerCase()} ${object}${techList ? ` using ${techList}` : ''}${outcome ? ` to ${outcome.toLowerCase()}` : ''}.`;
      } else {
        text = `${verb} ${object}${techList ? ` leveraging ${techList}` : ''}${outcome ? ` to ${outcome.toLowerCase()}` : ''}.`;
      }
      break;
    }

    case 'problem-and-fix': {
      if (evidence && outcome) {
        text = `Addressed engineering bottleneck by ${verb.toLowerCase()} ${object}${techList ? ` with ${techList}` : ''}, realizing ${evidence} ${outcome.toLowerCase()}.`;
      } else if (evidence) {
        text = `Streamlined pipeline by ${verb.toLowerCase()} ${object}${techList ? ` with ${techList}` : ''}, achieving ${evidence} performance gains.`;
      } else {
        text = `Resolved system requirements by ${verb.toLowerCase()} ${object}${techList ? ` with ${techList}` : ''}.`;
      }
      break;
    }

    case 'action-first':
    default: {
      if (evidence && outcome) {
        text = `${verb} ${object}${techList ? ` using ${techList}` : ''}, achieving ${evidence} ${outcome.toLowerCase()}.`;
      } else if (evidence) {
        text = `${verb} ${object}${techList ? ` using ${techList}` : ''}, improving performance by ${evidence}.`;
      } else if (outcome) {
        text = `${verb} ${object}${techList ? ` using ${techList}` : ''}, delivering ${outcome.toLowerCase()}.`;
      } else {
        text = `${verb} ${object}${techList ? ` using ${techList}` : ''}.`;
      }
      break;
    }
  }

  // Ensure single period at end and normalize spacing
  text = text.trim().replace(/\s+/g, ' ').replace(/\.+$/, '') + '.';

  return {
    factId: fact.id,
    pattern,
    text,
    tier,
    verb,
    metricUsed: evidence,
  };
}

