import { analysisWorker } from "@/workers/analysis.worker";

analysisWorker.on("ready", () => {
  console.log("analysis worker ready");
});

analysisWorker.on("failed", (job, error) => {
  console.error("analysis worker failed", job?.id, error);
});
