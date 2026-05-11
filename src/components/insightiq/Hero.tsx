import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { HeroDashboard } from "./HeroDashboard";
import { CsvUploader } from "./CsvUploader";

const rotators = ["Analyze", "Visualize", "Discover", "Forecast", "Understand"];

export function Hero() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setIdx((i) => (i + 1) % rotators.length), 2200);
    return () => clearInterval(a);
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

          <CsvUploader />
        </motion.div>

        <HeroDashboard />
      </div>
    </section>
  );
}