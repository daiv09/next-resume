export type Role = "USER" | "RECRUITER";
export type ProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type CreditType = "DEBIT" | "CREDIT";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ParsedResume {
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
}

export interface ExtractedKeywords {
  keywords: string[];
}

export interface AnalysisResult {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
}

export interface ResumeParseJob {
  resumeId: string;
}

export interface AnalysisJob {
  analysisId: string;
}
