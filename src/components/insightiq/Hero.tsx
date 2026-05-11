import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Play, Sparkles, FileSpreadsheet } from "lucide-react";
import { HeroDashboard } from "./HeroDashboard";

const rotators = ["Analyze", "Visualize", "Discover", "Forecast", "Understand"];
const placeholders = [
  "Upload sales.csv",
  "Analyze customers.csv",
  "Drop finance_data.csv",
  "Upload marketing_metrics.csv",
];

export function Hero() {
  const [idx, setIdx] = useState(0);
  const [phIdx, setPhIdx] = useState(0);

  useEffect(() => {
    const a = setInterval(() => setIdx((i) => (i + 1) % rotators.length), 2200);
    const b = setInterval(() => setPhIdx((i) => (i + 1) % placeholders.length), 2800);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);

  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 mask-fade-b" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px]"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-[var(--primary)]" />
            <span>New — AI Insight Engine v2</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-foreground">Read more →</span>
          </div>

          <h1 className="mt-8 text-balance text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            Turn any CSV into an{" "}
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotators[idx]}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="gradient-text inline-block"
                >
                  {rotators[idx]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            dashboard.
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            InsightIQ automatically detects structure, analyzes patterns, recommends
            visualizations, and builds interactive dashboards from raw CSV files.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="group mt-10 w-full max-w-2xl"
          >
            <div className="relative rounded-2xl border border-border bg-card p-2 shadow-elegant transition-all duration-300 hover:border-[var(--primary)]/40 hover:shadow-[0_0_0_8px_oklch(0.52_0.22_274/0.08)]">
              <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="relative flex-1 overflow-hidden text-left">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholders[phIdx]}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="block text-sm text-muted-foreground"
                    >
                      {placeholders[phIdx]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <button className="hidden items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground sm:inline-flex">
                  <Upload className="h-3.5 w-3.5" /> Browse
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90">
                  Analyze Now
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <button className="inline-flex items-center gap-1.5 hover:text-foreground">
                <Play className="h-3 w-3" /> Watch demo
              </button>
              <span>·</span>
              <span>Drag & drop, or paste a URL</span>
              <span>·</span>
              <span>No signup required</span>
            </div>
          </motion.div>
        </motion.div>

        <HeroDashboard />
      </div>
    </section>
  );
}