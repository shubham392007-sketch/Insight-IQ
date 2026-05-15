import { Github, Linkedin, Mail } from "lucide-react";

export function DeveloperContact() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-border bg-[var(--surface-soft)] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 text-[var(--primary)]" /> Developer contact
          </div>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Built by Shubham Pokale.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Have feedback, found a bug, or want to collaborate on InsightIQ? Reach out
            on any of the channels below.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href="https://github.com/shubham392007-sketch"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
              <Github className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">GitHub</div>
              <div className="truncate text-sm font-medium text-foreground">
                github.com/shubham392007-sketch
              </div>
            </div>
          </a>

          <a
            href="https://www.linkedin.com/in/shubham-pokale-94030b37a/"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A66C2] text-white">
              <Linkedin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">LinkedIn</div>
              <div className="truncate text-sm font-medium text-foreground">
                linkedin.com/in/shubham-pokale-94030b37a
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}