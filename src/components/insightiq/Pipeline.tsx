import { motion } from "framer-motion";
import { FileUp, Search, BarChart3, Lightbulb, LayoutDashboard } from "lucide-react";

const steps = [
  { icon: FileUp, title: "CSV Upload", note: "12,840 rows · 14 cols" },
  { icon: Search, title: "Schema Detection", note: "5 types inferred · 98%" },
  { icon: BarChart3, title: "Statistical Analysis", note: "μ, σ, IQR · 6 series" },
  { icon: Lightbulb, title: "Insight Generation", note: "11 insights surfaced" },
  { icon: LayoutDashboard, title: "Dashboard Created", note: "9 widgets · ready" },
];

const snippets = [
  `df.describe()`,
  `SELECT region, SUM(amount)\n  FROM sales\n GROUP BY 1`,
  `corr = df.corr()`,
  `{ type: "area", x: "date", y: "rev" }`,
];

export function Pipeline() {
  return (
    <section id="product" className="relative overflow-hidden border-y border-border bg-[var(--surface-soft)] py-28">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            AI Engine
          </div>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Data intelligence infrastructure that scales.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A purpose-built pipeline that turns raw rows into reliable insight — auditable end-to-end.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] text-muted-foreground">Step {i + 1}</span>
              </div>
              <div className="mt-3 text-sm font-semibold tracking-tight">{s.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.note}</div>
              <div className="mt-4 flex items-center gap-1">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${70 + i * 5}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-[var(--gradient-primary)]"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{70 + i * 5}%</span>
              </div>
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute right-[-22px] top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-border to-transparent lg:block" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {snippets.map((s, i) => (
            <motion.pre
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="overflow-hidden rounded-xl border border-border bg-card p-4 text-[11px] leading-relaxed text-muted-foreground shadow-soft"
            >
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--primary)]">
                {["pandas","sql","stats","chart-config"][i]}
              </span>
              <code className="text-foreground/80">{s}</code>
            </motion.pre>
          ))}
        </div>
      </div>
    </section>
  );
}