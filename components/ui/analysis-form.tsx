"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Loader2, ArrowRight } from "lucide-react";
import { FileUpload } from "./file-upload";

export function AnalysisForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobDescription.trim()) {
      setError("Please provide both a resume and a job description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload Resume
      setStatusText("Uploading resume...");
      const formData = new FormData();
      formData.append("file", file);

      const resumeRes = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!resumeRes.ok) throw new Error("Failed to upload resume");
      const resumeData = await resumeRes.json();
      const resumeId = resumeData.resumeId;

      // Step 2: Submit Job Description
      setStatusText("Analyzing job description...");
      const jdRes = await fetch("/api/job/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: jobDescription }),
      });

      if (!jdRes.ok) throw new Error("Failed to analyze job description");
      const jdData = await jdRes.json();
      const jobDescriptionId = jdData.jobDescriptionId;

      // Step 3: Trigger Analysis
      setStatusText("Starting AI evaluation...");
      const analysisRes = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescriptionId }),
      });

      if (!analysisRes.ok) throw new Error("Failed to start analysis");

      setStatusText("Redirecting to results...");
      setTimeout(() => {
        router.push("/dashboard/history");
        router.refresh();
      }, 500);

    } catch (err) {
      console.error("Analysis workflow error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
      setLoading(false);
      setStatusText("");
    }
  };

  const isReady = !!file && !!jobDescription.trim() && !loading;

  return (
    <form onSubmit={handleAnalyze} className="w-full space-y-7">
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-bold">
            1
          </span>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Upload Resume</h2>
        </div>
        <FileUpload onFileSelect={setFile} />
      </motion.div>

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* JD Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-bold">
            2
          </span>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Job Description</h2>
        </div>

        <div className="relative">
          <FileText className="absolute top-3.5 left-3.5 w-4 h-4 text-zinc-600 pointer-events-none" />
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="w-full h-44 pl-10 pr-4 py-3.5 bg-zinc-800/40 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all resize-none text-sm"
            disabled={loading}
          />
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 text-sm text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
      >
        <button
          type="submit"
          disabled={!isReady}
          className={`
            w-full flex items-center justify-center gap-2.5 px-6 py-3.5 
            rounded-xl font-semibold text-sm transition-all
            ${isReady
              ? "glow-button hover:scale-[1.01] active:scale-[0.99]"
              : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-800"}
          `}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusText || "Processing..."}</span>
            </>
          ) : (
            <>
              <span>Run AI Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.div>
    </form>
  );
}
