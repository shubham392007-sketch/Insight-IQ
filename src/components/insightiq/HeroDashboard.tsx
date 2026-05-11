import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Sparkles, TrendingUp, Users, Activity, Brain } from "lucide-react";

const revenue = Array.from({ length: 24 }, (_, i) => ({
  m: i,
  v: 40 + Math.sin(i / 3) * 14 + i * 2.4 + (i > 18 ? 6 : 0),
}));
const cohort = [38, 52, 47, 61, 58, 72, 68, 84];
const regions = [
  { name: "NA", v: 86 }, { name: "EU", v: 72 }, { name: "APAC", v: 64 },
  { name: "LATAM", v: 41 }, { name: "MEA", v: 33 },
];

function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function HeroDashboard() {
  return (
    <div className="relative mx-auto mt-20 max-w-6xl">
      <div className="pointer-events-none absolute -inset-x-8 -top-8 -bottom-12 -z-10 rounded-[36px] bg-gradient-to-b from-[oklch(0.52_0.22_274/0.06)] via-transparent to-transparent blur-2xl" />
      <div className="grid grid-cols-12 gap-4">
        {/* Revenue */}
        <Card className="col-span-12 md:col-span-7 lg:col-span-7">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Revenue Growth
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">$284,920</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <ArrowUpRight className="h-3 w-3" /> 24.3%
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              {["1D","7D","1M","1Y"].map((t,i)=>(
                <span key={t} className={`rounded-md px-2 py-1 text-[11px] ${i===2?"bg-foreground text-background":"text-muted-foreground"}`}>{t}</span>
              ))}
            </div>
          </div>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.52 0.22 274)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.52 0.22 274)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="oklch(0.52 0.22 274)" strokeWidth={2} fill="url(#rev)" isAnimationActive />
                <XAxis hide dataKey="m" />
                <YAxis hide />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Insight */}
        <Card className="col-span-12 md:col-span-5 lg:col-span-5" delay={0.1}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="h-3.5 w-3.5 text-[var(--primary)]" /> AI Insights
            <span className="ml-auto rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">98% confidence</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            Q4 revenue accelerated <span className="font-semibold">+24.3%</span> driven primarily by
            <span className="rounded bg-[var(--primary)]/10 px-1 text-[var(--primary)]"> enterprise tier </span>
            upgrades. Churn down 12% in <span className="font-medium">NA cohort</span>.
          </p>
          <div className="mt-4 space-y-2">
            {[
              { l: "Correlation: ARR ↔ NPS", v: "+0.82" },
              { l: "Anomaly: APAC signups", v: "Spike 3.2σ" },
              { l: "Forecast: Q1 revenue", v: "$312k ± 4%" },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">{r.l}</span>
                <span className="font-medium text-foreground">{r.v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* KPI tiles */}
        <Card className="col-span-6 md:col-span-3" delay={0.15}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />Active Users</div>
          <div className="mt-3 text-2xl font-semibold tracking-tight">48,219</div>
          <div className="text-xs text-emerald-600">+8.4% wow</div>
          <div className="mt-3 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <Line type="monotone" dataKey="v" stroke="oklch(0.52 0.22 274)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-6 md:col-span-3" delay={0.2}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Activity className="h-3.5 w-3.5" />Retention</div>
          <div className="mt-3 text-2xl font-semibold tracking-tight">92.4%</div>
          <div className="text-xs text-muted-foreground">30-day cohort</div>
          <div className="mt-3 flex h-10 items-end gap-1">
            {cohort.map((v, i) => (
              <div key={i} className="flex-1 rounded-sm bg-[var(--primary)]/80" style={{ height: `${v}%`, opacity: 0.4 + i / 12 }} />
            ))}
          </div>
        </Card>

        {/* CSV preview */}
        <Card className="col-span-12 md:col-span-6" delay={0.25}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Schema auto-detected
            </div>
            <span className="text-[10px] text-muted-foreground">sales_q4.csv · 12,840 rows</span>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-border/70 text-[11px]">
            <div className="grid grid-cols-5 gap-px bg-border/70">
              {["order_id","date","region","amount","tier"].map((h, i) => (
                <div key={h} className="bg-secondary/70 px-2.5 py-1.5 text-left text-muted-foreground">
                  <div>{h}</div>
                  <div className="text-[9px] text-[var(--primary)]">{["id","datetime","category","number","category"][i]}</div>
                </div>
              ))}
              {[
                ["A-2841","2025-10-04","NA","$1,240","Pro"],
                ["A-2842","2025-10-04","EU","$2,180","Enterprise"],
                ["A-2843","2025-10-05","APAC","$640","Free"],
                ["A-2844","2025-10-05","NA","$3,920","Enterprise"],
              ].flatMap((row, ri) =>
                row.map((c, ci) => (
                  <div key={`${ri}-${ci}`} className="bg-card px-2.5 py-1.5 text-foreground/80">{c}</div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Regions */}
        <Card className="col-span-12 md:col-span-6" delay={0.3}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">Regional Performance</div>
          <div className="mt-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regions} layout="vertical" margin={{ left: 0, right: 0 }}>
                <Bar dataKey="v" radius={[0, 6, 6, 0]} fill="oklch(0.52 0.22 274)" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={48} style={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}