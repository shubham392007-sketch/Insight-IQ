import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, Play, X, CheckCircle2, Hash, Calendar, Type, ToggleLeft, Sparkles } from "lucide-react";

const placeholders = [
  "Upload sales.csv",
  "Analyze customers.csv",
  "Drop finance_data.csv",
  "Upload marketing_metrics.csv",
];

type ColType = "number" | "date" | "category" | "boolean" | "id" | "text";
type Column = { name: string; type: ColType; unique: number; samples: string[]; nullPct: number };
type Parsed = { fileName: string; rows: number; cols: Column[]; preview: string[][] };

const TYPE_META: Record<ColType, { icon: any; label: string; color: string }> = {
  number:   { icon: Hash,       label: "number",   color: "text-[var(--primary)]" },
  date:     { icon: Calendar,   label: "datetime", color: "text-cyan-600" },
  category: { icon: Type,       label: "category", color: "text-amber-600" },
  boolean:  { icon: ToggleLeft, label: "boolean",  color: "text-emerald-600" },
  id:       { icon: Hash,       label: "id",       color: "text-rose-500" },
  text:     { icon: Type,       label: "text",     color: "text-muted-foreground" },
};

// --- CSV parsing (handles quoted fields, commas/semicolons/tabs) ---
function detectDelimiter(line: string) {
  const counts = [",", ";", "\t", "|"].map((d) => [d, (line.match(new RegExp(`\\${d}`, "g")) || []).length] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}
function parseLine(line: string, d: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === d) { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}
function inferType(name: string, values: string[]): ColType {
  const lname = name.toLowerCase();
  const non = values.filter((v) => v !== "" && v != null);
  if (!non.length) return "text";
  if (/(^|_)id$/.test(lname) || lname.endsWith("uuid")) return "id";
  const isNum = non.every((v) => !isNaN(Number(v.replace(/[$,€£%\s]/g, ""))));
  if (isNum) return "number";
  const isBool = non.every((v) => /^(true|false|yes|no|0|1)$/i.test(v));
  if (isBool) return "boolean";
  const isDate = non.every((v) => !isNaN(Date.parse(v))) && /(date|_at|time|day|month|year)/i.test(lname + " " + non[0]);
  if (isDate || (non.every((v) => /^\d{4}-\d{2}-\d{2}/.test(v)))) return "date";
  const unique = new Set(non).size;
  if (unique <= Math.max(8, non.length * 0.2)) return "category";
  return "text";
}
function parseCsv(text: string, fileName: string): Parsed {
  const lines = text.split(/\r?\n/).filter((l) => l.length);
  if (!lines.length) return { fileName, rows: 0, cols: [], preview: [] };
  const d = detectDelimiter(lines[0]);
  const header = parseLine(lines[0], d).map((h) => h.trim() || "column");
  const rows = lines.slice(1).map((l) => parseLine(l, d));
  const sampleRows = rows.slice(0, Math.min(rows.length, 200));
  const cols: Column[] = header.map((name, i) => {
    const colVals = sampleRows.map((r) => (r[i] ?? "").trim());
    const non = colVals.filter(Boolean);
    return {
      name,
      type: inferType(name, non),
      unique: new Set(non).size,
      samples: non.slice(0, 3),
      nullPct: Math.round(((colVals.length - non.length) / Math.max(1, colVals.length)) * 100),
    };
  });
  return { fileName, rows: rows.length, cols, preview: rows.slice(0, 4) };
}

// --- Demo dataset for "Try sample" ---
const SAMPLE = `order_id,created_at,region,amount,tier,is_paid
A-2841,2025-10-04,NA,1240.00,Pro,true
A-2842,2025-10-04,EU,2180.50,Enterprise,true
A-2843,2025-10-05,APAC,640.10,Free,false
A-2844,2025-10-05,NA,3920.00,Enterprise,true
A-2845,2025-10-06,LATAM,412.75,Pro,true
A-2846,2025-10-06,EU,1860.00,Pro,false
A-2847,2025-10-07,APAC,2230.40,Enterprise,true
A-2848,2025-10-07,NA,540.00,Free,true`;

export function CsvUploader() {
  const [phIdx, setPhIdx] = useState(0);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (parsed) return;
    const t = setInterval(() => setPhIdx((i) => (i + 1) % placeholders.length), 2600);
    return () => clearInterval(t);
  }, [parsed]);

  const handleText = useCallback((text: string, name: string) => {
    setBusy(true);
    // brief delay to convey "analysis"
    setTimeout(() => {
      setParsed(parseCsv(text, name));
      setBusy(false);
    }, 450);
  }, []);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => handleText(String(reader.result || ""), file.name);
    reader.readAsText(file);
  }, [handleText]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="mt-10 w-full max-w-2xl"
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative rounded-2xl border bg-card p-2 shadow-elegant transition-all duration-300 ${
          drag
            ? "border-[var(--primary)] shadow-[0_0_0_8px_oklch(0.52_0.22_274/0.12)]"
            : "border-border hover:border-[var(--primary)]/40 hover:shadow-[0_0_0_8px_oklch(0.52_0.22_274/0.08)]"
        }`}
      >
        <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3">
          <FileSpreadsheet className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="relative flex-1 overflow-hidden text-left">
            <AnimatePresence mode="wait">
              <motion.span
                key={parsed ? parsed.fileName : placeholders[phIdx]}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`block text-sm ${parsed ? "text-foreground" : "text-muted-foreground"}`}
              >
                {parsed ? parsed.fileName : placeholders[phIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
          {parsed && (
            <button
              onClick={() => setParsed(null)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Reset"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            className="hidden items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground sm:inline-flex"
          >
            <Upload className="h-3.5 w-3.5" /> Browse
          </button>
          <button
            onClick={() => (parsed ? null : handleText(SAMPLE, "sample_sales.csv"))}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Analyzing…" : parsed ? "Re-run" : "Analyze Now"}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {/* drop overlay */}
        <AnimatePresence>
          {drag && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-background/80 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
                <Upload className="h-4 w-4" /> Drop CSV to analyze
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <button className="inline-flex items-center gap-1.5 hover:text-foreground">
          <Play className="h-3 w-3" /> Watch demo
        </button>
        <span>·</span>
        <button
          onClick={() => handleText(SAMPLE, "sample_sales.csv")}
          className="underline-offset-2 hover:text-foreground hover:underline"
        >
          Try a sample
        </button>
        <span>·</span>
        <span>No signup required</span>
      </div>

      {/* Result panel */}
      <AnimatePresence>
        {parsed && (
          <motion.div
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-left shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Schema detected
                  </span>
                  <span className="text-muted-foreground">
                    {parsed.rows.toLocaleString()} rows · {parsed.cols.length} columns
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--primary)]">
                  <Sparkles className="h-3 w-3" /> {Math.min(99, 88 + parsed.cols.length)}% confidence
                </div>
              </div>

              {/* Column chips */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {parsed.cols.map((c, i) => {
                  const meta = TYPE_META[c.type];
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="group rounded-lg border border-border bg-secondary/40 p-2.5 transition hover:border-[var(--primary)]/40 hover:bg-background"
                    >
                      <div className="flex items-center justify-between">
                        <div className="truncate text-xs font-medium">{c.name}</div>
                        <Icon className={`h-3 w-3 shrink-0 ${meta.color}`} />
                      </div>
                      <div className={`mt-0.5 text-[10px] uppercase tracking-wider ${meta.color}`}>{meta.label}</div>
                      <div className="mt-1 truncate text-[10px] text-muted-foreground">
                        {c.unique} unique{c.nullPct > 0 ? ` · ${c.nullPct}% null` : ""}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Preview table */}
              {parsed.preview.length > 0 && (
                <div className="mt-5 overflow-hidden rounded-lg border border-border text-[11px]">
                  <div
                    className="grid gap-px bg-border/70"
                    style={{ gridTemplateColumns: `repeat(${parsed.cols.length}, minmax(0, 1fr))` }}
                  >
                    {parsed.cols.map((c) => (
                      <div key={c.name} className="bg-secondary/70 px-2.5 py-1.5 text-muted-foreground">
                        <div className="truncate">{c.name}</div>
                        <div className={`text-[9px] ${TYPE_META[c.type].color}`}>{TYPE_META[c.type].label}</div>
                      </div>
                    ))}
                    {parsed.preview.flatMap((row, ri) =>
                      parsed.cols.map((_, ci) => (
                        <div key={`${ri}-${ci}`} className="truncate bg-card px-2.5 py-1.5 text-foreground/80">
                          {row[ci] ?? ""}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground">
                  Recommended: {parsed.cols.some((c) => c.type === "date") ? "Time-series area chart" : "Distribution + correlation"} · {parsed.cols.filter((c) => c.type === "category").length} segment{parsed.cols.filter((c) => c.type === "category").length === 1 ? "" : "s"}
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90">
                  Generate dashboard <Sparkles className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}