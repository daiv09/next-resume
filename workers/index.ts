import { analysisWorker } from "@/workers/analysis.worker";
import { resumeParserWorker } from "@/workers/resumeParser.worker";

analysisWorker.on("ready", () => {
  console.log("analysis worker ready");
});

resumeParserWorker.on("ready", () => {
  console.log("resume parser worker ready");
});

analysisWorker.on("failed", (job, error) => {
  console.error("analysis worker failed", job?.id, error);
});

resumeParserWorker.on("failed", (job, error) => {
  console.error("resume worker failed", job?.id, error);
});
