import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/crm-data";

export interface DrawerRow {
  id: string;
  nome: string;
  detalhe: string;
  avatar_url?: string | null;
  resultado: string;
}

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  rows,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  rows: DrawerRow[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-l border-border bg-surface sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="font-display text-2xl font-normal">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="mt-2 flex flex-col divide-y divide-border overflow-y-auto px-4">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 py-4">
              <Avatar className="size-9">
                {row.avatar_url ? <AvatarImage src={row.avatar_url} alt={row.nome} /> : null}
                <AvatarFallback className="bg-accent text-xs">{initials(row.nome)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{row.nome}</p>
                <p className="label-caps text-muted-foreground">{row.detalhe}</p>
              </div>
              <p className="font-display text-lg leading-none">{row.resultado}</p>
            </div>
          ))}
          {rows.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Nada para mostrar ainda.</p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
