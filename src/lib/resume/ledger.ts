// ============================================================
// HIREFLOW APPEND-ONLY CANDIDATE FACT LEDGER (STAGE 1)
// Immutable history: edit creates version n+1 with new content hash.
// Unconfirmed facts never render; confirmed only via explicit user action API (P1, P2)
// ============================================================

import { Fact, OwnershipTier, validateFact } from './types';
import { computeFactHash } from './hash';

export interface SerializedLedger {
  version: number;
  factsByBaseId: Record<string, Fact[]>;
  updatedAt: string;
}

export class AppendOnlyFactLedger {
  // Map of factId -> array of versions [v1, v2, v3, ...]
  private history: Map<string, Fact[]> = new Map();

  constructor(initialFacts?: Fact[]) {
    if (initialFacts && Array.isArray(initialFacts)) {
      for (const f of initialFacts) {
        this.insertFactRecord(f);
      }
    }
  }

  private insertFactRecord(fact: Fact): void {
    const existing = this.history.get(fact.id) || [];
    existing.push(fact);
    // Keep sorted by version ascending
    existing.sort((a, b) => a.version - b.version);
    this.history.set(fact.id, existing);
  }

  /**
   * Adds a brand new Fact (version 1) to the ledger.
   * By default, imported facts start unconfirmed and with unset ownership.
   */
  public addFact(input: Omit<Fact, 'version' | 'hash'>): Fact {
    const version = 1;
    const hash = computeFactHash({
      action: input.action,
      object: input.object,
      tech: input.tech,
      outcome: input.outcome,
      evidence: input.evidence,
      ownership: input.ownership,
      version
    });

    const newFact: Fact = {
      ...input,
      version,
      hash,
      // Invariant P1: imported facts never start confirmed
      confirmed: input.source === 'user' ? input.confirmed : false
    };

    const validation = validateFact(newFact);
    if (!validation.valid) {
      throw new Error(`Cannot add invalid fact: ${validation.errors.join('; ')}`);
    }

    this.insertFactRecord(newFact);
    return newFact;
  }

  /**
   * Edits an existing fact, creating version n+1 while preserving historical versions.
   * Invariant: Editing never mutates past records.
   */
  public editFact(factId: string, updates: Partial<Omit<Fact, 'id' | 'version' | 'hash'>>): Fact {
    const versions = this.history.get(factId);
    if (!versions || versions.length === 0) {
      throw new Error(`Fact not found in ledger: "${factId}"`);
    }

    const latest = versions[versions.length - 1];
    const newVersion = latest.version + 1;

    const updatedAction = updates.action !== undefined ? updates.action : latest.action;
    const updatedObject = updates.object !== undefined ? updates.object : latest.object;
    const updatedTech = updates.tech !== undefined ? updates.tech : latest.tech;
    const updatedOutcome = updates.outcome !== undefined ? updates.outcome : latest.outcome;
    const updatedEvidence = updates.evidence !== undefined ? updates.evidence : latest.evidence;
    const updatedOwnership = updates.ownership !== undefined ? updates.ownership : latest.ownership;
    const updatedConfirmed = updates.confirmed !== undefined ? updates.confirmed : latest.confirmed;
    const updatedLink = updates.link !== undefined ? updates.link : latest.link;
    const updatedParentId = updates.parentId !== undefined ? updates.parentId : latest.parentId;

    const newHash = computeFactHash({
      action: updatedAction,
      object: updatedObject,
      tech: updatedTech,
      outcome: updatedOutcome,
      evidence: updatedEvidence,
      ownership: updatedOwnership,
      version: newVersion
    });

    const nextFact: Fact = {
      id: factId,
      version: newVersion,
      source: latest.source,
      confirmed: updatedConfirmed,
      kind: latest.kind,
      parentId: updatedParentId,
      action: updatedAction,
      object: updatedObject,
      tech: updatedTech,
      outcome: updatedOutcome,
      evidence: updatedEvidence,
      ownership: updatedOwnership,
      link: updatedLink,
      hash: newHash,
      createdAt: updates.createdAt || latest.createdAt
    };

    const validation = validateFact(nextFact);
    if (!validation.valid) {
      throw new Error(`Cannot record invalid fact revision: ${validation.errors.join('; ')}`);
    }

    this.insertFactRecord(nextFact);
    return nextFact;
  }

  /**
   * Explicit API for setting candidate confirmation on a fact.
   * Invariant P1: Confirmed is ONLY set through this explicit user action API.
   */
  public confirmFact(factId: string, confirmed: boolean = true): Fact {
    return this.editFact(factId, { confirmed });
  }

  /**
   * Explicit API for assigning an ownership tier (1-5) to a fact.
   * Invariant P3: Ownership tier is declared by candidate; engine never invents or raises it.
   */
  public setOwnershipTier(factId: string, ownership: OwnershipTier): Fact {
    return this.editFact(factId, { ownership });
  }

  /**
   * Returns ONLY latest-version facts where confirmed === true and ownership tier is set.
   * These are the ONLY facts permitted to render on a resume document tree (P1, P3).
   */
  public renderableFacts(): Fact[] {
    const renderable: Fact[] = [];
    for (const [, versions] of this.history.entries()) {
      if (versions.length > 0) {
        const latest = versions[versions.length - 1];
        if (latest.confirmed && latest.ownership !== undefined) {
          renderable.push(latest);
        }
      }
    }
    return renderable;
  }

  /**
   * Returns all latest-version facts, including unconfirmed or unset ownership.
   */
  public allLatestFacts(): Fact[] {
    const list: Fact[] = [];
    for (const [, versions] of this.history.entries()) {
      if (versions.length > 0) {
        list.push(versions[versions.length - 1]);
      }
    }
    return list;
  }

  /**
   * Returns the full immutable version audit trail for a specific fact.
   */
  public getFactHistory(factId: string): Fact[] {
    const versions = this.history.get(factId);
    return versions ? [...versions] : [];
  }

  public getFact(factId: string): Fact | undefined {
    const versions = this.history.get(factId);
    return versions && versions.length > 0 ? versions[versions.length - 1] : undefined;
  }

  public size(): number {
    return this.history.size;
  }

  public serialize(): string {
    const obj: SerializedLedger = {
      version: 1,
      factsByBaseId: {},
      updatedAt: new Date().toISOString()
    };
    for (const [id, versions] of this.history.entries()) {
      obj.factsByBaseId[id] = versions;
    }
    return JSON.stringify(obj);
  }

  public static deserialize(jsonString: string): AppendOnlyFactLedger {
    const parsed: SerializedLedger = JSON.parse(jsonString);
    const ledger = new AppendOnlyFactLedger();
    if (parsed.factsByBaseId) {
      for (const [id, versions] of Object.entries(parsed.factsByBaseId)) {
        for (const v of versions) {
          ledger.insertFactRecord(v);
        }
      }
    }
    return ledger;
  }
}
