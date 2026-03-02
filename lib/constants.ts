export const AUTH_COOKIE_NAME = "ats_access";

export const QUEUE_NAMES = {
  resumeParse: "resume-parse-queue",
  analysis: "analysis-queue",
} as const;

export const JOB_NAMES = {
  resumeParse: "resume:parse",
  analysis: "analysis:score",
} as const;

export const DEFAULT_CREDITS = 5;
