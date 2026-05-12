import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, Treemap, ComposedChart, FunnelChart, Funnel, LabelList,
} from "recharts";
import {
  TrendingUp, BarChart3, PieChart as PieIcon, Activity, Hash, Database, Layers,
  Sparkles, Calendar, Type as TypeIcon, ToggleLeft, Grid3x3, GitCompare, Gauge,
  Sigma, Percent, Boxes, Target, Network, BarChart2,
} from "lucide-react";

type ColType = "number" | "date" | "category" | "boolean" | "id" | "text";
type Column = { name: string; type: ColType; unique: number; samples: string[]; nullPct: number };
type Parsed = { fileName: string; rows: number; cols: Column[]; preview: string[][]; allRows: string[][] };

type Props = { parsed: Parsed; allRows: string[][] };

const PALETTE = [
  "#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6",
  "#ef4444", "#0ea5e9", "#84cc16", "#f97316", "#14b8a6", "#a855f7",
];

function toNum(v: string) {
  if (v == null) return NaN;
  const n = Number(String(v).replace(/[$,€£%\s]/g, ""));
  return isFinite(n) ? n : NaN;
}
function toDate(v: string) {
  const t = Date.parse(v);
  return isNaN(t) ? null : new Date(t);
}
function fmt(n: number) {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toFixed(2);
}
function quantile(sorted: number[], q: number) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
}
function pearson(xs: number[], ys: number[]) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  let sx = 0, sy = 0, sxy = 0, sx2 = 0, sy2 = 0;
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxy += xs[i] * ys[i]; sx2 += xs[i] * xs[i]; sy2 += ys[i] * ys[i]; }
  const num = n * sxy - sx * sy;
  const den = Math.sqrt((n * sx2 - sx * sx) * (n * sy2 - sy * sy));
  return den === 0 ? 0 : num / den;
}

type ChartSpec = {
  id: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  group: "Overview" | "Numeric" | "Categorical" | "Time" | "Relationships";
  span?: 1 | 2;
  render: () => React.ReactNode;
};

export function GeneratedDashboard({ parsed, allRows }: Props) {
  const [filter, setFilter] = useState<"All" | ChartSpec["group"]>("All");

  const charts = useMemo<ChartSpec[]>(() => {
    const cols = parsed.cols;
    const numericCols = cols.filter((c) => c.type === "number");
    const categoryCols = cols.filter((c) => c.type === "category");
    const boolCols = cols.filter((c) => c.type === "boolean");
    const dateCols = cols.filter((c) => c.type === "date");

    const numIdx = (name: string) => cols.findIndex((c) => c.name === name);

    // Precompute numeric vectors
    const numVecs: Record<string, number[]> = {};
    numericCols.forEach((c) => {
      const i = numIdx(c.name);
      numVecs[c.name] = allRows.map((r) => toNum(r[i])).filter((n) => !isNaN(n));
    });

    const out: ChartSpec[] = [];

    // ===== OVERVIEW: KPIs ===== (1 chart counted, but multi-stat)
    if (numericCols.length) {
      out.push({
        id: "overview-kpi",
        title: "Key metrics",
        badge: "KPI",
        icon: <Sigma className="h-3.5 w-3.5" />,
        group: "Overview",
        span: 2,
        render: () => (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {numericCols.slice(0, 8).map((c, i) => {
              const v = numVecs[c.name];
              const sum = v.reduce((a, b) => a + b, 0);
              const avg = v.length ? sum / v.length : 0;
              return (
                <div key={c.name} className="rounded-lg border border-border bg-secondary/40 p-2.5">
                  <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">{c.name}</div>
                  <div className="mt-1 text-lg font-semibold tracking-tight" style={{ color: PALETTE[i % PALETTE.length] }}>{fmt(sum)}</div>
                  <div className="text-[10px] text-muted-foreground">avg {fmt(avg)}</div>
                </div>
              );
            })}
          </div>
        ),
      });
    }

    // Schema overview chart: column type distribution
    out.push({
      id: "overview-types",
      title: "Column type distribution",
      badge: "Schema",
      icon: <Layers className="h-3.5 w-3.5" />,
      group: "Overview",
      render: () => {
        const counts: Record<string, number> = {};
        cols.forEach((c) => (counts[c.type] = (counts[c.type] || 0) + 1));
        const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
        return (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        );
      },
    });

    // Null/completeness chart
    out.push({
      id: "overview-null",
      title: "Data completeness per column",
      badge: "Quality",
      icon: <Percent className="h-3.5 w-3.5" />,
      group: "Overview",
      render: () => {
        const data = cols.map((c) => ({ name: c.name, complete: 100 - c.nullPct }));
        return (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={axisTick} />
              <YAxis type="category" dataKey="name" width={70} tick={{ ...axisTick, fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="complete" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      },
    });

    // Cardinality (unique values per column)
    out.push({
      id: "overview-card",
      title: "Unique values per column",
      badge: "Cardinality",
      icon: <Boxes className="h-3.5 w-3.5" />,
      group: "Overview",
      render: () => {
        const data = cols.map((c) => ({ name: c.name, unique: c.unique }));
        return (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ left: -10, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="unique" radius={[4, 4, 0, 0]}>
                {cols.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      },
    });

    // ===== NUMERIC =====
    numericCols.forEach((c, ci) => {
      const v = numVecs[c.name];
      if (!v.length) return;
      const sorted = [...v].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const q1 = quantile(sorted, 0.25);
      const median = quantile(sorted, 0.5);
      const q3 = quantile(sorted, 0.75);
      const mean = v.reduce((a, b) => a + b, 0) / v.length;
      const color = PALETTE[ci % PALETTE.length];

      // Histogram
      out.push({
        id: `hist-${c.name}`,
        title: `${c.name} — distribution`,
        badge: "Histogram",
        icon: <BarChart2 className="h-3.5 w-3.5" />,
        group: "Numeric",
        render: () => {
          const bins = 10;
          const step = (max - min) / bins || 1;
          const data = Array.from({ length: bins }, (_, i) => ({
            range: `${fmt(min + i * step)}`,
            count: 0,
          }));
          v.forEach((val) => {
            const b = Math.min(bins - 1, Math.floor((val - min) / step));
            data[b].count += 1;
          });
          return (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} margin={{ left: -10, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="range" tick={{ ...axisTick, fontSize: 9 }} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          );
        },
      });

      // Stats summary card (boxplot-like)
      out.push({
        id: `stats-${c.name}`,
        title: `${c.name} — statistics`,
        badge: "Summary",
        icon: <Sigma className="h-3.5 w-3.5" />,
        group: "Numeric",
        render: () => (
          <div className="grid h-[180px] grid-cols-3 gap-2">
            {[
              { l: "min", v: min }, { l: "q1", v: q1 }, { l: "median", v: median },
              { l: "mean", v: mean }, { l: "q3", v: q3 }, { l: "max", v: max },
            ].map((s) => (
              <div key={s.l} className="flex flex-col justify-center rounded-lg border border-border bg-secondary/40 p-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                <div className="truncate text-sm font-semibold" style={{ color }}>{fmt(s.v)}</div>
              </div>
            ))}
          </div>
        ),
      });

      // Cumulative line
      out.push({
        id: `cum-${c.name}`,
        title: `${c.name} — cumulative`,
        badge: "Running total",
        icon: <TrendingUp className="h-3.5 w-3.5" />,
        group: "Numeric",
        render: () => {
          let acc = 0;
          const data = v.slice(0, 200).map((val, i) => ({ i, cum: (acc += val) }));
          return (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data} margin={{ left: -10, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id={`g-${c.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="i" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="cum" stroke={color} strokeWidth={2} fill={`url(#g-${c.name})`} />
              </AreaChart>
            </ResponsiveContainer>
          );
        },
      });
    });

    // ===== CATEGORICAL =====
    categoryCols.forEach((c, ci) => {
      const i = numIdx(c.name);
      const counts = new Map<string, number>();
      allRows.forEach((r) => {
        const k = (r[i] || "—").trim() || "—";
        counts.set(k, (counts.get(k) || 0) + 1);
      });
      const data = Array.from(counts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      const color = PALETTE[(ci + 2) % PALETTE.length];

      // Bar chart of counts
      out.push({
        id: `cat-bar-${c.name}`,
        title: `${c.name} — counts`,
        badge: "Bar",
        icon: <BarChart3 className="h-3.5 w-3.5" />,
        group: "Categorical",
        render: () => (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ left: -10, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ),
      });

      // Donut share
      out.push({
        id: `cat-donut-${c.name}`,
        title: `${c.name} — share`,
        badge: "Donut",
        icon: <PieIcon className="h-3.5 w-3.5" />,
        group: "Categorical",
        render: () => (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        ),
      });

      // Treemap
      out.push({
        id: `cat-tree-${c.name}`,
        title: `${c.name} — treemap`,
        badge: "Treemap",
        icon: <Grid3x3 className="h-3.5 w-3.5" />,
        group: "Categorical",
        render: () => (
          <ResponsiveContainer width="100%" height={180}>
            <Treemap
              data={data.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))}
              dataKey="value"
              nameKey="name"
              stroke="#fff"
            />
          </ResponsiveContainer>
        ),
      });

      // Radial
      out.push({
        id: `cat-radial-${c.name}`,
        title: `${c.name} — radial`,
        badge: "Radial",
        icon: <Target className="h-3.5 w-3.5" />,
        group: "Categorical",
        render: () => (
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart innerRadius="20%" outerRadius="100%" data={data.slice(0, 6).map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))}>
              <RadialBar background dataKey="value" />
              <Tooltip contentStyle={tooltipStyle} />
            </RadialBarChart>
          </ResponsiveContainer>
        ),
      });

      // Funnel (top categories)
      if (data.length >= 3) {
        out.push({
          id: `cat-funnel-${c.name}`,
          title: `${c.name} — funnel`,
          badge: "Funnel",
          icon: <Activity className="h-3.5 w-3.5" />,
          group: "Categorical",
          render: () => (
            <ResponsiveContainer width="100%" height={180}>
              <FunnelChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Funnel dataKey="value" data={data.slice(0, 6).map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))} isAnimationActive>
                  <LabelList position="right" fill="#6b7280" stroke="none" dataKey="name" style={{ fontSize: 10 }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          ),
        });
      }

      // Numeric × this category — average bars
      if (numericCols[0]) {
        const ni = numIdx(numericCols[0].name);
        const agg = new Map<string, { s: number; n: number }>();
        allRows.forEach((r) => {
          const k = (r[i] || "—").trim() || "—";
          const n = toNum(r[ni]);
          if (isNaN(n)) return;
          const cur = agg.get(k) || { s: 0, n: 0 };
          cur.s += n; cur.n += 1; agg.set(k, cur);
        });
        const aData = Array.from(agg.entries())
          .map(([name, { s, n }]) => ({ name, avg: s / n, total: s }))
          .sort((a, b) => b.total - a.total).slice(0, 8);
        out.push({
          id: `cat-avg-${c.name}`,
          title: `Avg ${numericCols[0].name} by ${c.name}`,
          badge: "Aggregate",
          icon: <BarChart3 className="h-3.5 w-3.5" />,
          group: "Categorical",
          render: () => (
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={aData} margin={{ left: -10, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="total" fill={color} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="avg" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ),
        });
      }
    });

    // ===== BOOLEAN =====
    boolCols.forEach((c, ci) => {
      const i = numIdx(c.name);
      let t = 0, f = 0;
      allRows.forEach((r) => {
        const v = (r[i] || "").toLowerCase();
        if (/^(true|1|yes)$/.test(v)) t++;
        else if (/^(false|0|no)$/.test(v)) f++;
      });
      const total = t + f || 1;
      out.push({
        id: `bool-${c.name}`,
        title: `${c.name} — true vs false`,
        badge: "Gauge",
        icon: <Gauge className="h-3.5 w-3.5" />,
        group: "Categorical",
        render: () => (
          <div className="flex h-[180px] flex-col items-center justify-center">
            <div className="text-3xl font-semibold" style={{ color: PALETTE[ci % PALETTE.length] }}>
              {((t / total) * 100).toFixed(1)}%
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">true ({t.toLocaleString()})</div>
            <div className="mt-3 h-2 w-3/4 overflow-hidden rounded-full bg-secondary">
              <div className="h-full" style={{ width: `${(t / total) * 100}%`, background: PALETTE[ci % PALETTE.length] }} />
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">false ({f.toLocaleString()})</div>
          </div>
        ),
      });
    });

    // ===== TIME SERIES =====
    dateCols.forEach((dc) => {
      const di = numIdx(dc.name);
      // For each numeric, time series
      numericCols.slice(0, 4).forEach((nc, ni2) => {
        const ni = numIdx(nc.name);
        const buckets = new Map<string, number>();
        allRows.forEach((r) => {
          const d = (r[di] || "").slice(0, 10);
          const n = toNum(r[ni]);
          if (!d || isNaN(n)) return;
          buckets.set(d, (buckets.get(d) || 0) + n);
        });
        const data = Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
        if (data.length < 2) return;
        const color = PALETTE[ni2 % PALETTE.length];
        out.push({
          id: `ts-${dc.name}-${nc.name}`,
          title: `${nc.name} over ${dc.name}`,
          badge: "Time series",
          icon: <TrendingUp className="h-3.5 w-3.5" />,
          group: "Time",
          render: () => (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data} margin={{ left: -10, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id={`ts-${dc.name}-${nc.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{ ...axisTick, fontSize: 9 }} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#ts-${dc.name}-${nc.name})`} />
              </AreaChart>
            </ResponsiveContainer>
          ),
        });
      });

      // Day-of-week breakdown
      const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name) => ({ name, count: 0 }));
      allRows.forEach((r) => {
        const d = toDate(r[di]);
        if (d) dow[d.getDay()].count += 1;
      });
      out.push({
        id: `dow-${dc.name}`,
        title: `${dc.name} — by weekday`,
        badge: "Pattern",
        icon: <Calendar className="h-3.5 w-3.5" />,
        group: "Time",
        render: () => (
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={dow} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: "#9ca3af" }} />
              <Radar dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        ),
      });

      // Month breakdown
      const months = Array.from({ length: 12 }, (_, m) => ({ name: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m], count: 0 }));
      allRows.forEach((r) => {
        const d = toDate(r[di]);
        if (d) months[d.getMonth()].count += 1;
      });
      out.push({
        id: `month-${dc.name}`,
        title: `${dc.name} — by month`,
        badge: "Seasonality",
        icon: <Calendar className="h-3.5 w-3.5" />,
        group: "Time",
        render: () => (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={months} margin={{ left: -10, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 9 }} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ),
      });
    });

    // ===== RELATIONSHIPS =====
    // Scatter for each numeric pair (first 4 numeric => up to 6 pairs)
    const topNum = numericCols.slice(0, 4);
    for (let a = 0; a < topNum.length; a++) {
      for (let b = a + 1; b < topNum.length; b++) {
        const ai = numIdx(topNum[a].name);
        const bi = numIdx(topNum[b].name);
        const pts = allRows.map((r) => ({ x: toNum(r[ai]), y: toNum(r[bi]) }))
          .filter((p) => !isNaN(p.x) && !isNaN(p.y)).slice(0, 200);
        if (pts.length < 5) continue;
        const r = pearson(pts.map((p) => p.x), pts.map((p) => p.y));
        out.push({
          id: `scatter-${topNum[a].name}-${topNum[b].name}`,
          title: `${topNum[a].name} vs ${topNum[b].name}`,
          badge: `r = ${r.toFixed(2)}`,
          icon: <GitCompare className="h-3.5 w-3.5" />,
          group: "Relationships",
          render: () => (
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart margin={{ left: -10, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="x" tick={axisTick} />
                <YAxis type="number" dataKey="y" tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={pts} fill="#06b6d4" />
              </ScatterChart>
            </ResponsiveContainer>
          ),
        });
      }
    }

    // Correlation heatmap (numeric only)
    if (topNum.length >= 2) {
      const matrix = topNum.map((c1) => topNum.map((c2) => {
        const i1 = numIdx(c1.name), i2 = numIdx(c2.name);
        const xs: number[] = [], ys: number[] = [];
        allRows.forEach((r) => {
          const x = toNum(r[i1]), y = toNum(r[i2]);
          if (!isNaN(x) && !isNaN(y)) { xs.push(x); ys.push(y); }
        });
        return pearson(xs, ys);
      }));
      out.push({
        id: "heatmap",
        title: "Correlation matrix",
        badge: "Heatmap",
        icon: <Network className="h-3.5 w-3.5" />,
        group: "Relationships",
        span: 2,
        render: () => (
          <div className="overflow-x-auto">
            <div className="inline-grid gap-px bg-border" style={{ gridTemplateColumns: `auto repeat(${topNum.length}, minmax(60px,1fr))` }}>
              <div className="bg-card p-1.5 text-[10px]" />
              {topNum.map((c) => <div key={c.name} className="bg-card p-1.5 text-[10px] font-medium text-muted-foreground">{c.name}</div>)}
              {matrix.map((row, ri) => (
                <>
                  <div key={`r-${ri}`} className="bg-card p-1.5 text-[10px] font-medium text-muted-foreground">{topNum[ri].name}</div>
                  {row.map((val, ci) => {
                    const op = Math.min(0.9, Math.abs(val));
                    const bg = val >= 0 ? `rgba(99,102,241,${op})` : `rgba(239,68,68,${op})`;
                    return (
                      <div key={`${ri}-${ci}`} className="p-2 text-center text-[11px] font-medium" style={{ background: bg, color: op > 0.5 ? "white" : "#111" }}>
                        {val.toFixed(2)}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        ),
      });
    }

    // Category × Category — stacked bar (first 2 categoricals)
    if (categoryCols.length >= 2) {
      const a = categoryCols[0], b = categoryCols[1];
      const ai = numIdx(a.name), bi = numIdx(b.name);
      const map = new Map<string, Record<string, number>>();
      const bKeys = new Set<string>();
      allRows.forEach((r) => {
        const ka = (r[ai] || "—").trim() || "—";
        const kb = (r[bi] || "—").trim() || "—";
        bKeys.add(kb);
        const cur = map.get(ka) || {};
        cur[kb] = (cur[kb] || 0) + 1;
        map.set(ka, cur);
      });
      const bArr = Array.from(bKeys).slice(0, 6);
      const data = Array.from(map.entries()).slice(0, 8).map(([name, vals]) => ({ name, ...vals }));
      out.push({
        id: `stack-${a.name}-${b.name}`,
        title: `${a.name} × ${b.name}`,
        badge: "Stacked",
        icon: <BarChart3 className="h-3.5 w-3.5" />,
        group: "Relationships",
        render: () => (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ left: -10, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              {bArr.map((k, i) => (
                <Bar key={k} dataKey={k} stackId="s" fill={PALETTE[i % PALETTE.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ),
      });
    }

    return out.slice(0, 40);
  }, [parsed, allRows]);

  const groups: ("All" | ChartSpec["group"])[] = ["All", "Overview", "Numeric", "Categorical", "Time", "Relationships"];
  const visible = filter === "All" ? charts : charts.filter((c) => c.group === filter);

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
            <Sparkles className="h-3 w-3 text-[var(--primary)]" /> Auto-generated dashboard
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
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-1 font-medium text-[var(--primary)]">
            <Sparkles className="h-3 w-3" /> {charts.length} visualizations
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5 text-[11px]">
        {groups.map((g) => {
          const count = g === "All" ? charts.length : charts.filter((c) => c.group === g).length;
          if (count === 0 && g !== "All") return null;
          const active = filter === g;
          return (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`rounded-full px-3 py-1 transition ${active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {g} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.02 }}
            className={`rounded-xl border border-border bg-background p-3 ${c.span === 2 ? "md:col-span-2 lg:col-span-2" : ""}`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
                <span className="text-[var(--primary)]">{c.icon}</span>
                <span className="truncate">{c.title}</span>
              </div>
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">{c.badge}</span>
            </div>
            {c.render()}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const tooltipStyle = { borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" } as const;
const axisTick = { fontSize: 10, fill: "#6b7280" } as const;