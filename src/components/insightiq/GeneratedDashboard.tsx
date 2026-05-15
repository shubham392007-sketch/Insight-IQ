import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, Treemap, ComposedChart, FunnelChart, Funnel, LabelList,
} from "recharts";
import {
  TrendingUp, BarChart3, PieChart as PieIcon, Activity, Database, Layers,
  Sparkles, Calendar, Grid3x3, GitCompare, Gauge, Sigma, Percent, Boxes, Target, Network, BarChart2,
  ChevronLeft, ChevronRight, Download, Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

type ColType = "number" | "date" | "category" | "boolean" | "id" | "text";
type Column = { name: string; type: ColType; unique: number; samples: string[]; nullPct: number };
type Parsed = { fileName: string; rows: number; cols: Column[]; preview: string[][]; allRows: string[][] };
type Props = { parsed: Parsed; allRows: string[][] };

const PALETTE = [
  "#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6",
  "#ef4444", "#0ea5e9", "#84cc16", "#f97316", "#14b8a6", "#a855f7",
];

const tooltipStyle = { borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb", background: "#fff" } as const;
const axisTick = { fontSize: 11, fill: "#6b7280" } as const;

function toNum(v: string) {
  if (v == null) return NaN;
  const n = Number(String(v).replace(/[$,€£%\s]/g, ""));
  return isFinite(n) ? n : NaN;
}
function toDate(v: string) { const t = Date.parse(v); return isNaN(t) ? null : new Date(t); }
function fmt(n: number) {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toFixed(2);
}
function quantile(s: number[], q: number) {
  if (!s.length) return 0;
  const pos = (s.length - 1) * q, base = Math.floor(pos), rest = pos - base;
  return s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base];
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

type Group = "Overview" | "Numeric" | "Categorical" | "Time" | "Relationships";
type ChartSpec = {
  id: string; title: string; badge: string; icon: React.ReactNode;
  group: Group; span?: 1 | 2; render: (h: number, fs: number) => React.ReactNode;
};

/**
 * Card that observes its own width and renders the chart at a height that is
 * always proportional to the available container width. Guarantees charts
 * fit their card on every breakpoint and labels stay readable on mobile.
 */
function ResponsiveChartCard({
  spec,
  innerRef,
  index,
}: {
  spec: ChartSpec;
  innerRef: (el: HTMLDivElement | null) => void;
  index: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const isWide = spec.span === 2;
  // Aspect-ratio driven height — readable on phones, generous on desktop
  let h: number;
  if (spec.id === "ov-kpi") {
    h = width < 480 ? 220 : 260;
  } else if (isWide) {
    h = Math.round(Math.min(520, Math.max(300, width * 0.4)));
  } else {
    h = Math.round(Math.min(460, Math.max(280, width * 0.62)));
  }

  // Automatic font scaling — keeps axis labels and legends readable across
  // every card width without overflowing on small screens.
  const fs = Math.round(Math.max(9, Math.min(14, width / 48)));

  return (
    <motion.div
      ref={(node) => {
        wrapRef.current = node;
        innerRef(node);
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03 }}
      className={`rounded-2xl border border-border bg-background p-4 sm:p-5 ${isWide ? "xl:col-span-2" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium sm:text-base">
          <span className="text-[var(--primary)]">{spec.icon}</span>
          <span className="truncate">{spec.title}</span>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground sm:px-2.5 sm:py-1">
          {spec.badge}
        </span>
      </div>
      <div className="w-full">{width > 0 ? spec.render(h, fs) : <div style={{ height: h }} />}</div>
    </motion.div>
  );
}

const NUMERIC_TYPES = ["histogram", "cumulative", "stats", "sparkline", "density"] as const;
const CATEGORICAL_TYPES = ["bar", "donut", "treemap", "radial", "funnel", "aggregate"] as const;

export function GeneratedDashboard({ parsed, allRows }: Props) {
  const [filter, setFilter] = useState<"All" | Group>("All");
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const PAGE_SIZE = 8;

  const charts = useMemo<ChartSpec[]>(() => {
    const cols = parsed.cols;
    const numericCols = cols.filter((c) => c.type === "number");
    const categoryCols = cols.filter((c) => c.type === "category");
    const boolCols = cols.filter((c) => c.type === "boolean");
    const dateCols = cols.filter((c) => c.type === "date");
    const idx = (n: string) => cols.findIndex((c) => c.name === n);

    const numVecs: Record<string, number[]> = {};
    numericCols.forEach((c) => {
      const i = idx(c.name);
      numVecs[c.name] = allRows.map((r) => toNum(r[i])).filter((n) => !isNaN(n));
    });

    const out: ChartSpec[] = [];

    // ===== OVERVIEW =====
    if (numericCols.length) out.push({
      id: "ov-kpi", title: "Key metrics", badge: "KPI", icon: <Sigma className="h-3.5 w-3.5" />,
      group: "Overview", span: 2,
      render: (h) => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ minHeight: h }}>
          {numericCols.slice(0, 8).map((c, i) => {
            const v = numVecs[c.name];
            const sum = v.reduce((a, b) => a + b, 0);
            const avg = v.length ? sum / v.length : 0;
            return (
              <div key={c.name} className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{c.name}</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: PALETTE[i % PALETTE.length] }}>{fmt(sum)}</div>
                <div className="text-xs text-muted-foreground">avg {fmt(avg)}</div>
              </div>
            );
          })}
        </div>
      ),
    });

    out.push({
      id: "ov-types", title: "Column type distribution", badge: "Schema",
      icon: <Layers className="h-3.5 w-3.5" />, group: "Overview",
      render: (h) => {
        const counts: Record<string, number> = {};
        cols.forEach((c) => (counts[c.type] = (counts[c.type] || 0) + 1));
        const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
        return (
          <ResponsiveContainer width="100%" height={h}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="40%" outerRadius="75%" paddingAngle={2} label>
                {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        );
      },
    });

    out.push({
      id: "ov-null", title: "Data completeness per column", badge: "Quality",
      icon: <Percent className="h-3.5 w-3.5" />, group: "Overview",
      render: (h) => {
        const data = cols.map((c) => ({ name: c.name, complete: 100 - c.nullPct }));
        return (
          <ResponsiveContainer width="100%" height={h}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={axisTick} />
              <YAxis type="category" dataKey="name" width={90} tick={{ ...axisTick, fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="complete" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      },
    });

    out.push({
      id: "ov-card", title: "Unique values per column", badge: "Cardinality",
      icon: <Boxes className="h-3.5 w-3.5" />, group: "Overview",
      render: (h) => {
        const data = cols.map((c) => ({ name: c.name, unique: c.unique }));
        return (
          <ResponsiveContainer width="100%" height={h}>
            <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
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

    // ===== NUMERIC — rotate type per column =====
    numericCols.forEach((c, ci) => {
      const v = numVecs[c.name];
      if (!v.length) return;
      const sorted = [...v].sort((a, b) => a - b);
      const min = sorted[0], max = sorted[sorted.length - 1];
      const mean = v.reduce((a, b) => a + b, 0) / v.length;
      const color = PALETTE[ci % PALETTE.length];
      const type = NUMERIC_TYPES[ci % NUMERIC_TYPES.length];

      if (type === "histogram") {
        out.push({
          id: `num-${c.name}`, title: `${c.name} — distribution`, badge: "Histogram",
          icon: <BarChart2 className="h-3.5 w-3.5" />, group: "Numeric",
          render: (h) => {
            const bins = 12, step = (max - min) / bins || 1;
            const data = Array.from({ length: bins }, (_, i) => ({ range: fmt(min + i * step), count: 0 }));
            v.forEach((val) => { const b = Math.min(bins - 1, Math.floor((val - min) / step)); data[b].count++; });
            return (
              <ResponsiveContainer width="100%" height={h}>
                <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="range" tick={{ ...axisTick, fontSize: 10 }} />
                  <YAxis tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            );
          },
        });
      } else if (type === "cumulative") {
        out.push({
          id: `num-${c.name}`, title: `${c.name} — running total`, badge: "Cumulative",
          icon: <TrendingUp className="h-3.5 w-3.5" />, group: "Numeric",
          render: (h) => {
            let acc = 0;
            const data = v.slice(0, 300).map((val, i) => ({ i, cum: (acc += val) }));
            return (
              <ResponsiveContainer width="100%" height={h}>
                <AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                  <defs><linearGradient id={`g-${c.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.5} /><stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="i" tick={axisTick} /><YAxis tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="cum" stroke={color} strokeWidth={2} fill={`url(#g-${c.name})`} />
                </AreaChart>
              </ResponsiveContainer>
            );
          },
        });
      } else if (type === "stats") {
        out.push({
          id: `num-${c.name}`, title: `${c.name} — five-number summary`, badge: "Statistics",
          icon: <Sigma className="h-3.5 w-3.5" />, group: "Numeric",
          render: (h) => (
            <div className="grid grid-cols-3 gap-3" style={{ minHeight: h }}>
              {[{ l: "min", v: min }, { l: "q1", v: quantile(sorted, 0.25) }, { l: "median", v: quantile(sorted, 0.5) },
                { l: "mean", v: mean }, { l: "q3", v: quantile(sorted, 0.75) }, { l: "max", v: max }].map((s) => (
                <div key={s.l} className="flex flex-col justify-center rounded-xl border border-border bg-secondary/40 p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                  <div className="mt-1 truncate text-xl font-semibold" style={{ color }}>{fmt(s.v)}</div>
                </div>
              ))}
            </div>
          ),
        });
      } else if (type === "sparkline") {
        out.push({
          id: `num-${c.name}`, title: `${c.name} — sequence`, badge: "Line",
          icon: <Activity className="h-3.5 w-3.5" />, group: "Numeric",
          render: (h) => {
            const data = v.slice(0, 300).map((val, i) => ({ i, v: val }));
            return (
              <ResponsiveContainer width="100%" height={h}>
                <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="i" tick={axisTick} /><YAxis tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            );
          },
        });
      } else { // density
        out.push({
          id: `num-${c.name}`, title: `${c.name} — density`, badge: "Area density",
          icon: <BarChart2 className="h-3.5 w-3.5" />, group: "Numeric",
          render: (h) => {
            const bins = 24, step = (max - min) / bins || 1;
            const data = Array.from({ length: bins }, (_, i) => ({ x: fmt(min + i * step), d: 0 }));
            v.forEach((val) => { const b = Math.min(bins - 1, Math.floor((val - min) / step)); data[b].d++; });
            return (
              <ResponsiveContainer width="100%" height={h}>
                <AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                  <defs><linearGradient id={`d-${c.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.55} /><stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="x" tick={{ ...axisTick, fontSize: 9 }} /><YAxis tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="basis" dataKey="d" stroke={color} strokeWidth={2} fill={`url(#d-${c.name})`} />
                </AreaChart>
              </ResponsiveContainer>
            );
          },
        });
      }
    });

    // ===== CATEGORICAL — rotate type per column =====
    categoryCols.forEach((c, ci) => {
      const i = idx(c.name);
      const counts = new Map<string, number>();
      allRows.forEach((r) => { const k = (r[i] || "—").trim() || "—"; counts.set(k, (counts.get(k) || 0) + 1); });
      const data = Array.from(counts.entries()).map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value).slice(0, 10);
      const color = PALETTE[(ci + 2) % PALETTE.length];
      const type = CATEGORICAL_TYPES[ci % CATEGORICAL_TYPES.length];

      if (type === "bar") {
        out.push({
          id: `cat-${c.name}`, title: `${c.name} — counts`, badge: "Bar",
          icon: <BarChart3 className="h-3.5 w-3.5" />, group: "Categorical",
          render: (h) => (
            <ResponsiveContainer width="100%" height={h}>
              <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ),
        });
      } else if (type === "donut") {
        out.push({
          id: `cat-${c.name}`, title: `${c.name} — share`, badge: "Donut",
          icon: <PieIcon className="h-3.5 w-3.5" />, group: "Categorical",
          render: (h) => (
            <ResponsiveContainer width="100%" height={h}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="80%" paddingAngle={2} label>
                  {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ),
        });
      } else if (type === "treemap") {
        out.push({
          id: `cat-${c.name}`, title: `${c.name} — treemap`, badge: "Treemap",
          icon: <Grid3x3 className="h-3.5 w-3.5" />, group: "Categorical",
          render: (h) => (
            <ResponsiveContainer width="100%" height={h}>
              <Treemap data={data.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))}
                dataKey="value" nameKey="name" stroke="#fff" />
            </ResponsiveContainer>
          ),
        });
      } else if (type === "radial") {
        out.push({
          id: `cat-${c.name}`, title: `${c.name} — radial`, badge: "Radial",
          icon: <Target className="h-3.5 w-3.5" />, group: "Categorical",
          render: (h) => (
            <ResponsiveContainer width="100%" height={h}>
              <RadialBarChart innerRadius="20%" outerRadius="100%"
                data={data.slice(0, 6).map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))}>
                <RadialBar background dataKey="value" />
                <Tooltip contentStyle={tooltipStyle} />
              </RadialBarChart>
            </ResponsiveContainer>
          ),
        });
      } else if (type === "funnel") {
        out.push({
          id: `cat-${c.name}`, title: `${c.name} — funnel`, badge: "Funnel",
          icon: <Activity className="h-3.5 w-3.5" />, group: "Categorical",
          render: (h) => (
            <ResponsiveContainer width="100%" height={h}>
              <FunnelChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Funnel dataKey="value" data={data.slice(0, 6).map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))} isAnimationActive>
                  <LabelList position="right" fill="#374151" stroke="none" dataKey="name" style={{ fontSize: 11 }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          ),
        });
      } else { // aggregate
        if (numericCols[0]) {
          const ni = idx(numericCols[0].name);
          const agg = new Map<string, { s: number; n: number }>();
          allRows.forEach((r) => {
            const k = (r[i] || "—").trim() || "—";
            const n = toNum(r[ni]);
            if (isNaN(n)) return;
            const cur = agg.get(k) || { s: 0, n: 0 };
            cur.s += n; cur.n += 1; agg.set(k, cur);
          });
          const aData = Array.from(agg.entries()).map(([name, { s, n }]) => ({ name, avg: s / n, total: s }))
            .sort((a, b) => b.total - a.total).slice(0, 8);
          out.push({
            id: `cat-${c.name}`, title: `Avg ${numericCols[0].name} by ${c.name}`, badge: "Composed",
            icon: <BarChart3 className="h-3.5 w-3.5" />, group: "Categorical",
            render: (h) => (
              <ResponsiveContainer width="100%" height={h}>
                <ComposedChart data={aData} margin={{ left: 0, right: 12, top: 8, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill={color} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="avg" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ),
          });
        }
      }
    });

    // ===== BOOLEAN =====
    boolCols.forEach((c, ci) => {
      const i = idx(c.name);
      let t = 0, f = 0;
      allRows.forEach((r) => {
        const v = (r[i] || "").toLowerCase();
        if (/^(true|1|yes)$/.test(v)) t++; else if (/^(false|0|no)$/.test(v)) f++;
      });
      const total = t + f || 1;
      out.push({
        id: `bool-${c.name}`, title: `${c.name} — true vs false`, badge: "Gauge",
        icon: <Gauge className="h-3.5 w-3.5" />, group: "Categorical",
        render: (h) => (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: h }}>
            <div className="text-5xl font-semibold" style={{ color: PALETTE[ci % PALETTE.length] }}>
              {((t / total) * 100).toFixed(1)}%
            </div>
            <div className="mt-2 text-xs text-muted-foreground">true ({t.toLocaleString()})</div>
            <div className="mt-4 h-3 w-3/4 overflow-hidden rounded-full bg-secondary">
              <div className="h-full" style={{ width: `${(t / total) * 100}%`, background: PALETTE[ci % PALETTE.length] }} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">false ({f.toLocaleString()})</div>
          </div>
        ),
      });
    });

    // ===== TIME — rotate per (date,numeric) pair =====
    const timeTypes = ["area", "bar", "line"] as const;
    let tIdx = 0;
    dateCols.forEach((dc) => {
      const di = idx(dc.name);
      numericCols.slice(0, 3).forEach((nc) => {
        const ni = idx(nc.name);
        const buckets = new Map<string, number>();
        allRows.forEach((r) => {
          const d = (r[di] || "").slice(0, 10);
          const n = toNum(r[ni]);
          if (!d || isNaN(n)) return;
          buckets.set(d, (buckets.get(d) || 0) + n);
        });
        const data = Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
        if (data.length < 2) return;
        const color = PALETTE[tIdx % PALETTE.length];
        const type = timeTypes[tIdx % timeTypes.length];
        tIdx++;
        out.push({
          id: `ts-${dc.name}-${nc.name}`,
          title: `${nc.name} over ${dc.name}`,
          badge: type === "area" ? "Area" : type === "bar" ? "Time bars" : "Time line",
          icon: <TrendingUp className="h-3.5 w-3.5" />, group: "Time",
          render: (h) => (
            <ResponsiveContainer width="100%" height={h}>
              {type === "area" ? (
                <AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                  <defs><linearGradient id={`ts-${dc.name}-${nc.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.45} /><stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tick={{ ...axisTick, fontSize: 10 }} /><YAxis tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#ts-${dc.name}-${nc.name})`} />
                </AreaChart>
              ) : type === "bar" ? (
                <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tick={{ ...axisTick, fontSize: 10 }} /><YAxis tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tick={{ ...axisTick, fontSize: 10 }} /><YAxis tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          ),
        });
      });

      // Weekday radar (one per date column)
      const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name) => ({ name, count: 0 }));
      allRows.forEach((r) => { const d = toDate(r[di]); if (d) dow[d.getDay()].count += 1; });
      out.push({
        id: `dow-${dc.name}`, title: `${dc.name} — weekday pattern`, badge: "Radar",
        icon: <Calendar className="h-3.5 w-3.5" />, group: "Time",
        render: (h) => (
          <ResponsiveContainer width="100%" height={h}>
            <RadarChart data={dow} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Radar dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        ),
      });
    });

    // ===== RELATIONSHIPS =====
    const topNum = numericCols.slice(0, 4);
    for (let a = 0; a < topNum.length; a++) {
      for (let b = a + 1; b < topNum.length; b++) {
        const ai = idx(topNum[a].name), bi = idx(topNum[b].name);
        const pts = allRows.map((r) => ({ x: toNum(r[ai]), y: toNum(r[bi]) }))
          .filter((p) => !isNaN(p.x) && !isNaN(p.y)).slice(0, 300);
        if (pts.length < 5) continue;
        const r = pearson(pts.map((p) => p.x), pts.map((p) => p.y));
        out.push({
          id: `sc-${topNum[a].name}-${topNum[b].name}`,
          title: `${topNum[a].name} vs ${topNum[b].name}`,
          badge: `r = ${r.toFixed(2)}`,
          icon: <GitCompare className="h-3.5 w-3.5" />, group: "Relationships",
          render: (h) => (
            <ResponsiveContainer width="100%" height={h}>
              <ScatterChart margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="x" tick={axisTick} name={topNum[a].name} />
                <YAxis type="number" dataKey="y" tick={axisTick} name={topNum[b].name} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={pts} fill="#06b6d4" />
              </ScatterChart>
            </ResponsiveContainer>
          ),
        });
      }
    }

    if (topNum.length >= 2) {
      const matrix = topNum.map((c1) => topNum.map((c2) => {
        const i1 = idx(c1.name), i2 = idx(c2.name);
        const xs: number[] = [], ys: number[] = [];
        allRows.forEach((r) => { const x = toNum(r[i1]), y = toNum(r[i2]); if (!isNaN(x) && !isNaN(y)) { xs.push(x); ys.push(y); } });
        return pearson(xs, ys);
      }));
      out.push({
        id: "heatmap", title: "Correlation matrix", badge: "Heatmap",
        icon: <Network className="h-3.5 w-3.5" />, group: "Relationships", span: 2,
        render: (h) => (
          <div className="overflow-x-auto" style={{ minHeight: h }}>
            <div className="inline-grid gap-px bg-border" style={{ gridTemplateColumns: `auto repeat(${topNum.length}, minmax(80px,1fr))` }}>
              <div className="bg-card p-2 text-xs" />
              {topNum.map((c) => <div key={c.name} className="bg-card p-2 text-xs font-medium text-muted-foreground">{c.name}</div>)}
              {matrix.map((row, ri) => (
                <div key={`r-${ri}`} className="contents">
                  <div className="bg-card p-2 text-xs font-medium text-muted-foreground">{topNum[ri].name}</div>
                  {row.map((val, ci) => {
                    const op = Math.min(0.9, Math.abs(val));
                    const bg = val >= 0 ? `rgba(99,102,241,${op})` : `rgba(239,68,68,${op})`;
                    return (
                      <div key={`${ri}-${ci}`} className="p-3 text-center text-sm font-medium" style={{ background: bg, color: op > 0.5 ? "white" : "#111" }}>
                        {val.toFixed(2)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }

    if (categoryCols.length >= 2) {
      const a = categoryCols[0], b = categoryCols[1];
      const ai = idx(a.name), bi = idx(b.name);
      const map = new Map<string, Record<string, number>>();
      const bKeys = new Set<string>();
      allRows.forEach((r) => {
        const ka = (r[ai] || "—").trim() || "—";
        const kb = (r[bi] || "—").trim() || "—";
        bKeys.add(kb);
        const cur = map.get(ka) || {}; cur[kb] = (cur[kb] || 0) + 1; map.set(ka, cur);
      });
      const bArr = Array.from(bKeys).slice(0, 6);
      const data = Array.from(map.entries()).slice(0, 8).map(([name, vals]) => ({ name, ...vals }));
      out.push({
        id: `stack-${a.name}-${b.name}`, title: `${a.name} × ${b.name}`, badge: "Stacked bars",
        icon: <BarChart3 className="h-3.5 w-3.5" />, group: "Relationships",
        render: (h) => (
          <ResponsiveContainer width="100%" height={h}>
            <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              {bArr.map((k, i) => (<Bar key={k} dataKey={k} stackId="s" fill={PALETTE[i % PALETTE.length]} />))}
            </BarChart>
          </ResponsiveContainer>
        ),
      });
    }

    return out.slice(0, 40);
  }, [parsed, allRows]);

  const groups: ("All" | Group)[] = ["All", "Overview", "Numeric", "Categorical", "Time", "Relationships"];
  const visible = filter === "All" ? charts : charts.filter((c) => c.group === filter);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * PAGE_SIZE;
  const pageItems = exportMode ? visible : visible.slice(pageStart, pageStart + PAGE_SIZE);

  // Insights
  const insights = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Detected ${parsed.cols.length} columns across ${parsed.rows.toLocaleString()} rows.`);
    const types = parsed.cols.reduce<Record<string, number>>((a, c) => ((a[c.type] = (a[c.type] || 0) + 1), a), {});
    lines.push(`Schema: ${Object.entries(types).map(([k, v]) => `${v} ${k}`).join(", ")}.`);
    const lowQ = parsed.cols.filter((c) => c.nullPct > 10);
    if (lowQ.length) lines.push(`Quality alert: ${lowQ.map((c) => `${c.name} (${c.nullPct.toFixed(0)}% missing)`).join(", ")}.`);
    return lines;
  }, [parsed]);

  async function handleExport() {
    setExporting(true);
    setExportMode(true);
    // wait for full render of all charts
    await new Promise((r) => setTimeout(r, 900));
    try {
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4", compress: true });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 36;
      const innerW = pageW - margin * 2;
      const headerH = 22; // chart title line height in PDF
      const gap = 14;

      // ---------- COVER ----------
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageW, 160, "F");
      pdf.setTextColor(255);
      pdf.setFontSize(11);
      pdf.text("InsightIQ · Auto-generated report", margin, 60);
      pdf.setFontSize(26);
      pdf.text(parsed.fileName, margin, 100);
      pdf.setFontSize(11);
      pdf.setTextColor(200);
      pdf.text(
        `${parsed.rows.toLocaleString()} rows  ·  ${parsed.cols.length} columns  ·  ${charts.length} visualizations`,
        margin,
        125,
      );
      pdf.setTextColor(120);
      pdf.setFontSize(10);
      pdf.text(new Date().toLocaleString(), margin, 148);

      // Insights summary on cover
      pdf.setTextColor(20);
      pdf.setFontSize(13);
      pdf.text("Summary", margin, 200);
      pdf.setFontSize(11);
      pdf.setTextColor(60);
      let sy = 224;
      insights.forEach((line) => {
        const wrapped = pdf.splitTextToSize(`• ${line}`, innerW);
        pdf.text(wrapped, margin, sy);
        sy += wrapped.length * 14 + 4;
      });

      // ---------- TOC (placeholder, page numbers patched after layout) ----------
      pdf.addPage();
      pdf.setTextColor(20);
      pdf.setFontSize(18);
      pdf.text("Table of contents", margin, margin + 18);
      const tocStartY = margin + 50;
      const tocLineH = 18;
      const tocPageNum = pdf.getNumberOfPages();
      const tocEntries: { title: string; group: string; page: number }[] = [];

      // ---------- CHARTS ----------
      const cards = visible
        .map((c) => ({ spec: c, el: cardRefs.current[c.id] }))
        .filter((x): x is { spec: ChartSpec; el: HTMLDivElement } => !!x.el);

      pdf.addPage();
      let cursorY = margin;

      for (const { spec, el } of cards) {
        const canvas = await html2canvas(el, {
          backgroundColor: "#ffffff",
          scale: Math.min(2.5, Math.max(2, window.devicePixelRatio * 1.5)),
          useCORS: true,
          logging: false,
          windowWidth: el.scrollWidth,
        });
        const ratio = canvas.width / innerW;
        let imgH = canvas.height / ratio;
        const blockH = headerH + imgH + gap;
        const maxBlock = pageH - margin * 2;

        // If the block is taller than a single page, scale it down to fit one page.
        let drawImgH = imgH;
        let drawImgW = innerW;
        if (blockH > maxBlock) {
          const scale = (maxBlock - headerH - gap) / imgH;
          drawImgH = imgH * scale;
          drawImgW = innerW * scale;
        }
        const finalBlockH = headerH + drawImgH + gap;

        // Page-break if not enough room for this chart
        if (cursorY + finalBlockH > pageH - margin) {
          pdf.addPage();
          cursorY = margin;
        }

        tocEntries.push({
          title: spec.title,
          group: spec.group,
          page: pdf.getNumberOfPages(),
        });

        // Title bar
        pdf.setTextColor(20);
        pdf.setFontSize(12);
        pdf.text(spec.title, margin, cursorY + 14);
        pdf.setFontSize(9);
        pdf.setTextColor(120);
        pdf.text(spec.badge, pageW - margin, cursorY + 14, { align: "right" });

        // Image
        const img = canvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(
          img,
          "JPEG",
          margin + (innerW - drawImgW) / 2,
          cursorY + headerH,
          drawImgW,
          drawImgH,
          undefined,
          "FAST",
        );

        cursorY += finalBlockH;
      }

      // ---------- Patch TOC ----------
      pdf.setPage(tocPageNum);
      pdf.setTextColor(40);
      pdf.setFontSize(11);
      tocEntries.forEach((e, i) => {
        const y = tocStartY + i * tocLineH;
        if (y > pageH - margin - 20) return; // overflow guard for huge reports
        pdf.setTextColor(40);
        pdf.text(`${i + 1}. ${e.title}`, margin, y);
        pdf.setTextColor(140);
        pdf.text(e.group, pageW - margin - 60, y, { align: "right" });
        pdf.text(String(e.page), pageW - margin, y, { align: "right" });
      });

      // ---------- Footer on every page ----------
      const total = pdf.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(140);
        pdf.text(`InsightIQ · ${parsed.fileName}`, margin, pageH - 14);
        pdf.text(`page ${i} / ${total}`, pageW - margin, pageH - 14, { align: "right" });
      }

      pdf.save(`${parsed.fileName.replace(/\.[^.]+$/, "")}-insights.pdf`);
    } finally {
      setExportMode(false);
      setExporting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-elegant"
    >
      <div ref={ref} className="bg-card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-[var(--primary)]" /> Auto-generated dashboard
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">{parsed.fileName}</h3>
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
            <button
              data-export-ignore
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              {exporting ? "Exporting…" : "Export PDF"}
            </button>
          </div>
        </div>

        {/* AI insights */}
        <div className="mb-5 rounded-xl border border-border bg-secondary/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--primary)]">
            <Sparkles className="h-3.5 w-3.5" /> AI insights
          </div>
          <ul className="space-y-1 text-sm text-foreground/80">
            {insights.map((l, i) => <li key={i}>• {l}</li>)}
          </ul>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5 text-[11px]" data-export-ignore>
          {groups.map((g) => {
            const count = g === "All" ? charts.length : charts.filter((c) => c.group === g).length;
            if (count === 0 && g !== "All") return null;
            const active = filter === g;
            return (
              <button key={g}
                onClick={() => { setFilter(g); setPage(0); }}
                className={`rounded-full px-3 py-1 transition ${active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {g} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
          {pageItems.map((c, i) => (
            <ResponsiveChartCard
              key={c.id}
              spec={c}
              index={i}
              innerRef={(el) => {
                cardRefs.current[c.id] = el;
              }}
            />
          ))}
        </div>

        {/* Pagination */}
        {!exportMode && totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between" data-export-ignore>
            <div className="text-xs text-muted-foreground">
              Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, visible.length)} of {visible.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="h-3 w-3" /> Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`h-7 w-7 rounded-full text-xs transition ${i === safePage ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                  >{i + 1}</button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
                disabled={safePage >= totalPages - 1}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Next <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}