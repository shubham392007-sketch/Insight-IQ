export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-7 w-7">
        <div className="absolute inset-0 rounded-md bg-[var(--gradient-primary)]" />
        <div className="absolute inset-[3px] rounded-[5px] bg-background" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-2 w-2 rounded-sm bg-[var(--gradient-primary)]" />
        </div>
      </div>
      <span className="text-[15px] font-semibold tracking-tight">InsightIQ</span>
    </div>
  );
}