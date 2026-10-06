// ============================================================
// ATS Resume Roaster — Local Deterministic BM25 Engine
// Fast, zero-dependency Okapi BM25 scoring for resume & JD relevance
// ============================================================

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'or', 'so', 'if', 'into',
]);

/**
 * Tokenizes text into normalized stems/words, filtering stopwords.
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOPWORDS.has(token));
}

export interface Bm25Document {
  id: string;
  tokens: string[];
  length: number;
}

export class Bm25Engine {
  private documents: Bm25Document[] = [];
  private avgDocLen = 0;
  private dfMap = new Map<string, number>();
  private k1 = 1.2;
  private b = 0.75;

  constructor(corpus: { id: string; text: string }[]) {
    let totalLen = 0;
    this.documents = corpus.map(doc => {
      const tokens = tokenizeText(doc.text);
      totalLen += tokens.length;

      // Unique tokens for document frequency
      const unique = new Set(tokens);
      for (const t of unique) {
        this.dfMap.set(t, (this.dfMap.get(t) || 0) + 1);
      }

      return {
        id: doc.id,
        tokens,
        length: tokens.length,
      };
    });

    this.avgDocLen = this.documents.length > 0 ? totalLen / this.documents.length : 1;
  }

  /**
   * Computes BM25 score of a query against all documents or a specific document.
   */
  public scoreQueryAgainstDoc(query: string, docId: string): number {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc || doc.length === 0) return 0;

    const queryTokens = tokenizeText(query);
    if (queryTokens.length === 0) return 0;

    const n = this.documents.length;
    let totalScore = 0;

    // Count term frequencies in target doc
    const tfMap = new Map<string, number>();
    for (const t of doc.tokens) {
      tfMap.set(t, (tfMap.get(t) || 0) + 1);
    }

    for (const qt of queryTokens) {
      const tf = tfMap.get(qt) || 0;
      if (tf === 0) continue;

      const df = this.dfMap.get(qt) || 0;
      // Okapi IDF
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (doc.length / (this.avgDocLen || 1)));

      totalScore += idf * (numerator / denominator);
    }

    // Normalized to 0.0 - 1.0 range based on query token count
    const maxPossible = queryTokens.length * Math.log(n + 1) * 1.5;
    return maxPossible > 0 ? Math.min(1.0, Math.max(0, totalScore / maxPossible)) : 0;
  }

  /**
   * Returns top matching document score for the query across the entire corpus.
   */
  public maxScoreForQuery(query: string): number {
    let max = 0;
    for (const doc of this.documents) {
      const s = this.scoreQueryAgainstDoc(query, doc.id);
      if (s > max) max = s;
    }
    return max;
  }
}
