import { Job, Worker } from "bullmq";
import type { Prisma } from "@prisma/client";

import { extractResumeJson } from "@/lib/groq/operations";
import { JOB_NAMES, QUEUE_NAMES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getBullConnectionOptions } from "@/lib/redis/client";
import type { ResumeParseJob } from "@/types/domain";

function getExtractedText(fileData: string): string {
  try {
    const parsed = JSON.parse(fileData) as { extractedText?: string };
    return parsed.extractedText ?? "";
  } catch {
    return "";
  }
}

export const resumeParserWorker = new Worker<ResumeParseJob, void, typeof JOB_NAMES.resumeParse>(
  QUEUE_NAMES.resumeParse,
  async (job: Job<ResumeParseJob, void, typeof JOB_NAMES.resumeParse>) => {
    if (job.name !== JOB_NAMES.resumeParse) return;

    const resume = await prisma.resume.findUnique({ where: { id: job.data.resumeId } });
    if (!resume) return;

    await prisma.resume.update({
      where: { id: resume.id },
      data: { parseStatus: "PROCESSING" },
    });

    try {
      const extractedText = getExtractedText(resume.fileData);
      const parsedJson = await extractResumeJson(extractedText);

      await prisma.resume.update({
        where: { id: resume.id },
        data: {
          parsedJson: parsedJson as unknown as Prisma.InputJsonValue,
          parseStatus: "COMPLETED",
        },
      });
    } catch (error) {
      await prisma.resume.update({
        where: { id: resume.id },
        data: {
          parseStatus: "FAILED",
        },
      });

      throw error;
    }
  },
  {
    connection: getBullConnectionOptions(),
  },
);
