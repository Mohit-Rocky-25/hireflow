// ============================================================
// Pathways Architecture — Money & Number Formatting Utilities
// Enforces Constitution E7: Integer rupees, Indian number grouping,
// half-up rounding, and standard LPA notation.
// ============================================================

/**
 * Rounds a number to the nearest integer using standard half-up rounding.
 * e.g., 0.5 rounds to 1, -0.5 rounds to 0.
 */
export function roundHalfUp(val: number): number {
  if (val >= 0) {
    return Math.floor(val + 0.5);
  }
  return Math.ceil(val - 0.5);
}

/**
 * Ensures a value is strictly an integer rupee amount.
 */
export function toIntegerRupees(val: number): number {
  return roundHalfUp(val);
}

/**
 * Formats an integer rupee amount with standard Indian numbering commas:
 * e.g., 1200000 -> "₹12,00,000", 35000 -> "₹35,000"
 */
export function formatRupees(amount: number, includeSymbol: boolean = true): string {
  const rounded = roundHalfUp(amount);
  const isNegative = rounded < 0;
  const absVal = Math.abs(rounded);

  const numStr = absVal.toString();
  let result = '';

  if (numStr.length <= 3) {
    result = numStr;
  } else {
    // Last 3 digits
    const lastThree = numStr.slice(-3);
    const remaining = numStr.slice(0, -3);

    // Group remaining by 2 digits from right to left
    const grouped = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${grouped},${lastThree}`;
  }

  const prefix = isNegative ? '-₹' : '₹';
  return includeSymbol ? `${prefix}${result}` : (isNegative ? `-${result}` : result);
}

/**
 * Formats an annual salary in Lakhs Per Annum (LPA):
 * e.g., 360000 -> "3.6 LPA", 1200000 -> "12.0 LPA", 700000 -> "7.0 LPA"
 */
export function formatLpa(amount: number, decimals: number = 1): string {
  const lakhs = amount / 100000;
  return `${lakhs.toFixed(decimals)} LPA`;
}

/**
 * Formats a monthly integer amount as "/mo":
 * e.g., 25000 -> "₹25,000/mo"
 */
export function formatMonthly(amount: number): string {
  return `${formatRupees(amount)}/mo`;
}

/**
 * Calculates percentage with safe division and 1 decimal place.
 */
export function formatPercent(numerator: number, denominator: number): string {
  if (!denominator || denominator <= 0) return '0.0%';
  const pct = (numerator / denominator) * 100;
  return `${pct.toFixed(1)}%`;
}
