/**
 * HireFlow v4: Explainability Type Definition (X1.8, B6)
 * Every derived score and metric shown to a user carries an ExplainedValue contract.
 */

export interface MetricInput {
  name: string;
  value: string | number;
  source?: string;
}

export interface ExplainedValue {
  /** Unique metric identifier, e.g., 'resume-strength', 'hard-skills-coverage' */
  id: string;

  /** Human-readable metric title */
  label: string;

  /** The calculated numerical value */
  value: number;

  /** Optional unit representation, e.g. '%', 'LPA', '/100' */
  unit?: string;

  /** Dynamic plain-English formula reflecting live configuration constants */
  formula: string;

  /** Breakdown of each contributing parameter and its source */
  inputs: MetricInput[];

  /** Provenance data period or catalog version, e.g., "'26-27 Campus Intelligence" */
  dataPeriod?: string;

  /** Confidence rating in the extraction or calculation */
  confidence?: 'low' | 'medium' | 'high';

  /** Plain statements clarifying what this number does and does not mean */
  limitations: string[];
}
