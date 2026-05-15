import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section id="start" className="relative overflow-hidden py-32">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-fade-b" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-72 -translate-y-1/2"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, oklch(0.7 0.18 270 / 0.18), transparent 70%)" }} />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
          Your data already has answers.
        </h2>
        <p className="mt-5 text-balance text-lg text-muted-foreground">
          InsightIQ helps you discover them instantly.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('input[type="file"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            Upload your CSV
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        <div className="mt-6 text-xs text-muted-foreground">
          100% client-side · no signup · your data never leaves the browser
        </div>
      </div>
    </section>
  );
}