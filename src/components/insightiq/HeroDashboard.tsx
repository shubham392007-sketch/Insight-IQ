import { motion } from "framer-motion";
import {
  Sparkles, Database, BarChart3, Brain, Zap, ShieldCheck, Network, Layers,
} from "lucide-react";

type Card = { icon: React.ReactNode; title: string; body: string; tag: string };

const cards: Card[] = [
  {
    icon: <Database className="h-3.5 w-3.5" />, tag: "Schema",
    title: "Automatic schema detection",
    body: "InsightIQ scans every column and infers types — numeric, date, category, boolean, identifier, or free text — before you write a single query.",
  },
  {
    icon: <BarChart3 className="h-3.5 w-3.5" />, tag: "Visualize",
    title: "30–40 charts per dataset",
    body: "Distributions, time series, correlations, treemaps, funnels and heatmaps are matched to your data shape — never duplicated, always relevant.",
  },
  {
    icon: <Brain className="h-3.5 w-3.5" />, tag: "Insights",
    title: "Statistical insights, not guesses",
    body: "Pearson correlations, five-number summaries, completeness scores and weekday seasonality are computed deterministically from your rows.",
  },
  {
    icon: <Zap className="h-3.5 w-3.5" />, tag: "Speed",
    title: "Runs entirely in your browser",
    body: "Parsing, type inference and rendering happen client-side. No upload, no waiting, no server round-trip.",
  },
  {
    icon: <ShieldCheck className="h-3.5 w-3.5" />, tag: "Privacy",
    title: "Your CSV never leaves the page",
    body: "Files are processed locally with the File API. Nothing is stored, transmitted or logged by InsightIQ.",
  },
  {
    icon: <Network className="h-3.5 w-3.5" />, tag: "Relationships",
    title: "Cross-column intelligence",
    body: "A correlation matrix, scatter pairs and stacked categorical breakdowns reveal how your fields actually move together.",
  },
];

function Tile({ c, i, className = "" }: { c: Card; i: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant ${className}`}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-[var(--primary)]">{c.icon}</span> {c.tag}
      </div>
      <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">{c.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
    </motion.div>
  );
}

export function HeroDashboard() {
  return (
    <div className="relative mx-auto mt-20 max-w-6xl">
      <div className="pointer-events-none absolute -inset-x-8 -top-8 -bottom-12 -z-10 rounded-[36px] bg-gradient-to-b from-[oklch(0.52_0.22_274/0.06)] via-transparent to-transparent blur-2xl" />

      <div className="mb-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
        How InsightIQ works under the hood
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => <Tile key={c.title} c={c} i={i} />)}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {[
          { l: "Column types detected", v: "6" },
          { l: "Visualizations per file", v: "30–40" },
          { l: "Client-side parsing", v: "100%" },
          { l: "Charts grouped into", v: "5 lenses" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-2xl font-semibold tracking-tight text-foreground">{s.v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </motion.div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Layers className="h-3.5 w-3.5" />
        Overview · Numeric · Categorical · Time · Relationships
      </div>
    </div>
  );
}
