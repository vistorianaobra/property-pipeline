import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-6">
      <div>
        <p className="label-caps text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-3 text-5xl leading-none tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div className="pt-6">{action}</div> : null}
    </header>
  );
}
