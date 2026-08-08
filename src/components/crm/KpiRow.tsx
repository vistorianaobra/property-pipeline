import { cn } from "@/lib/utils";

export interface Kpi {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "success";
}

export function KpiRow({ items, onSelect }: { items: Kpi[]; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 border border-border bg-card sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <button
          key={kpi.id}
          type="button"
          onClick={() => onSelect(kpi.id)}
          className="border-b border-border px-6 py-7 text-left transition-colors last:border-b-0 hover:bg-accent/50 sm:border-b sm:[&:nth-last-child(-n+1)]:border-b-0 xl:border-b-0 xl:border-r xl:last:border-r-0"
        >
          <p className="label-caps text-muted-foreground">{kpi.label}</p>
          <p
            className={cn(
              "mt-4 font-display text-4xl leading-none",
              kpi.tone === "success" && "text-success",
            )}
          >
            {kpi.value}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{kpi.hint} →</p>
        </button>
      ))}
    </div>
  );
}
