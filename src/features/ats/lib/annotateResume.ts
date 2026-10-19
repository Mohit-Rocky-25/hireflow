/**
 * HireFlow v4: Deterministic Resume Text Annotator (D16)
 * Scans candidate text and generates exact character-span annotations for:
 * - Red: Weak action verbs, vague claims
 * - Amber: Passive voice, run-on bullets (> 28 words)
 * - Green: Strong engineering verbs, quantified metrics, matched tech tokens
 */

export interface ResumeAnnotationSpan {
  id: string;
  start: number;
  end: number;
  text: string;
  type: 'weak_verb' | 'passive_voice' | 'run_on_bullet' | 'strong_verb' | 'quant_metric' | 'matched_skill';
  severity: 'red' | 'amber' | 'green';
  ruleId: string;
  title: string;
  message: string;
  suggestedRewrite?: string;
}

const WEAK_VERBS: Record<string, string> = {
  helped: 'Engineered or Led',
  assisted: 'Co-developed or Implemented',
  'worked on': 'Architected or Built',
  handled: 'Managed or Orchestrated',
  responsible: 'Owned end-to-end execution of',
  supported: 'Enhanced or Scaled',
};

const STRONG_VERBS = [
  'architected',
  'engineered',
  'built',
  'deployed',
  'optimized',
  'developed',
  'designed',
  'implemented',
  'refactored',
  'automated',
  'spearheaded',
  'scaled',
  'configured',
];

const METRIC_PATTERN = /\b(?:\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?k?|\d+\s*(?:ms|s|sec|fps|qps|users|req\/s|mb|gb|tb|lpa))\b/i;
const NUMBER_COUNT_PATTERN = /\b\d{2,}\b/;

export function generateResumeAnnotations(
  text: string,
  targetSkills: string[] = []
): ResumeAnnotationSpan[] {
  if (!text) return [];

  const annotations: ResumeAnnotationSpan[] = [];
  const lines = text.split('\n');
  let currentOffset = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      currentOffset += line.length + 1;
      continue;
    }

    const lineStart = text.indexOf(line, currentOffset);

    // 1. Check for Run-On Bullets (> 28 words)
    const words = trimmed.split(/\s+/);
    if (words.length > 28) {
      annotations.push({
        id: `ann_runon_${lineStart}`,
        start: lineStart,
        end: lineStart + line.length,
        text: line,
        type: 'run_on_bullet',
        severity: 'amber',
        ruleId: 'rule-run-on-bullet',
        title: 'Run-On Bullet Point (> 28 words)',
        message: `This bullet contains ${words.length} words. Recruiters scan in 6 seconds; trim into 2 crisp lines or cut filler words.`,
        suggestedRewrite: words.slice(0, 22).join(' ') + '...',
      });
    }

    // 2. Check for Passive Voice ("was responsible for", "was assigned to")
    const lowerLine = line.toLowerCase();
    const passiveMatch = lowerLine.match(/\b(was responsible for|were responsible for|was involved in|responsible for)\b/i);
    if (passiveMatch && passiveMatch.index !== undefined) {
      const matchStart = lineStart + passiveMatch.index;
      annotations.push({
        id: `ann_passive_${matchStart}`,
        start: matchStart,
        end: matchStart + passiveMatch[0].length,
        text: line.slice(passiveMatch.index, passiveMatch.index + passiveMatch[0].length),
        type: 'passive_voice',
        severity: 'amber',
        ruleId: 'rule-passive-voice',
        title: 'Passive Voice Detected',
        message: 'Replace passive phrasing with direct active ownership.',
        suggestedRewrite: 'Spearheaded and delivered',
      });
    }

    // 3. Check for Weak Verbs at sentence / clause starts
    for (const [weak, suggested] of Object.entries(WEAK_VERBS)) {
      const regex = new RegExp(`\\b${weak}\\b`, 'gi');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(line)) !== null) {
        const start = lineStart + m.index;
        annotations.push({
          id: `ann_weak_${start}`,
          start,
          end: start + m[0].length,
          text: m[0],
          type: 'weak_verb',
          severity: 'red',
          ruleId: 'rule-action-verbs-weak',
          title: `Weak Action Verb ("${m[0]}")`,
          message: `Recruiters penalize passive words like "${m[0]}". State your direct engineering contribution.`,
          suggestedRewrite: suggested,
        });
      }
    }

    // 4. Check for Strong Engineering Verbs (Green)
    for (const strong of STRONG_VERBS) {
      const regex = new RegExp(`\\b${strong}\\b`, 'gi');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(line)) !== null) {
        const start = lineStart + m.index;
        annotations.push({
          id: `ann_strong_${start}`,
          start,
          end: start + m[0].length,
          text: m[0],
          type: 'strong_verb',
          severity: 'green',
          ruleId: 'rule-action-verbs-strong',
          title: `Strong Engineering Verb ("${m[0]}")`,
          message: 'Excellent high-impact action verb showing technical ownership.',
        });
      }
    }

    // 5. Check for Quantified Metrics ($/%, latency, counts) (Green)
    const metricRegex = /(?:\b\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?k?|\b\d+\s*(?:ms|s|sec|fps|qps|users|req\/s|mb|gb|tb|lpa|k\b))/gi;
    let mMetric: RegExpExecArray | null;
    while ((mMetric = metricRegex.exec(line)) !== null) {
      const start = lineStart + mMetric.index;
      annotations.push({
        id: `ann_metric_${start}`,
        start,
        end: start + mMetric[0].length,
        text: mMetric[0],
        type: 'quant_metric',
        severity: 'green',
        ruleId: 'rule-quant-metrics',
        title: `Quantified Outcome ("${mMetric[0]}")`,
        message: 'Verified numeric evidence demonstrating measurable engineering impact (L3 tier).',
      });
    }

    // 6. Check for Matched Target Tech Skills (Green)
    for (const skill of targetSkills) {
      if (!skill || skill.length < 2) continue;
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(line)) !== null) {
        const start = lineStart + m.index;
        // Avoid duplicate overlapping spans
        const alreadyCovered = annotations.some((a) => a.start <= start && a.end >= start + m![0].length);
        if (!alreadyCovered) {
          annotations.push({
            id: `ann_skill_${start}`,
            start,
            end: start + m[0].length,
            text: m[0],
            type: 'matched_skill',
            severity: 'green',
            ruleId: 'rule-jd-skill-matched',
            title: `Matched JD Skill ("${m[0]}")`,
            message: `Direct technical keyword match for target role requirement.`,
          });
        }
      }
    }

    currentOffset = lineStart + line.length + 1;
  }

  // Sort by starting character index
  return annotations.sort((a, b) => a.start - b.start);
}
