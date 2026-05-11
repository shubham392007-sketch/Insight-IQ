import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts";
import { Brain, Wand2, LineChart as LineIcon, AlertTriangle, MessageSquare, Network, Share2, Sparkles } from "lucide-react";

const mini = (n = 12) => Array.from({ length: n }, (_, i) => ({ v: 30 + Math.sin(i / 1.6) * 20 + i * 2 }));

function Cell({
  span = "col-span-12 md:col-span-6",
  icon: Icon,
  title,
  desc,
  children,
  delay = 0,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant ${span}`}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--primary)]">
        <Icon className="h-3.5 w-3.5" /> <span className="uppercase tracking-wider">{title}</span>
      </div>
      <p className="mt-3 text-lg font-medium leading-snug tracking-tight text-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[var(--primary)]/5 blur-2xl transition-opacity group-hover:bg-[var(--primary)]/10" />
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-[var(--primary)]" /> Built for analysts, loved by teams
          </div>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Everything you need to turn raw data into decisions.
          </h2>
          <p className="mt-4 text-muted-foreground">
            From schema detection to forecasting — InsightIQ handles the entire analytics pipeline so your team can focus on insights, not infrastructure.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-4">
          <Cell span="col-span-12 md:col-span-7" icon={Brain} title="Automatic CSV Understanding" desc="Detects column types, relationships, distributions, and quality issues — instantly.">
            <div className="grid grid-cols-5 gap-2 text-[11px]">
              {[
                ["order_id","ID"], ["created_at","date"], ["region","category"], ["amount","number"], ["status","enum"],
              ].map(([k, t]) => (
                <div key={k} className="rounded-md border border-border bg-secondary/60 px-2 py-1.5">
                  <div className="text-foreground">{k}</div>
                  <div className="text-[var(--primary)]">{t}</div>
                </div>
              ))}
            </div>
          </Cell>

          <Cell span="col-span-12 md:col-span-5" icon={Wand2} title="AI Dashboard Generation" desc="Get a complete, interactive dashboard in seconds — no configuration required." delay={0.05}>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-10 rounded-md bg-secondary/70" />
              ))}
            </div>
          </Cell>

          <Cell span="col-span-12 md:col-span-4" icon={LineIcon} title="Forecasting" desc="Project trends forward with confidence intervals you can actually trust." delay={0.1}>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mini(18)}>
                  <defs>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.52 0.22 274)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.52 0.22 274)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area dataKey="v" stroke="oklch(0.52 0.22 274)" strokeWidth={2} fill="url(#g2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Cell>

          <Cell span="col-span-12 md:col-span-4" icon={MessageSquare} title="Natural Language Queries" desc="Ask questions in plain English — get charts, tables, and explanations." delay={0.15}>
            <div className="space-y-1.5 text-xs">
              <div className="rounded-lg border border-border px-3 py-2 text-muted-foreground">“Top regions by revenue last quarter”</div>
              <div className="rounded-lg bg-foreground px-3 py-2 text-background">→ Generated bar chart · 5 regions</div>
            </div>
          </Cell>

          <Cell span="col-span-12 md:col-span-4" icon={AlertTriangle} title="Anomaly Detection" desc="Spot outliers automatically before they become problems." delay={0.2}>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mini(20)}>
                  <Line dataKey="v" stroke="oklch(0.52 0.22 274)" strokeWidth={2} dot={(props: any) => {
                    const { cx, cy, index } = props;
                    return index === 14 ? <circle key={index} cx={cx} cy={cy} r={4} fill="oklch(0.7 0.2 25)" /> : <circle key={index} cx={cx} cy={cy} r={0} />;
                  }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Cell>

          <Cell span="col-span-12 md:col-span-6" icon={Network} title="Correlation Analysis" desc="See how every column relates — at a glance." delay={0.25}>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-sm" style={{ background: `oklch(0.52 0.22 274 / ${0.06 + ((i * 37) % 90) / 100})` }} />
              ))}
            </div>
          </Cell>

          <Cell span="col-span-12 md:col-span-6" icon={Share2} title="Export & Sharing" desc="Publish dashboards, share live links, or export polished reports." delay={0.3}>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mini(10)}>
                  <Bar dataKey="v" fill="oklch(0.52 0.22 274)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Cell>
        </div>
      </div>
    </section>
  );
}