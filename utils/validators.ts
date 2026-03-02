import { z } from "zod";

const maxUploadBytes = 5 * 1024 * 1024;

export const authSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export const jobAnalyzeSchema = z.object({
  content: z.string().min(50, "Job description is too short").max(20_000),
});

export const analysisRunSchema = z.object({
  resumeId: z.string().min(1),
  jobDescriptionId: z.string().min(1),
});

export const recruiterSearchSchema = z.object({
  skill: z.string().optional().default(""),
  minScore: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .pipe(z.number().min(0).max(100).optional()),
});

export function validateResumeFile(file: File): void {
  const validMime = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!validMime.includes(file.type)) {
    throw new Error("Only PDF or DOCX files are allowed");
  }

  if (file.size > maxUploadBytes) {
    throw new Error("File must be <= 5MB");
  }
}
