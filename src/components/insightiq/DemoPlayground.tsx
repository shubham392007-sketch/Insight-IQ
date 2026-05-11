import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts";
import { FileSpreadsheet, Sparkles, Filter, Plus, ArrowRight } from "lucide-react";

const data = Array.from({ length: 20 }, (_, i) => ({ v: 30 + Math.sin(i / 2) * 18 + i * 2 }));

export function DemoPlayground() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
            Live Playground
          </div>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Build dashboards in real time.
          </h2>
          <p className="mt-4 text-muted-foreground">Drag widgets, switch datasets, ask questions — and watch your dashboard respond instantly.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-14 overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
        >
          {/* window chrome */}
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
            </div>
            <div className="rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground">app.insightiq.ai / dashboards / q4-sales</div>
            <div className="text-[11px] text-muted-foreground">Auto-saved</div>
          </div>

          <div className="grid grid-cols-12 gap-0">
            {/* left rail */}
            <aside className="col-span-12 border-b border-border bg-secondary/30 p-4 text-xs md:col-span-3 md:border-b-0 md:border-r">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Datasets</div>
              <ul className="mt-3 space-y-1.5">
                {[["sales_q4.csv", true], ["customers.csv"], ["marketing.csv"], ["finance.csv"]].map(([n, active]: any) => (
                  <li key={n} className={`flex items-center gap-2 rounded-md px-2.5 py-2 ${active ? "bg-background shadow-soft text-foreground" : "text-muted-foreground hover:bg-background/60"}`}>
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-2 text-muted-foreground hover:text-foreground">
                <Plus className="h-3 w-3" /> Add dataset
              </button>
            </aside>

            {/* canvas */}
            <div className="col-span-12 p-5 md:col-span-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Q4 Sales · Dashboard</div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-muted-foreground">
                    <Filter className="h-3 w-3" /> Region: NA
                  </span>
                  <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">Last 90d</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-6 gap-3">
                <div className="col-span-6 rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Revenue</div>
                  <div className="text-xl font-semibold tracking-tight">$284,920</div>
                  <div className="mt-2 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.52 0.22 274)" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="oklch(0.52 0.22 274)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area dataKey="v" stroke="oklch(0.52 0.22 274)" strokeWidth={2} fill="url(#dg)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="col-span-3 rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">By Region</div>
                  <div className="mt-2 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.slice(0, 6)}>
                        <Bar dataKey="v" fill="oklch(0.52 0.22 274)" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="col-span-3 rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Trend</div>
                  <div className="mt-2 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <Line dataKey="v" stroke="oklch(0.52 0.22 274)" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* assistant */}
            <aside className="col-span-12 border-t border-border bg-secondary/20 p-4 md:col-span-3 md:border-l md:border-t-0">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" /> AI Assistant
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="rounded-lg bg-background p-3 shadow-soft">
                  <div className="text-muted-foreground">Insight</div>
                  <div className="mt-1 text-foreground">NA enterprise revenue grew 3× faster than baseline last 30d.</div>
                </div>
                <div className="rounded-lg bg-background p-3 shadow-soft">
                  <div className="text-muted-foreground">Suggested chart</div>
                  <div className="mt-1 text-foreground">Funnel: leads → trials → paid</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                <span className="flex-1">Ask anything…</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </section>
  );
}