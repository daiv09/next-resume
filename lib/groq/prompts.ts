export const resumeParsePrompt = `You are a strict JSON extractor.
Given resume text, return JSON only in this exact shape:
{
  "skills": string[],
  "experience": string[],
  "education": string[],
  "projects": string[]
}
No markdown, no extra keys.`;

export const jdKeywordPrompt = `Extract ATS-relevant keywords from the given job description.
Return JSON only in this exact shape:
{
  "keywords": string[]
}
No markdown, no extra keys.`;

export function buildSuggestionPrompt(missingKeywords: string[], resumeText: string): string {
  return `You are an ATS resume coach. Missing keywords: ${missingKeywords.join(", ")}.
Based on this resume text, return JSON only in this exact shape:
{
  "suggestions": string[]
}
Each suggestion should be concrete and actionable. Resume text:\n${resumeText.slice(0, 8000)}`;
}
