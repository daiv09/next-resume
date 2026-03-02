import { Job, Worker } from "bullmq";

import { atsScorer } from "@/lib/atsScorer";
import { JOB_NAMES, QUEUE_NAMES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getBullConnectionOptions } from "@/lib/redis/client";
import type { AnalysisJob, ExtractedKeywords, ParsedResume } from "@/types/domain";

function readResumeText(fileData: string): string {
  try {
    const parsed = JSON.parse(fileData) as { extractedText?: string };
    return parsed.extractedText ?? "";
  } catch {
    return "";
  }
}

function asParsedResume(value: unknown): ParsedResume {
  const json = (value ?? {}) as Partial<ParsedResume>;
  return {
    skills: Array.isArray(json.skills) ? json.skills : [],
    experience: Array.isArray(json.experience) ? json.experience : [],
    education: Array.isArray(json.education) ? json.education : [],
    projects: Array.isArray(json.projects) ? json.projects : [],
  };
}

function asKeywords(value: unknown): ExtractedKeywords {
  const json = (value ?? {}) as Partial<ExtractedKeywords>;
  return {
    keywords: Array.isArray(json.keywords) ? json.keywords : [],
  };
}

export const analysisWorker = new Worker<AnalysisJob, void, typeof JOB_NAMES.analysis>(
  QUEUE_NAMES.analysis,
  async (job: Job<AnalysisJob, void, typeof JOB_NAMES.analysis>) => {
    if (job.name !== JOB_NAMES.analysis) return;

    const analysis = await prisma.analysis.findUnique({
      where: { id: job.data.analysisId },
      include: {
        resume: true,
        jobDescription: true,
      },
    });

    if (!analysis) return;

    await prisma.analysis.update({
      where: { id: analysis.id },
      data: { status: "PROCESSING" },
    });

    try {
      const result = await atsScorer({
        resumeParsed: asParsedResume(analysis.resume.parsedJson),
        jdKeywords: asKeywords(analysis.jobDescription.extractedKeywords),
        resumeText: readResumeText(analysis.resume.fileData),
        jdText: analysis.jobDescription.content,
      });

      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          score: result.score,
          missingKeywords: result.missingKeywords,
          suggestions: result.suggestions,
          status: "COMPLETED",
        },
      });
    } catch (error) {
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: "FAILED" },
      });

      throw error;
    }
  },
  {
    connection: getBullConnectionOptions(),
  },
);
