import { Logo } from "./Logo";
import { Github, Twitter, Linkedin } from "lucide-react";

const cols = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap", "Integrations"],
  Resources: ["Docs", "Guides", "API Reference", "Templates", "Blog"],
  Company: ["About", "Customers", "Careers", "Press", "Contact"],
  Developers: ["GitHub", "SDK", "Webhooks", "Status", "Open Source"],
  Legal: ["Privacy", "Terms", "Security", "DPA", "Cookies"],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-xs text-muted-foreground">AI-powered analytics for the next generation of data teams.</p>
          </div>
          {Object.entries(cols).map(([title, items]) => (
            <div key={title}>
              <div className="text-xs font-semibold text-foreground">{title}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {items.map((i) => (
                  <li key={i}><a href="#" className="hover:text-foreground">{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} InsightIQ, Inc. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="GitHub"><Github className="h-4 w-4 hover:text-foreground" /></a>
            <a href="#" aria-label="Twitter"><Twitter className="h-4 w-4 hover:text-foreground" /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin className="h-4 w-4 hover:text-foreground" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}