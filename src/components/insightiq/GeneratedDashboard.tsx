import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Hash, Database, Layers, Sparkles } from "lucide-react";

type ColType = "number" | "date" | "category" | "boolean" | "id" | "text";
type Column = { name: string; type: ColType; unique: number; samples: string[]; nullPct: number };
type Parsed = { fileName: string; rows: number; cols: Column[]; preview: string[][] };

type Props = { parsed: Parsed; allRows: string[][] };

const PALETTE = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#ef4444", "#0ea5e9"];

function toNum(v: string) {
  if (v == null) return NaN;
  const n = Number(String(v).replace(/[$,€£%\s]/g, ""));
  return isFinite(n) ? n : NaN;
}

export function GeneratedDashboard({ parsed, allRows }: Props) {
  const { kpis, timeSeries, categoryBars, donut, scatter, dateCol, numericCols, categoryCols } = useMemo(() => {
    const cols = parsed.cols;
    const numericCols = cols.filter((c) => c.type === "number");
    const categoryCols = cols.filter((c) => c.type === "category" || c.type === "boolean");
    const dateCol = cols.find((c) => c.type === "date");

    // KPIs from numeric cols
    const kpis = numericCols.slice(0, 4).map((c) => {
      const idx = cols.indexOf(c);
      const vals = allRows.map((r) => toNum(r[idx])).filter((n) => !isNaN(n));
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length ? sum / vals.length : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      return { name: c.name, sum, avg, max, count: vals.length };
    });

    // Time-series: aggregate first numeric by date
    let timeSeries: { date: string; value: number }[] = [];
    if (dateCol && numericCols[0]) {
      const dIdx = cols.indexOf(dateCol);
      const nIdx = cols.indexOf(numericCols[0]);
      const buckets = new Map<string, number>();
      allRows.forEach((r) => {
        const d = (r[dIdx] || "").slice(0, 10);
        const n = toNum(r[nIdx]);
        if (!d || isNaN(n)) return;
        buckets.set(d, (buckets.get(d) || 0) + n);
      });
      timeSeries = Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({ date, value }))
        .slice(-30);
    }

    // Category breakdown: first category col, sum of first numeric (or count)
    let categoryBars: { name: string; value: number }[] = [];
    let donut: { name: string; value: number }[] = [];
    if (categoryCols[0]) {
      const cIdx = cols.indexOf(categoryCols[0]);
      const nIdx = numericCols[0] ? cols.indexOf(numericCols[0]) : -1;
      const buckets = new Map<string, number>();
      allRows.forEach((r) => {
        const k = (r[cIdx] || "—").trim() || "—";
        const v = nIdx >= 0 ? toNum(r[nIdx]) : 1;
        if (isNaN(v)) return;
        buckets.set(k, (buckets.get(k) || 0) + v);
      });
      categoryBars = Array.from(buckets.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      donut = categoryBars.slice(0, 6);
    }

    // Scatter: first two numeric cols
    let scatter: { x: number; y: number }[] = [];
    if (numericCols.length >= 2) {
      const xi = cols.indexOf(numericCols[0]);
      const yi = cols.indexOf(numericCols[1]);
      scatter = allRows
        .map((r) => ({ x: toNum(r[xi]), y: toNum(r[yi]) }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y))
        .slice(0, 200);
    }

    return { kpis, timeSeries, categoryBars, donut, scatter, dateCol, numericCols, categoryCols };
  }, [parsed, allRows]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-elegant"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-[var(--primary)]" />
            Auto-generated dashboard
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{parsed.fileName}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-muted-foreground">
            <Database className="h-3 w-3" /> {parsed.rows.toLocaleString()} rows
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-muted-foreground">
            <Layers className="h-3 w-3" /> {parsed.cols.length} columns
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-muted-foreground">
            <Hash className="h-3 w-3" /> {numericCols.length} numeric
          </span>
        </div>
      </div>

      {/* KPI row */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((k, i) => (
            <div key={k.name} className="rounded-xl border border-border bg-secondary/40 p-3">
              <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">{k.name}</div>
              <div className="mt-1 text-xl font-semibold tracking-tight" style={{ color: PALETTE[i % PALETTE.length] }}>
                {k.sum >= 1000 ? k.sum.toLocaleString(undefined, { maximumFractionDigits: 0 }) : k.sum.toFixed(2)}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                avg {k.avg.toFixed(1)} · max {k.max.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {timeSeries.length > 1 && (
          <ChartCard
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            title={`${numericCols[0]?.name} over ${dateCol?.name}`}
            badge="Time series"
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeSeries} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="ts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#ts)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {categoryBars.length > 0 && (
          <ChartCard
            icon={<BarChart3 className="h-3.5 w-3.5" />}
            title={`${numericCols[0]?.name || "Count"} by ${categoryCols[0]?.name}`}
            badge="Breakdown"
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryBars} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryBars.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {donut.length > 0 && (
          <ChartCard
            icon={<PieIcon className="h-3.5 w-3.5" />}
            title={`Share by ${categoryCols[0]?.name}`}
            badge="Distribution"
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donut} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {donut.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              {donut.map((d, i) => (
                <span key={d.name} className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
                  {d.name}
                </span>
              ))}
            </div>
          </ChartCard>
        )}

        {scatter.length > 5 ? (
          <ChartCard
            icon={<Activity className="h-3.5 w-3.5" />}
            title={`${numericCols[0]?.name} vs ${numericCols[1]?.name}`}
            badge="Correlation"
          >
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="x" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <YAxis type="number" dataKey="y" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={scatter} fill="#06b6d4" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        ) : numericCols[0] ? (
          <ChartCard
            icon={<Activity className="h-3.5 w-3.5" />}
            title={`${numericCols[0]?.name} trend`}
            badge="Sparkline"
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={allRows.slice(0, 60).map((r, i) => ({ i, v: toNum(r[parsed.cols.indexOf(numericCols[0])]) })).filter((d) => !isNaN(d.v))}
                margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="i" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        ) : null}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/30 p-3 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">AI insight:</span>{" "}
        {dateCol && numericCols[0]
          ? `${numericCols[0].name} shows ${timeSeries.length > 1 && timeSeries[timeSeries.length - 1].value > timeSeries[0].value ? "an upward" : "a stable"} trend across ${timeSeries.length} ${dateCol.name} buckets.`
          : categoryCols[0] && categoryBars[0]
          ? `${categoryBars[0].name} leads ${categoryCols[0].name} with ${((categoryBars[0].value / categoryBars.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}% of total.`
          : `Detected ${numericCols.length} numeric and ${categoryCols.length} categorical columns suitable for analysis.`}
      </div>
    </motion.div>
  );
}

function ChartCard({ icon, title, badge, children }: { icon: React.ReactNode; title: string; badge: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className="text-[var(--primary)]">{icon}</span>
          <span className="truncate">{title}</span>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{badge}</span>
      </div>
      {children}
    </div>
  );
}