import { Job, Worker } from "bullmq";
import { ProcessingStatus } from "@prisma/client";

import { runAnalysis } from "@/lib/groq/operations"; // Assuming this is where your LLM logic lives
import { JOB_NAMES, QUEUE_NAMES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getBullConnectionOptions } from "@/lib/redis/client";
import type { AnalysisJob } from "@/types/domain";

export const analysisWorker = new Worker<AnalysisJob, void, typeof JOB_NAMES.analysis>(
  QUEUE_NAMES.analysis,
  async (job: Job<AnalysisJob, void, typeof JOB_NAMES.analysis>) => {
    // 1. Guard clause for job type
    if (job.name !== JOB_NAMES.analysis) return;

    const { analysisId } = job.data;

    // 2. Fetch analysis with its relations
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        resume: true,
        jobDescription: true,
      },
    });

    if (!analysis || !analysis.resume || !analysis.jobDescription) {
      console.error(`[AnalysisWorker] Missing data for analysis ${analysisId}`);
      return;
    }

    // 3. Set status to PROCESSING
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: ProcessingStatus.PROCESSING },
    });

    try {
      // 4. Run the AI Analysis
      // We pass the parsed resume JSON and the job content to the LLM
      const result = await runAnalysis({
        resumeData: analysis.resume.parsedJson,
        jobContent: analysis.jobDescription.content,
      });

      // 5. Update database with results
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          score: result.score,
          missingKeywords: result.missingKeywords,
          suggestions: result.suggestions,
          status: ProcessingStatus.COMPLETED,
        },
      });

      console.log(`[AnalysisWorker] Completed analysis ${analysisId}`);
    } catch (error) {
      console.error(`[AnalysisWorker] Failed analysis ${analysisId}:`, error);

      // 6. Update status to FAILED on error
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: ProcessingStatus.FAILED },
      });

      // Throw so BullMQ can handle retries if configured
      throw error;
    }
  },
  {
    connection: getBullConnectionOptions(),
    // Concurrency limits how many analyses run at once on this worker
    concurrency: 5, 
  }
);