# InsightIQ

Turn any CSV into an intelligent, interactive dashboard — automatically.

InsightIQ is a privacy-first analytics tool that runs entirely in your
browser. Drop a CSV (or paste text / a URL), and InsightIQ detects the
schema, profiles every column, and generates 30–40 distinct visualizations
tailored to your data. Export the whole report as a polished PDF in one
click.

## Features

- **Local-only parsing** — your data never leaves the browser.
- **Automatic schema detection** — types, cardinality, completeness, and
  relationships inferred from the file itself.
- **30–40 distinct chart types** — histograms, KPIs, donuts, treemaps,
  funnels, radar, time series, correlation heatmaps, stacked bars, and
  more — chosen per column type.
- **Responsive cards** — every chart resizes to its container, with
  automatic font scaling so axis labels stay readable on mobile.
- **PDF export with quality presets** — choose JPEG Standard, JPEG High,
  or PNG Lossless. Includes a cover page, table of contents, consistent
  chart titles, and per-page footers.
- **Three input modes** — drag-and-drop file, paste raw CSV text, or
  fetch from a URL.

## Tech stack

- TanStack Start v1 (React 19 + Vite 7)
- Tailwind CSS v4
- Recharts for in-app visualization
- jsPDF + html2canvas-pro for PDF export
- Framer Motion for animation

## Getting started

```bash
bun install
bun run dev
```

Then open the preview URL printed in the terminal and drop a CSV onto
the hero uploader.

## Project structure

```
src/
  components/insightiq/   UI sections (Hero, Features, Pipeline, …)
    CsvUploader.tsx       File / paste / URL input
    GeneratedDashboard.tsx 30–40 chart engine + PDF export
  routes/                 TanStack Start file-based routes
  styles.css              Design tokens (oklch palette)
```

## Developer

Built by **Shubham Pokale**.

- GitHub: <https://github.com/shubham392007-sketch>
- LinkedIn: <https://www.linkedin.com/in/shubham-pokale-94030b37a/>

## License

MIT