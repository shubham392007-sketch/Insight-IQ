import { motion } from "framer-motion";
import { Upload, Brain, LayoutDashboard, Share2 } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload CSV", desc: "Drag a file, paste a URL, or connect a source." },
  { icon: Brain, title: "AI Understands Data", desc: "Schemas, types, and relationships — detected automatically." },
  { icon: LayoutDashboard, title: "Dashboard Auto-Generated", desc: "Charts, KPIs, and insights — ready in seconds." },
  { icon: Share2, title: "Share Insights", desc: "Publish a live link or export polished reports." },
];

export function HowItWorks() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">From file to dashboard in four steps.</h2>
          <p className="mt-4 text-muted-foreground">No SQL. No scripts. No setup.</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card shadow-soft">
                <s.icon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">0{i + 1}</div>
              <div className="mt-1 text-lg font-semibold tracking-tight">{s.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-5 hidden h-px w-1/3 bg-gradient-to-r from-border to-transparent md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}