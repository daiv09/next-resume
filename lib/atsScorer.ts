import { createEmbedding, generateSuggestions } from "@/lib/groq/operations";
import type { AnalysisResult, ExtractedKeywords, ParsedResume } from "@/types/domain";

function tokenize(values: string[]): Set<string> {
  return new Set(
    values
      .flatMap((value) => value.toLowerCase().split(/[^a-z0-9+#.-]+/g))
      .map((word) => word.trim())
      .filter(Boolean),
  );
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) {
    throw new Error("Invalid embedding vectors");
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function atsScorer(input: {
  resumeParsed: ParsedResume;
  jdKeywords: ExtractedKeywords;
  resumeText: string;
  jdText: string;
}): Promise<AnalysisResult> {
  const resumeSkills = tokenize(input.resumeParsed.skills ?? []);
  const jdKeywords = tokenize(input.jdKeywords.keywords ?? []);

  const matchedSkills = [...resumeSkills].filter((skill) => jdKeywords.has(skill));
  const missingKeywords = [...jdKeywords].filter((keyword) => !resumeSkills.has(keyword));

  const skillOverlap = jdKeywords.size === 0 ? 0 : matchedSkills.length / jdKeywords.size;
  const keywordMatch = jdKeywords.size === 0 ? 0 : (jdKeywords.size - missingKeywords.length) / jdKeywords.size;

  const [resumeEmbedding, jdEmbedding] = await Promise.all([
    createEmbedding(input.resumeText),
    createEmbedding(input.jdText),
  ]);

  const embeddingSimilarityRaw = cosineSimilarity(resumeEmbedding, jdEmbedding);
  const embeddingSimilarity = (embeddingSimilarityRaw + 1) / 2;

  const score = Math.round((skillOverlap * 0.4 + keywordMatch * 0.3 + embeddingSimilarity * 0.3) * 100);
  const suggestions = await generateSuggestions(missingKeywords.slice(0, 20), input.resumeText);

  return {
    score,
    missingKeywords,
    suggestions,
  };
}
