// Load .env in local dev; silently skip in production (env vars injected by platform)
import { existsSync } from "fs";
import { resolve } from "path";
if (existsSync(resolve(process.cwd(), ".env"))) {
  const { config } = await import("dotenv");
  config();
}

import { analysisWorker } from "@/workers/analysis.worker";

analysisWorker.on("ready", () => {
  console.log("analysis worker ready");
});

analysisWorker.on("failed", (job, error) => {
  console.error("analysis worker failed", job?.id, error);
});
