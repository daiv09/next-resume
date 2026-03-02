"use client";

import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowRight, FileText, Sparkles, BarChart, Clock, ChevronDown, Target, Zap } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

/**
 * Variants with explicit typing to resolve:
 * "Type 'string' is not assignable to type 'Easing | Easing[] | undefined'"
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

export default function Home() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const titleWords = "PRECISION MATCHING".split(" ");

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* High-Contrast Grain Overlay */}
      <div className="fixed inset-0 z-[99] pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/10 bg-black/90 backdrop-blur-md px-6 lg:px-12 py-5 flex justify-between items-center">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="p-1 bg-white rounded-sm group-hover:rotate-90 transition-transform duration-500">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">AptResume</span>
        </motion.div>
        
        <div className="flex gap-4">
          <Link
            href="/dashboard/analyze"
            className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 hover:bg-white hover:text-black transition-all duration-500"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard/recruiter"
            className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-300 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.main 
        ref={targetRef}
        style={{ opacity, scale }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6"
      >
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 border border-white/10 rounded-full mb-10"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              System.Status: Optimized
            </span>
          </motion.div>

          <h1 className="text-7xl md:text-[12rem] font-black tracking-tighter mb-10 leading-[0.8] uppercase overflow-hidden">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className={`inline-block ${i === 1 ? 'text-transparent' : ''}`}
                style={i === 1 ? { WebkitTextStroke: "2px white" } : {}}
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg md:text-xl text-zinc-500 max-w-xl mx-auto mb-14 font-light leading-relaxed tracking-tight"
          >
            A brutalist interface for career optimization. Bypass corporate filters with mathematical precision.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <Link
              href="/dashboard/analyze"
              className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Analyze Resume 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
            </Link>
            <Link
              href="/dashboard/history"
              className="group text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Clock className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
              View Archives
            </Link>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-12 border border-white/20 p-2 rounded-full"
        >
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </motion.div>
      </motion.main>

      {/* Bento Grid Features */}
      <section className="px-6 py-40 max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Large Card */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-8 p-12 border border-white/10 bg-zinc-950 flex flex-col justify-between min-h-[450px] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-700">
               <Target className="w-64 h-64" />
            </div>
            <div className="w-14 h-14 border border-white/20 flex items-center justify-center mb-10 group-hover:bg-white group-hover:text-black transition-all duration-500">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-5xl font-black tracking-tighter uppercase mb-6 italic">Infiltration</h3>
              <p className="text-zinc-500 max-w-sm text-lg leading-snug">Reverse-engineer corporate hiring filters with 99.9% accuracy. Know the score before you hit apply.</p>
            </div>
          </motion.div>

          {/* Small Card */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 p-12 border border-white/10 bg-zinc-950 flex flex-col justify-between hover:bg-zinc-900 transition-colors duration-500"
          >
            <Zap className="w-8 h-8 text-white mb-10" />
            <div>
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-3">Groq-Speed</h3>
              <p className="text-zinc-600 text-sm leading-relaxed uppercase tracking-tighter font-bold">Latency under 100ms. Immediate feedback loops for high-frequency job hunting.</p>
            </div>
          </motion.div>

          {/* High-Contrast Card */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 p-12 bg-white text-black flex flex-col justify-between min-h-[350px] group"
          >
            <BarChart className="w-8 h-8 mb-10 group-hover:scale-125 transition-transform" />
            <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-3">Quantified</h3>
              <p className="font-bold text-sm uppercase tracking-tighter">Mathematical scoring of your career narrative based on industry telemetry.</p>
            </div>
          </motion.div>

          {/* Semantic Card */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-8 p-12 border border-white/10 bg-zinc-950 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start text-white">
              <FileText className="w-8 h-8 mb-10" />
              <div className="text-[10px] font-mono text-zinc-700">VERSION_4.0.2</div>
            </div>
            <div>
              <h3 className="text-5xl font-black tracking-tighter uppercase mb-6 italic">Deep Context</h3>
              <p className="text-zinc-500 max-w-md text-lg leading-snug">Beyond keywords. We parse the hierarchy, impact, and delta of your professional growth.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-[10px] font-black uppercase tracking-[1em] text-zinc-800"
        >
          AptResume // Terminal Mode // 2026
        </motion.p>
      </footer>
    </div>
  );
}