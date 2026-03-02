import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { AnalysisForm } from "@/components/ui/analysis-form";

export const metadata: Metadata = {
  title: "Analyze Resume | AptResume",
  description: "Upload your resume and a job description to get AI-powered insights.",
};

export default function AnalyzePage() {
  return (
    <main className="relative min-h-screen bg-[#080808] text-zinc-50 font-sans">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[200px] opacity-[0.025]" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[200px] opacity-[0.025]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.05] px-6 lg:px-12 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-lg font-bold tracking-tight text-white">AptResume</span>
        </Link>
        <Link
          href="/dashboard/history"
          className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          History
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        <div className="w-full max-w-2xl flex flex-col items-center">
          
          {/* Back button */}
          <div className="self-start mb-8">
            <Link
              href="/"
              className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 text-xs font-medium border rounded-full border-white/10 bg-white/5 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              Powered by Groq AI
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
              Analyze Your Resume
            </h1>
            <p className="text-zinc-500 max-w-lg text-sm leading-relaxed">
              Upload your resume and paste the job description. Our AI scores your ATS compatibility and shows you exactly what&rsquo;s missing.
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full rounded-2xl border border-white/[0.07] bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl">
            <AnalysisForm />
          </div>
        </div>
      </div>
    </main>
  );
}
