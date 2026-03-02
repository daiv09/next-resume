import { Queue } from "bullmq";

import { JOB_NAMES, QUEUE_NAMES } from "@/lib/constants";
import { getBullConnectionOptions } from "@/lib/redis/client";
import type { AnalysisJob, ResumeParseJob } from "@/types/domain";

export const resumeParseQueue = new Queue<ResumeParseJob, void, typeof JOB_NAMES.resumeParse>(
  QUEUE_NAMES.resumeParse,
  {
    connection: getBullConnectionOptions(),
  },
);

export const analysisQueue = new Queue<AnalysisJob, void, typeof JOB_NAMES.analysis>(QUEUE_NAMES.analysis, {
  connection: getBullConnectionOptions(),
});

export async function enqueueResumeParse(payload: ResumeParseJob): Promise<void> {
  await resumeParseQueue.add(JOB_NAMES.resumeParse, payload, {
    attempts: 2,
    removeOnComplete: 100,
    removeOnFail: 100,
  });
}

export async function enqueueAnalysis(payload: AnalysisJob): Promise<void> {
  await analysisQueue.add(JOB_NAMES.analysis, payload, {
    attempts: 2,
    removeOnComplete: 100,
    removeOnFail: 100,
  });
}
