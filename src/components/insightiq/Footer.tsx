import { Logo } from "./Logo";
import { Github, Linkedin } from "lucide-react";

const cols: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pipeline", href: "#product" },
    { label: "Solutions", href: "#solutions" },
  ],
  Resources: [
    { label: "Docs", href: "#docs" },
    { label: "Live playground", href: "#docs" },
    { label: "How it works", href: "#solutions" },
  ],
  Contact: [
    { label: "GitHub", href: "https://github.com/shubham392007-sketch" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shubham-pokale-94030b37a/" },
    { label: "Developer", href: "#contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-xs text-muted-foreground">
              Turn any CSV into an intelligent, interactive dashboard. Local parsing,
              automatic schema detection, 30+ chart types — all in your browser.
            </p>
          </div>
          {Object.entries(cols).map(([title, items]) => (
            <div key={title}>
              <div className="text-xs font-semibold text-foreground">{title}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {items.map((i) => (
                  <li key={i.label}>
                    <a
                      href={i.href}
                      target={i.href.startsWith("http") ? "_blank" : undefined}
                      rel={i.href.startsWith("http") ? "noreferrer" : undefined}
                      className="hover:text-foreground"
                    >
                      {i.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} InsightIQ, Inc. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/shubham392007-sketch"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4 hover:text-foreground" />
            </a>
            <a
              href="https://www.linkedin.com/in/shubham-pokale-94030b37a/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4 hover:text-foreground" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}