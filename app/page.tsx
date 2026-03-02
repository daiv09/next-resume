"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, FileText, Sparkles, Briefcase, BarChart, Clock, ChevronDown, Target, Zap } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function Home() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Grainy Texture Overlay */}
      <div className="fixed inset-0 z-[99] pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/10 bg-black/80 backdrop-blur-md px-6 lg:px-12 py-4 flex justify-between items-center">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="p-1 bg-white rounded">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">AptResume</span>
        </motion.div>
        
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
          <Link href="#" className="hover:text-white transition-colors">Process</Link>
          <Link href="#" className="hover:text-white transition-colors">Features</Link>
          <Link href="#" className="hover:text-white transition-colors">Enterprise</Link>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard/analyze"
            className="hidden sm:block px-5 py-2 text-xs font-bold uppercase tracking-tighter border border-white/20 hover:bg-white hover:text-black transition-all duration-300"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard/recruiter"
            className="px-5 py-2 text-xs font-bold uppercase tracking-tighter bg-white text-black hover:invert transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.main 
        style={{ opacity, scale }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-block px-4 py-1 border border-white/10 rounded-full mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <span className="w-1 h-1 bg-white animate-pulse rounded-full" />
              Engineered for the 1%
            </span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
            Precision <br /> 
            <span className="text-transparent" style={{ WebkitTextStroke: "1px white" }}>Matching</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            A high-performance interface to audit your professional identity. 
            Leverage ultra-low latency LLMs to bypass algorithmic gatekeepers.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/dashboard/analyze"
              className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-tighter flex items-center gap-3 hover:pr-12 transition-all duration-300"
            >
              Start Analysis 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard/history"
              className="text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Clock className="w-4 h-4" />
              Archives
            </Link>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10"
        >
          <ChevronDown className="w-6 h-6 text-zinc-700" />
        </motion.div>
      </motion.main>

      {/* Bento Grid Features */}
      <section className="px-6 py-32 max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          {/* Large Card */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-8 p-10 border border-white/10 bg-zinc-900/20 backdrop-blur-sm flex flex-col justify-between min-h-[400px] group hover:border-white/40 transition-colors"
          >
            <div className="w-12 h-12 border border-white/20 flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-black transition-all">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-4xl font-bold tracking-tighter uppercase mb-4">ATS Infiltration</h3>
              <p className="text-zinc-500 max-w-md text-lg">Reverse-engineer corporate hiring filters with 99.9% accuracy. We show you exactly what the robots see.</p>
            </div>
          </motion.div>

          {/* Small Card */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 p-10 border border-white/10 bg-zinc-900/20 flex flex-col justify-between hover:border-white/40 transition-colors"
          >
            <Zap className="w-6 h-6 text-white mb-8" />
            <div>
              <h3 className="text-2xl font-bold tracking-tighter uppercase mb-2">Groq-Speed</h3>
              <p className="text-zinc-500 text-sm">Instantaneous analysis. No loaders. No waiting. Just results.</p>
            </div>
          </motion.div>

          {/* Row 2 */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 p-10 border border-white/10 bg-white text-black flex flex-col justify-between min-h-[300px]"
          >
            <BarChart className="w-6 h-6 mb-8" />
            <div>
              <h3 className="text-2xl font-bold tracking-tighter uppercase mb-2">Data Driven</h3>
              <p className="font-medium text-sm">Quantitative scoring based on real-world hiring telemetry.</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="md:col-span-8 p-10 border border-white/10 bg-zinc-900/20 flex flex-col justify-between hover:border-white/40 transition-colors"
          >
            <FileText className="w-6 h-6 text-white mb-8" />
            <div>
              <h3 className="text-4xl font-bold tracking-tighter uppercase mb-4">Semantic Parsing</h3>
              <p className="text-zinc-500 max-w-md text-lg">We don't just look for words; we look for context, impact, and hierarchy in your career narrative.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer Branding */}
      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-700">
          Built for the next generation of talent • 2026
        </p>
      </footer>
    </div>
  );
}