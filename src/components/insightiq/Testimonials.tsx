import { motion } from "framer-motion";
import { Database, BarChart3, Brain, Clock, FileDown, Layers } from "lucide-react";

const items = [
  {
    icon: <Database className="h-4 w-4" />,
    title: "Drop a CSV, get a schema",
    body: "Type inference for numeric, date, category, boolean, identifier and text fields runs the moment your file is parsed.",
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    title: "30–40 visualizations, on demand",
    body: "Charts are chosen from your column shapes — no duplicates, no filler. Histograms, treemaps, funnels, heatmaps and scatter pairs.",
  },
  {
    icon: <Brain className="h-4 w-4" />,
    title: "Statistics built in",
    body: "Pearson correlations, five-number summaries, completeness scores and weekday seasonality computed deterministically from your rows.",
  },
  {
    icon: <Layers className="h-4 w-4" />,
    title: "Five lenses on your data",
    body: "Switch between Overview, Numeric, Categorical, Time and Relationships views — each surface is built for its question.",
  },
  {
    icon: <Clock className="h-4 w-4" />,
    title: "Zero setup, zero waiting",
    body: "No accounts, no SQL, no upload pipeline. Parsing and rendering happen in your browser the second a file lands.",
  },
  {
    icon: <FileDown className="h-4 w-4" />,
    title: "Export the full report",
    body: "One click renders every chart and the AI insight panel into a multi-page, high-resolution PDF you can share.",
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-border bg-[var(--surface-soft)] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Everything InsightIQ does — without the marketing fluff.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            A precise, mathematically grounded analytics surface, built for people who care what's actually in their data.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex items-center gap-2 text-xs text-[var(--primary)]">
                {t.icon}
                <span className="uppercase tracking-wider">Capability</span>
              </div>
              <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
