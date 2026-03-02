import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Analysis History | AptResume",
  description: "View your past resume analysis results.",
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    COMPLETED: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      label: "Completed",
      cls: "bg-white/10 text-white border-white/20",
    },
    PENDING: {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Pending",
      cls: "bg-zinc-800 text-zinc-300 border-zinc-700",
    },
    PROCESSING: {
      icon: <Clock className="w-3.5 h-3.5 animate-spin" />,
      label: "Processing",
      cls: "bg-zinc-800 text-zinc-300 border-zinc-700",
    },
    FAILED: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: "Failed",
      cls: "bg-zinc-900 text-zinc-500 border-zinc-700/50",
    },
  };

  const s = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

function ScoreDial({ score }: { score: number | null }) {
  if (score === null) return <span className="text-zinc-600 text-2xl font-bold">—</span>;

  const color =
    score >= 75 ? "text-white" : score >= 50 ? "text-zinc-300" : "text-zinc-500";

  return (
    <div className="flex flex-col items-center">
      <span className={`text-3xl font-bold tabular-nums ${color}`}>{score}</span>
      <span className="text-zinc-600 text-xs mt-0.5">/ 100</span>
    </div>
  );
}

export default async function HistoryPage() {
  const analyses = await prisma.analysis.findMany({
    include: {
      resume: {
        select: { fileName: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="relative min-h-screen bg-[#080808] text-zinc-50 font-sans">
      {/* Subtle background noise */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[200px] opacity-[0.02]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[200px] opacity-[0.02]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Analysis History</h1>
            <p className="text-zinc-500 mt-1 text-sm">{analyses.length} past {analyses.length === 1 ? "analysis" : "analyses"}</p>
          </div>

          <Link
            href="/dashboard/analyze"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            New Analysis
          </Link>
        </div>

        {/* Empty State */}
        {analyses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-zinc-800 rounded-2xl">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
              <FileText className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="font-semibold text-zinc-300">No analyses yet</p>
            <p className="text-zinc-600 text-sm mt-1 mb-6">Upload your first resume to get started</p>
            <Link
              href="/dashboard/analyze"
              className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-all"
            >
              Analyze My Resume
            </Link>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid gap-4">
          {analyses.map((analysis) => {
            const missing = toStringArray(analysis.missingKeywords);
            const suggestions = toStringArray(analysis.suggestions);
            const isCompleted = analysis.status === "COMPLETED";
            const isFailed = analysis.status === "FAILED";

            return (
              <div
                key={analysis.id}
                className={`
                  rounded-2xl border p-6 transition-colors
                  ${isFailed
                    ? "border-zinc-800/50 bg-zinc-950/50 opacity-60"
                    : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70"}
                `}
              >
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 flex-shrink-0">
                      <FileText className="w-4 h-4 text-zinc-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-100 truncate">{analysis.resume.fileName}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-zinc-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        {analysis.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={analysis.status} />
                  </div>
                </div>

                {/* Score + Data Row */}
                {isCompleted && (
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Score */}
                    <div className="flex flex-col rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">ATS Score</span>
                      </div>
                      <ScoreDial score={analysis.score} />
                    </div>

                    {/* Missing Keywords */}
                    <div className="flex flex-col rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4 md:col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
                          Missing Keywords{missing.length > 0 ? ` (${missing.length})` : ""}
                        </span>
                      </div>
                      {missing.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {missing.slice(0, 15).map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs rounded-md bg-zinc-700/60 border border-zinc-600/50 text-zinc-300"
                            >
                              {kw}
                            </span>
                          ))}
                          {missing.length > 15 && (
                            <span className="px-2 py-0.5 text-xs rounded-md bg-zinc-800 border border-zinc-700 text-zinc-500">
                              +{missing.length - 15} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600">No missing keywords found.</p>
                      )}
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="flex flex-col rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4 md:col-span-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">AI Suggestions</span>
                        </div>
                        <ul className="space-y-2">
                          {suggestions.slice(0, 5).map((s, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-zinc-300 leading-relaxed">
                              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-zinc-700 text-zinc-400 text-[10px] font-semibold mt-0.5">
                                {i + 1}
                              </span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending / Processing state */}
                {(analysis.status === "PENDING" || analysis.status === "PROCESSING") && (
                  <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
                    <Clock className="w-4 h-4 text-zinc-500 animate-pulse" />
                    <p className="text-zinc-500 text-sm">Analysis is being processed. Refresh in a moment.</p>
                  </div>
                )}

                {/* Failed state */}
                {isFailed && (
                  <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-zinc-800/20 border border-zinc-800/50">
                    <XCircle className="w-4 h-4 text-zinc-600" />
                    <p className="text-zinc-600 text-sm">This analysis failed to process. Please submit a new one.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
