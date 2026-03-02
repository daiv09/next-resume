import { groqClient } from "@/lib/groq/client";
import { buildSuggestionPrompt, jdKeywordPrompt, resumeParsePrompt } from "@/lib/groq/prompts";
import type { AnalysisResult, ExtractedKeywords, ParsedResume } from "@/types/domain";
import type { JsonValue } from "@prisma/client/runtime/library";

/**
 * Orchestrates a full resume-vs-JD analysis:
 * 1. Extracts required keywords from the job description.
 * 2. Determines which keywords are absent from the resume JSON.
 * 3. Generates actionable improvement suggestions.
 * 4. Returns a 0–100 match score.
 */
export async function runAnalysis({
  resumeData,
  jobContent,
}: {
  resumeData: JsonValue;
  jobContent: string;
}): Promise<AnalysisResult> {
  // Stringify the parsed resume so we can do keyword matching
  const resumeText = typeof resumeData === "string"
    ? resumeData
    : JSON.stringify(resumeData);

  // 1. Pull required keywords from the JD
  const { keywords: allKeywords = [] } = await extractKeywordsFromJd(jobContent);

  // 2. Find missing keywords (case-insensitive)
  const lowerResume = resumeText.toLowerCase();
  const missingKeywords = allKeywords.filter(
    (kw) => !lowerResume.includes(kw.toLowerCase()),
  );

  // 3. Score = percentage of keywords that ARE present
  const matchedCount = allKeywords.length - missingKeywords.length;
  const score = allKeywords.length > 0
    ? Math.round((matchedCount / allKeywords.length) * 100)
    : 100;

  // 4. Generate suggestions for the missing ones
  const suggestions = missingKeywords.length > 0
    ? await generateSuggestions(missingKeywords, resumeText)
    : [];

  return { score, missingKeywords, suggestions };
}


function extractJson<T>(content: string): T {
  // Try to extract a JSON object
  const objStart = content.indexOf("{");
  const objEnd = content.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    return JSON.parse(content.slice(objStart, objEnd + 1)) as T;
  }
  // Try to extract a JSON array
  const arrStart = content.indexOf("[");
  const arrEnd = content.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    return JSON.parse(content.slice(arrStart, arrEnd + 1)) as T;
  }
  throw new Error("Model did not return JSON");
}

export async function extractResumeJson(resumeText: string): Promise<ParsedResume> {
  const response = await groqClient.chat.completions.create({
    model: process.env.GROQ_MODEL_TEXT ?? "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [
      { role: "system", content: resumeParsePrompt },
      { role: "user", content: resumeText.slice(0, 12_000) },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "";
  return extractJson<ParsedResume>(content);
}

export async function extractKeywordsFromJd(content: string): Promise<ExtractedKeywords> {
  const response = await groqClient.chat.completions.create({
    model: process.env.GROQ_MODEL_TEXT ?? "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [
      { role: "system", content: jdKeywordPrompt },
      { role: "user", content: content.slice(0, 12_000) },
    ],
  });

  const output = response.choices[0]?.message?.content ?? "";
  return extractJson<ExtractedKeywords>(output);
}

export async function generateSuggestions(
  missingKeywords: string[],
  resumeText: string,
): Promise<string[]> {
  const response = await groqClient.chat.completions.create({
    model: process.env.GROQ_MODEL_TEXT ?? "llama-3.3-70b-versatile",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: buildSuggestionPrompt(missingKeywords, resumeText) }],
  });

  const output = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = extractJson<{ suggestions: string[] }>(output);
    return parsed.suggestions ?? [];
  } catch {
    // If JSON parsing fails, fall back to empty array rather than crashing the whole analysis
    console.error("generateSuggestions: failed to parse JSON, returning empty array. Output:", output);
    return [];
  }
}

export async function createEmbedding(text: string): Promise<number[]> {
  const model = process.env.GROQ_MODEL_EMBEDDING ?? "text-embedding-3-small";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required for embeddings");
  }

  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text.slice(0, 4000),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter embedding error: ${response.status} ${error}`);
  }

  const json = await response.json() as { data: { embedding: number[] }[] };
  const embedding = json.data[0]?.embedding;

  if (!Array.isArray(embedding)) {
    throw new Error("Embedding response missing vector");
  }

  return embedding.map((value) => Number(value));
}
