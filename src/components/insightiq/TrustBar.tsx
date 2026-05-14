import { Database, BarChart3, Brain, ShieldCheck, Zap, FileSpreadsheet } from "lucide-react";

const stats = [
  { icon: <FileSpreadsheet className="h-4 w-4" />, label: "Any CSV", sub: "Upload, paste or URL" },
  { icon: <Database className="h-4 w-4" />, label: "6 column types", sub: "Auto-inferred schema" },
  { icon: <BarChart3 className="h-4 w-4" />, label: "30–40 charts", sub: "Per dataset, no duplicates" },
  { icon: <Brain className="h-4 w-4" />, label: "Statistical insights", sub: "Pearson, quantiles, quality" },
  { icon: <ShieldCheck className="h-4 w-4" />, label: "100% local", sub: "Files never leave your browser" },
  { icon: <Zap className="h-4 w-4" />, label: "Instant render", sub: "No backend, no waiting" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-[var(--surface-soft)] py-14">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          What InsightIQ does, the moment you drop a file in.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-4 text-center"
            >
              <span className="text-[var(--primary)]">{s.icon}</span>
              <div className="mt-2 text-sm font-semibold tracking-tight text-foreground">{s.label}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
