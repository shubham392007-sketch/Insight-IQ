import { motion } from "framer-motion";

const items = [
  { q: "We replaced three BI tools with InsightIQ. Our team ships analyses in minutes.", n: "Maya Chen", r: "Head of Data, Stratify", m: "−68% time-to-insight" },
  { q: "It saw a churn signal in our CSV that took our analysts a week to find.", n: "Devon Park", r: "VP Analytics, Lumen", m: "+11pt retention" },
  { q: "Genuinely the cleanest dashboarding experience I've used in a decade.", n: "Aarti Singh", r: "Founder, Quanta", m: "0 SQL written" },
];

export function Testimonials() {
  return (
    <section className="border-y border-border bg-[var(--surface-soft)] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">Built for the teams reshaping how data moves.</h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.figure
              key={t.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <blockquote className="text-[15px] leading-relaxed text-foreground">“{t.q}”</blockquote>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--gradient-primary)]" />
                  <div>
                    <div className="text-sm font-medium">{t.n}</div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </div>
                <span className="rounded-full bg-[var(--primary)]/10 px-2 py-1 text-[11px] font-medium text-[var(--primary)]">{t.m}</span>
              </div>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}