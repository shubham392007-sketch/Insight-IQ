const logos = ["Northwind", "Acme Co", "Stratify", "Lumen", "Quanta", "Helios", "Vector", "Parallax", "Cortex", "Meridian"];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-[var(--surface-soft)] py-14">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Trusted by modern teams analyzing millions of data points.
        </p>
        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max animate-marquee gap-14">
            {[...logos, ...logos].map((l, i) => (
              <span key={i} className="whitespace-nowrap text-xl font-semibold tracking-tight text-muted-foreground/70 grayscale">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}